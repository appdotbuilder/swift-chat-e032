<?php

namespace Database\Factories;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Message>
 */
class MessageFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var class-string<\App\Models\Message>
     */
    protected $model = Message::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'conversation_id' => Conversation::factory(),
            'user_id' => User::factory(),
            'content' => fake()->sentence(),
            'type' => 'text',
            'media' => null,
            'is_edited' => false,
            'edited_at' => null,
        ];
    }

    /**
     * Indicate that the message is an image.
     */
    public function image(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'image',
            'content' => fake()->optional(0.3)->sentence(),
            'media' => [
                'path' => 'messages/test-image.jpg',
                'original_name' => 'photo.jpg',
                'mime_type' => 'image/jpeg',
                'size' => random_int(100000, 5000000),
            ],
        ]);
    }

    /**
     * Indicate that the message is a video.
     */
    public function video(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'video',
            'content' => fake()->optional(0.3)->sentence(),
            'media' => [
                'path' => 'messages/test-video.mp4',
                'original_name' => 'video.mp4',
                'mime_type' => 'video/mp4',
                'size' => random_int(1000000, 50000000),
            ],
        ]);
    }

    /**
     * Indicate that the message is a file.
     */
    public function file(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'file',
            'content' => fake()->optional(0.3)->sentence(),
            'media' => [
                'path' => 'messages/test-file.pdf',
                'original_name' => 'document.pdf',
                'mime_type' => 'application/pdf',
                'size' => random_int(50000, 10000000),
            ],
        ]);
    }

    /**
     * Indicate that the message has been edited.
     */
    public function edited(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_edited' => true,
            'edited_at' => fake()->dateTimeBetween('-1 week', 'now'),
        ]);
    }
}