import React, { useState, useRef, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import { AppShell } from '@/components/app-shell';

interface User {
    id: number;
    name: string;
}

interface MediaData {
    path: string;
    original_name: string;
    mime_type: string;
    size: number;
}

interface Message {
    id: number;
    content: string | null;
    type: 'text' | 'image' | 'video' | 'file' | 'sticker' | 'gif';
    media: MediaData | null;
    is_edited: boolean;
    created_at: string;
    user: User;
    is_own: boolean;
}

interface Conversation {
    id: number;
    name: string;
    type: 'private' | 'group';
    image: string | null;
    description: string | null;
    users: User[];
}

interface Props {
    conversation: Conversation;
    messages: Message[];
    [key: string]: unknown;
}

export default function MessagesShow({ conversation, messages: initialMessages }: Props) {
    const [messages, setMessages] = useState(initialMessages);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const emojis = ['😊', '😂', '❤️', '👍', '🔥', '🎉', '😢', '😍', '🤔', '👏', '🙏', '💪', '✨', '🌟', '🎈', '🎁'];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = async (content: string, type: string = 'text', file?: File) => {
        if ((!content.trim() && type === 'text') || isLoading) return;

        setIsLoading(true);

        try {
            const formData = new FormData();
            formData.append('conversation_id', conversation.id.toString());
            formData.append('type', type);
            
            if (content) {
                formData.append('content', content);
            }
            
            if (file) {
                formData.append('media', file);
            }

            const response = await fetch(route('messages.store'), {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            const data = await response.json();

            if (response.ok) {
                setMessages(prev => [...prev, data.message]);
                setNewMessage('');
                setShowEmojiPicker(false);
            }
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        sendMessage(newMessage);
    };

    const handleEmojiClick = (emoji: string) => {
        setNewMessage(prev => prev + emoji);
        setShowEmojiPicker(false);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        let type = 'file';
        if (file.type.startsWith('image/')) {
            type = 'image';
        } else if (file.type.startsWith('video/')) {
            type = 'video';
        }

        sendMessage('', type, file);
    };

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const renderMessage = (message: Message) => {
        const isOwn = message.is_own;
        
        return (
            <div
                key={message.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}
            >
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                    isOwn 
                        ? 'bg-green-600 text-white rounded-tr-md' 
                        : 'bg-white text-gray-900 border border-gray-200 rounded-tl-md dark:bg-gray-700 dark:text-white dark:border-gray-600'
                }`}>
                    {!isOwn && conversation.type === 'group' && (
                        <p className="text-xs font-medium mb-1 opacity-75">
                            {message.user.name}
                        </p>
                    )}
                    
                    {message.type === 'text' && (
                        <p className="break-words">{message.content}</p>
                    )}
                    
                    {message.type === 'image' && message.media && (
                        <div className="space-y-2">
                            <img
                                src={`/storage/${message.media.path}`}
                                alt="Shared image"
                                className="rounded-lg max-w-full h-auto"
                            />
                            {message.content && <p className="break-words">{message.content}</p>}
                        </div>
                    )}
                    
                    {message.type === 'video' && message.media && (
                        <div className="space-y-2">
                            <video
                                src={`/storage/${message.media.path}`}
                                controls
                                className="rounded-lg max-w-full h-auto"
                            />
                            {message.content && <p className="break-words">{message.content}</p>}
                        </div>
                    )}
                    
                    {message.type === 'file' && message.media && (
                        <div className="flex items-center space-x-2">
                            <div className="p-2 bg-gray-100 rounded-lg dark:bg-gray-600">
                                <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-medium">{message.media.original_name}</p>
                                <p className="text-xs opacity-75">{(message.media.size / 1024 / 1024).toFixed(1)} MB</p>
                            </div>
                        </div>
                    )}
                    
                    <div className="flex items-center justify-between mt-1">
                        <p className={`text-xs ${isOwn ? 'text-green-100' : 'text-gray-500 dark:text-gray-400'}`}>
                            {formatTime(message.created_at)}
                            {message.is_edited && ' (edited)'}
                        </p>
                        {isOwn && (
                            <div className="flex space-x-1">
                                <svg className="w-3 h-3 text-green-100" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <svg className="w-3 h-3 text-green-100" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <AppShell>
            <Head title={`Chat with ${conversation.name}`} />
            
            <div className="flex h-full bg-gray-50 dark:bg-gray-900">
                {/* Chat Container */}
                <div className="flex flex-col flex-1 bg-white dark:bg-gray-800">
                    {/* Chat Header */}
                    <div className="bg-green-600 p-4 text-white flex items-center space-x-3 border-b">
                        <button
                            onClick={() => router.visit(route('conversations.index'))}
                            className="p-1 hover:bg-green-700 rounded-full transition-colors lg:hidden"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        
                        <div className="w-10 h-10 bg-green-700 rounded-full flex items-center justify-center font-semibold">
                            {conversation.type === 'group' ? '👥' : conversation.name.charAt(0).toUpperCase()}
                        </div>
                        
                        <div className="flex-1">
                            <h1 className="font-semibold">{conversation.name}</h1>
                            <p className="text-sm text-green-100">
                                {conversation.type === 'group' 
                                    ? `${conversation.users.length} members`
                                    : 'Online'
                                }
                            </p>
                        </div>
                        
                        <button className="p-2 hover:bg-green-700 rounded-full transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                            </svg>
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-green-50 to-white dark:from-gray-700 dark:to-gray-800">
                        {messages.length === 0 ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center">
                                    <div className="text-6xl mb-4">👋</div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                        Start the conversation
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400">
                                        Send your first message to {conversation.name}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <>
                                {messages.map(renderMessage)}
                                <div ref={messagesEndRef} />
                            </>
                        )}
                    </div>

                    {/* Message Input */}
                    <div className="p-4 bg-white border-t border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                        {/* Emoji Picker */}
                        {showEmojiPicker && (
                            <div className="mb-3 p-3 bg-gray-50 rounded-lg dark:bg-gray-700">
                                <div className="flex flex-wrap gap-2">
                                    {emojis.map((emoji) => (
                                        <button
                                            key={emoji}
                                            onClick={() => handleEmojiClick(emoji)}
                                            className="text-2xl hover:bg-gray-200 dark:hover:bg-gray-600 p-1 rounded transition-colors"
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="flex items-end space-x-2">
                            <div className="flex space-x-2">
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                    </svg>
                                </button>
                                
                                <button
                                    type="button"
                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                                >
                                    <span className="text-lg">😊</span>
                                </button>
                            </div>
                            
                            <div className="flex-1 flex items-end space-x-2">
                                <textarea
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-full resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                                    rows={1}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            sendMessage(newMessage);
                                        }
                                    }}
                                />
                                
                                <button
                                    type="submit"
                                    disabled={isLoading || (!newMessage.trim())}
                                    className="p-2 bg-green-600 text-white rounded-full hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                </button>
                            </div>
                        </form>
                        
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*,video/*,.pdf,.doc,.docx"
                            onChange={handleFileUpload}
                            className="hidden"
                        />
                    </div>
                </div>
            </div>
        </AppShell>
    );
}