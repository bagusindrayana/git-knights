<script lang="ts">
    import { page } from "$app/stores";
    import Chart from "chart.js/auto";
    import { onMount } from "svelte";
    import axios from "axios";
    import { ItemSkill, Player } from "../../lib/models/player";
    import { signOut } from "@auth/sveltekit/client";
    import skills from "../../lib/data/skill.json";
    import Shepherd from "shepherd.js";
    import PushNotification from "../../components/PushNotification.svelte";
    import Tooltip from "../../components/Tooltip.svelte";

    let status = "loading";

    let playerData = new Player({
        hp: 100,
        str: 85,
        spd: 60,
        atk: 90,
        def: 75,
    });

    let showTooltip = false;
    let mouseX = 0;
    let mouseY = 0;
    let tooltipTitle = "Detailed Information";
    let tooltipContent =
        "This tooltip follows the mouse position. You can add more details, images, links, or any other content here.";

    let playerDataChart: Chart;
    let availableSkills: ItemSkill[] = [];
    let activeTab: string = "tab1";
    let pushNotificaton: any = null;

    let newUser: boolean = true;
    let introTab: boolean[] = [false, false, false];

    function setActiveTab(tabId: string) {
        activeTab = tabId;

        if (tabId === "tab2" && !introTab[1] && newUser) {
            setTimeout(() => {
                tourTab2();
                introTab[1] = true;
            }, 100);
        } else if (tabId === "tab3" && !introTab[2] && newUser) {
            setTimeout(() => {
                tourTab3();
                introTab[2] = true;
            }, 100);
        }
    }

    function tourTab1() {
        const tour = new Shepherd.Tour({
            useModalOverlay: true,
            defaultStepOptions: {
                classes: "shadow-md bg-purple-dark",
                scrollTo: true,
            },
        });

        tour.addStep({
            id: "step-1",
            text: "In this section you can see the basic statistics and bonus statistics of the items your character uses. the development of your character's statistics depends on your github profile data.",
            attachTo: {
                element: "#tab1",
                on: "top",
            },
            buttons: [
                {
                    text: "Next",
                    action: tour.next,
                },
            ],
        });

        tour.addStep({
            id: "step-2",
            text: `for example, total XP is taken from the accumulation of total commits, total PRs, total Stars, total Issues, total repositories, number of followers, and number of languages ​​used.
                  </br>  
HP: accumulation of levels with number of repositories
</br>  
STR: accumulation of levels with total PRs
</br>  
ATK: accumulation of levels with number of languages
</br>  
SPD: accumulation of levels with total PRs accepted
</br>  
DEF: accumulation of levels with number of issues`,
            attachTo: {
                element: "#stats",
                on: "right",
            },
            buttons: [
                {
                    text: "Next",
                    action: tour.next,
                },
            ],
        });

        tour.start();
    }

    function tourTab2() {
        const tour = new Shepherd.Tour({
            useModalOverlay: true,
            defaultStepOptions: {
                classes: "shadow-md bg-purple-dark",
                scrollTo: true,
            },
        });

        tour.addStep({
            id: "step-2-1",
            text: "You can view items and manage the items you use here.",
            attachTo: {
                element: "#tab2",
                on: "top",
            },
            buttons: [
                {
                    text: "Next",
                    action: tour.next,
                },
            ],
        });

        tour.addStep({
            id: "step-2-2",
            text: `The items in your inventory are a list of programming languages ​​that you use in your GitHub repositories, each item has various statuses and attributes.`,
            attachTo: {
                element: "#inventory",
                on: "right",
            },
            buttons: [
                {
                    text: "Next",
                    action: tour.next,
                },
            ],
        });

        tour.addStep({
            id: "step-2-3",
            text: `You can use the items in the "Equipped Items" slot, there are a total of 6 slots available.`,
            attachTo: {
                element: "#slot-item",
                on: "left",
            },
            buttons: [
                {
                    text: "Next",
                    action: tour.next,
                },
            ],
        });

        tour.start();
    }

    function tourTab3() {
        const tour = new Shepherd.Tour({
            useModalOverlay: true,
            defaultStepOptions: {
                classes: "shadow-md bg-purple-dark",
                scrollTo: true,
            },
        });

        tour.addStep({
            id: "step-3-1",
            text: "You can view skills and manage the skills you use here.",
            attachTo: {
                element: "#tab3",
                on: "top",
            },
            buttons: [
                {
                    text: "Next",
                    action: tour.next,
                },
            ],
        });

        tour.addStep({
            id: "step-3-2",
            text: `This is a list of skills from the programming language you are using, the skills that can be used depend on what items you used previously., each skill has various statuses and attributes.`,
            attachTo: {
                element: "#list-skill",
                on: "right",
            },
            buttons: [
                {
                    text: "Next",
                    action: tour.next,
                },
            ],
        });

        tour.addStep({
            id: "step-3-3",
            text: `You can use the skills in the "Skill slot", there are a total of 12 slots available.`,
            attachTo: {
                element: "#skill-slot",
                on: "left",
            },
            buttons: [
                {
                    text: "Next",
                    action: tour.next,
                },
            ],
        });

        tour.start();
    }

    async function getUserData() {
        try {
            const apiUrl = `/api/userInfo`;
            const response = await axios.post(apiUrl);
            const user = response.data;
            playerData = Player.fromJson(JSON.stringify(user.data.playerData));
            getAllSkillFromEquipItem();

            newUser = user.newUser ?? false;
            if (newUser) {
                setTimeout(() => {
                    introTab[0] = true;
                    tourTab1();
                }, 500);
            }
        } catch (error) {
            console.error(error);
            pushNotificaton = {
                title: "Error",
                content: "Failed to get user data",
                type: "error",
                show: true,
            };
        }
    }

    async function syncUserData(e: any) {
        const tombol = e.currentTarget as HTMLButtonElement;
        tombol.disabled = true;
        tombol.innerHTML = "Syncing...";
        try {
            const apiUrl = `/api/userInfo?sync=true`;
            const response = await axios.post(apiUrl);
            const user = response.data;
            playerData = Player.fromJson(JSON.stringify(user.data.playerData));
            getAllSkillFromEquipItem();
            playerData.applyEquipedEffect();
            updateApplyEquipedEffect();
            playerData = playerData;
            pushNotificaton = {
                title: "Success",
                content: "User data synced successfully",
                type: "success",
                show: true,
            };
        } catch (error) {
            pushNotificaton = {
                title: "Error",
                content: "Failed to sync user data",
                type: "error",
                show: true,
            };
        }

        tombol.disabled = false;
        tombol.innerHTML = "Sync Github Data";
    }

    function drawChart() {
        const chartElement = document.getElementById(
            "playerDataChart",
        ) as HTMLCanvasElement;
        const ctx = chartElement ? chartElement.getContext("2d") : null;
        playerDataChart = new Chart(ctx!, {
            type: "radar",
            data: {
                labels: ["HP", "Strength", "Attack", "Speed", "Defense"],
                datasets: [
                    {
                        label: "Base Stats",
                        data: [
                            playerData.hp,
                            playerData.strength,
                            playerData.attack,
                            playerData.speed,
                            playerData.defense,
                        ],
                        backgroundColor: "rgba(54, 162, 235, 0.2)",
                        borderColor: "rgba(54, 162, 235, 1)",
                        borderWidth: 2,
                    },
                ],
            },
            options: {
                scales: {
                    r: {
                        beginAtZero: true,
                    },
                },
            },
        });
    }

    onMount(async () => {
        status = "loading";
        try {
            await getUserData();
            status = "loaded";

            setTimeout(() => {
                drawChart();
                updateApplyEquipedEffect();
                initSlot();
            }, 500);
        } catch (error) {
            console.error(error);
            status = `${error}`;
        }
    });

    function dragEnter(e: any) {
        e.preventDefault();
        //console.log("dragEnter", e);
    }

    function dragOver(e: any) {
        e.preventDefault();
        //console.log("dragOver", e);
    }

    function dragLeave(e: any) {
        //console.log("dragLeave", e);
    }

    function dropItem(e: any) {
        e.stopPropagation();
        const slot = e.currentTarget.getAttribute("data-slot");
        const id = e.dataTransfer.getData("text/plain");
        const draggable = document.querySelector(`.item-${id}`);
        if (draggable) {
            const item = JSON.parse(draggable.getAttribute("data-item")!);

            const check = e.currentTarget.querySelector(`[class*='item-']`);

            if (check) {
                const oldItem = JSON.parse(check.getAttribute("data-item"));
                const oldItemIndex = playerData.items.findIndex(
                    (it: any) => it.id == oldItem.id,
                );
                playerData.items[oldItemIndex].quantity += 1;
            }

            if (item.quantity >= 1) {
                const itemIndex = playerData.items.findIndex(
                    (it: any) => it.id == item.id,
                );
                playerData.items[itemIndex].quantity -= 1;
            }

            const clone = draggable.cloneNode(true) as HTMLElement;
            clone.querySelector(".badge")!.classList.add("hidden");
            clone.addEventListener("mouseenter", handleMouseEnterItem);
            clone.addEventListener("mouseleave", handleMouseLeave);
            clone.addEventListener("mousemove", handleMouseMove);
            clone.classList.add("slot-item");

            draggable.setAttribute("data-item", JSON.stringify(item));
            e.currentTarget.innerHTML = "";
            // // add it to the dropItem target
            e.currentTarget.appendChild(clone);
            playerData.slots[slot] = item.id;
            playerData = playerData;
            updateApplyEquipedEffect();
        }
    }

    function dragStart(e: any) {
        showTooltip = false;
        e.dataTransfer.setData("text/plain", e.target.getAttribute("data-id"));
    }

    function equipItem(e: any) {
        //find empty slot
        const slot = playerData.slots.findIndex((s) => s == null);
        if (slot === -1) return;
        const id = e.currentTarget.getAttribute("data-id");
        const item = JSON.parse(e.currentTarget.getAttribute("data-item"));
        const itemIndex = playerData.items.findIndex(
            (it: any) => it.id == item.id,
        );
        playerData.slots[slot] = item.id;
        const itemElement = document.querySelector(`.item-${id}`);
        const slotElement = document.querySelector(`.slot-${slot}`);

        const clone = itemElement!.cloneNode(true) as HTMLElement;
        clone.querySelector(".badge")!.classList.add("hidden");
        clone.addEventListener("mouseenter", handleMouseEnterItem);
        clone.addEventListener("mouseleave", handleMouseLeave);
        clone.addEventListener("mousemove", handleMouseMove);
        clone.classList.add("slot-item");

        slotElement!.innerHTML = "";
        slotElement!.appendChild(clone);

        playerData.items[itemIndex].quantity -= 1;
        playerData = playerData;
        updateApplyEquipedEffect();
    }

    function unequipSlot(e: any) {
        const check = e.currentTarget.querySelector(`[class*='item-']`);

        if (check) {
            const oldItem = JSON.parse(check.getAttribute("data-item"));
            const oldItemIndex = playerData.items.findIndex(
                (it: any) => it.id == oldItem.id,
            );
            playerData.items[oldItemIndex].quantity += 1;
        } else {
            return;
        }
        e.currentTarget.innerHTML = "";
        playerData.slots[e.currentTarget.getAttribute("data-slot")] = null;

        playerData = playerData;

        updateApplyEquipedEffect();
        showTooltip = false;
    }

    function initSlot() {
        for (let i = 0; i < playerData.slots.length; i++) {
            const slot = playerData.slots[i];
            const slotElement = document.querySelector(`.slot-${i}`);
            if (slotElement) {
                const item = playerData.items.find((it: any) => it.id == slot);
                const itemIndex = playerData.items.findIndex(
                    (it: any) => it.id == slot,
                );
                if (item) {
                    const itemElement = document.querySelector(
                        `.item-${itemIndex}`,
                    );
                    const clone = itemElement!.cloneNode(true) as HTMLElement;
                    clone.querySelector(".badge")!.classList.add("hidden");
                    clone.addEventListener("mouseenter", handleMouseEnterItem);
                    clone.addEventListener("mouseleave", handleMouseLeave);
                    clone.addEventListener("mousemove", handleMouseMove);

                    clone.classList.add("slot-item");
                    slotElement.innerHTML = "";
                    slotElement.appendChild(clone);
                } else {
                    playerData.slots[i] = null;
                }
            }
        }

        for (let i = 0; i < playerData.skillSlots.length; i++) {
            const skillSlot = playerData.skillSlots[i];
            const slotElement = document.querySelector(`.skill-slot-${i}`);
            if (slotElement) {
                const skill = availableSkills.find(
                    (it: any) => it.id == skillSlot,
                );
                if (skill) {
                    const skillElement = document.querySelector(
                        `.skill-${skillSlot}`,
                    );

                    if (skillElement) {
                        const clone = skillElement.cloneNode(
                            true,
                        ) as HTMLElement;
                        clone.addEventListener(
                            "mouseenter",
                            handleMouseEnterSkill,
                        );
                        clone.addEventListener("mouseleave", handleMouseLeave);
                        clone.addEventListener("mousemove", handleMouseMove);
                        clone.addEventListener("dragstart", dragStart);
                        slotElement.innerHTML = "";
                        slotElement.appendChild(clone!);
                        skillElement.classList.add("hidden");
                    }
                } else {
                    playerData.skillSlots[i] = null;
                }
            }
        }
    }

    function handleMouseMove(event: any) {
        const tooltip = document.getElementById("tooltip");
        mouseX = event.pageX;
        mouseY = event.pageY;

        if (tooltip) {
            //if tooltip is overlap right screen add offset to mouseX
            if (mouseX + tooltip.offsetWidth + 10 > window.innerWidth) {
                mouseX -= tooltip.offsetWidth;
            }

            //if tooltip is overlap bottom screen add offset to mouseY
            if (mouseY + tooltip.offsetHeight + 10 > window.innerHeight) {
                mouseY -= tooltip.offsetHeight;
            }
        }
    }

    function handleMouseEnterItem(e: any) {
        showTooltip = true;
        const item = JSON.parse(e.currentTarget.getAttribute("data-item"));
        tooltipTitle = item.name;
        let desc = item.description;
        desc += `<hr><b>Effects:</b><ul class="list-disc">`;
        item.effects.forEach((effect: any) => {
            desc += `<li>
                ${effect.name}: ${effect.type} ${effect.value}${effect.unit == "Percent" ? "%" : ""} ${effect.for} ${effect.attrTarget.toUpperCase()}
                <br>
                <div class="text-[#9bbc0f] text-sm">${effect.description}
            `;

            if (effect.bonusEffects) {
                desc += `<br>`;
                effect.bonusEffects.forEach(
                    (bonusEffect: any, index: number) => {
                        if (
                            playerData.countSameItemInSlot(item.id) >=
                                bonusEffect.sameItem &&
                            e.currentTarget.classList.contains(`slot-item`)
                        ) {
                            desc += `<small class="text-green-400 bonus-${index}">- Stack ${bonusEffect.sameItem} same item: ${effect.type} +${bonusEffect.bonus}${effect.unit == "Percent" ? "%" : ""} ${effect.attrTarget.toUpperCase()}</small><br>`;
                        } else {
                            desc += `<small class="text-gray-400 bonus-${index}">- Stack ${bonusEffect.sameItem} same item: ${effect.type} +${bonusEffect.bonus}${effect.unit == "Percent" ? "%" : ""} ${effect.attrTarget.toUpperCase()}</small><br>`;
                        }
                    },
                );
            }
            desc += `</div></li>`;
        });
        desc += `</ul>`;

        tooltipContent = desc;
    }

    function handleMouseEnterSkill(e: any) {
        showTooltip = true;
        const skill = ItemSkill.fromJson(
            e.currentTarget.getAttribute("data-skill"),
        );
        tooltipTitle = skill.name;
        let desc = skill.description;

        if (skill.doAttack === true) {
            desc += `<br>
            <b class="text-red-400"> Attack Skill </b>`;
        }
        desc += `
        <br>
        <b class="text-green-400"> Cooldown : ${skill.cooldownRound} turns</b> 
        <hr><b>Effects:</b><ul class="list-disc">`;
        skill.effects.forEach((effect: any) => {
            desc += `<li>
                ${effect.name}: ${effect.unit} ${effect.value}${effect.unit == "Percent" ? "%" : ""} ${effect.for} ${effect.attrTarget.toUpperCase()}
                <br>
                <div class="text-[#9bbc0f] text-sm">${effect.description}
            `;

            desc += `</div></li>`;
        });
        tooltipContent = desc;
    }

    function handleMouseLeave(e: any) {
        showTooltip = false;
    }

    function updateApplyEquipedEffect() {
        playerData.applyEquipedEffect();

        playerData = playerData;

        //update chart add new dataset
        if (playerDataChart.data.datasets.length > 1) {
            playerDataChart.data.datasets.pop();
        }
        playerDataChart.data.datasets.push({
            label: "Equiped Stats",
            data: [
                playerData.hp + playerData.bonusAttributes.hp,
                playerData.strength + playerData.bonusAttributes.str,
                playerData.attack + playerData.bonusAttributes.atk,
                playerData.speed + playerData.bonusAttributes.spd,
                playerData.defense + playerData.bonusAttributes.def,
            ],
            backgroundColor: "rgba(255, 99, 132, 0.2)",
            borderColor: "rgba(255, 99, 132, 1)",
            borderWidth: 2,
        });
        playerDataChart.update();
    }

    function updateData(e: any) {
        const button = e.currentTarget as HTMLButtonElement;
        button.disabled = true;
        button.innerHTML = "Updating...";
        try {
            const apiUrl = `/api/updateUser`;
            axios
                .post(apiUrl, {
                    slots: playerData.slots,
                    skillSlots: playerData.skillSlots,
                })
                .then((response) => {
                    pushNotificaton = {
                        title: "Success",
                        content: "User data updated successfully",
                        type: "success",
                        show: true,
                    };

                    button.disabled = false;
                    button.innerHTML = "Update Equipment";
                })
                .catch((error) => {
                    pushNotificaton = {
                        title: "Error",
                        content: "Failed to update user data",
                        type: "error",
                        show: true,
                    };
                    console.error(error);
                    button.disabled = false;
                    button.innerHTML = "Update Equipment";
                });
        } catch (error) {
            pushNotificaton = {
                title: "Error",
                content: "Failed to update user data",
                type: "error",
                show: true,
            };
            button.disabled = false;
            button.innerHTML = "Update Equipment";
        }
    }

    function getAllSkillFromEquipItem() {
        let _skill: ItemSkill[] = [];
        for (let i = 0; i < playerData.slots.length; i++) {
            const slot = playerData.slots[i];
            const item = playerData.items.find((it: any) => it.id == slot);
            //find skills with id = slot
            const itemSkill = skills.find((it: any) => it.id == slot);

            if (item && itemSkill) {
                _skill.push(
                    ...itemSkill.skills.map((s: any) => {
                        const a = ItemSkill.fromJson(JSON.stringify(s));
                        a.id = `${i}_${item.id}_${a.id}`;
                        a.itemName = item?.name;
                        a.itemColor = item?.color;
                        return a;
                    }),
                );
            }
        }

        //find all old availableSkills who not in _skill
        availableSkills.forEach((oldSkill) => {
            const found = _skill.find((s) => s.id == oldSkill.id);
            if (!found) {
                const slotIndex = playerData.skillSlots.findIndex(
                    (s) => s == oldSkill.id,
                );
                if (slotIndex != -1) {
                    const slotElement = document.querySelector(
                        `.skill-slot-${slotIndex}`,
                    );
                    if (slotElement) {
                        slotElement.innerHTML = "";
                    }
                    playerData.skillSlots[slotIndex] = null;
                }
            }
        });

        availableSkills = _skill;
        playerData = playerData;
    }

    function dropSkill(e: any) {
        e.stopPropagation();
        const id = e.dataTransfer.getData("text/plain");
        const draggable = document.querySelector(`.skill-${id}`);

        if (draggable) {
            const slotIndex = parseInt(
                e.currentTarget.getAttribute("data-slot"),
            );
            const skill = ItemSkill.fromJson(
                draggable.getAttribute("data-skill")!,
            );

            const clone = draggable.cloneNode(true) as HTMLElement;
            clone.addEventListener("mouseenter", handleMouseEnterSkill);
            clone.addEventListener("mouseleave", handleMouseLeave);
            clone.addEventListener("mousemove", handleMouseMove);
            clone.addEventListener("dragstart", dragStart);

            const check = e.currentTarget.querySelector(`[class*='skill-']`);
            const prevSlot = draggable.parentElement?.getAttribute("data-slot");
            if (prevSlot != undefined) {
                const prevSlotIndex = parseInt(prevSlot);

                if (check) {
                    draggable.parentElement?.appendChild(check);
                    const prevSkill = ItemSkill.fromJson(
                        check.getAttribute("data-skill")!,
                    );
                    playerData.skillSlots[prevSlotIndex] = prevSkill.id;
                } else {
                    playerData.skillSlots[prevSlotIndex] = null;
                }
            } else {
                if (check) {
                    const oldSkill = ItemSkill.fromJson(
                        check.getAttribute("data-skill")!,
                    );
                    // const oldSkillIndex = playerData.skillSlots.findIndex(
                    //     (it: any) => it == oldSkill.id,
                    // );
                    // playerData.skillSlots[oldSkillIndex] = null;
                    document
                        .querySelector(`.skill-${oldSkill.id}`)
                        ?.classList.remove("hidden");
                }
            }

            e.currentTarget.innerHTML = "";
            e.currentTarget.appendChild(clone);
            clone.classList.remove("hidden");
            draggable.classList.add("hidden");
            playerData.skillSlots[slotIndex] = skill.id;
        }
        playerData = playerData;
    }

    function equipSkill(e: any) {
        const skillSlot = playerData.skillSlots.findIndex((s) => s == null);
        if (skillSlot === -1) return;

        const id = e.currentTarget.getAttribute("data-id");
        const skill = JSON.parse(e.currentTarget.getAttribute("data-skill"));

        playerData.skillSlots[skillSlot] = skill.id;
        const skillElement = document.querySelector(`.skill-${id}`);
        const slotElement = document.querySelector(`.skill-slot-${skillSlot}`);

        if (skillElement && slotElement) {
            const clone = skillElement.cloneNode(true) as HTMLElement;
            clone.addEventListener("mouseenter", handleMouseEnterSkill);
            clone.addEventListener("mouseleave", handleMouseLeave);
            clone.addEventListener("mousemove", handleMouseMove);
            clone.addEventListener("dragstart", dragStart);

            skillElement.classList.add("hidden");

            slotElement.innerHTML = "";
            slotElement.appendChild(clone);
        }

        playerData = playerData;

        getAllSkillFromEquipItem();
        showTooltip = false;
    }

    function unequipSlotSkill(e: any) {
        const check = e.currentTarget.querySelector(`[class*='skill-']`);

        if (check) {
            const oldItem = JSON.parse(check.getAttribute("data-skill"));
            document
                .querySelector(`.skill-${oldItem.id}`)
                ?.classList.remove("hidden");
        } else {
            return;
        }
        e.currentTarget.innerHTML = "";
        playerData.skillSlots[e.currentTarget.getAttribute("data-slot")] = null;

        playerData = playerData;

        getAllSkillFromEquipItem();
        showTooltip = false;
    }

    function countSkills(id: string) {
        return skills.find((it: any) => it.id == id)?.skills.length ?? 0;
    }
</script>

<svelte:head>
    <title>Account</title>
    <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free/css/all.min.css"
    />
    <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/shepherd.js@13.0.0/dist/css/shepherd.css"
    />
    <style>
        .fa {
            margin-right: 0.5rem;
        }
    </style>
</svelte:head>

<main>
    {#if pushNotificaton}
        <PushNotification
            title={pushNotificaton.title}
            content={pushNotificaton.content}
            duration={3000}
            type={pushNotificaton.type}
            show={pushNotificaton.show}
        />
    {/if}

    <!-- Tooltip -->
    <Tooltip
        show={showTooltip}
        {mouseX}
        {mouseY}
        {tooltipTitle}
        {tooltipContent}
    />

    <div class="container mx-auto p-8">
        <div class="flex items-center justify-center">
            <div
                class="w-full max-w-5xl font-mono bg-[#d0d058] text-[#0f380f] rounded-lg overflow-hidden border-4 border-[#8bac0f] shadow-[8px_8px_0px_#306230]"
            >
                <div class="p-8">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center">
                            <img
                                class="w-24 h-24 rounded-full border-4 border-green-700"
                                src={$page.data.session?.user?.image ??
                                    "https://via.placeholder.com/150"}
                                alt="Character Avatar"
                            />
                            <div class="ml-4">
                                <h1 class="text-3xl font-bold text-gray-900">
                                    {$page.data.session?.user?.name}
                                </h1>
                                <p class="text-lg text-gray-600">
                                    {playerData != null &&
                                    playerData.id != undefined
                                        ? `ID#${playerData.id}`
                                        : ""}
                                </p>
                            </div>
                        </div>
                        <div class="text-right">
                            <div class="mt-8 flex justify-end space-x-4">
                                <button
                                    on:click={() => signOut()}
                                    class="retro-btn red-retro-btn"
                                    >Logout</button
                                >
                            </div>
                            <!-- <p class="text-sm text-gray-600">
                                Guild: <span class="font-semibold text-gray-900"
                                    >Knights of Valor</span
                                >
                            </p>
                            <p class="text-sm text-gray-600">
                                Location: <span
                                    class="font-semibold text-gray-900"
                                    >Valhalla</span
                                >
                            </p> -->
                        </div>
                    </div>

                    {#if status == "loading"}
                        <div class="w-full flex justify-center p-4">
                            <div
                                class="border-gray-300 h-20 w-20 animate-spin rounded-full border-8 border-t-green-700"
                            />
                        </div>
                    {:else if status != "loaded"}
                        <div class="text-red-500 text-center p-4">{status}</div>
                    {:else}
                        <div class="w-full mx-auto">
                            <div
                                class="flex border-b border-[#9bbc0f] border-solid"
                            >
                                <button
                                    type="button"
                                    class={`py-2 px-4 text-sm focus:outline-none  border-solid ${
                                        activeTab === "tab1"
                                            ? "border-b-2 border-green-700 text-green-700 font-bold"
                                            : "text-gray-500 hover:text-gray-700 font-medium"
                                    }`}
                                    on:click={() => setActiveTab("tab1")}
                                >
                                    Character Statistics
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
                                    Inventory & Equipment
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
                                    Skills
                                </button>
                                <button
                                    type="button"
                                    class={`py-2 px-4 text-sm focus:outline-none  border-solid ${
                                        activeTab === "tab4"
                                            ? "border-b-2 border-green-700 text-green-700 font-bold"
                                            : "text-gray-500 hover:text-gray-700 font-medium"
                                    }`}
                                    on:click={() => setActiveTab("tab4")}
                                >
                                    Battle
                                </button>
                            </div>
                            <div class="mt-4">
                                <div
                                    id="tab1"
                                    class={activeTab !== "tab1" ? "hidden" : ""}
                                >
                                    <div
                                        class="grid grid-cols-1 md:grid-cols-2 gap-6"
                                    >
                                        <!-- Statistics Section -->
                                        <div class="space-y-4" id="stats">
                                            <div class="space-y-2">
                                                <div
                                                    class="flex items-center justify-between text-sm"
                                                >
                                                    <span
                                                        >Level.{playerData.currentLevel()}</span
                                                    >
                                                    <span
                                                        >{playerData.exp} / {playerData.nextExp()}</span
                                                    >
                                                </div>
                                                <div
                                                    class="h-2 bg-yellow-500 rounded-full"
                                                >
                                                    <div
                                                        class="h-full bg-yellow-700 rounded-full"
                                                        style="width: 72.5%;"
                                                    ></div>
                                                </div>
                                            </div>

                                            <div class="grid grid-cols-2 gap-4">
                                                <div
                                                    class="flex space-x-2 bg-[#9bbc0f] p-1"
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        class="h-5 w-5 text-gray-600"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            stroke-linecap="round"
                                                            stroke-linejoin="round"
                                                            stroke-width="2"
                                                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                                        />
                                                    </svg>
                                                    <div>
                                                        <div
                                                            class="text-sm font-medium"
                                                        >
                                                            HP
                                                        </div>
                                                        <div
                                                            class="text-2xl font-bold"
                                                        >
                                                            {playerData.hp}
                                                            {@html playerData
                                                                .bonusAttributes
                                                                .hp > 0
                                                                ? `<small class="text-green-900">(+${playerData.bonusAttributes.hp})</small>`
                                                                : ""}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div
                                                    class="flex space-x-2 bg-[#9bbc0f] p-1"
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        class="h-5 w-5 text-gray-600"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            stroke-linecap="round"
                                                            stroke-linejoin="round"
                                                            stroke-width="2"
                                                            d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
                                                        />
                                                    </svg>
                                                    <div>
                                                        <div
                                                            class="text-sm font-medium"
                                                        >
                                                            Strength
                                                        </div>
                                                        <div
                                                            class="text-2xl font-bold"
                                                        >
                                                            {playerData.strength}
                                                            {@html playerData
                                                                .bonusAttributes
                                                                .str > 0
                                                                ? `<small class="text-green-900">(+${playerData.bonusAttributes.str})</small>`
                                                                : ""}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div
                                                    class="flex space-x-2 bg-[#9bbc0f] p-1"
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        class="h-5 w-5 text-gray-600"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                        ><g
                                                            fill="none"
                                                            stroke="currentColor"
                                                            stroke-linecap="round"
                                                            stroke-linejoin="round"
                                                            stroke-width="1.5"
                                                            ><path
                                                                d="M7.4 7H4.6a.6.6 0 0 0-.6.6v8.8a.6.6 0 0 0 .6.6h2.8a.6.6 0 0 0 .6-.6V7.6a.6.6 0 0 0-.6-.6m12 0h-2.8a.6.6 0 0 0-.6.6v8.8a.6.6 0 0 0 .6.6h2.8a.6.6 0 0 0 .6-.6V7.6a.6.6 0 0 0-.6-.6"
                                                            /><path
                                                                d="M1 14.4V9.6a.6.6 0 0 1 .6-.6h1.8a.6.6 0 0 1 .6.6v4.8a.6.6 0 0 1-.6.6H1.6a.6.6 0 0 1-.6-.6m22 0V9.6a.6.6 0 0 0-.6-.6h-1.8a.6.6 0 0 0-.6.6v4.8a.6.6 0 0 0 .6.6h1.8a.6.6 0 0 0 .6-.6M8 12h8"
                                                            /></g
                                                        ></svg
                                                    >
                                                    <div>
                                                        <div
                                                            class="text-sm font-medium"
                                                        >
                                                            Attack
                                                        </div>
                                                        <div
                                                            class="text-2xl font-bold"
                                                        >
                                                            {playerData.attack}
                                                            {@html playerData
                                                                .bonusAttributes
                                                                .atk > 0
                                                                ? `<small class="text-green-900">(+${playerData.bonusAttributes.atk})</small>`
                                                                : ""}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div
                                                    class="flex space-x-2 bg-[#9bbc0f] p-1"
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        class="h-5 w-5 text-gray-600"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            stroke-linecap="round"
                                                            stroke-linejoin="round"
                                                            stroke-width="2"
                                                            d="M13 10V3L4 14h7v7l9-11h-7z"
                                                        />
                                                    </svg>
                                                    <div>
                                                        <div
                                                            class="text-sm font-medium"
                                                        >
                                                            Speed
                                                        </div>
                                                        <div
                                                            class="text-2xl font-bold"
                                                        >
                                                            {playerData.speed}
                                                            {@html playerData
                                                                .bonusAttributes
                                                                .spd > 0
                                                                ? `<small class="text-green-900">(+${playerData.bonusAttributes.spd})</small>`
                                                                : ""}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div
                                                    class="flex space-x-2 bg-[#9bbc0f] p-1"
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        class="h-5 w-5 text-gray-600"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            stroke-linecap="round"
                                                            stroke-linejoin="round"
                                                            stroke-width="2"
                                                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                                        />
                                                    </svg>
                                                    <div>
                                                        <div
                                                            class="text-sm font-medium"
                                                        >
                                                            Defense
                                                        </div>
                                                        <div
                                                            class="text-2xl font-bold"
                                                        >
                                                            {playerData.defense}
                                                            {@html playerData
                                                                .bonusAttributes
                                                                .def > 0
                                                                ? `<small class="text-green-900">(+${playerData.bonusAttributes.def})</small>`
                                                                : ""}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Radar Chart Section -->
                                        <div>
                                            <h2
                                                class="text-2xl font-bold text-gray-800"
                                            >
                                                Character Player Chart
                                            </h2>
                                            <div class="mt-4">
                                                <canvas id="playerDataChart"
                                                ></canvas>
                                            </div>
                                        </div>
                                    </div>
                                    <div
                                        class="mt-4 flex justify-end space-x-4"
                                    >
                                        <button
                                            on:click={syncUserData}
                                            class="retro-btn blue-retro-btn"
                                            >Sync Github Data</button
                                        >
                                    </div>
                                </div>
                                <div
                                    id="tab2"
                                    class={activeTab !== "tab2" ? "hidden" : ""}
                                >
                                    <div
                                        class="grid grid-cols-1 md:grid-cols-2 gap-6"
                                    >
                                        <div id="inventory">
                                            <h2
                                                class="text-2xl font-bold text-gray-800 mb-4"
                                            >
                                                Inventory
                                            </h2>
                                            <div
                                                class="w-full overflow-y-auto"
                                                style="max-height: min(500px, 70vh);"
                                            >
                                                <div
                                                    class="grid grid-cols-3 md:grid-cols-4 gap-2"
                                                >
                                                    {#each playerData.items as item, index}
                                                        <button
                                                            type="button"
                                                            on:click={equipItem}
                                                            on:mouseenter={handleMouseEnterItem}
                                                            on:mouseleave={handleMouseLeave}
                                                            on:mousemove={handleMouseMove}
                                                            on:dragstart={dragStart}
                                                            data-id={`${index}`}
                                                            data-item={JSON.stringify(
                                                                item,
                                                            )}
                                                            draggable="true"
                                                            class="border-2 border-green-900 {`item-${index}`} {item.quantity <=
                                                            0
                                                                ? 'hidden'
                                                                : ''}  h-28 w-full cursor-pointer bg-[#9bbc0f] rounded-md p-2 flex flex-col items-center justify-center transition-all duration-200 hover:bg-gray-400"
                                                        >
                                                            <div
                                                                class="bg-gray-300 rounded-md p-1 text-xs text-center text-white"
                                                                style="background-color: {item.color}"
                                                            >
                                                                {item.name}
                                                            </div>

                                                            <div
                                                                class="mt-2 inline-flex w-fit items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent text-secondary-foreground hover:bg-secondary/80 bg-gray-300 text-sm badge"
                                                            >
                                                                x<!-- -->{item.quantity}
                                                            </div>
                                                        </button>
                                                    {/each}
                                                </div>
                                            </div>
                                        </div>
                                        <div id="slot-item">
                                            <h2
                                                class="text-2xl font-bold text-gray-800 mb-4"
                                            >
                                                Equiped Items
                                            </h2>
                                            <div class="w-full p-4">
                                                <div
                                                    class="w-full flex justify-center mb-8 mt-4"
                                                >
                                                    <button
                                                        type="button"
                                                        class="min-h-28 w-24 rounded-md p-1 border-2 border-green-700 slot-0 flex justify-center items-center"
                                                        data-slot="0"
                                                        on:click={unequipSlot}
                                                        on:dragenter={dragEnter}
                                                        on:dragover={dragOver}
                                                        on:dragleave={dragLeave}
                                                        on:drop={dropItem}
                                                    />
                                                </div>
                                                <div
                                                    class="w-full flex justify-between my-8"
                                                >
                                                    <button
                                                        type="button"
                                                        class="min-h-28 w-24 rounded-md p-1 border-2 border-green-700 slot-1 flex justify-center items-center"
                                                        data-slot="1"
                                                        on:click={unequipSlot}
                                                        on:dragenter={dragEnter}
                                                        on:dragover={dragOver}
                                                        on:dragleave={dragLeave}
                                                        on:drop={dropItem}
                                                    />
                                                    <button
                                                        type="button"
                                                        class="min-h-28 w-24 rounded-md border-2 p-1 border-green-700 slot-2 flex justify-center items-center"
                                                        data-slot="2"
                                                        on:click={unequipSlot}
                                                        on:dragenter={dragEnter}
                                                        on:dragover={dragOver}
                                                        on:dragleave={dragLeave}
                                                        on:drop={dropItem}
                                                    />
                                                    <button
                                                        type="button"
                                                        class="min-h-28 w-24 rounded-md p-1 border-2 border-green-700 slot-3 flex justify-center items-center"
                                                        data-slot="3"
                                                        on:click={unequipSlot}
                                                        on:dragenter={dragEnter}
                                                        on:dragover={dragOver}
                                                        on:dragleave={dragLeave}
                                                        on:drop={dropItem}
                                                    />
                                                </div>
                                                <div
                                                    class="w-full flex justify-evenly my-8"
                                                >
                                                    <button
                                                        type="button"
                                                        class="min-h-28 w-24 rounded-md border-2 p-1 border-green-700 slot-4 flex justify-center items-center"
                                                        data-slot="4"
                                                        on:click={unequipSlot}
                                                        on:dragenter={dragEnter}
                                                        on:dragover={dragOver}
                                                        on:dragleave={dragLeave}
                                                        on:drop={dropItem}
                                                    />
                                                    <button
                                                        type="button"
                                                        class="min-h-28 w-24 rounded-md border-2 p-1 border-green-700 slot-5 flex justify-center items-center"
                                                        data-slot="5"
                                                        on:click={unequipSlot}
                                                        on:dragenter={dragEnter}
                                                        on:dragover={dragOver}
                                                        on:dragleave={dragLeave}
                                                        on:drop={dropItem}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div
                                        class="mt-4 flex justify-end space-x-4"
                                    >
                                        <button
                                            on:click={updateData}
                                            class="retro-btn blue-retro-btn"
                                            >Update Equipment</button
                                        >
                                    </div>
                                </div>
                                <div
                                    id="tab3"
                                    class={activeTab !== "tab3" ? "hidden" : ""}
                                >
                                    <div
                                        class="grid grid-cols-1 md:grid-cols-2 gap-6"
                                    >
                                        <div id="list-skill">
                                            <p
                                                class="text-2xl font-bold text-gray-800"
                                            >
                                                Item Used
                                            </p>
                                            <small
                                                class=" mb-4 text-gray-700 text-sm"
                                            >
                                                Skills that can be selected
                                                depending on the item used
                                            </small>

                                            <div
                                                class=" grid grid-cols-3 md:grid-cols-6 gap-2"
                                            >
                                                {#each playerData.slots as slot, index}
                                                    <div
                                                        class="p-2 rounded-md border-2 border-green-600 text-center text-xs flex justify-center items-center"
                                                    >
                                                        <small>
                                                            {#if slot != null}
                                                                {playerData.getItem(
                                                                    slot,
                                                                )?.name} ({countSkills(
                                                                    slot,
                                                                )} Skill)
                                                            {:else}
                                                                0
                                                            {/if}
                                                        </small>
                                                    </div>
                                                {/each}
                                            </div>
                                            <div
                                                class="mt-4 p-1 border-2 border-[#9bbc0f] rounded-md"
                                            >
                                                <div
                                                    class="grid grid-cols-3 md:grid-cols-5 gap-2"
                                                >
                                                    {#each availableSkills as skill, index}
                                                        <button
                                                            type="button"
                                                            data-skill={JSON.stringify(
                                                                skill,
                                                            )}
                                                            on:click={equipSkill}
                                                            on:mouseenter={handleMouseEnterSkill}
                                                            on:mouseleave={handleMouseLeave}
                                                            on:mousemove={handleMouseMove}
                                                            on:dragstart={dragStart}
                                                            data-id={`${skill.id}`}
                                                            data-item={JSON.stringify(
                                                                skill,
                                                            )}
                                                            draggable="true"
                                                            class="relative w-full skill-{skill.id} h-20 cursor-pointer bg-[#9bbc0f] border-2 border-green-900 rounded-md p-1 flex flex-col items-center justify-center transition-all duration-200 hover:bg-gray-400"
                                                        >
                                                            <span
                                                                class="text-xs text-center h-8 flex items-center"
                                                                >{skill.name}</span
                                                            >
                                                            <small
                                                                class="absolute text-xs top-0 left-0 bg-green-700 rounded-md p-1 text-white"
                                                                style="background-color: {skill.itemColor};"
                                                                >{skill.itemName}</small
                                                            >
                                                            {#if skill.doAttack}
                                                                <small
                                                                    class="absolute text-xs bottom-0 left-0 bg-red-700 rounded-md p-1 text-white"
                                                                    >A</small
                                                                >
                                                            {/if}
                                                        </button>
                                                    {/each}
                                                </div>
                                            </div>
                                        </div>
                                        <div id="skill-slot">
                                            <p
                                                class="text-2xl font-bold text-gray-800 mb-4"
                                            >
                                                Skill Slot
                                            </p>
                                            <div
                                                class="mt-4 grid grid-cols-3 md:grid-cols-4 gap-2"
                                            >
                                                {#each playerData.skillSlots as slot, index}
                                                    <button
                                                        type="button"
                                                        on:click={unequipSlotSkill}
                                                        on:dragenter={dragEnter}
                                                        on:dragover={dragOver}
                                                        on:dragleave={dragLeave}
                                                        on:drop={dropSkill}
                                                        data-slot={index}
                                                        class="skill-slot-{index} p-1 rounded-md border-2 min-h-20 border-green-700 text-center text-xs flex justify-center items-center"
                                                    />
                                                {/each}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div
                                    class={activeTab !== "tab4" ? "hidden" : ""}
                                >
                                    <div
                                        class="flex justify-center items-center p-4 gap-4"
                                    >
                                        <a
                                            href="/duel"
                                            class="retro-btn red-retro-btn"
                                            >Duel</a
                                        >
                                        <button class="retro-btn red-retro-btn"
                                            >Solo Raid</button
                                        >
                                        <button
                                            class="retro-btn red-retro-btn"
                                            disabled
                                            title="Coming soon..."
                                            >Global Raid</button
                                        >
                                    </div>
                                </div>
                            </div>
                        </div>
                    {/if}
                </div>
            </div>
        </div>
    </div>
</main>
