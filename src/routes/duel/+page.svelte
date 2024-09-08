<script lang="ts">
    import { onMount } from "svelte";
    import axios from "axios";

    let activeTab: string = "tab1";
    var players: any[] = [];

    let page = 1;
    let limit = 10;
    let filter = "recomended";

    function setActiveTab(tabId: string) {
        activeTab = tabId;
    }

    async function loadPlayers() {
        const response = await axios.get("/api/topPlayers", {
            params: {
                page: page,
                limit: limit,
                recomended: filter === "recomended" ? true : false,
            },
        });

        players = response.data.data;
    }

    onMount(() => {
        loadPlayers();
    });
</script>

<svelte:head>
    <title>D-D-D-DUELLLLLL</title>
</svelte:head>
<div class="container mx-auto p-8">
    <a href="/player" class="retro-btn yellow-retro-btn">Back</a>
    <div class="flex items-center justify-center mt-4">
        
        <div class="main-card">
            
            <div class="p-8">
                
                <div class="flex border-b border-[#9bbc0f] border-solid">
                    <button
                        type="button"
                        class={`py-2 px-4 text-sm focus:outline-none  border-solid ${
                            activeTab === "tab1"
                                ? "border-b-2 border-green-700 text-green-700 font-bold"
                                : "text-gray-500 hover:text-gray-700 font-medium"
                        }`}
                        on:click={() => setActiveTab("tab1")}
                    >
                        DUEL
                    </button>
                    <button
                        type="button"
                        class={`py-2 px-4 text-sm focus:outline-none  border-solid ${
                            activeTab === "tab2"
                                ? "border-b-2 border-green-700 text-green-700 font-bold"
                                : "text-gray-500 hover:text-gray-700 font-medium"
                        }`}
                        on:click={() => setActiveTab("tab2")}
                    >
                        SOLO RAID
                    </button>
                    <button
                        type="button"
                        class={`py-2 px-4 text-sm focus:outline-none  border-solid ${
                            activeTab === "tab3"
                                ? "border-b-2 border-green-700 text-green-700 font-bold"
                                : "text-gray-500 hover:text-gray-700 font-medium "
                        }`}
                        on:click={() => setActiveTab("tab3")}
                    >
                        GLOBAL RAID
                    </button>
                </div>

                <div class="mt-4">
                    <div id="tab1" class={activeTab !== "tab1" ? "hidden" : ""}>
                        <h2 class="text-2xl font-bold text-gray-800 ">
                            D-D-D-DUELLLLLL
                        </h2>
                        <p>Filter</p>
                        <div class="flex gap-2">
                            <button on:click={()=>{
                                filter = "recomended";
                                loadPlayers();
                            }} class="rounded-md px-2 py-1 text-sm border-green-900 border-2 hover:bg-green-700 hover:text-white {filter == 'recomended'?'bg-green-700 text-white':''}">
                                Recomended
                            </button>
                            <button on:click={()=>{
                                filter = "all";
                                loadPlayers();
                            }} class="rounded-md px-2 py-1 text-sm border-green-900 border-2 hover:bg-green-700 hover:text-white {filter == 'all'?'bg-green-700 text-white':''}">
                                All
                            </button>
                        </div>
                        <div class="flex flex-col gap-4 w-full mt-4">
                            {#each players as player}
                                <div class="font-mono bg-[#d0d058] text-[#0f380f] rounded-lg overflow-hidden border-4 border-[#8bac0f]" >
                                    <div class="p-2 space-y-2">
                                        <div class="flex items-center space-x-2">
                                            <img
                                                src="https://avatars.githubusercontent.com/u/{player.id}"
                                                alt="Pixel art character avatar"
                                                class="w-16 h-16 border-2 border-[#0f380f]"
                                            />
                                            <div class="flex-1">
                                                <h2
                                                    class=" font-bold tracking-tight leading-none mb-1 text-shadow-[2px_2px_0px_#306230]"
                                                >
                                                    {player.name}
                                                </h2>
                                                <p class="text-sm">
                                                    Level {player.level}
                                                </p>
                                                
                                            </div>
                                            <div class="flex-1">
                                                <div class="grid grid-cols-3 gap-2 text-sm">
                                                    <div class="flex justify-between items-center bg-[#9bbc0f] p-1" >
                                                        <span>HP</span>
                                                        <span>{@html player.bonus.hp > 0
                                                            ? `<small class="text-green-900">(+${player.bonus.hp})</small>`
                                                            : ""}{player.hp}</span>
                                                    </div>
                                                    <div class="flex justify-between items-center bg-[#9bbc0f] p-1" >
                                                        <span>ATK</span>
                                                        <span>{@html player.bonus.atk > 0
                                                            ? `<small class="text-green-900">(+${player.bonus.atk})</small>`
                                                            : ""}{player.atk}</span>
                                                    </div>
                                                    <div class="flex justify-between items-center bg-[#9bbc0f] p-1" >
                                                        <span>STR</span>
                                                        <span>{@html player.bonus.str > 0
                                                            ? `<small class="text-green-900">(+${player.bonus.str})</small>`
                                                            : ""}{player.str}</span>
                                                    </div>
                                                    <div class="flex justify-between items-center bg-[#9bbc0f] p-1" >
                                                        <span>DEF</span>
                                                        <span>{@html player.bonus.def > 0
                                                            ? `<small class="text-green-900">(+${player.bonus.def})</small>`
                                                            : ""}{player.def}</span>
                                                    </div>
                                                    <div class="flex justify-between items-center bg-[#9bbc0f] p-1" >
                                                        <span>SPD</span>
                                                        <span>{@html player.bonus.spd > 0
                                                            ? `<small class="text-green-900">(+${player.bonus.spd})</small>`
                                                            : ""}{player.spd}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="flex flex-col gap-1">
                                                <button class="retro-btn red-retro-btn retro-btn-sm">
                                                    Duel
                                                </button>
                                                <button class="retro-btn blue-retro-btn retro-btn-sm">
                                                    Info
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            {/each}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
