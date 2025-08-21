<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreMessageRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->check();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'conversation_id' => 'required|exists:conversations,id',
            'content' => $this->type === 'text' ? 'required|string|max:5000' : 'nullable|string|max:5000',
            'type' => 'required|in:text,image,video,file,sticker,gif',
            'media' => in_array($this->type, ['image', 'video', 'file']) ? 'required|file|max:10240' : 'nullable|file|max:10240',
        ];
    }

    /**
     * Get custom error messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'conversation_id.required' => 'Conversation is required.',
            'conversation_id.exists' => 'Selected conversation does not exist.',
            'content.max' => 'Message cannot exceed 5000 characters.',
            'type.required' => 'Message type is required.',
            'type.in' => 'Invalid message type.',
            'media.file' => 'Please upload a valid file.',
            'media.max' => 'File size cannot exceed 10MB.',
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            // Require content for text messages
            if ($this->type === 'text' && (empty($this->content) || trim($this->content) === '')) {
                $validator->errors()->add('content', 'Message content is required for text messages.');
            }

            // Require media for non-text messages
            if (in_array($this->type, ['image', 'video', 'file']) && !$this->hasFile('media')) {
                $validator->errors()->add('media', 'Media file is required for this message type.');
            }
        });
    }
}