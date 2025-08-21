import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { AppShell } from '@/components/app-shell';

interface User {
    id: number;
    name: string;
    email: string;
}

interface Props {
    users: User[];
    [key: string]: unknown;
}



export default function CreateConversation({ users }: Props) {
    const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        type: 'private' as 'private' | 'group',
        description: '',
        user_ids: [] as number[],
    });

    const filteredUsers = users.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleUser = (userId: number) => {
        const newSelectedUsers = selectedUsers.includes(userId)
            ? selectedUsers.filter(id => id !== userId)
            : [...selectedUsers, userId];
        
        setSelectedUsers(newSelectedUsers);
        setData('user_ids', newSelectedUsers);
        
        // Auto-set type based on number of users
        if (newSelectedUsers.length === 1) {
            setData('type', 'private');
        } else if (newSelectedUsers.length > 1) {
            setData('type', 'group');
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('conversations.store'));
    };

    return (
        <AppShell>
            <Head title="New Conversation" />
            
            <div className="max-w-2xl mx-auto p-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => router.visit(route('conversations.index'))}
                                className="p-1 hover:bg-gray-100 rounded-full transition-colors dark:hover:bg-gray-700"
                            >
                                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">New Conversation</h1>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* Conversation Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Conversation Type
                            </label>
                            <div className="flex space-x-4">
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        value="private"
                                        checked={data.type === 'private'}
                                        onChange={(e) => setData('type', e.target.value as 'private' | 'group')}
                                        className="mr-2 text-green-600 focus:ring-green-500"
                                        disabled={selectedUsers.length > 1}
                                    />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">Private Chat</span>
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        value="group"
                                        checked={data.type === 'group'}
                                        onChange={(e) => setData('type', e.target.value as 'private' | 'group')}
                                        className="mr-2 text-green-600 focus:ring-green-500"
                                    />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">Group Chat</span>
                                </label>
                            </div>
                            {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type}</p>}
                        </div>

                        {/* Group Name (only for group chats) */}
                        {data.type === 'group' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Group Name
                                </label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Enter group name..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                                />
                                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                            </div>
                        )}

                        {/* Group Description (only for group chats) */}
                        {data.type === 'group' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Description (Optional)
                                </label>
                                <textarea
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Enter group description..."
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                                />
                                {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                            </div>
                        )}

                        {/* User Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Select Users ({selectedUsers.length} selected)
                            </label>
                            
                            {/* Search */}
                            <div className="mb-4">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search users..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                                />
                            </div>

                            {/* User List */}
                            <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg dark:border-gray-600">
                                {filteredUsers.length === 0 ? (
                                    <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                                        No users found
                                    </div>
                                ) : (
                                    filteredUsers.map((user) => (
                                        <label
                                            key={user.id}
                                            className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 dark:hover:bg-gray-700 dark:border-gray-600"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedUsers.includes(user.id)}
                                                onChange={() => toggleUser(user.id)}
                                                className="mr-3 text-green-600 focus:ring-green-500 rounded"
                                                disabled={data.type === 'private' && selectedUsers.length >= 1 && !selectedUsers.includes(user.id)}
                                            />
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {user.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        {user.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </label>
                                    ))
                                )}
                            </div>
                            {errors.user_ids && <p className="mt-1 text-sm text-red-600">{errors.user_ids}</p>}
                        </div>

                        {/* Selected Users Summary */}
                        {selectedUsers.length > 0 && (
                            <div>
                                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Selected Users:</h4>
                                <div className="flex flex-wrap gap-2">
                                    {selectedUsers.map(userId => {
                                        const user = users.find(u => u.id === userId);
                                        return user ? (
                                            <span
                                                key={userId}
                                                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                                            >
                                                {user.name}
                                                <button
                                                    type="button"
                                                    onClick={() => toggleUser(userId)}
                                                    className="ml-2 hover:text-green-600"
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        ) : null;
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                            <button
                                type="button"
                                onClick={() => router.visit(route('conversations.index'))}
                                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-700"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={processing || selectedUsers.length === 0}
                                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {processing ? 'Creating...' : 'Create Conversation'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AppShell>
    );
}