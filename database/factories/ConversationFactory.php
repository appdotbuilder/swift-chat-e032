<?php

namespace Database\Factories;

use App\Models\Conversation;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Conversation>
 */
class ConversationFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var class-string<\App\Models\Conversation>
     */
    protected $model = Conversation::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $type = fake()->randomElement(['private', 'group']);
        
        return [
            'name' => $type === 'group' ? fake()->words(2, true) : null,
            'type' => $type,
            'image' => null,
            'description' => $type === 'group' ? fake()->optional(0.5)->sentence() : null,
        ];
    }

    /**
     * Indicate that the conversation is a private chat.
     */
    public function private(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'private',
            'name' => null,
            'description' => null,
        ]);
    }

    /**
     * Indicate that the conversation is a group chat.
     */
    public function group(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'group',
            'name' => fake()->words(2, true),
            'description' => fake()->optional(0.7)->sentence(),
        ]);
    }
}