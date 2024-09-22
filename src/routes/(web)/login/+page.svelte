<script>
    import { signIn, signOut } from "@auth/sveltekit/client";
</script>

<svelte:head>
    <title>Login</title>
</svelte:head>

<main class="flex items-center justify-center min-h-screen bg-gray-100">
    <div class="w-full max-w-sm p-6 bg-white rounded-lg shadow-md">
        <h2 class="text-2xl font-bold text-center text-gray-700">Login</h2>
        <div class="mt-4">
            <button
                on:click={() => signIn("github")}
                class="flex items-center justify-center w-full px-4 py-2 font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800 focus:outline-none focus:bg-gray-800"
            >
                <svg
                    class="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        fill-rule="evenodd"
                        d="M12 0C5.373 0 0 5.373 0 12c0 5.303 3.438 9.8 8.207 11.387.599.111.793-.26.793-.577v-2.157c-3.338.725-4.042-1.416-4.042-1.416-.546-1.386-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.204.085 1.837 1.236 1.837 1.236 1.07 1.834 2.807 1.305 3.492.997.108-.775.42-1.305.762-1.605-2.665-.306-5.466-1.335-5.466-5.933 0-1.311.469-2.382 1.235-3.222-.124-.304-.535-1.527.117-3.183 0 0 1.008-.323 3.301 1.23a11.492 11.492 0 0 1 3.004-.404c1.018.004 2.042.138 3.004.404 2.292-1.554 3.3-1.23 3.3-1.23.653 1.656.242 2.879.118 3.183.767.84 1.235 1.911 1.235 3.222 0 4.609-2.803 5.625-5.474 5.921.431.373.815 1.103.815 2.222v3.293c0 .319.194.693.801.576C20.565 21.796 24 17.301 24 12c0-6.627-5.373-12-12-12z"
                        clip-rule="evenodd"
                    />
                </svg>
                Login with GitHub
            </button>
        </div>
        
    </div>
</main>
