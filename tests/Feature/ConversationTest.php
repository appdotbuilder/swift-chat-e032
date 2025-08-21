<?php

use App\Models\Conversation;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create();
});

test('authenticated user can view conversations index', function () {
    $this->actingAs($this->user)
        ->get(route('conversations.index'))
        ->assertStatus(200)
        ->assertInertia(fn ($page) =>
            $page->component('messages/index')
        );
});

test('guest cannot view conversations', function () {
    $this->get(route('conversations.index'))
        ->assertRedirect(route('login'));
});

test('user can create private conversation', function () {
    $otherUser = User::factory()->create();

    $this->actingAs($this->user)
        ->post(route('conversations.store'), [
            'type' => 'private',
            'user_ids' => [$otherUser->id],
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('conversations', [
        'type' => 'private',
        'name' => null,
    ]);
});

test('user can create group conversation', function () {
    $otherUsers = User::factory(3)->create();

    $this->actingAs($this->user)
        ->post(route('conversations.store'), [
            'name' => 'Test Group',
            'type' => 'group',
            'description' => 'A test group chat',
            'user_ids' => $otherUsers->pluck('id')->toArray(),
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('conversations', [
        'name' => 'Test Group',
        'type' => 'group',
        'description' => 'A test group chat',
    ]);
});

test('user can view conversation', function () {
    $conversation = Conversation::factory()->create();
    
    // Add user to conversation
    $conversation->users()->attach($this->user->id, [
        'role' => 'member',
        'joined_at' => now(),
    ]);

    $this->actingAs($this->user)
        ->get(route('conversations.show', $conversation))
        ->assertStatus(200)
        ->assertInertia(fn ($page) =>
            $page->component('messages/show')
        );
});

test('user cannot view conversation they are not part of', function () {
    $conversation = Conversation::factory()->create();

    $this->actingAs($this->user)
        ->get(route('conversations.show', $conversation))
        ->assertStatus(403);
});

test('conversation validation requires users', function () {
    $this->actingAs($this->user)
        ->post(route('conversations.store'), [
            'type' => 'private',
            'user_ids' => [],
        ])
        ->assertSessionHasErrors(['user_ids']);
});

test('group conversation can have name and description', function () {
    $otherUsers = User::factory(2)->create();

    $this->actingAs($this->user)
        ->post(route('conversations.store'), [
            'name' => 'Team Chat',
            'type' => 'group',
            'description' => 'Our team discussion',
            'user_ids' => $otherUsers->pluck('id')->toArray(),
        ])
        ->assertRedirect();
    
    $conversation = Conversation::where('name', 'Team Chat')->first();
    expect($conversation)->not()->toBeNull();
    expect($conversation->description)->toBe('Our team discussion');
});