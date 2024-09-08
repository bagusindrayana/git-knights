<script lang="ts">
    import "../../skill.css";
    import {
        ItemSkill,
        Player,
        EffectFor,
        EffectType,
        EffectUnit,
        ItemEffect,
        ItemSkillEffect,
    } from "$lib/models/player";
    import { onMount } from "svelte";
    import axios from "axios";
    import { page } from "$app/stores";
    import skills from "../../lib/data/skill.json";
    import Tooltip from "../../components/Tooltip.svelte";
    import { Battle } from "$lib/models/battle";
    import PlayerCard from "../../components/PlayerCard.svelte";

    const animations: { [key: string]: any } = {
        hit: {
            wait: 1000,
            sound: "/sounds/22_Slash_04.wav",
            image: "/animations/Hit_512_30720.png",
        },
        "big-hit": {
            wait: 1000,
            sound: "/sounds/22_Slash_04.wav",
            image: "/animations/Big_Hit_758_45480.png",
        },
        slash: {
            wait: 1000,
            sound: "/sounds/22_Slash_04.wav",
            image: "/animations/Slash_512_51200.png",
        },
        healing: {
            wait: 1500,
            sound: "/sounds/02_Heal_02.wav",
            image: "/animations/Healing_512_61440.png",
        },
        explosion: {
            wait: 1000,
            sound: "/sounds/04_Fire_explosion_04_medium.wav",
            image: "/animations/Explosion_sprite_sheet_single.png",
        },
        poison: {
            wait: 1500,
            sound: "/sounds/46_Poison_01.wav",
            image: "/animations/Poison_512_30720.png",
        },
        magic: {
            wait: 1500,
            sound: "/sounds/25_Wind_01.wav",
            image: "/animations/Magic_512_40960.png",
        },
        fire: {
            wait: 1500,
            sound: "/sounds/04_Fire_explosion_04_medium.wav",
            image: "/animations/Fire_512_40960.png",
        },
        ice: {
            wait: 1000,
            sound: "/sounds/13_Ice_explosion_01.wav",
            image: "/animations/Ice_512_40960.png",
        },
        thunder: {
            wait: 1000,
            sound: "/sounds/18_Thunder_02.wav",
            image: "/animations/Thunder_512_40960.png",
        },
        buff: {
            wait: 1500,
            sound: "/sounds/39_Absorb_04.wav",
            image: "/animations/Buff_512_40960.png",
        },
        debuff: {
            wait: 1500,
            sound: "/sounds/21_Debuff_01.wav",
            image: "/animations/Breakdown_sprite_sheet_single.png",
        },
    };

    const enemyUsername = $page.url.searchParams.get("username");
    const id = $page.url.searchParams.get("id");

    let round = 1;
    let status = "idle";
    let dataStatus = "loading";

    let player: Player = new Player({
        hp: 1690,
        str: 300,
        atk: 200,
        def: 300,
        spd: 300,
        profile: {
            name: "Bagus",
        },
    });

    let enemyPlayer: Player = new Player({
        hp: 1000,
        str: 200,
        atk: 200,
        def: 200,
        spd: 150,
        profile: {
            name: "Budi",
        },
    });

    let battle: Battle = new Battle();

    let showTooltip = false;
    let mouseX = 0;
    let mouseY = 0;
    let tooltipTitle = "Detailed Information";
    let tooltipContent =
        "This tooltip follows the mouse position. You can add more details, images, links, or any other content here.";

    async function loadImage(src: string) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    }

    async function loadSound(src: string) {
        return new Promise((resolve, reject) => {
            const audio = new Audio();
            audio.onload = () => resolve(audio);
            audio.onerror = reject;
            audio.src = src;
        });
    }

    async function startBattle() {
        const response = await axios.post("/api/battle/init", {
            attackerId: player.id,
            defenderId: enemyPlayer.id,
        });

        battle = Battle.fromJson(JSON.stringify(response.data.data));
        round = battle.round;
    }

    async function loadAllData() {
        try {
            dataStatus = "get player data...";
            await getUserData();
            dataStatus = "get enemy data...";
            await getEnemy();

            //load assets
            dataStatus = "loading assets...";
            for (let i = 0; i < animations.length; i++) {
                await loadSound(animations[i].sound);
                await loadImage(animations[i].image);
            }
            dataStatus = "starting battle...";
            await startBattle();

            dataStatus = "done";
        } catch (error: any) {
            console.log(error);
            dataStatus = "error : " + error.message;
        }
        setTimeout(() => {
            scrollEventLogs();
        }, 500);
    }

    async function getEnemy() {
        const apiUrl = "/api/enemyInfo";
        try {
            const response = await axios.post(apiUrl, {
                username: enemyUsername,
                id: id,
            });

            enemyPlayer = Player.fromJson(
                JSON.stringify(response.data.data.playerData),
            );

            enemyPlayer.equipRandomItems();
            enemyPlayer.equipRandomSkills(skills);
            enemyPlayer.applyEquipedEffect();
            enemyPlayer.currentHP =
                enemyPlayer.hp + enemyPlayer.bonusAttributes.hp;
            enemyPlayer = enemyPlayer;
        } catch (error: any) {
            //if error is axios and got 404
            if (error.response && error.response.status == 404) {
                throw new Error(error.response.data.data.error);
            } else {
                throw error;
            }
        }
    }

    async function getUserData() {
        const apiUrl = `/api/userInfo?sync=false`;
        const response = await axios.post(apiUrl);
        const user = response.data;
        player = Player.fromJson(JSON.stringify(user.data.playerData));
        player.applyEquipedEffect();
        player.currentHP = player.hp + player.bonusAttributes.hp;
        player = player;
    }

    function playBgMusic() {
        (document.getElementById("bg-music") as HTMLAudioElement)!.volume = 0.1;
        (document.getElementById("bg-music") as HTMLAudioElement)!.play();
    }

    function scrollEventLogs() {
        const logs = document.getElementById("event-logs");
        if (logs) {
            logs.scrollTop = logs.scrollHeight;
        }
    }

    onMount(() => {
        loadAllData();

        playBgMusic();
    });

    const timer = (ms: number) => new Promise((res) => setTimeout(res, ms));

    async function addSkillAnimation(
        skill: ItemSkill,
        from: string,
        damageResult: any = null,
    ) {
        const playerElm = document.getElementById("player-effect");
        const playerAdio = document.getElementById(
            "player-audio",
        ) as HTMLAudioElement;
        const enemyElm = document.getElementById("enemy-effect");
        const enemyAudio = document.getElementById(
            "enemy-audio",
        ) as HTMLAudioElement;

        const arenaElm = document.getElementById("arena") as HTMLElement;
        if (from == "player") {
            arenaElm.classList.remove("move-right");
            arenaElm.classList.add("move-left");
        } else {
            arenaElm.classList.remove("move-left");
            arenaElm.classList.add("move-right");
        }

        await timer(1500);

        const elm = from == "player" ? enemyElm : playerElm;

        for (let i = 0; i < skill.effects.length; i++) {
            const effect = skill.effects[i];
            if (elm != null) {
                if (from == "player") {
                    if (effect.for == EffectFor.Player) {
                        arenaElm.classList.remove("move-right");
                        arenaElm.classList.add("move-left");
                        await timer(500);
                        playerAdio!.src =
                            animations[
                                effect.type == EffectType.Decrease
                                    ? "debuff"
                                    : "buff"
                            ].sound;
                        playerAdio!.play();
                        playerElm!.innerHTML += `<div class="hit-text text-${effect.type == EffectType.Decrease ? "red" : "green"}-700">${effect.type == EffectType.Decrease ? "-" : "+"}${effect.value}${effect.unit == EffectUnit.Percent ? "%" : ""} ${effect.attrTarget}</div>`;
                        playerElm!.innerHTML += `<div class="animation-effect ${effect.type == EffectType.Decrease ? "debuff" : "buff"}-animation"/>`;
                    } else {
                        arenaElm.classList.remove("move-left");
                        arenaElm.classList.add("move-right");
                        await timer(500);
                        enemyAudio!.src =
                            animations[
                                effect.type == EffectType.Decrease
                                    ? "debuff"
                                    : "buff"
                            ].sound;
                        enemyAudio!.play();
                        enemyElm!.innerHTML += `<div class="hit-text text-${effect.type == EffectType.Decrease ? "red" : "green"}-700">${effect.type == EffectType.Decrease ? "-" : "+"}${effect.value}${effect.unit == EffectUnit.Percent ? "%" : ""} ${effect.attrTarget}</div>`;
                        enemyElm!.innerHTML += `<div class="animation-effect ${effect.type == EffectType.Decrease ? "debuff" : "buff"}-animation"/>`;
                    }
                } else {
                    if (effect.for == EffectFor.Player) {
                        arenaElm.classList.remove("move-left");
                        arenaElm.classList.add("move-right");
                        await timer(500);
                        playerAdio!.src =
                            animations[
                                effect.type == EffectType.Decrease
                                    ? "debuff"
                                    : "buff"
                            ].sound;
                        playerAdio!.play();
                        enemyElm!.innerHTML += `<div class="hit-text text-${effect.type == EffectType.Decrease ? "red" : "green"}-700">${effect.type == EffectType.Decrease ? "-" : "+"}${effect.value}${effect.unit == EffectUnit.Percent ? "%" : ""} ${effect.attrTarget}</div>`;
                        enemyElm!.innerHTML += `<div class="animation-effect ${effect.type == EffectType.Decrease ? "debuff" : "buff"}-animation"/>`;
                    } else {
                        arenaElm.classList.remove("move-right");
                        arenaElm.classList.add("move-left");
                        await timer(500);
                        enemyAudio!.src =
                            animations[
                                effect.type == EffectType.Decrease
                                    ? "debuff"
                                    : "buff"
                            ].sound;
                        enemyAudio!.play();
                        playerElm!.innerHTML += `<div class="hit-text text-${effect.type == EffectType.Decrease ? "red" : "green"}-700">${effect.type == EffectType.Decrease ? "-" : "+"}${effect.value}${effect.unit == EffectUnit.Percent ? "%" : ""} ${effect.attrTarget}</div>`;
                        playerElm!.innerHTML += `<div class="animation-effect ${effect.type == EffectType.Decrease ? "debuff" : "buff"}-animation"/>`;
                    }
                }

                await timer(1500);
                playerElm!.innerHTML = "";
                enemyElm!.innerHTML = "";
            }
        }

        document.getElementById("arena")!.classList.remove("move-left");
        document.getElementById("arena")!.classList.remove("move-right");
        await timer(500);
        if (skill.animation && elm != null && skill.animation != "none") {
            if (damageResult.finalDamage > 0) {
                elm.parentElement!.classList.add("shake");
                elm.innerHTML += `<div class="animation-effect ${skill.animation}-animation"/>`;
            }
            if (skill.doAttack) {
                if (from == "player") {
                    document.getElementById("player-character")!.innerHTML =
                        `<div class="char-attack absolute"></div>`;
                    setTimeout(() => {
                        document.getElementById("player-character")!.innerHTML =
                            `<div class="char-idle absolute"></div>`;
                    }, 1300);
                    await timer(300);
                    if (damageResult.finalDamage > 0) {
                        if (damageResult.isCriticalHit) {
                            enemyElm!.innerHTML += `<div class="hit-text text-red-700">${damageResult.finalDamage}</div>`;
                        } else {
                            enemyElm!.innerHTML += `<div class="hit-text text-yellow-700">${damageResult.finalDamage}</div>`;
                        }
                        enemyAudio!.src = animations[skill.animation!].sound;
                        enemyAudio!.play();
                    } else {
                        enemyElm!.innerHTML += `<div class="hit-text text-gray-700">Miss</div>`;
                        enemyAudio!.src = "/sounds/35_Miss_Evade_02.wav";
                        enemyAudio!.play();
                    }
                } else {
                    document.getElementById("enemy-character")!.innerHTML =
                        `<div class="char-attack absolute"></div>`;
                    setTimeout(() => {
                        document.getElementById("enemy-character")!.innerHTML =
                            `<div class="char-idle absolute"></div>`;
                    }, 1300);
                    await timer(300);
                    if (damageResult.finalDamage > 0) {
                        playerAdio!.src = animations[skill.animation!].sound;
                        playerAdio!.play();
                        if (damageResult.isCriticalHit) {
                            playerElm!.innerHTML += `<div class="hit-text text-red-700">${damageResult.finalDamage}</div>`;
                        } else {
                            playerElm!.innerHTML += `<div class="hit-text text-yellow-700">${damageResult.finalDamage}</div>`;
                        }
                    } else {
                        playerElm!.innerHTML += `<div class="hit-text text-gray-700">Miss</div>`;
                        playerAdio!.src = "/sounds/35_Miss_Evade_02.wav";
                        playerAdio!.play();
                    }
                }
            } else if (damageResult.finalDamage <= 0 && skill.doAttack) {
                if (from == "player") {
                    enemyElm!.innerHTML += `<div class="hit-text text-gray-700">Miss</div>`;
                    enemyAudio!.src = "/sounds/35_Miss_Evade_02.wav";
                    enemyAudio!.play();
                } else {
                    playerElm!.innerHTML += `<div class="hit-text text-gray-700">Miss</div>`;
                    playerAdio!.src = "/sounds/35_Miss_Evade_02.wav";
                    playerAdio!.play();
                }
            }
            if (skill.animation != "none") {
                await timer(1000 + animations[skill.animation].wait);
            } else {
                await timer(1000);
            }
            elm.parentElement!.classList.remove("shake");
            elm.innerHTML = "";
            playerElm!.innerHTML = "";
            enemyElm!.innerHTML = "";
        }
    }

    async function addEffectAnimation(elm: HTMLElement, animation: string) {
        elm.parentElement!.classList.add("shake");
        elm.innerHTML += `<div class="animation-effect ${animation}-animation"/>`;
        await timer(1500);
        elm.parentElement!.classList.remove("shake");
        elm!.innerHTML = "";
    }

    function attack(skill?: ItemSkill) {
        playBgMusic();
        if (status != "idle") {
            return;
        }
        if (skill) {
            const findSkill = battle.attacker.skills.find(
                (s) => s.id === skill.id,
            );
            if (findSkill && findSkill.currentCooldown > 0) {
                return;
            }
        }
        status = "attacking";
        const apiUrl = "/api/battle/attack";
        axios
            .post(apiUrl, {
                battleId: battle.id,
                skill: skill,
                attackerId: player.id,
                defenderId: enemyPlayer.id,
                originalAttacker: true,
            })
            .then(async (res) => {
                const enemyElm = document.getElementById("enemy-effect");
                const enemyAudio = document.getElementById(
                    "enemy-audio",
                ) as HTMLAudioElement;
                enemyElm!.innerHTML = "";
                if (skill != null) {
                    await addSkillAnimation(
                        skill,
                        "player",
                        res.data.damageResult,
                    );
                } else {
                    document.getElementById("player-character")!.innerHTML =
                        `<div class="char-attack absolute"></div>`;
                    setTimeout(() => {
                        document.getElementById("player-character")!.innerHTML =
                            `<div class="char-idle absolute"></div>`;
                    }, 1300);
                    await timer(300);

                    if (res.data.damageResult.finalDamage > 0) {
                        if (res.data.damageResult.isCriticalHit) {
                            enemyAudio.src = animations["big-hit"].sound;
                            enemyAudio.play();
                            enemyElm!.innerHTML += `<div class="hit-text text-red-700">${res.data.damageResult.finalDamage}</div>`;
                            await addEffectAnimation(enemyElm!, "big-hit");
                        } else {
                            enemyAudio.src = animations["hit"].sound;
                            enemyAudio.play();
                            enemyElm!.innerHTML += `<div class="hit-text text-yellow-700">${res.data.damageResult.finalDamage}</div>`;
                            await addEffectAnimation(enemyElm!, "hit");
                        }
                    } else {
                        enemyElm!.innerHTML += `<div class="hit-text text-gray-700">Miss</div>`;
                        enemyAudio!.src = "/sounds/35_Miss_Evade_02.wav";
                        enemyAudio!.play();
                    }
                }
                battle = Battle.fromJson(JSON.stringify(res.data.battleData));

                setTimeout(() => {
                    scrollEventLogs();
                }, 500);
                if (battle.status != "pending") {
                    alert(battle.status);
                } else {
                    setTimeout(() => {
                        if (battle.status == "pending") {
                            enemyAttack();
                        }
                        enemyElm!.innerHTML = "";
                    }, 1000);
                }
            })
            .catch((err) => {
                status = "error : " + err;
                console.log(err);
            });
    }

    function enemyAttack() {
        const isPrimeRound = round % 2 == 0;

        let randomSkill: ItemSkill | undefined;

        //if isPrimeRound find skill that "doAttack" with high cooldownRound
        if (isPrimeRound) {
            const skills = battle.defender.skills.filter(
                (skill) => skill.doAttack && skill.currentCooldown == 0,
            );
            if (skills.length > 0) {
                randomSkill = skills[Math.floor(Math.random() * skills.length)];
            }
        } else {
            //else sort skill with less "cooldownRound"
            const skills = battle.defender.skills
                .sort((a, b) => a.cooldownRound - b.cooldownRound)
                .filter((skill) => skill.currentCooldown == 0);

            if (skills.length > 0) {
                randomSkill = skills[Math.floor(Math.random() * skills.length)];
            }
        }

        const apiUrl = "/api/battle/attack";
        axios
            .post(apiUrl, {
                battleId: battle.id,
                skill: randomSkill,
                attackerId: player.id,
                defenderId: enemyPlayer.id,
                originalAttacker: false,
            })
            .then(async (res) => {
                const playerElm = document.getElementById("player-effect");
                const playerAudio = document.getElementById(
                    "player-audio",
                ) as HTMLAudioElement;
                playerElm!.innerHTML = "";
                if (randomSkill != undefined) {
                    await addSkillAnimation(
                        randomSkill,
                        "enemy",
                        res.data.damageResult,
                    );
                } else {
                    document.getElementById("enemy-character")!.innerHTML =
                        `<div class="char-attack absolute"></div>`;
                    setTimeout(() => {
                        document.getElementById("enemy-character")!.innerHTML =
                            `<div class="char-idle absolute"></div>`;
                    }, 1300);
                    await timer(300);
                    if (res.data.damageResult.finalDamage > 0) {
                        if (res.data.damageResult.isCriticalHit) {
                            playerAudio.src = animations["big-hit"].sound;
                            playerAudio.play();
                            playerElm!.innerHTML += `<div class="hit-text text-red-700">${res.data.damageResult.finalDamage}</div>`;
                            await addEffectAnimation(playerElm!, "big-hit");
                        } else {
                            playerAudio.src = animations["hit"].sound;
                            playerAudio.play();
                            playerElm!.innerHTML += `<div class="hit-text text-yellow-700">${res.data.damageResult.finalDamage}</div>`;
                            await addEffectAnimation(playerElm!, "hit");
                        }
                    } else {
                        playerElm!.innerHTML += `<div class="hit-text text-gray-700">Miss</div>`;
                        playerAudio!.src = "/sounds/35_Miss_Evade_02.wav";
                        playerAudio!.play();
                    }
                }

                // battle.attacker.currentHp = res.data.attacker.currentHp;
                // battle.attacker.attack = res.data.attacker.attack;
                // battle.attacker.defense = res.data.attacker.defense;
                // battle.attacker.strength = res.data.attacker.strength;
                // battle.attacker.speed = res.data.attacker.speed;

                // battle.defender.currentHp = res.data.defender.currentHp;
                // battle.defender.attack = res.data.defender.attack;
                // battle.defender.defense = res.data.defender.defense;
                // battle.defender.strength = res.data.defender.strength;
                // battle.defender.speed = res.data.defender.speed;

                battle = Battle.fromJson(JSON.stringify(res.data.battleData));

                round = round + 1;
                status = "idle";
                playerElm!.innerHTML = "";
                if (battle.status != "pending") {
                    alert(battle.status);
                }
                setTimeout(() => {
                    scrollEventLogs();
                }, 500);
            })
            .catch((err) => {
                status = "error : " + err;
                console.log(err);
            });
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
        skill.effects.forEach((effect: ItemSkillEffect) => {
            desc += `<li>
                ${effect.name}: ${effect.type} ${effect.value}${effect.unit == EffectUnit.Percent ? "%" : ""} ${effect.for} ${effect.attrTarget.toUpperCase()}
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
</script>

<svelte:head>
    <title>Battle!</title>
    <style>
        .shake {
            animation: shake 0.5s;
        }

        @keyframes shake {
            0% {
                transform: translate(1px, 1px) rotate(0deg);
            }
            10% {
                transform: translate(-1px, -2px) rotate(-1deg);
            }
            20% {
                transform: translate(-3px, 0px) rotate(1deg);
            }
            30% {
                transform: translate(3px, 2px) rotate(0deg);
            }
            40% {
                transform: translate(1px, -1px) rotate(1deg);
            }
            50% {
                transform: translate(-1px, 2px) rotate(-1deg);
            }
            60% {
                transform: translate(-3px, 1px) rotate(0deg);
            }
            70% {
                transform: translate(3px, 1px) rotate(-1deg);
            }
            80% {
                transform: translate(-1px, -1px) rotate(1deg);
            }
            90% {
                transform: translate(1px, 2px) rotate(0deg);
            }
            100% {
                transform: translate(1px, -2px) rotate(-1deg);
            }
        }

        #player-character {
            /* background-image: url("/animations/player/idle.png");
            background-size: cover;
            background-repeat: no-repeat;
            transform: scaleX(-1);
            width:550px;
            height: 598px; */
            transform: scale(0.3);
        }

        #enemy-character {
            /* background-image: url("/animations/player/idle.png");
            background-size: cover;
            background-repeat: no-repeat;
            width:550px;
            height: 598px; */
            transform: scale(0.3);
        }

        .char-idle {
            background-image: url("/animations/player/idle.png");
            background-size: cover;
            background-repeat: no-repeat;
            width: 550px;
            height: 598px;
            animation: char-anim 1s steps(8) infinite;
        }

        #player-character .char-idle {
            transform: scaleX(-1);
            animation-delay: 0.5s;
        }

        .char-attack {
            background-image: url("/animations/player/attack.png");
            background-size: cover;
            background-repeat: no-repeat;
            width: 550px;
            height: 598px;
            animation: char-anim 1s steps(8);
        }

        #player-character .char-attack {
            transform: scaleX(-1);
        }

        @keyframes char-anim {
            0% {
                background-position: 0 0;
            }
            100% {
                background-position: 0 -4784px;
            }
        }

        .hit-text {
            position: absolute;
            opacity: 0;
            animation: hit-text 1s ease;
            font-weight: bold;
            top: 0;
            right: 0;
        }

        @keyframes hit-text {
            0% {
                transform: translateY(0);
            }
            30% {
                opacity: 1;
            }
            50% {
                opacity: 1;
                transform: translateY(-10px);
            }
            90% {
                opacity: 1;
            }
            100% {
                opacity: 0;
                transform: translateY(0);
            }
        }

        #arena {
            transition: all 0.5s;
            zoom: 1;
        }

        #arena.move-left {
            transform: translateX(25%);
            zoom: 1.5;
        }

        #arena.move-right {
            transform: translateX(-25%);
            zoom: 1.5;
        }
    </style>
</svelte:head>

<main class="w-full h-screen flex flex-col justify-between font-mono">
    <audio
        id="bg-music"
        src="/musics/Battle-Conflict.mp3"
        autoplay={true}
        loop={true}
        volume="0.1"
    ></audio>
    <Tooltip
        show={showTooltip}
        {mouseX}
        {mouseY}
        {tooltipTitle}
        {tooltipContent}
    />

    {#if dataStatus.includes("error")}
        <div class="w-full flex flex-col items-center justify-center p-4 h-lvh">
            <p class="text-lg mt-4">{dataStatus}</p>
            <div class="flex flex-col mt-2 gap-2">
                <button class="retro-btn blue-retro-btn" on:click={loadAllData}>
                    Retry...
                </button>
                <a class="retro-btn yellow-retro-btn" href="/player"> Back </a>
            </div>
        </div>
    {:else if dataStatus != "done"}
        <div class="w-full flex flex-col items-center justify-center p-4 h-lvh">
            <div
                class="border-gray-300 h-20 w-20 animate-spin rounded-full border-8 border-t-green-700"
            />
            <p class="text-lg mt-4">{dataStatus}</p>
        </div>
    {:else}
        <div class="w-full flex justify-between">
            <div
                class="font-mono flex flex-col justify-start items-center text-center w-60 h-24 m-4 bg-[#d0d058] text-[#0f380f] rounded-lg overflow-hidden border-4 border-[#8bac0f] shadow-[8px_8px_0px_#306230]"
            >
                <p>Round</p>
                <p class="font-bold text-2xl">{round}</p>
            </div>
            <PlayerCard
                id={`${battle?.defender.playerId}`}
                name={`${enemyPlayer.name}`}
                level={enemyPlayer.currentLevel()}
                hp={battle?.defender.hp}
                currentHp={battle?.defender.currentHp}
                attack={battle?.defender.attack}
                strength={battle?.defender.strength}
                defense={battle?.defender.defense}
                speed={battle?.defender.speed}
            />
        </div>
        <div class="w-full flex justify-around" id="arena">
            <div class="h-40 w-40 relative flex justify-center items-center">
                <div
                    class="h-40 w-40 absolute flex justify-center items-center"
                    id="player-character"
                >
                    <div class="char-idle absolute"></div>
                </div>
                <div
                    class="h-40 w-40 relative flex justify-center items-center"
                    id="player-effect"
                ></div>
                <audio src="" id="player-audio" class="hidden"></audio>
            </div>

            <div class="h-40 w-40 relative flex justify-center items-center">
                <div
                    class="h-40 w-40 absolute flex justify-center items-center"
                    id="enemy-character"
                >
                    <div class="char-idle absolute"></div>
                </div>
                <div
                    class="h-40 w-40 relative flex justify-center items-center"
                    id="enemy-effect"
                ></div>
                <audio src="" id="enemy-audio" class="hidden"></audio>
            </div>
        </div>
        <div class="flex justify-between">
            <PlayerCard
                id={`${player.id}`}
                name={`${player.name}`}
                level={player.currentLevel()}
                hp={battle.attacker?.hp}
                currentHp={battle.attacker?.currentHp}
                attack={battle.attacker?.attack}
                strength={battle.attacker?.strength}
                defense={battle.attacker?.defense}
                speed={battle.attacker?.speed}
            >
                <div class=" grid grid-cols-2 md:grid-cols-3 gap-2">
                    {#each battle.attacker?.items as item}
                        <div
                            class="p-2 rounded-md border-2 border-green-600 text-center min-h-16 flex justify-center items-center"
                        >
                            <small>
                                {#if item != null}
                                    {item?.name}
                                {:else}
                                    0
                                {/if}
                            </small>
                        </div>
                    {/each}
                </div>
            </PlayerCard>

            <div
                class="font-mono relative w-2/4 m-4 bg-[#d0d058] text-[#0f380f] rounded-lg border-4 border-[#8bac0f] shadow-[8px_8px_0px_#306230]"
            >
                <div class="p-4 space-y-4">
                    <div class="absolute -top-11 left-0 right-0 text-center">
                        <button
                            disabled={status !== "idle"}
                            on:click={() => attack()}
                            class="px-8 py-4 bg-red-600 text-white font-bold text-xl uppercase tracking-wide border-b-4 border-red-800 rounded hover:bg-red-500 active:border-b-0 active:border-t-4 transition-all duration-100"
                        >
                            Attack
                        </button>
                    </div>

                    <div>
                        <p class="text-2xl font-bold text-gray-800 mb-4">
                            Skill
                        </p>
                        <div class="mt-4 grid grid-cols-4 md:grid-cols-6 gap-2">
                            {#each battle.attacker?.skills as skill, index}
                                <div
                                    data-slot={index}
                                    class="skill-slot-{index} p-1 rounded-md border-2 min-h-20 border-green-700 text-center text-xs flex justify-center items-center"
                                >
                                    <button
                                        type="button"
                                        data-skill={JSON.stringify(skill)}
                                        on:click={() => attack(skill)}
                                        on:mouseenter={handleMouseEnterSkill}
                                        on:mouseleave={handleMouseLeave}
                                        on:mousemove={handleMouseMove}
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
                                            style="background-color: {battle.attacker.items.find(
                                                (item) => {
                                                    return (
                                                        item.id ===
                                                        skill.id.split('_')[1]
                                                    );
                                                },
                                            )?.color};"
                                            >{battle.attacker.items.find(
                                                (item) => {
                                                    return (
                                                        item.id ===
                                                        skill.id.split("_")[1]
                                                    );
                                                },
                                            )?.name}</small
                                        >
                                        {#if skill.doAttack}
                                            <small
                                                class="absolute text-xs bottom-0 left-0 bg-red-700 rounded-md p-1 text-white"
                                                >A</small
                                            >
                                        {/if}

                                        {#if skill.currentCooldown > 0}
                                            <small
                                                class="absolute text-xs bottom-0 right-0 bg-red-700 rounded-md p-1 text-white"
                                            >
                                                {skill.currentCooldown}</small
                                            >
                                        {/if}
                                    </button>
                                </div>
                            {/each}
                        </div>
                    </div>
                </div>
            </div>

            <div
                class="font-mono w-1/4 m-4 bg-[#d0d058] text-[#0f380f] rounded-lg overflow-hidden border-4 border-[#8bac0f] shadow-[8px_8px_0px_#306230]"
            >
                <div class="p-4 space-y-4">
                    <h1>Event Log</h1>
                    <div class="h-52 overflow-y-auto" id="event-logs">
                        {#each battle.battleLog as log}
                            {#if log.skill}
                                {#if log.skill.doAttack}
                                    <p>
                                        <b>{log.from}</b> use
                                        <b
                                            class="text-blue-700"
                                            data-skill={JSON.stringify(
                                                log.skill,
                                            )}
                                            on:mouseenter={handleMouseEnterSkill}
                                            on:mouseleave={handleMouseLeave}
                                            on:mousemove={handleMouseMove}
                                            data-id={log.skill.id}
                                            >{log.skill.name}</b
                                        >
                                        to <b>{log.to}</b> : give
                                        <b class="text-red-700">{log.damage}</b>
                                        damage
                                    </p>
                                {:else}
                                    <p>
                                        <b>{log.from}</b> using
                                        <b
                                            class="text-blue-700"
                                            data-skill={JSON.stringify(
                                                log.skill,
                                            )}
                                            on:mouseenter={handleMouseEnterSkill}
                                            on:mouseleave={handleMouseLeave}
                                            on:mousemove={handleMouseMove}
                                            data-id={log.skill.id}
                                            >{log.skill.name}</b
                                        >
                                    </p>
                                {/if}
                            {:else if log.isCriticalHit}
                                <p>
                                    <b>{log.from}</b> attack
                                    <b>{log.to}</b>
                                    with critical hit : give
                                    <b class="text-red-700">{log.damage}</b> damage
                                </p>
                            {:else}
                                <p>
                                    <b>{log.from}</b> attack
                                    <b>{log.to}</b>
                                    with normal attack : give
                                    <b class="text-red-700">{log.damage}</b> damage
                                </p>
                            {/if}
                        {/each}
                    </div>
                </div>
            </div>
        </div>
    {/if}
</main>
