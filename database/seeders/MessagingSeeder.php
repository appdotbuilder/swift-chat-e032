<?php

namespace Database\Seeders;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use Illuminate\Database\Seeder;

class MessagingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create additional test users if they don't exist
        $users = User::all();
        
        if ($users->count() < 5) {
            $additionalUsers = User::factory(5 - $users->count())->create();
            $users = $users->merge($additionalUsers);
        }

        // Create private conversations
        for ($i = 0; $i < 3; $i++) {
            $conversation = Conversation::factory()->private()->create();
            
            // Add two random users to the private conversation
            $selectedUsers = $users->random(2);
            foreach ($selectedUsers as $user) {
                $conversation->users()->attach($user->id, [
                    'role' => 'member',
                    'joined_at' => now(),
                ]);
            }
            
            // Create messages for this conversation
            foreach ($selectedUsers as $user) {
                Message::factory()
                    ->count(random_int(2, 8))
                    ->create([
                        'conversation_id' => $conversation->id,
                        'user_id' => $user->id,
                    ]);
            }
        }

        // Create group conversations
        for ($i = 0; $i < 2; $i++) {
            $conversation = Conversation::factory()->group()->create();
            
            // Add 3-5 random users to the group conversation
            $selectedUsers = $users->random(random_int(3, 5));
            $first = true;
            foreach ($selectedUsers as $user) {
                $conversation->users()->attach($user->id, [
                    'role' => $first ? 'admin' : 'member',
                    'joined_at' => now(),
                ]);
                $first = false;
            }
            
            // Create messages for this conversation
            foreach ($selectedUsers as $user) {
                Message::factory()
                    ->count(random_int(1, 5))
                    ->create([
                        'conversation_id' => $conversation->id,
                        'user_id' => $user->id,
                    ]);
            }
        }

        // Create some media messages
        if (Conversation::count() > 0) {
            $conversation = Conversation::first();
            $user = $conversation->users()->first();
            
            if ($user) {
                // Create image message
                Message::factory()->image()->create([
                    'conversation_id' => $conversation->id,
                    'user_id' => $user->getKey(),
                ]);
                
                // Create video message
                Message::factory()->video()->create([
                    'conversation_id' => $conversation->id,
                    'user_id' => $user->getKey(),
                ]);
            }
        }
    }
}