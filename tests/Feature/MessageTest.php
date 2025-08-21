<?php

use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    $this->user = User::factory()->create();
    Storage::fake('public');
});

test('user can send text message', function () {
    $conversation = Conversation::factory()->create();
    
    // Add user to conversation
    $conversation->users()->attach($this->user->id, [
        'role' => 'member',
        'joined_at' => now(),
    ]);

    $this->actingAs($this->user)
        ->postJson(route('messages.store'), [
            'conversation_id' => $conversation->id,
            'content' => 'Hello, world! 👋',
            'type' => 'text',
        ])
        ->assertStatus(200);

    $this->assertDatabaseHas('messages', [
        'conversation_id' => $conversation->id,
        'user_id' => $this->user->id,
        'content' => 'Hello, world! 👋',
        'type' => 'text',
    ]);
});

test('user can send image message', function () {
    $conversation = Conversation::factory()->create();
    
    // Add user to conversation
    $conversation->users()->attach($this->user->id, [
        'role' => 'member',
        'joined_at' => now(),
    ]);

    $file = UploadedFile::fake()->image('test.jpg', 800, 600);

    $this->actingAs($this->user)
        ->postJson(route('messages.store'), [
            'conversation_id' => $conversation->id,
            'type' => 'image',
            'media' => $file,
        ])
        ->assertStatus(200);

    $this->assertDatabaseHas('messages', [
        'conversation_id' => $conversation->id,
        'user_id' => $this->user->id,
        'type' => 'image',
    ]);
    
    // Check that file was stored
    $message = Message::where([
        'conversation_id' => $conversation->id,
        'user_id' => $this->user->id,
        'type' => 'image',
    ])->first();
    
    expect($message->media)->not()->toBeNull();
    expect($message->media)->toHaveKey('path');
    Storage::disk('public')->assertExists($message->media['path']);
});

test('user cannot send message to conversation they are not part of', function () {
    $conversation = Conversation::factory()->create();

    $this->actingAs($this->user)
        ->postJson(route('messages.store'), [
            'conversation_id' => $conversation->id,
            'content' => 'Hello',
            'type' => 'text',
        ])
        ->assertStatus(403);
});

test('user can edit their own message', function () {
    $conversation = Conversation::factory()->create();
    
    // Add user to conversation
    $conversation->users()->attach($this->user->id, [
        'role' => 'member',
        'joined_at' => now(),
    ]);

    $message = Message::factory()->create([
        'conversation_id' => $conversation->id,
        'user_id' => $this->user->id,
        'content' => 'Original message',
    ]);

    $this->actingAs($this->user)
        ->putJson(route('messages.update', $message), [
            'content' => 'Edited message',
        ])
        ->assertStatus(200);

    $this->assertDatabaseHas('messages', [
        'id' => $message->id,
        'content' => 'Edited message',
        'is_edited' => true,
    ]);
});

test('user cannot edit other users message', function () {
    $otherUser = User::factory()->create();
    $conversation = Conversation::factory()->create();
    
    // Add users to conversation
    $conversation->users()->attach([$this->user->id, $otherUser->id], [
        'role' => 'member',
        'joined_at' => now(),
    ]);

    $message = Message::factory()->create([
        'conversation_id' => $conversation->id,
        'user_id' => $otherUser->id,
        'content' => 'Other user message',
    ]);

    $this->actingAs($this->user)
        ->putJson(route('messages.update', $message), [
            'content' => 'Trying to edit',
        ])
        ->assertStatus(403);
});

test('user can delete their own message', function () {
    $conversation = Conversation::factory()->create();
    
    // Add user to conversation
    $conversation->users()->attach($this->user->id, [
        'role' => 'member',
        'joined_at' => now(),
    ]);

    $message = Message::factory()->create([
        'conversation_id' => $conversation->id,
        'user_id' => $this->user->id,
    ]);

    $this->actingAs($this->user)
        ->deleteJson(route('messages.destroy', $message))
        ->assertStatus(200);

    $this->assertDatabaseMissing('messages', [
        'id' => $message->id,
    ]);
});

test('message validation requires content for text messages', function () {
    $conversation = Conversation::factory()->create();
    
    // Add user to conversation
    $conversation->users()->attach($this->user->id, [
        'role' => 'member',
        'joined_at' => now(),
    ]);

    $this->actingAs($this->user)
        ->postJson(route('messages.store'), [
            'conversation_id' => $conversation->id,
            'type' => 'text',
            'content' => '',
        ])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['content']);
});

test('message validation requires media for image messages', function () {
    $conversation = Conversation::factory()->create();
    
    // Add user to conversation
    $conversation->users()->attach($this->user->id, [
        'role' => 'member',
        'joined_at' => now(),
    ]);

    $this->actingAs($this->user)
        ->postJson(route('messages.store'), [
            'conversation_id' => $conversation->id,
            'type' => 'image',
        ])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['media']);
});