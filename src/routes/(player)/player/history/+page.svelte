<script lang="ts">
    import { onMount } from "svelte";
    import axios from "axios";

    var battles: any[] = [];

    let page = 1;
    let limit = 5;

    let search: string = "";
    let status: string = "loading";
    let canLoadMore:boolean = false;

    async function loadHistory() {
        status = "loading";
        try {
            const response = await axios.get("/api/history", {
                params: {
                    page: page,
                    limit: limit,
                    q: search,
                },
            });
            if(response.data.data != null && response.data.data.length == 5){
                canLoadMore = true
            } else {
                canLoadMore = false;
            }
            battles = response.data.data;
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
            const response = await axios.get("/api/history", {
                params: {
                    page: page,
                    limit: limit,
                    q: search,
                },
            });
            if(response.data.data != null && response.data.data.length == 5){
                canLoadMore = true
            } else {
                canLoadMore = false;
            }
            battles = [...battles, ...response.data.data];
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
            loadHistory();
        }, 500)();
    };

    onMount(() => {
        loadHistory();
    });
</script>

<svelte:head>
    <title>My Battle History</title>
</svelte:head>
<div class="container mx-auto p-0 md:p-8">
    <div class="flex items-center justify-center  mt-0 md:mt-4">
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
                            My Battle History
                        </h2>
                    </div>
                </div>

                <div class="mt-4">
                    <div id="tab1">
                        <div class="flex gap-2">
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
                        </div>
                        <div
                            class="w-full mt-4 overflow-y-auto"
                            style="height: max(500px, 60vh);"
                        >
                            <div class="flex flex-col gap-4">
                                {#if battles.length == 0}
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
                                            No battle yet
                                        </p>
                                    {/if}
                                {/if}
                                {#each battles as battle}
                                    <div
                                        class="font-mono bg-[#d0d058] text-[#0f380f] rounded-lg overflow-hidden border-4 border-[#8bac0f]"
                                    >
                                        <div class="p-2 space-y-2">
                                            <div
                                                class="flex flex-col md:flex-row gap-2 items-start"
                                            >
                                                <div class="flex gap-1 w-full md:w-2/6">
                                                    <img
                                                        src="https://avatars.githubusercontent.com/u/{battle
                                                            .defender.id}"
                                                        alt="Pixel art character avatar"
                                                        class="w-16 h-16 border-2 border-[#0f380f]"
                                                    />
                                                    <div>
                                                        <h2
                                                            class=" font-bold tracking-tight leading-none mb-1 text-shadow-[2px_2px_0px_#306230]"
                                                        >
                                                            {battle.defender
                                                                .name}
                                                        </h2>

                                                        <p class="text-sm">
                                                            Level {battle
                                                                .defender.level}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div class="w-full md:w-3/6">
                                                    <div
                                                        class="grid grid-cols-3 gap-2 text-sm"
                                                    >
                                                        <div
                                                            class="flex justify-between items-center bg-[#9bbc0f] p-1"
                                                        >
                                                            <span>HP</span>
                                                            <span
                                                                >{battle
                                                                    .defender
                                                                    .stats
                                                                    .hp}</span
                                                            >
                                                        </div>
                                                        <div
                                                            class="flex justify-between items-center bg-[#9bbc0f] p-1"
                                                        >
                                                            <span>ATK</span>
                                                            <span
                                                                >{battle
                                                                    .defender
                                                                    .stats
                                                                    .attack}</span
                                                            >
                                                        </div>
                                                        <div
                                                            class="flex justify-between items-center bg-[#9bbc0f] p-1"
                                                        >
                                                            <span>STR</span>
                                                            <span
                                                                >{battle
                                                                    .defender
                                                                    .stats
                                                                    .strength}</span
                                                            >
                                                        </div>
                                                        <div
                                                            class="flex justify-between items-center bg-[#9bbc0f] p-1"
                                                        >
                                                            <span>DEF</span>
                                                            <span
                                                                >{battle
                                                                    .defender
                                                                    .stats
                                                                    .defense}</span
                                                            >
                                                        </div>
                                                        <div
                                                            class="flex justify-between items-center bg-[#9bbc0f] p-1"
                                                        >
                                                            <span>SPD</span>
                                                            <span
                                                                >{battle
                                                                    .defender
                                                                    .stats
                                                                    .speed}</span
                                                            >
                                                        </div>
                                                    </div>
                                                </div>
                                                <div
                                                    class="flex flex-wor md:flex-col gap-1 w-full md:w-1/6"
                                                >
                                                    {#if battle.status == "win"}
                                                        <div
                                                            class="py-1 px-2 bg-green-700 rounded-md"
                                                        >
                                                            <p
                                                                class="text-green-300 font-bold"
                                                            >
                                                                WIN
                                                            </p>
                                                        </div>
                                                        <p
                                                            class="text-green-700"
                                                        >
                                                            +{battle.score}
                                                        </p>
                                                    {:else if battle.status == "lose"}
                                                        <div
                                                            class="py-1 px-2 bg-red-700 rounded-md"
                                                        >
                                                            <p
                                                                class="text-red-300 font-bold"
                                                            >
                                                                LOSE
                                                            </p>
                                                        </div>
                                                        <p class="text-red-700">
                                                            {battle.score}
                                                        </p>
                                                    {:else}
                                                        <div
                                                            class="py-1 px-2 bg-yellow-700 rounded-md"
                                                        >
                                                            <p
                                                                class="text-yellow-300 font-bold"
                                                            >
                                                                DRAW
                                                            </p>
                                                        </div>
                                                        <p>
                                                            -{battle.score}
                                                        </p>
                                                    {/if}
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
</div>
