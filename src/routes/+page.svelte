<script lang="ts">
    import { onMount } from "svelte";

    onMount(() => {
        
    });
</script>

<svelte:head>
    <title>GitKnight</title>
</svelte:head>
<header class="bg-red-500 text-white p-4 border-b-4 border-red-700">
    <div class="container mx-auto flex justify-between items-center">
        <h1 class="text-3xl font-bold tracking-tight">GitKnights</h1>
        <nav>
            <ul class="flex space-x-4">
                <li><a href="#" class="hover:text-yellow-300">Home</a></li>
                <li><a href="#" class="hover:text-yellow-300">About</a></li>
                <li><a href="/login" class="hover:text-yellow-300">Play</a></li>
            </ul>
        </nav>
    </div>
</header>

<main>
    <section class="py-20 text-center bg-blue-200">
        <h2 class="text-6xl font-bold mb-6 animate-pulse text-blue-800">
            GitKnights
        </h2>
        <p class="text-2xl mb-8 text-gray-700">
            Battle with your GitHub stats in epic 1v1 turn-based combat!
        </p>
        <div class="flex justify-center space-x-4">
            <a
                href="/login"
                class="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 border-b-4 border-green-700 hover:border-green-800 rounded text-lg"
            >
                Play Now
            </a>
            <button
                class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 border-b-4 border-blue-700 hover:border-blue-800 rounded text-lg"
            >
                Learn More
            </button>
        </div>
    </section>

    <section class="py-20 bg-purple-200">
        <div class="container mx-auto text-center">
            <h3 class="text-4xl font-bold mb-12 text-purple-800">
                Game Features
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div
                    class="bg-white p-6 rounded-lg border-4 border-purple-500 shadow-lg"
                >
                    <div class="flex justify-center mb-4">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="w-12 h-12 text-purple-600"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        >
                            <path
                                d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"
                            ></path>
                        </svg>
                    </div>
                    <h4 class="text-xl font-bold mb-2 text-purple-800">
                        GitHub-Powered
                    </h4>
                    <p class="text-gray-700">
                        Your GitHub activity determines your character's
                        strength!
                    </p>
                </div>
                <div
                    class="bg-white p-6 rounded-lg border-4 border-purple-500 shadow-lg"
                >
                    <div class="flex justify-center mb-4">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="w-12 h-12 text-purple-600"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        >
                            <path d="M14.5 17.5L3 6V3h3l11.5 11.5"></path>
                            <path d="M13 19l6-6"></path>
                            <path d="M16 16l4 4"></path>
                            <path d="M19 21l2-2"></path>
                        </svg>
                    </div>
                    <h4 class="text-xl font-bold mb-2 text-purple-800">
                        Epic Battles
                    </h4>
                    <p class="text-gray-700">
                        Engage in thrilling 1v1 turn-based combat with other
                        developers!
                    </p>
                </div>
                <div
                    class="bg-white p-6 rounded-lg border-4 border-purple-500 shadow-lg"
                >
                    <div class="flex justify-center mb-4">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="w-12 h-12 text-purple-600"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        >
                            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"
                            ></polyline>
                        </svg>
                    </div>
                    <h4 class="text-xl font-bold mb-2 text-purple-800">
                        Dynamic Stats
                    </h4>
                    <p class="text-gray-700">
                        Your stats evolve as you contribute more to open source!
                    </p>
                </div>
                <div
                    class="bg-white p-6 rounded-lg border-4 border-purple-500 shadow-lg"
                >
                    <div class="flex justify-center mb-4">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="w-12 h-12 text-purple-600"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        >
                            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
                            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
                            <path d="M4 22h16"></path>
                            <path
                                d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"
                            ></path>
                            <path
                                d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"
                            ></path>
                            <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
                        </svg>
                    </div>
                    <h4 class="text-xl font-bold mb-2 text-purple-800">
                        Leaderboards
                    </h4>
                    <p class="text-gray-700">
                        Climb the ranks and become the ultimate GitKnight!
                    </p>
                </div>
            </div>
        </div>
    </section>

    <section class="py-20 bg-green-300 text-gray-800">
        <div class="container mx-auto text-center">
            <h3 class="text-4xl font-bold mb-6 text-green-800">
                Ready to Battle?
            </h3>
            <p class="text-2xl mb-8 text-gray-700">
                Connect your GitHub account and start your adventure now!
            </p>
            <button
                class="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 border-b-4 border-red-700 hover:border-red-800 rounded text-lg"
            >
                Connect GitHub & Play
            </button>
        </div>
    </section>
</main>

<footer class="bg-gray-800 text-white text-center py-4">
    <p>&copy; 2023 GitKnights. All rights reserved.</p>
</footer>
