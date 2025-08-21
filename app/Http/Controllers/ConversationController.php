<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreConversationRequest;
use App\Http\Requests\UpdateConversationRequest;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ConversationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $conversations = auth()->user()->conversations()
            ->with([
                'users' => function ($query) {
                    $query->select('users.id', 'users.name', 'users.email');
                }, 
                'latestMessage.user:id,name'
            ])
            ->get()
            ->map(function (Conversation $conversation) { // @phpstan-ignore-line
                return [
                    'id' => $conversation->id,
                    'name' => $conversation->name ?: $this->getPrivateChatName($conversation),
                    'type' => $conversation->type,
                    'image' => $conversation->image,
                    'latest_message' => $conversation->latestMessage ? [
                        'content' => $conversation->latestMessage->content,
                        'type' => $conversation->latestMessage->type,
                        'created_at' => $conversation->latestMessage->created_at,
                        'user_name' => $conversation->latestMessage->user->name,
                    ] : null,
                    'unread_count' => 0, // TODO: Implement unread count
                ];
            });

        return Inertia::render('messages/index', [
            'conversations' => $conversations
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $users = User::where('users.id', '!=', auth()->id())
            ->select('users.id', 'users.name', 'users.email')
            ->get();

        return Inertia::render('messages/create', [
            'users' => $users
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreConversationRequest $request)
    {
        $data = $request->validated();

        $conversation = Conversation::create([
            'name' => $data['name'] ?? null,
            'type' => $data['type'],
            'description' => $data['description'] ?? null,
        ]);

        // Add current user as admin
        $conversation->users()->attach(auth()->id(), [
            'role' => 'admin',
            'joined_at' => now(),
        ]);

        // Add other users
        if (!empty($data['user_ids'])) {
            foreach ($data['user_ids'] as $userId) {
                $conversation->users()->attach($userId, [
                    'role' => 'member',
                    'joined_at' => now(),
                ]);
            }
        }

        return redirect()->route('conversations.show', $conversation)
            ->with('success', 'Conversation created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Conversation $conversation)
    {
        // Check if user is part of the conversation
        if (!$conversation->users()->where('user_id', auth()->id())->exists()) {
            abort(403, 'You are not part of this conversation.');
        }

        $messages = $conversation->messages()
            ->with('user:id,name,email')
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(function (Message $message) { // @phpstan-ignore-line
                return [
                    'id' => $message->id,
                    'content' => $message->content,
                    'type' => $message->type,
                    'media' => $message->media,
                    'is_edited' => $message->is_edited,
                    'created_at' => $message->created_at,
                    'user' => [
                        'id' => $message->user->id,
                        'name' => $message->user->name,
                    ],
                    'is_own' => $message->user_id === auth()->id(),
                ];
            });

        $conversationData = [
            'id' => $conversation->id,
            'name' => $conversation->name ?: $this->getPrivateChatName($conversation),
            'type' => $conversation->type,
            'image' => $conversation->image,
            'description' => $conversation->description,
            'users' => $conversation->users()->select('users.id', 'users.name', 'users.email')->get(),
        ];

        return Inertia::render('messages/show', [
            'conversation' => $conversationData,
            'messages' => $messages
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Conversation $conversation)
    {
        // Check if user is admin of the conversation
        $userConversation = $conversation->users()->where('user_id', auth()->id())->first();
        $role = $userConversation?->pivot?->getAttribute('role');
        if (!$userConversation || $role !== 'admin') {
            abort(403, 'Only admins can edit the conversation.');
        }

        return Inertia::render('messages/edit', [
            'conversation' => $conversation->load(['users' => function ($query) {
                $query->select('users.id', 'users.name', 'users.email');
            }])
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateConversationRequest $request, Conversation $conversation)
    {
        // Check if user is admin of the conversation
        $userConversation = $conversation->users()->where('user_id', auth()->id())->first();
        $role = $userConversation?->pivot?->getAttribute('role');
        if (!$userConversation || $role !== 'admin') {
            abort(403, 'Only admins can update the conversation.');
        }

        $conversation->update($request->validated());

        return redirect()->route('conversations.show', $conversation)
            ->with('success', 'Conversation updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Conversation $conversation)
    {
        // Check if user is admin of the conversation
        $userConversation = $conversation->users()->where('user_id', auth()->id())->first();
        $role = $userConversation?->pivot?->getAttribute('role');
        if (!$userConversation || $role !== 'admin') {
            abort(403, 'Only admins can delete the conversation.');
        }

        $conversation->delete();

        return redirect()->route('conversations.index')
            ->with('success', 'Conversation deleted successfully.');
    }

    /**
     * Get the name for a private chat.
     *
     * @param  \App\Models\Conversation  $conversation
     * @return string
     */
    protected function getPrivateChatName(Conversation $conversation): string
    {
        if ($conversation->type !== 'private') {
            return $conversation->name ?? 'Group Chat';
        }

        $otherUser = $conversation->users()
            ->where('user_id', '!=', auth()->id())
            ->first();

        return $otherUser?->getAttribute('name') ?? 'Unknown User';
    }
}