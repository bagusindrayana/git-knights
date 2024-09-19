<script lang="ts">
    import { onMount } from "svelte";
    import axios from "axios";

    var players: any[] = [];

    let page = 1;
    let limit = 5;

    let search: string = "";

    async function loadPlayers() {
        const response = await axios.get("/api/topPlayers", {
            params: {
                page: page,
                limit: limit,
                q: search,
            },
        });

        players = response.data.data;
    }

    async function loadMore(e: any) {
        const _myButton = e.currentTarget;
        _myButton.disabled = true;
        _myButton.textContent = "Loading...";
        try {
            page++;
            const response = await axios.get("/api/topPlayers", {
                params: {
                    page: page,
                    limit: limit,
                    q: search,
                },
            });

            players = [...players, ...response.data.data];
            _myButton.disabled = false;
            _myButton.textContent = "Load More";
        } catch (error) {
            alert(error);
            page--;
            console.error(error);
            _myButton.disabled = false;
            _myButton.textContent = "Load More";
        }
    }

    const debounce = (fn: Function, ms = 300) => {
        let timeoutId: ReturnType<typeof setTimeout>;
        return function (this: any, ...args: any[]) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => fn.apply(this, args), ms);
        };
    };

    const doSearch = (e: any) => {
        page = 1;
        debounce(() => {
            search = e.target.value;
            loadPlayers();
        }, 500)();
    };

    onMount(() => {
        loadPlayers();
    });
</script>

<svelte:head>
    <title>TOP PLAYER</title>
</svelte:head>
<div class="container mx-auto p-0 md:p-8">
    <div class="flex items-center justify-center mt-4">
        <div class="main-card">
            <div class=" p-2 md:p-8">
                <div
                    class="flex justify-between border-b-green-800 border-b-2 py-4"
                >
                    <div>
                        <a
                            href="/player?tab=battle"
                            class="retro-btn blue-retro-btn">Back</a
                        >
                    </div>
                    <div class="flex-1 text-center">
                        <h2 class="text-2xl font-bold text-green-900 -ml-4">
                            RAJA KODING
                        </h2>
                    </div>
                </div>

                <div class="mt-4">
                    <div id="tab1">
                        <div class="flex w-full gap-1">
                            <!-- Retro Search Input -->
                            <input
                                on:keyup={doSearch}
                                type="text"
                                placeholder="Search..."
                                class="text-gray-900 px-4 py-2 w-full rounded-md shadow-md border-4 border-blue-500 bg-blue-100 focus:outline-none focus:ring-4 focus:ring-blue-300
                                       placeholder-gray-500 text-lg font-mono tracking-wider"
                            />
                            <!-- Search Button Icon -->
                            <button class="retro-btn blue-retro-btn">
                                Search
                            </button>
                        </div>

                        <div class="flex flex-col gap-4 w-full mt-4">
                            {#if players.length == 0}
                                <p class="text-center text-red-900">
                                    Not find player
                                </p>
                            {/if}
                            {#each players as player, index}
                                <div
                                    class="font-mono bg-[#d0d058] text-[#0f380f] rounded-lg border-4 border-[#8bac0f]"
                                >
                                    <div class="p-2 space-y-2">
                                        <div
                                            class="flex flex-col md:flex-row gap-2 md:gap-0 items-start space-x-2 relative"
                                        >
                                            {#if page == 1 && index == 0}
                                                <div
                                                    class="absolute -top-8 -rotate-12 -left-2"
                                                >
                                                    <svg
                                                        class="animate-glow"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        width="40"
                                                        height="40"
                                                        viewBox="0 0 36 36"
                                                        ><path
                                                            fill="#f4900c"
                                                            d="M14.174 17.075L6.75 7.594l-3.722 9.481z"
                                                        /><path
                                                            fill="#f4900c"
                                                            d="m17.938 5.534l-6.563 12.389H24.5z"
                                                        /><path
                                                            fill="#f4900c"
                                                            d="m21.826 17.075l7.424-9.481l3.722 9.481z"
                                                        /><path
                                                            fill="#ffcc4d"
                                                            d="M28.669 15.19L23.887 3.523l-5.88 11.668l-.007.003l-.007-.004l-5.88-11.668L7.331 15.19C4.197 10.833 1.28 8.042 1.28 8.042S3 20.75 3 33h30c0-12.25 1.72-24.958 1.72-24.958s-2.917 2.791-6.051 7.148"
                                                        /><circle
                                                            cx="17.957"
                                                            cy="22"
                                                            r="3.688"
                                                            fill="#5c913b"
                                                        /><circle
                                                            cx="26.463"
                                                            cy="22"
                                                            r="2.412"
                                                            fill="#981ceb"
                                                        /><circle
                                                            cx="32.852"
                                                            cy="22"
                                                            r="1.986"
                                                            fill="#dd2e44"
                                                        /><circle
                                                            cx="9.45"
                                                            cy="22"
                                                            r="2.412"
                                                            fill="#981ceb"
                                                        /><circle
                                                            cx="3.061"
                                                            cy="22"
                                                            r="1.986"
                                                            fill="#dd2e44"
                                                        /><path
                                                            fill="#ffac33"
                                                            d="M33 34H3a1 1 0 1 1 0-2h30a1 1 0 1 1 0 2m0-3.486H3a1 1 0 1 1 0-2h30a1 1 0 1 1 0 2"
                                                        /><circle
                                                            cx="1.447"
                                                            cy="8.042"
                                                            r="1.407"
                                                            fill="#ffcc4d"
                                                        /><circle
                                                            cx="6.75"
                                                            cy="7.594"
                                                            r="1.192"
                                                            fill="#f4900c"
                                                        /><circle
                                                            cx="12.113"
                                                            cy="3.523"
                                                            r="1.784"
                                                            fill="#ffcc4d"
                                                        /><circle
                                                            cx="34.553"
                                                            cy="8.042"
                                                            r="1.407"
                                                            fill="#ffcc4d"
                                                        /><circle
                                                            cx="29.25"
                                                            cy="7.594"
                                                            r="1.192"
                                                            fill="#f4900c"
                                                        /><circle
                                                            cx="23.887"
                                                            cy="3.523"
                                                            r="1.784"
                                                            fill="#ffcc4d"
                                                        /><circle
                                                            cx="17.938"
                                                            cy="5.534"
                                                            r="1.784"
                                                            fill="#f4900c"
                                                        /></svg
                                                    >
                                                </div>
                                            {/if}
                                            <div class="flex gap-1">
                                                <img
                                                    src="https://avatars.githubusercontent.com/u/{player.id}"
                                                    alt="Pixel art character avatar"
                                                    class="w-16 h-16 border-2 border-[#0f380f]"
                                                />
                                                <div>
                                                    <h2
                                                        class=" font-bold tracking-tight leading-none mb-1 text-shadow-[2px_2px_0px_#306230]"
                                                    >
                                                        {player.name}
                                                    </h2>
                                                    <p class="text-sm">
                                                        Level {player.level}
                                                    </p>
                                                    <p>
                                                        Score : {player.score}
                                                    </p>
                                                </div>
                                            </div>

                                            <div class="flex-1">
                                                {#each player.tags as tag}
                                                    <div class="inline-block">
                                                        <div
                                                            class="h-6 flex ml-1 text-center justify-center items-center text-white font-bold rounded-full px-2 text-xs"
                                                            style="background-color: {tag.color};"
                                                        >
                                                            <span
                                                                >{tag.name}</span
                                                            >
                                                        </div>
                                                    </div>
                                                {/each}
                                            </div>
                                            <div class="flex-1">
                                                <div
                                                    class="grid grid-cols-3 gap-2 text-sm"
                                                >
                                                    <div
                                                        class="flex justify-between items-center bg-[#9bbc0f] p-1"
                                                    >
                                                        <span>HP</span>
                                                        <span
                                                            >{@html player.bonus
                                                                .hp > 0
                                                                ? `<small class="text-green-900">(+${player.bonus.hp})</small>`
                                                                : ""}{player.hp}</span
                                                        >
                                                    </div>
                                                    <div
                                                        class="flex justify-between items-center bg-[#9bbc0f] p-1"
                                                    >
                                                        <span>ATK</span>
                                                        <span
                                                            >{@html player.bonus
                                                                .atk > 0
                                                                ? `<small class="text-green-900">(+${player.bonus.atk})</small>`
                                                                : ""}{player.atk}</span
                                                        >
                                                    </div>
                                                    <div
                                                        class="flex justify-between items-center bg-[#9bbc0f] p-1"
                                                    >
                                                        <span>STR</span>
                                                        <span
                                                            >{@html player.bonus
                                                                .str > 0
                                                                ? `<small class="text-green-900">(+${player.bonus.str})</small>`
                                                                : ""}{player.str}</span
                                                        >
                                                    </div>
                                                    <div
                                                        class="flex justify-between items-center bg-[#9bbc0f] p-1"
                                                    >
                                                        <span>DEF</span>
                                                        <span
                                                            >{@html player.bonus
                                                                .def > 0
                                                                ? `<small class="text-green-900">(+${player.bonus.def})</small>`
                                                                : ""}{player.def}</span
                                                        >
                                                    </div>
                                                    <div
                                                        class="flex justify-between items-center bg-[#9bbc0f] p-1"
                                                    >
                                                        <span>SPD</span>
                                                        <span
                                                            >{@html player.bonus
                                                                .spd > 0
                                                                ? `<small class="text-green-900">(+${player.bonus.spd})</small>`
                                                                : ""}{player.spd}</span
                                                        >
                                                    </div>
                                                </div>
                                            </div>
                                            <div
                                                class="flex flex-col gap-1 justify-center"
                                            >
                                                <a
                                                    href="/player/battle?id={player.id}"
                                                    class="retro-btn red-retro-btn retro-btn-sm"
                                                >
                                                    Duel
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            {/each}
                            {#if players.length == 5}
                                <div class="flex justify-center">
                                    <button
                                        class="retro-btn blue-retro-btn"
                                        on:click={(e) => {
                                            loadMore(e);
                                        }}
                                    >
                                        Load More
                                    </button>
                                </div>
                            {/if}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    @keyframes iconGlow {
        0% {
            filter: drop-shadow(0 0 2px #fff) drop-shadow(0 0 4px #fff)
                drop-shadow(0 0 6px gold);
        }
        100% {
            filter: drop-shadow(0 0 4px #fff) drop-shadow(0 0 8px #fff)
                drop-shadow(0 0 12px gold);
        }
    }
    .animate-glow {
        transition: all;
        animation: iconGlow 1.5s ease-in-out infinite alternate;
    }
</style>
