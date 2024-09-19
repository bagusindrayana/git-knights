<script lang="ts">
    export let id: string;
    export let name: string;
    export let level: number;
    export let hp: number;
    export let currentHp: number;
    export let attack: number;
    export let strength: number;
    export let defense: number;
    export let speed: number;
</script>


<div class="font-mono w-full md:w-1/4 m-0 md:m-4 bg-[#d0d058] text-[#0f380f] rounded-lg overflow-hidden border-4 border-[#8bac0f] shadow-[8px_8px_0px_#306230]">
    <div class="p-1 md:p-4 space-y-1 md:space-y-4">
        <div class="flex items-center space-x-4">
            <img
                src="https://avatars.githubusercontent.com/u/{id}"
                alt="Pixel art character avatar"
                class="w-16 h-16 border-2 border-[#0f380f]"
            />
            <div class="flex-1">
                <h2 class=" font-bold tracking-tight leading-none mb-1 text-shadow-[2px_2px_0px_#306230]">
                    {name}
                </h2>
                <p class="text-sm">
                    Level {level}
                </p>
                <div class="w-full bg-[#8bac0f] h-4 rounded-sm overflow-hidden">
                    <div
                        class="bg-[#0f380f] h-full w-3/4"
                        style="width: {(currentHp / hp) *
                            100}%;"
                    ></div>
                </div>
                <p class="text-xs text-right mt-1">
                    {currentHp} / {hp} HP
                </p>
            </div>
        </div>

        <div class=" hidden md:grid grid-cols-2 gap-2 text-sm">
            <div
                class="flex justify-between items-center bg-[#9bbc0f] p-1"
            >
                <span>ATK</span>
                <span>{attack}</span>
            </div>
            <div
                class="flex justify-between items-center bg-[#9bbc0f] p-1"
            >
                <span>STR</span>
                <span>{strength}</span
                >
            </div>
            <div
                class="flex justify-between items-center bg-[#9bbc0f] p-1"
            >
                <span>DEF</span>
                <span>{defense}</span
                >
            </div>
            <div
                class="flex justify-between items-center bg-[#9bbc0f] p-1"
            >
                <span>SPD</span>
                <span>{speed}</span
                >
            </div>
        </div>

        <slot></slot>
    </div>
</div>