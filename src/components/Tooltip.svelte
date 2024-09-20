<script lang="ts">
    export let show = false;
    export let mouseX = 0;
    export let mouseY = 0;
    export let tooltipTitle = '';
    export let tooltipContent = '';
</script>

<div
    id="tooltip"
    class="{!show?'opacity-0':'opacity-1'} transition-opacity absolute hidden md:block z-10 w-2/3 md:w-1/3 p-4 text-sm bg-[#d0d058] text-[#0f380f] rounded-lg overflow-hidden border-4 border-[#8bac0f] shadow-lg pointer-events-none"
    style="top: {mouseY + 10}px; left: {mouseX + 10}px;"
>
    <p class="font-semibold">
        {tooltipTitle}
    </p>
    <div class="px-4">
        {@html tooltipContent}
    </div>
</div>
