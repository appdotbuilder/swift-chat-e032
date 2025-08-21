import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="WhatsChat - Instant Messaging">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>
            <div className="flex min-h-screen flex-col items-center bg-gradient-to-br from-green-50 to-gray-50 p-6 text-gray-800 lg:justify-center lg:p-8 dark:from-gray-900 dark:to-gray-800 dark:text-gray-100">
                <header className="mb-6 w-full max-w-[335px] text-sm not-has-[nav]:hidden lg:max-w-4xl">
                    <nav className="flex items-center justify-end gap-4">
                        {auth.user ? (
                            <Link
                                href={route('conversations.index')}
                                className="inline-block rounded-full bg-green-600 px-6 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors"
                            >
                                Open Messages
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={route('login')}
                                    className="inline-block rounded-full border border-green-600 px-6 py-2 text-sm font-medium text-green-600 hover:bg-green-50 transition-colors dark:border-green-400 dark:text-green-400 dark:hover:bg-gray-800"
                                >
                                    Log in
                                </Link>
                                <Link
                                    href={route('register')}
                                    className="inline-block rounded-full bg-green-600 px-6 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors"
                                >
                                    Get Started
                                </Link>
                            </>
                        )}
                    </nav>
                </header>

                <div className="flex w-full items-center justify-center opacity-100 transition-opacity duration-750 lg:grow starting:opacity-0">
                    <main className="flex w-full max-w-[335px] flex-col-reverse lg:max-w-6xl lg:flex-row lg:items-center lg:gap-12">
                        {/* Content Section */}
                        <div className="flex-1 rounded-2xl bg-white p-8 shadow-xl border border-gray-100 lg:p-12 dark:bg-gray-800 dark:border-gray-700">
                            <div className="text-center lg:text-left">
                                <div className="mb-4">
                                    <span className="text-6xl">💬</span>
                                </div>
                                <h1 className="mb-6 text-4xl font-bold text-gray-900 lg:text-5xl dark:text-white">
                                    WhatsChat
                                </h1>
                                <p className="mb-8 text-lg text-gray-600 lg:text-xl dark:text-gray-300">
                                    Fast, secure, and simple messaging for everyone. Connect with friends, family, and colleagues instantly.
                                </p>

                                <div className="grid gap-4 mb-8 sm:grid-cols-2">
                                    <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg dark:bg-green-900/20">
                                        <span className="text-2xl">🚀</span>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 dark:text-white">Lightning Fast</h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Instant message delivery</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg dark:bg-blue-900/20">
                                        <span className="text-2xl">🔒</span>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 dark:text-white">Secure</h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Your privacy matters</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg dark:bg-purple-900/20">
                                        <span className="text-2xl">📱</span>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 dark:text-white">Cross-Platform</h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Works everywhere</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg dark:bg-orange-900/20">
                                        <span className="text-2xl">🎨</span>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 dark:text-white">Rich Media</h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Photos, videos & more</p>
                                        </div>
                                    </div>
                                </div>

                                {!auth.user && (
                                    <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center lg:justify-start">
                                        <Link
                                            href={route('register')}
                                            className="block w-full rounded-full bg-green-600 px-8 py-3 text-center font-semibold text-white hover:bg-green-700 transition-colors sm:w-auto"
                                        >
                                            Start Chatting Free
                                        </Link>
                                        <Link
                                            href={route('login')}
                                            className="block w-full rounded-full border-2 border-green-600 px-8 py-3 text-center font-semibold text-green-600 hover:bg-green-50 transition-colors sm:w-auto dark:hover:bg-gray-800"
                                        >
                                            Sign In
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Visual Section */}
                        <div className="flex-1 mb-8 lg:mb-0">
                            <div className="relative mx-auto max-w-sm">
                                {/* Phone mockup */}
                                <div className="relative bg-gray-900 rounded-3xl p-2 shadow-2xl">
                                    <div className="bg-gray-100 rounded-2xl overflow-hidden dark:bg-gray-800">
                                        {/* Status bar */}
                                        <div className="bg-green-600 p-3 text-white text-center font-medium">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm">9:41</span>
                                                <span className="font-semibold">WhatsChat</span>
                                                <div className="flex gap-1">
                                                    <div className="w-1 h-1 bg-white rounded-full"></div>
                                                    <div className="w-1 h-1 bg-white rounded-full"></div>
                                                    <div className="w-1 h-1 bg-white rounded-full"></div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Chat preview */}
                                        <div className="p-4 space-y-3 h-64 bg-gradient-to-b from-green-50 to-white dark:from-gray-700 dark:to-gray-800">
                                            {/* Incoming message */}
                                            <div className="flex justify-start">
                                                <div className="bg-white rounded-2xl rounded-tl-md px-4 py-2 max-w-xs shadow-sm">
                                                    <p className="text-sm text-gray-800">Hey! How are you doing? 😊</p>
                                                    <p className="text-xs text-gray-500 mt-1">2:30 PM</p>
                                                </div>
                                            </div>

                                            {/* Outgoing message */}
                                            <div className="flex justify-end">
                                                <div className="bg-green-600 rounded-2xl rounded-tr-md px-4 py-2 max-w-xs">
                                                    <p className="text-sm text-white">I'm great! Thanks for asking 🚀</p>
                                                    <p className="text-xs text-green-100 mt-1">2:32 PM ✓✓</p>
                                                </div>
                                            </div>

                                            {/* Media message */}
                                            <div className="flex justify-start">
                                                <div className="bg-white rounded-2xl rounded-tl-md p-2 max-w-xs shadow-sm">
                                                    <div className="bg-gray-200 rounded-lg h-16 flex items-center justify-center mb-2">
                                                        <span className="text-2xl">📸</span>
                                                    </div>
                                                    <p className="text-xs text-gray-500">2:35 PM</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>

                <footer className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
                    <p>
                        Built with ❤️ for seamless communication
                    </p>
                </footer>
            </div>
        </>
    );
}