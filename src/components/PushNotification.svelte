<script lang="ts">
    import { onMount } from "svelte";

    export let title = "Notification Title";
    export let content = "Notification content goes here...";
    export let duration = 3000;
    export let type = "success";
    export let show = false;

    $: show && hideTransition();

    function getTypeClass() {
        switch (type) {
            case "success":
                return "bg-green-500";
            case "error":
                return "bg-red-500";
            case "warning":
                return "bg-yellow-500";
            case "info":
                return "bg-blue-500";
            default:
                return "bg-blue-500";
        }
    }

    function hideTransition() {
        if (show) {
            setTimeout(() => {
                show = false;
            }, duration);
        }
    }

    onMount(() => {
        hideTransition();
    });
</script>

<div
    class="{show
        ? 'opacity-100'
        : 'opacity-0'} fixed top-5 right-5 {getTypeClass()} text-white p-4 rounded-lg shadow-lg transition-opacity duration-300 ease-in-out"
>
    <p class="font-bold">{title}</p>
    <p>{content}</p>
</div>
