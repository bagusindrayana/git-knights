<script lang="ts">
    import { page } from "$app/stores";
    import Chart from "chart.js/auto";
    import { onMount } from "svelte";
    import axios from "axios";
    import { Item, ItemSkill, Player } from "../../../lib/models/player";
    import { signOut } from "@auth/sveltekit/client";
    import skills from "../../../lib/data/skill.json";
    import announcement from "../../../lib/data/announcement.json";
    import Shepherd from "shepherd.js";
    import PushNotification from "../../../components/PushNotification.svelte";
    import Tooltip from "../../../components/Tooltip.svelte";
    import lottie from "lottie-web";
    import { goto } from "$app/navigation";

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
    let activeTab: string = $page.url.searchParams
        ? ($page.url.searchParams.get("tab") ?? "char_stats")
        : "char_stats";
    let pushNotificaton: any = null;

    let newUser: boolean = true;
    let introTab: boolean[] = [false, false, false];

    let progressAnnouncement = 0;
    let showAnnouncement = true;

    function setActiveTab(tabId: string) {
        let query = new URLSearchParams($page.url.searchParams.toString());

        query.set("tab", tabId);
        activeTab = tabId;

        if (tabId === "inventory" && !introTab[1] && newUser) {
            setTimeout(() => {
                tourTab2();
                introTab[1] = true;
            }, 100);
        } else if (tabId === "skill" && !introTab[2] && newUser) {
            setTimeout(() => {
                tourTab3();
                introTab[2] = true;
            }, 100);
        }
        goto(`?${query.toString()}`);
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
                element: "#char_stats",
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
                element: "#inventory",
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
                element: "#skill",
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
            const apiUrl = `/api/player`;
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
            pushNotificaton = null;
            pushNotificaton = {
                title: "Error",
                content: "Failed to get user data",
                type: "error",
                show: true,
            };
            alert("Failed to get user data");
        }
    }

    async function syncUserData(e: any) {
        const tombol = e.currentTarget as HTMLButtonElement;
        tombol.disabled = true;
        tombol.innerHTML = "Syncing...";
        try {
            const apiUrl = `/api/player?sync=true`;
            const response = await axios.post(apiUrl);
            const user = response.data;
            playerData = Player.fromJson(JSON.stringify(user.data.playerData));

            playerData.applyEquipedEffect();
            updateApplyEquipedEffect();
            getAllSkillFromEquipItem();
            pushNotificaton = null;
            pushNotificaton = {
                title: "Success",
                content: "User data synced successfully",
                type: "success",
                show: true,
            };
        } catch (error) {
            pushNotificaton = null;
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
        const d1 = Date.now();
        const d2 = Date.parse(announcement.date);
        if(d1 >= d2){
            showAnnouncement = false;
        }
        let interval = setInterval(() => {
            progressAnnouncement += 1;
            if (progressAnnouncement >= 105) {
                clearInterval(interval);
                showAnnouncement = false;
            }
        }, 100);
        status = "loading";
        try {
            await getUserData();
            status = "loaded";

            setTimeout(() => {
                drawChart();
                updateApplyEquipedEffect();
                initSlot();
                const animation = lottie.loadAnimation({
                    container: document.getElementById("player-container")!, // the dom element that will contain the animation
                    renderer: "svg",
                    loop: true,
                    autoplay: true,
                    path: "./Chibi_Knight_Idle.lottie.json", // the path to the animation json
                });

                animation.addEventListener("DOMLoaded", function () {
                    selectHelmetTipColor(
                        playerData.characterColor.helmetTipColor,
                    );
                    selectHelmetColor(playerData.characterColor.helmetColor);
                    selectVisorColor(playerData.characterColor.visorColor);
                    selectSwordColor(playerData.characterColor.swordColor);
                    seletcHandColor(playerData.characterColor.handColor);
                    seletcRightFootColor(
                        playerData.characterColor.rightFootColor,
                    );
                    seletcLeftFootColor(
                        playerData.characterColor.leftFootColor,
                    );
                    seletcShieldColor(playerData.characterColor.shieldColor);
                    seletcBodydColor(playerData.characterColor.bodyColor);
                    selectSkinColor(playerData.characterColor.skinColor);
                });
            }, 300);
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
        getAllSkillFromEquipItem();
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
        const item = Item.fromJson(e.currentTarget.getAttribute("data-item"));
        tooltipTitle = `${item.name} Lvl.${item.currentLevel()}`;
        let desc = item.description;
        desc += `<hr>
        <div class="w-full grid grid-cols-2 gap-1">
        <div class="break-words">
        <b>Effects:</b>
        <ul class="list-disc">`;
        item.effects.forEach((effect: any) => {
            desc += `<li class="break-words">
                <span class="break-words">${effect.name}: ${effect.type} ${item.currentItemEffect(effect)}${effect.unit == "Percent" ? "%" : ""} ${effect.for} ${effect.attrTarget.toUpperCase()}</span>
               
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
                            desc += `<small class="break-words text-green-900 font-bold bonus-${index}">- Stack ${bonusEffect.sameItem} same item: ${effect.type} +${bonusEffect.bonus}${effect.unit == "Percent" ? "%" : ""} ${effect.attrTarget.toUpperCase()}</small><br>`;
                        } else {
                            desc += `<small class="break-words text-gray-700 bonus-${index}">- Stack ${bonusEffect.sameItem} same item: ${effect.type} +${bonusEffect.bonus}${effect.unit == "Percent" ? "%" : ""} ${effect.attrTarget.toUpperCase()}</small><br>`;
                        }
                    },
                );
            }
            desc += `</li>`;
        });
        desc += `</ul></div>
        <div class="break-words ml-4">
        <b>Skills:</b>
        <ul class="list-disc">`;
        let itemSkills = skills.find(
            (skill: any) => skill.id == item.id,
        )?.skills;
        itemSkills?.forEach((skill: any) => {
            desc += `<li>${skill.name}</li>`;
        });
        desc += "</ul></div>";

        tooltipContent = desc;
    }

    function handleMouseEnterSkill(e: any) {
        showTooltip = true;
        const skill = ItemSkill.fromJson(
            e.currentTarget.getAttribute("data-skill"),
        );
        const splitId = skill.id.split("_");
        // console.log(splitId[splitId.length-1]);

        // let itemSkill = skills.find(
        //     (s: any) => s.skills.find((sk:any)=>sk.id == skill.id) != null,
        // );
        // console.log(itemSkill);

        let item: Item = playerData.getItem(splitId[1])!;

        tooltipTitle = skill.name;
        let desc = skill.description;

        if (skill.doAttack === true) {
            desc += `<br>
            <b class="text-red-600"> Attack Skill </b>`;
        }
        // if (skill.isUltimate === true) {
        //     desc += `<br>
        //     <b class="text-red-800"> Ultimate Skill </b>`;
        // }
        desc += `
        <br>
        <b class="text-green-800"> Cooldown : ${skill.cooldownRound} turns</b>`;
        if (skill.doAttack == true) {
            desc += `<br>
                    <b class="text-green-800"> Base Damage : ${item.currentItemSkillDamage(skill)}</b> `;
        }
        if (skill.effects.length > 0) {
            desc += `<hr><b>Effects:</b><ul class="list-disc">`;
            skill.effects.forEach((effect: any) => {
                desc += `<li>
                    ${effect.name}: ${effect.type} ${item.currentItemSkillEffect(effect)}${effect.unit == "Percent" ? "%" : ""} ${effect.for} ${effect.attrTarget.toUpperCase()}
                    </li>
                `;
            });
            desc += `</ul>`;
        }

        // if (skill.isUltimate) {
        //     desc += `<hr><b>Activate:</b><ul class="list-disc">`;
        //     skill.ultimateRequires?.forEach((require: any) => {
        //         desc += `<li>
        //         Need use ${require.skillLanguageAmmount} ${require.skillLanguage} type skill in battle
        //         </li>
        //     `;
        //     });
        //     desc += `</ul>`;
        // }
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
            const apiUrl = `/api/player/updateUser`;
            axios
                .post(apiUrl, {
                    slots: playerData.slots,
                    skillSlots: playerData.skillSlots,
                })
                .then((response) => {
                    pushNotificaton = null;
                    pushNotificaton = {
                        title: "Success",
                        content: "User data updated successfully",
                        type: "success",
                        show: true,
                    };
                    playerData.slots = response.data.slots;
                    playerData.skillSlots = response.data.skillSlots;
                    playerData.tags = response.data.tags;
                    playerData.applyEquipedEffect();
                    updateApplyEquipedEffect();
                    getAllSkillFromEquipItem();
                    button.disabled = false;
                    button.innerHTML = "Update Equipment";
                })
                .catch((error) => {
                    pushNotificaton = null;
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
            pushNotificaton = null;
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

    function updateCharacter(e: any) {
        const button = e.currentTarget as HTMLButtonElement;
        button.disabled = true;
        button.innerHTML = "Updating...";
        try {
            const apiUrl = `/api/player/updateCharacter`;
            axios
                .post(apiUrl, {
                    characterColor: playerData.characterColor,
                })
                .then((response) => {
                    pushNotificaton = null;
                    pushNotificaton = {
                        title: "Success",
                        content: "Character color updated successfully",
                        type: "success",
                        show: true,
                    };
                    playerData.applyEquipedEffect();
                    updateApplyEquipedEffect();
                    getAllSkillFromEquipItem();
                    button.disabled = false;
                    button.innerHTML = "Update Character";
                })
                .catch((error) => {
                    pushNotificaton = null;
                    pushNotificaton = {
                        title: "Error",
                        content: "Failed to update character color",
                        type: "error",
                        show: true,
                    };
                    console.error(error);
                    button.disabled = false;
                    button.innerHTML = "Update Character";
                });
        } catch (error) {
            pushNotificaton = null;
            pushNotificaton = {
                title: "Error",
                content: "Failed to update character color",
                type: "error",
                show: true,
            };
            button.disabled = false;
            button.innerHTML = "Update Character";
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

    function setFillColor(elms: any, color: any) {
        for (let i = 0; i < elms.length; i++) {
            const element = elms[i];
            element?.setAttribute("fill", color);
        }
    }

    function selectSkinColor(e: any) {
        const playerContainer = document.querySelector(
            "#player-container svg g g",
        )?.children!;
        const paths = playerContainer[4]?.children[0].querySelectorAll("path");
        setFillColor(paths, e.target?.value ?? e);
    }

    function selectHelmetColor(e: any) {
        const playerContainer = document.querySelector(
            "#player-container svg g g",
        )?.children!;
        const paths =
            playerContainer[4]?.children[1].children[0].querySelectorAll(
                "path",
            );
        setFillColor(paths, e.target?.value ?? e);
    }

    function selectHelmetTipColor(e: any) {
        const playerContainer = document.querySelector(
            "#player-container svg g g",
        )?.children!;
        const paths =
            playerContainer[4]?.children[1].children[1].querySelectorAll(
                "path",
            );
        setFillColor(paths, e.target?.value ?? e);
    }

    function selectVisorColor(e: any) {
        const playerContainer = document.querySelector(
            "#player-container svg g g",
        )?.children!;
        const visorPaths =
            playerContainer[4]?.children[2].querySelectorAll("path");
        setFillColor(visorPaths, e.target?.value ?? e);
    }

    function selectSwordColor(e: any) {
        const playerContainer = document.querySelector(
            "#player-container svg g g",
        )?.children!;
        const swordPaths =
            playerContainer[3]?.children[1].querySelectorAll("path");
        setFillColor(swordPaths, e.target?.value ?? e);
    }

    function seletcHandColor(e: any) {
        const playerContainer = document.querySelector(
            "#player-container svg g g",
        )?.children!;
        const handPaths =
            playerContainer[3]?.children[0].querySelectorAll("path");
        setFillColor(handPaths, e.target?.value ?? e);
    }

    function seletcRightFootColor(e: any) {
        const playerContainer = document.querySelector(
            "#player-container svg g g",
        )?.children!;
        const rightFootPaths = playerContainer[1]?.querySelectorAll("g path");
        setFillColor(rightFootPaths, e.target?.value ?? e);
    }

    function seletcLeftFootColor(e: any) {
        const playerContainer = document.querySelector(
            "#player-container svg g g",
        )?.children!;
        const leftFootPaths = playerContainer[2]?.querySelectorAll("g path");
        setFillColor(leftFootPaths, e.target?.value ?? e);
    }

    function seletcShieldColor(e: any) {
        const playerContainer = document.querySelector(
            "#player-container svg g g",
        )?.children!;
        const shieldPaths = playerContainer[5]?.querySelectorAll("g path");
        setFillColor(shieldPaths, e.target?.value ?? e);
    }

    function seletcBodydColor(e: any) {
        const playerContainer = document.querySelector(
            "#player-container svg g g",
        )?.children!;
        const bodyPaths = playerContainer[0]?.querySelectorAll("g path");
        setFillColor(bodyPaths, e.target?.value ?? e);
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

    {#if showAnnouncement}
        <div
            class="fixed top-0 left-0 w-full bg-white border border-black p-4 z-50 text-center"
        >
            <p class="mb-2">
                {announcement.text}
            </p>
            <div class="relative w-full h-1 bg-gray-200 overflow-hidden">
                <div
                    class="absolute top-0 left-0 h-full bg-red-500"
                    style="width: {progressAnnouncement}%; transition:all 0.5s ease-out;"
                ></div>
            </div>
        </div>
    {/if}
    <div class="container mx-auto p-0 md:p-8">
        <div class="flex items-center justify-center">
            <div
                class="w-full max-w-5xl min-h-screen md:min-h-28 font-mono bg-[#d0d058] text-[#0f380f] rounded-lg overflow-hidden border-4 border-[#8bac0f] shadow-[8px_8px_0px_#306230]"
            >
                <div class=" p-2 md:p-8">
                    <div
                        class="flex items-center flex-col md:flex-row justify-between"
                    >
                        <div
                            class="flex items-center w-full md:w-auto flex-col md:flex-row"
                        >
                            <div
                                class="flex justify-between w-full md:w-24 items-center flex-row md:flex-col"
                            >
                                <div class="flex flex-col justify-center gap-1">
                                    <img
                                        class="w-24 h-24 rounded-full border-4 border-green-700"
                                        src={$page.data.session?.user?.image ??
                                            "https://via.placeholder.com/150"}
                                        alt="Character Avatar"
                                    />
                                    <button
                                        on:click={() => signOut()}
                                        class=" block md:hidden retro-btn red-retro-btn retro-btn-sm"
                                        >Logout</button
                                    >
                                </div>

                                <div class="flex md:hidden flex-col">
                                    <h1
                                        class="text-3xl font-bold text-gray-900"
                                    >
                                        {$page.data.session?.user?.name}
                                    </h1>
                                    <div class="flex gap-1">
                                        {#each playerData.tags as tag}
                                            <div
                                                class="text-nowrap h-6 flex text-center justify-center items-center text-white font-bold rounded-full px-2 text-xs"
                                                style="background-color: {tag.color};"
                                            >
                                                <span>{tag.name}</span>
                                            </div>
                                        {/each}
                                    </div>
                                </div>
                            </div>

                            <div class="ml-4 hidden md:block">
                                {#if playerData != null}
                                    <div class="flex gap-1">
                                        <h1
                                            class="text-3xl font-bold text-gray-900"
                                        >
                                            {$page.data.session?.user?.name}
                                        </h1>
                                        {#each playerData.tags as tag}
                                            <div
                                                class="text-nowrap h-6 flex text-center justify-center items-center text-white font-bold rounded-full px-2 text-xs"
                                                style="background-color: {tag.color};"
                                            >
                                                <span>{tag.name}</span>
                                            </div>
                                        {/each}
                                    </div>
                                    <p class="text-lg text-gray-600">
                                        {playerData != null &&
                                        playerData.id != undefined
                                            ? `ID#${playerData.id}`
                                            : ""}
                                    </p>
                                {/if}
                            </div>
                        </div>
                        <div class="text-right hidden md:block">
                            <div
                                class="mt-0 md:mt-8 mb-2 md:mb-0 flex justify-end space-x-4"
                            >
                                <button
                                    on:click={() => signOut()}
                                    class="retro-btn red-retro-btn"
                                    >Logout</button
                                >
                            </div>
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
                                class="flex border-b border-[#9bbc0f] border-solid overflow-x-auto md:overflow-x-hidden"
                            >
                                <button
                                    type="button"
                                    class={`py-2 px-4 text-sm focus:outline-none  border-solid ${
                                        activeTab === "char_stats"
                                            ? "border-b-2 border-green-700 text-green-700 font-bold"
                                            : "text-gray-500 hover:text-gray-700 font-medium"
                                    }`}
                                    on:click={() => setActiveTab("char_stats")}
                                >
                                    Player Statistics
                                </button>
                                <button
                                    type="button"
                                    class={`py-2 px-4 text-sm focus:outline-none  border-solid ${
                                        activeTab === "inventory"
                                            ? "border-b-2 border-green-700 text-green-700 font-bold"
                                            : "text-gray-500 hover:text-gray-700 font-medium"
                                    }`}
                                    on:click={() => setActiveTab("inventory")}
                                >
                                    Inventory & Equipment
                                </button>
                                <button
                                    type="button"
                                    class={`py-2 px-4 text-sm focus:outline-none  border-solid ${
                                        activeTab === "skill"
                                            ? "border-b-2 border-green-700 text-green-700 font-bold"
                                            : "text-gray-500 hover:text-gray-700 font-medium "
                                    }`}
                                    on:click={() => setActiveTab("skill")}
                                >
                                    Skills
                                </button>
                                <button
                                    type="button"
                                    class={`py-2 px-4 text-sm focus:outline-none  border-solid ${
                                        activeTab === "character"
                                            ? "border-b-2 border-green-700 text-green-700 font-bold"
                                            : "text-gray-500 hover:text-gray-700 font-medium"
                                    }`}
                                    on:click={() => setActiveTab("character")}
                                >
                                    Character
                                </button>
                                <button
                                    type="button"
                                    class={`py-2 px-4 text-sm focus:outline-none  border-solid ${
                                        activeTab === "battle"
                                            ? "border-b-2 border-green-700 text-green-700 font-bold"
                                            : "text-gray-500 hover:text-gray-700 font-medium"
                                    }`}
                                    on:click={() => setActiveTab("battle")}
                                >
                                    Battle
                                </button>
                            </div>
                            <div class="mt-4">
                                <div
                                    id="char_stats"
                                    class={activeTab !== "char_stats"
                                        ? "hidden"
                                        : ""}
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
                                    id="inventory"
                                    class={activeTab !== "inventory"
                                        ? "hidden"
                                        : ""}
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
                                            >Update Equipments</button
                                        >
                                    </div>
                                </div>
                                <div
                                    id="skill"
                                    class={activeTab !== "skill"
                                        ? "hidden"
                                        : ""}
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
                                                                )?.name} Lvl.{playerData
                                                                    .getItem(
                                                                        slot,
                                                                    )
                                                                    ?.currentLevel()}
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
                                                                    class="absolute text-xs bottom-0 left-0 bg-red-600 rounded-md p-1 text-white"
                                                                    >A</small
                                                                >
                                                                <!-- {#if skill.isUltimate}
                                                                    <small
                                                                        class="absolute text-xs bottom-0 left-0 bg-red-800 rounded-md p-1 text-white"
                                                                        >U</small
                                                                    >
                                                                {:else}
                                                                    <small
                                                                        class="absolute text-xs bottom-0 left-0 bg-red-600 rounded-md p-1 text-white"
                                                                        >A</small
                                                                    >
                                                                {/if} -->
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
                                    <div
                                        class="mt-4 flex justify-end space-x-4"
                                    >
                                        <button
                                            on:click={updateData}
                                            class="retro-btn blue-retro-btn"
                                            >Update Skills</button
                                        >
                                    </div>
                                </div>
                                <div
                                    class={activeTab !== "character"
                                        ? "hidden"
                                        : ""}
                                >
                                    <div
                                        class="flex flex-col md:flex-row gap-2 w-full justify-evenly"
                                    >
                                        <div
                                            class="flex flex-row md:flex-col gap-1 md:gap-2 items-center justify-between"
                                        >
                                            <input
                                                type="color"
                                                class="h-24 w-24"
                                                on:change={selectHelmetTipColor}
                                                on:input={selectHelmetTipColor}
                                                bind:value={playerData
                                                    .characterColor
                                                    .helmetTipColor}
                                            />
                                            <input
                                                type="color"
                                                class="h-24 w-24"
                                                on:change={selectHelmetColor}
                                                on:input={selectHelmetColor}
                                                bind:value={playerData
                                                    .characterColor.helmetColor}
                                            />

                                            <input
                                                type="color"
                                                class="h-24 w-24"
                                                on:change={selectVisorColor}
                                                on:input={selectVisorColor}
                                                bind:value={playerData
                                                    .characterColor.visorColor}
                                            />
                                            <input
                                                type="color"
                                                class="h-24 w-24"
                                                on:change={selectSwordColor}
                                                on:input={selectSwordColor}
                                                bind:value={playerData
                                                    .characterColor.swordColor}
                                            />
                                            <input
                                                type="color"
                                                class="h-24 w-24"
                                                on:change={seletcHandColor}
                                                on:input={seletcHandColor}
                                                bind:value={playerData
                                                    .characterColor.handColor}
                                            />
                                        </div>
                                        <div
                                            class="flex flex-col items-center justify-between"
                                        >
                                            <div
                                                id="player-container"
                                                class="w-full"
                                            ></div>
                                        </div>
                                        <div
                                            class="flex flex-row md:flex-col gap-1 md:gap-2 items-center justify-between"
                                        >
                                            <input
                                                type="color"
                                                class="h-24 w-24"
                                                on:change={selectSkinColor}
                                                on:input={selectSkinColor}
                                                bind:value={playerData
                                                    .characterColor.skinColor}
                                            />
                                            <input
                                                type="color"
                                                class="h-24 w-24"
                                                on:change={seletcBodydColor}
                                                on:input={seletcBodydColor}
                                                bind:value={playerData
                                                    .characterColor.bodyColor}
                                            />
                                            <input
                                                type="color"
                                                class="h-24 w-24"
                                                on:change={seletcShieldColor}
                                                on:input={seletcShieldColor}
                                                bind:value={playerData
                                                    .characterColor.shieldColor}
                                            />
                                            <input
                                                type="color"
                                                class="h-24 w-24"
                                                on:change={seletcRightFootColor}
                                                on:input={seletcRightFootColor}
                                                bind:value={playerData
                                                    .characterColor
                                                    .rightFootColor}
                                            />
                                            <input
                                                type="color"
                                                class="h-24 w-24"
                                                on:change={seletcLeftFootColor}
                                                on:input={seletcLeftFootColor}
                                                bind:value={playerData
                                                    .characterColor
                                                    .leftFootColor}
                                            />
                                        </div>
                                    </div>

                                    <div
                                        class="mt-4 flex justify-end space-x-4"
                                    >
                                        <button
                                            on:click={updateCharacter}
                                            class="retro-btn blue-retro-btn"
                                            >Update Character</button
                                        >
                                    </div>
                                </div>
                                <div
                                    class={activeTab !== "battle"
                                        ? "hidden"
                                        : ""}
                                >
                                    <div
                                        class="flex flex-col md:flex-row justify-center items-center p-4 gap-4"
                                    >
                                        <a
                                            href="/player/duel"
                                            class="retro-btn red-retro-btn"
                                        >
                                            Duel
                                        </a>
                                        <a
                                            href="/player/history"
                                            class="retro-btn red-retro-btn blue-retro-btn"
                                        >
                                            HISTORY
                                        </a>
                                        <a
                                            href="/player/scoreboard"
                                            class="retro-btn red-retro-btn green-retro-btn"
                                        >
                                            SCOREBOARD
                                        </a>
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
