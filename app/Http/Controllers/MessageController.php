<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMessageRequest;
use App\Http\Requests\UpdateMessageRequest;
use App\Models\Conversation;
use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class MessageController extends Controller
{
    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreMessageRequest $request)
    {
        $data = $request->validated();
        $conversation = Conversation::findOrFail($data['conversation_id']);

        // Check if user is part of the conversation
        if (!$conversation->users()->where('user_id', auth()->id())->exists()) {
            abort(403, 'You are not part of this conversation.');
        }

        $messageData = [
            'conversation_id' => $conversation->id,
            'user_id' => auth()->id(),
            'content' => $data['content'] ?? null,
            'type' => $data['type'],
        ];

        // Handle media upload
        if ($request->hasFile('media') && in_array($data['type'], ['image', 'video', 'file'])) {
            $file = $request->file('media');
            $path = $file->store('messages', 'public');
            
            $messageData['media'] = [
                'path' => $path,
                'original_name' => $file->getClientOriginalName(),
                'mime_type' => $file->getMimeType(),
                'size' => $file->getSize(),
            ];
        }

        $message = Message::create($messageData);
        
        // Load the user relationship for the response
        $message->load('user:id,name');

        $messageResponse = [
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
            'is_own' => true,
        ];

        return response()->json([
            'message' => $messageResponse,
            'success' => 'Message sent successfully.'
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateMessageRequest $request, Message $message)
    {
        // Check if user owns the message
        if ($message->user_id !== auth()->id()) {
            abort(403, 'You can only edit your own messages.');
        }

        $data = $request->validated();
        
        $message->update([
            'content' => $data['content'],
            'is_edited' => true,
            'edited_at' => now(),
        ]);

        return response()->json([
            'message' => $message->fresh(),
            'success' => 'Message updated successfully.'
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Message $message)
    {
        // Check if user owns the message
        if ($message->user_id !== auth()->id()) {
            abort(403, 'You can only delete your own messages.');
        }

        // Delete media files if they exist
        if ($message->media && isset($message->media['path'])) {
            Storage::disk('public')->delete($message->media['path']);
        }

        $message->delete();

        return response()->json([
            'success' => 'Message deleted successfully.'
        ]);
    }
}