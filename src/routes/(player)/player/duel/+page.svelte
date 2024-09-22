<script lang="ts">
    import { onMount } from "svelte";
    import axios from "axios";

    var players: any[] = [];

    let page = 1;
    let limit = 5;
    let filter = "recomended";

    let search: string = "";
    let status: string = "loading";
    let canLoadMore: boolean = false;

    async function loadPlayers() {
        status = "loading";
        try {
            const response = await axios.get("/api/players", {
                params: {
                    page: page,
                    limit: limit,
                    recomended: filter === "recomended" ? true : false,
                    q: search,
                },
            });
            if (response.data.data != null && response.data.data.length == 5) {
                canLoadMore = true;
            } else {
                canLoadMore = false;
            }
            players = response.data.data;
            status = "finish";
        } catch (error) {
            status = "Error : " + error;
        }
    }

    async function loadMore(e: any) {
        const _myButton = e.currentTarget;
        _myButton.disabled = true;
        _myButton.textContent = "Loading...";
        try {
            page++;
            const response = await axios.get("/api/players", {
                params: {
                    page: page,
                    limit: limit,
                    recomended: filter === "recomended" ? true : false,
                    q: search,
                },
            });

            if (response.data.data != null && response.data.data.length == 5) {
                canLoadMore = true;
            } else {
                canLoadMore = false;
            }

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
            players = [];
            search = e.target.value;
            loadPlayers();
        }, 500)();
    };

    onMount(() => {
        loadPlayers();
    });
</script>

<svelte:head>
    <title>D-D-D-DUELLLLLL</title>
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
                            D-D-D-DUELLLLLL
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

                        <div class="flex gap-2 mt-2">
                            <button
                                on:click={() => {
                                    filter = "recomended";
                                    players = [];
                                    loadPlayers();
                                }}
                                class="rounded-md px-2 py-1 text-sm border-green-900 border-2 hover:bg-green-700 hover:text-white {filter ==
                                'recomended'
                                    ? 'bg-green-700 text-white'
                                    : ''}"
                            >
                                Recomended
                            </button>
                            <button
                                on:click={() => {
                                    filter = "all";
                                    players = [];
                                    loadPlayers();
                                }}
                                class="rounded-md px-2 py-1 text-sm border-green-900 border-2 hover:bg-green-700 hover:text-white {filter ==
                                'all'
                                    ? 'bg-green-700 text-white'
                                    : ''}"
                            >
                                All
                            </button>
                        </div>
                        <div class="flex flex-col gap-4 w-full mt-4">
                            {#if players.length == 0}
                                {#if status == "loading"}
                                    <p class="text-center text-green-900">
                                        Loading...
                                    </p>
                                {:else if status != "finish"}
                                    <p class="text-center text-red-900">
                                        {status}
                                    </p>
                                {:else}
                                    <p class="text-center text-red-900">
                                        Not find player
                                    </p>
                                {/if}
                            {/if}
                            {#each players as player}
                                <div
                                    class="font-mono bg-[#d0d058] text-[#0f380f] rounded-lg overflow-hidden border-4 border-[#8bac0f]"
                                >
                                    <div class="p-2 space-y-2">
                                        <div
                                            class="flex flex-col md:flex-row gap-2 md:gap-0 items-start space-x-2"
                                        >
                                            <div class="flex gap-1 w-56 items-center">
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
                                                    <div>
                                                        {#each player.tags as tag}
                                                            <div
                                                                class="inline-block"
                                                            >
                                                                <div
                                                                    class="h-6 flex ml-1 mb-1 text-center justify-center items-center text-white font-bold rounded-full px-2 text-xs"
                                                                    style="background-color: {tag.color};"
                                                                >
                                                                    <span
                                                                        >{tag.name}</span
                                                                    >
                                                                </div>
                                                            </div>
                                                           
                                                        {/each}
                                                    </div>
                                                </div>
                                            </div>

                                            <div class="flex-1">
                                                <div
                                                    class="grid grid-cols-3 gap-2 text-sm"
                                                >
                                                    <div
                                                        class="flex justify-between items-center bg-[#9bbc0f] p-1 gap-1"
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
                                                        class="flex justify-between items-center bg-[#9bbc0f] p-1 gap-1"
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
                                                        class="flex justify-between items-center bg-[#9bbc0f] p-1 gap-1"
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
                                                        class="flex justify-between items-center bg-[#9bbc0f] p-1 gap-1"
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
                                                        class="flex justify-between items-center bg-[#9bbc0f] p-1 gap-1"
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
                            {#if canLoadMore}
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
