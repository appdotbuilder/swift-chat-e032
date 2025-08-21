import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { AppShell } from '@/components/app-shell';

interface Conversation {
    id: number;
    name: string;
    type: 'private' | 'group';
    image: string | null;
    latest_message: {
        content: string;
        type: string;
        created_at: string;
        user_name: string;
    } | null;
    unread_count: number;
}

interface Props {
    conversations: Conversation[];
    [key: string]: unknown;
}

export default function MessagesIndex({ conversations }: Props) {
    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
        
        if (diffInHours < 24) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (diffInHours < 168) {
            return date.toLocaleDateString([], { weekday: 'short' });
        } else {
            return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        }
    };

    const getMessagePreview = (message: Conversation['latest_message']) => {
        if (!message) return 'No messages yet';
        
        switch (message.type) {
            case 'image':
                return '📸 Photo';
            case 'video':
                return '🎥 Video';
            case 'file':
                return '📄 File';
            case 'sticker':
                return '😊 Sticker';
            case 'gif':
                return '🎬 GIF';
            default:
                return message.content || 'Message';
        }
    };

    return (
        <AppShell>
            <Head title="Messages" />
            
            <div className="flex h-full bg-gray-50 dark:bg-gray-900">
                {/* Conversations List */}
                <div className="w-full max-w-md bg-white border-r border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                    {/* Header */}
                    <div className="bg-green-600 p-4 text-white">
                        <div className="flex items-center justify-between">
                            <h1 className="text-xl font-semibold">Messages</h1>
                            <Link
                                href={route('conversations.create')}
                                className="p-2 rounded-full hover:bg-green-700 transition-colors"
                                title="New conversation"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            </Link>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search conversations..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                            />
                            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>

                    {/* Conversations */}
                    <div className="overflow-y-auto flex-1">
                        {conversations.length === 0 ? (
                            <div className="p-8 text-center">
                                <div className="text-6xl mb-4">💬</div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No conversations yet</h3>
                                <p className="text-gray-500 dark:text-gray-400 mb-4">Start a new conversation to begin messaging</p>
                                <Link
                                    href={route('conversations.create')}
                                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Start Conversation
                                </Link>
                            </div>
                        ) : (
                            conversations.map((conversation) => (
                                <Link
                                    key={conversation.id}
                                    href={route('conversations.show', conversation.id)}
                                    className="block p-4 hover:bg-gray-50 border-b border-gray-100 dark:hover:bg-gray-700 dark:border-gray-700"
                                >
                                    <div className="flex items-center space-x-3">
                                        {/* Avatar */}
                                        <div className="flex-shrink-0">
                                            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-semibold">
                                                {conversation.type === 'group' ? '👥' : conversation.name.charAt(0).toUpperCase()}
                                            </div>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-medium text-gray-900 truncate dark:text-white">
                                                    {conversation.name}
                                                </p>
                                                {conversation.latest_message && (
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        {formatTime(conversation.latest_message.created_at)}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm text-gray-600 truncate dark:text-gray-300">
                                                    {getMessagePreview(conversation.latest_message)}
                                                </p>
                                                {conversation.unread_count > 0 && (
                                                    <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-green-600 rounded-full">
                                                        {conversation.unread_count}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </div>

                {/* Empty State */}
                <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                    <div className="text-center">
                        <div className="text-8xl mb-4">💬</div>
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                            Select a conversation
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400">
                            Choose a conversation from the sidebar to start messaging
                        </p>
                    </div>
                </div>
            </div>
        </AppShell>
    );
}