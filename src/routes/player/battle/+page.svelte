<script lang="ts">
    import "../../../skill.css";
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
    import skills from "../../../lib/data/skill.json";
    import Tooltip from "../../../components/Tooltip.svelte";
    import { Battle } from "$lib/models/battle";
    import PlayerCard from "../../../components/PlayerCard.svelte";
    import lottie from "lottie-web";

    const animations: { [key: string]: any } = {
        hit: {
            wait: 1000,
            sound: "/sounds/22_Slash_04.wav",
            image: "/animations/Hit_512_30720-min.png",
        },
        "big-hit": {
            wait: 1000,
            sound: "/sounds/22_Slash_04.wav",
            image: "/animations/Big_Hit_758_45480-min.png",
        },
        slash: {
            wait: 1000,
            sound: "/sounds/22_Slash_04.wav",
            image: "/animations/Slash_512_51200-min.png",
        },
        healing: {
            wait: 1500,
            sound: "/sounds/02_Heal_02.wav",
            image: "/animations/Healing_512_61440-min.png",
        },
        explosion: {
            wait: 1000,
            sound: "/sounds/04_Fire_explosion_04_medium.wav",
            image: "/animations/Explosion_sprite_sheet_single-min.png",
        },
        poison: {
            wait: 1500,
            sound: "/sounds/46_Poison_01.wav",
            image: "/animations/Poison_512_30720-min.png",
        },
        magic: {
            wait: 1500,
            sound: "/sounds/25_Wind_01.wav",
            image: "/animations/Magic_512_40960-min.png",
        },
        fire: {
            wait: 1500,
            sound: "/sounds/04_Fire_explosion_04_medium.wav",
            image: "/animations/Fire_512_40960-min.png",
        },
        ice: {
            wait: 1000,
            sound: "/sounds/13_Ice_explosion_01.wav",
            image: "/animations/Ice_512_40960-min.png",
        },
        thunder: {
            wait: 1000,
            sound: "/sounds/18_Thunder_02.wav",
            image: "/animations/Thunder_512_40960-min.png",
        },
        buff: {
            wait: 1500,
            sound: "/sounds/39_Absorb_04.wav",
            image: "/animations/Buff_512_40960-min.png",
        },
        debuff: {
            wait: 1500,
            sound: "/sounds/21_Debuff_01.wav",
            image: "/animations/Breakdown_sprite_sheet_single-min.png",
        },
    };

    const enemyUsername = $page.url.searchParams.get("username");
    const id = $page.url.searchParams.get("id");

    let round = 1;
    let status = "idle";
    let dataStatus = "loading";
    let enemyTurn = false;

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

    let playerAnimationIdle: any;
    let playerAnimationAttack: any;
    let enemyAnimationIdle: any;
    let enemyAnimationAttack: any;

    async function loadSound(src: string) {
        return new Promise((resolve, reject) => {
            const audio = new Audio();
            audio.onload = () => resolve(audio);
            audio.onerror = reject;
            audio.src = src;
        });
    }

    function setAnimationColor(container: any, player: any) {
        player.selectHelmetTipColor(
            container,
            player.characterColor.helmetTipColor,
        );
        player.selectHelmetColor(container, player.characterColor.helmetColor);
        player.selectVisorColor(container, player.characterColor.visorColor);
        player.selectSwordColor(container, player.characterColor.swordColor);
        player.seletcHandColor(container, player.characterColor.handColor);
        player.seletcRightFootColor(
            container,
            player.characterColor.rightFootColor,
        );
        player.seletcLeftFootColor(
            container,
            player.characterColor.leftFootColor,
        );
        player.seletcShieldColor(container, player.characterColor.shieldColor);
        player.seletcBodydColor(container, player.characterColor.bodyColor);
        player.selectSkinColor(container, player.characterColor.skinColor);
    }

    function playerAnimationColor() {
        setAnimationColor(
            document.querySelector(
                "#player-animation-idle svg g g",
            ) as HTMLElement,
            player,
        );

        setAnimationColor(
            document.querySelector(
                "#player-animation-attack svg g g",
            ) as HTMLElement,
            player,
        );
    }

    function enemyAnimationColor() {
        setAnimationColor(
            document.querySelector(
                "#enemy-animation-idle svg g g",
            ) as HTMLElement,
            player,
        );

        setAnimationColor(
            document.querySelector(
                "#enemy-animation-attack svg g g",
            ) as HTMLElement,
            player,
        );
    }

    function playerIdleAnimation() {
        document
            .getElementById("player-animation-attack")
            ?.classList.add("hidden");
        document
            .getElementById("player-animation-idle")
            ?.classList.remove("hidden");
    }

    function playerAttackAnimation() {
        document
            .getElementById("player-animation-attack")
            ?.classList.remove("hidden");
        document
            .getElementById("player-animation-idle")
            ?.classList.add("hidden");

        playerAnimationAttack.goToAndPlay(0, true);
        playerAnimationAttack.play();
    }

    function enemyIdleAnimation() {
        document
            .getElementById("enemy-animation-attack")
            ?.classList.add("hidden");
        document
            .getElementById("enemy-animation-idle")
            ?.classList.remove("hidden");
    }

    function enemyAttackAnimation() {
        document
            .getElementById("enemy-animation-attack")
            ?.classList.remove("hidden");
        document
            .getElementById("enemy-animation-idle")
            ?.classList.add("hidden");

        enemyAnimationAttack.goToAndPlay(0, true);
        enemyAnimationAttack.play();
    }

    async function startBattle() {
        const response = await axios.post("/api/battle/init", {
            attackerId: player.id,
            defenderId: enemyPlayer.id,
        });

        battle = Battle.fromJson(JSON.stringify(response.data.data));
        round = battle.round;

        setTimeout(() => {
            playerIdleAnimation();
            enemyIdleAnimation();

            playerAnimationIdle = lottie.loadAnimation({
                container: document.getElementById("player-animation-idle")!, // the dom element that will contain the animation
                renderer: "svg",
                loop: true,
                autoplay: true,
                path:
                    window.location.protocol +
                    "//" +
                    window.location.host +
                    "/Chibi_Knight_Idle.lottie.json", // the path to the animation json
            });

            playerAnimationIdle.addEventListener("DOMLoaded", function () {
                playerAnimationColor();
            });

            playerAnimationAttack = lottie.loadAnimation({
                container: document.getElementById("player-animation-attack")!, // the dom element that will contain the animation
                renderer: "svg",
                loop: false,
                autoplay: false,
                path:
                    window.location.protocol +
                    "//" +
                    window.location.host +
                    "/Chibi_Knight_Attack.lottie.json", // the path to the animation json
            });

            playerAnimationAttack.addEventListener("DOMLoaded", function () {
                playerAnimationColor();
            });

            enemyAnimationIdle = lottie.loadAnimation({
                container: document.getElementById("enemy-animation-idle")!, // the dom element that will contain the animation
                renderer: "svg",
                loop: true,
                autoplay: true,
                path:
                    window.location.protocol +
                    "//" +
                    window.location.host +
                    "/Chibi_Knight_Idle.lottie.json", // the path to the animation json
            });

            enemyAnimationIdle.addEventListener("DOMLoaded", function () {
                enemyAnimationColor();
            });

            enemyAnimationAttack = lottie.loadAnimation({
                container: document.getElementById("enemy-animation-attack")!, // the dom element that will contain the animation
                renderer: "svg",
                loop: false,
                autoplay: false,
                path:
                    window.location.protocol +
                    "//" +
                    window.location.host +
                    "/Chibi_Knight_Attack.lottie.json", // the path to the animation json
            });

            enemyAnimationAttack.addEventListener("DOMLoaded", function () {
                enemyAnimationColor();
            });
        }, 300);
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
        const apiUrl = `/api/player?sync=false`;
        const response = await axios.post(apiUrl);
        const user = response.data;
        player = Player.fromJson(JSON.stringify(user.data.playerData));
        player.applyEquipedEffect();
        player.currentHP = player.hp + player.bonusAttributes.hp;
        player = player;
    }

    function playBgMusic() {
        (document.getElementById("bg-music") as HTMLAudioElement)!.volume = 0.1;
        setTimeout(() => {
            (document.getElementById("bg-music") as HTMLAudioElement)!.play();
        }, 500);
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
            playerElm!.innerHTML = `<div class="skill-text bg-[#9bbc0f] border-2 border-green-900 rounded-md p-1 flex flex-col items-center justify-center text-sm">
                    ${skill.name}
                </div>`;
        } else {
            arenaElm.classList.remove("move-left");
            arenaElm.classList.add("move-right");
            enemyElm!.innerHTML = `<div class="skill-text bg-[#9bbc0f] border-2 border-green-900 rounded-md p-1 flex flex-col items-center justify-center text-sm">
                    ${skill.name}
                </div>`;
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
                        playerElm!.innerHTML += `<div class="hit-text bg-${effect.type == EffectType.Decrease ? "red" : "green"}-500">${effect.type == EffectType.Decrease ? "-" : "+"}${effect.value}${effect.unit == EffectUnit.Percent ? "%" : ""} ${effect.attrTarget}</div>`;
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
                        enemyElm!.innerHTML += `<div class="hit-text bg-${effect.type == EffectType.Decrease ? "red" : "green"}-500">${effect.type == EffectType.Decrease ? "-" : "+"}${effect.value}${effect.unit == EffectUnit.Percent ? "%" : ""} ${effect.attrTarget}</div>`;
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
                        enemyElm!.innerHTML += `<div class="hit-text bg-${effect.type == EffectType.Decrease ? "red" : "green"}-500">${effect.type == EffectType.Decrease ? "-" : "+"}${effect.value}${effect.unit == EffectUnit.Percent ? "%" : ""} ${effect.attrTarget}</div>`;
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
                        playerElm!.innerHTML += `<div class="hit-text bg-${effect.type == EffectType.Decrease ? "red" : "green"}-500">${effect.type == EffectType.Decrease ? "-" : "+"}${effect.value}${effect.unit == EffectUnit.Percent ? "%" : ""} ${effect.attrTarget}</div>`;
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
                    playerAttackAnimation();
                    setTimeout(() => {
                        playerIdleAnimation();
                    }, 1300);
                    await timer(500);
                    if (damageResult.finalDamage > 0) {
                        if (damageResult.isCriticalHit) {
                            enemyElm!.innerHTML += `<div class="hit-text bg-red-500">${damageResult.finalDamage}</div>`;
                        } else {
                            enemyElm!.innerHTML += `<div class="hit-text bg-yellow-500">${damageResult.finalDamage}</div>`;
                        }
                        enemyAudio!.src = animations[skill.animation!].sound;
                        enemyAudio!.play();
                    } else {
                        enemyElm!.innerHTML += `<div class="hit-text bg-gray-500">Miss</div>`;
                        enemyAudio!.src = "/sounds/35_Miss_Evade_02.wav";
                        enemyAudio!.play();
                    }
                } else {
                    enemyAttackAnimation();
                    setTimeout(() => {
                        enemyIdleAnimation();
                    }, 1300);
                    await timer(500);
                    if (damageResult.finalDamage > 0) {
                        playerAdio!.src = animations[skill.animation!].sound;
                        playerAdio!.play();
                        if (damageResult.isCriticalHit) {
                            playerElm!.innerHTML += `<div class="hit-text bg-red-500">${damageResult.finalDamage}</div>`;
                        } else {
                            playerElm!.innerHTML += `<div class="hit-text bg-yellow-500">${damageResult.finalDamage}</div>`;
                        }
                    } else {
                        playerElm!.innerHTML += `<div class="hit-text bg-gray-500">Miss</div>`;
                        playerAdio!.src = "/sounds/35_Miss_Evade_02.wav";
                        playerAdio!.play();
                    }
                }
            } else if (damageResult.finalDamage <= 0 && skill.doAttack) {
                if (from == "player") {
                    enemyElm!.innerHTML += `<div class="hit-text bg-gray-500">Miss</div>`;
                    enemyAudio!.src = "/sounds/35_Miss_Evade_02.wav";
                    enemyAudio!.play();
                } else {
                    playerElm!.innerHTML += `<div class="hit-text bg-gray-500">Miss</div>`;
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
                    playerAttackAnimation();
                    setTimeout(() => {
                        playerIdleAnimation();
                    }, 1300);
                    await timer(500);

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
                    // alert(battle.status);
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
        enemyTurn = true;
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
                    enemyAttackAnimation();
                    setTimeout(() => {
                        enemyIdleAnimation();
                    }, 1300);
                    await timer(500);
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
                // if (battle.status != "pending") {
                //     alert(battle.status);
                // }
                setTimeout(() => {
                    scrollEventLogs();
                    enemyTurn = false;
                }, 500);
            })
            .catch((err) => {
                status = "error : " + err;
                console.log(err);
                enemyTurn = false;
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
            <b class="text-red-600"> Attack Skill </b>`;
        }

        desc += `
        <br>
        <b class="text-green-800"> Cooldown : ${skill.cooldownRound} turns</b>`;
        if (skill.doAttack == true) {
            desc += `<br>
                    <b class="text-green-800"> Base Damage : ${skill.baseDamage + (skill.ultimateDamage ?? 0)}</b> `;
        }

        if (skill.effects.length > 0) {
            desc += `<hr><b>Effects:</b><ul class="list-disc">`;
            skill.effects.forEach((effect: any) => {
                desc += `<li>
                    ${effect.name}: ${effect.type} ${effect.value}${effect.unit == "Percent" ? "%" : ""} ${effect.for} ${effect.attrTarget.toUpperCase()}
                    </li>
                `;
            });
            desc += `</ul>`;
        }

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

    function getPlayer(id: string) {
        if (id == player.id) {
            return player;
        } else {
            return enemyPlayer;
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

        #player-animation-idle,
        #player-animation-attack {
            transform: scaleX(-1);
            height: 500px;
            width: 500px;
        }

        #enemy-animation-idle,
        #enemy-animation-attack {
            height: 500px;
            width: 500px;
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
            color: white;
            padding: 4px;
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

        .skill-text {
            position: absolute;
            opacity: 0;
            animation: skill-text 1.5s ease;
            font-weight: bold;
            top: 0;
            right: 0;
            padding: 4px;
        }

        @keyframes skill-text {
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

        .bg-arena {
            background-color: #b24f49;
            background-image: url("/images/4455.jpg");
            background-size: cover;
            background-repeat: no-repeat;
            background-position: 0px -200px;
        }

        button:disabled,
        button[disabled] {
            cursor: no-drop;
        }
    </style>
</svelte:head>

<main class="w-full h-screen flex flex-col justify-between font-mono bg-arena">
    {#if enemyTurn}
        <div
            class="text-center absolute bg-[#d05858] text-[#380f0f] rounded-lg overflow-hidden border-4 border-[#ac0f0f] shadow-[8px_8px_0px_#380f0f] m-4 p-4 w-1/3 mx-auto left-0 right-0"
        >
            <h2 class="font-bold text-white text-2xl">ENEMY TURN</h2>
        </div>
    {/if}
    {#if battle.status == "win"}
        <div
            class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        >
            <div
                class="bg-yellow-300 border-4 border-orange-500 rounded-lg p-6 max-w-sm w-full text-center relative overflow-hidden"
            >
                <div class="absolute top-0 left-0 w-full h-2 bg-orange-500" />
                <div
                    class="absolute bottom-0 left-0 w-full h-2 bg-orange-500"
                />
                <div class="absolute top-0 left-0 w-2 h-full bg-orange-500" />
                <div class="absolute top-0 right-0 w-2 h-full bg-orange-500" />
                <h2 class="text-4xl font-bold text-red-600 mb-4 pixel-font">
                    YOU WIN!
                </h2>
                <p class="text-xl text-green-700 mb-6 pixel-font">
                    Congratulations, knight! You've conquered the arena!
                </p>
                <div class="space-y-4">
                    <!-- <button class="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded pixel-font">
                    Next Level
                </button> -->
                    <a
                        href="/player/duel"
                        class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded pixel-font"
                    >
                        Main Menu
                    </a>
                </div>
            </div>
        </div>
    {:else if battle.status == "lose"}
        <div
            class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        >
            <div
                class="bg-gray-800 border-4 border-red-600 rounded-lg p-6 max-w-sm w-full text-center relative overflow-hidden"
            >
                <div class="absolute top-0 left-0 w-full h-2 bg-red-600" />
                <div class="absolute bottom-0 left-0 w-full h-2 bg-red-600" />
                <div class="absolute top-0 left-0 w-2 h-full bg-red-600" />
                <div class="absolute top-0 right-0 w-2 h-full bg-red-600" />
                <h2 class="text-4xl font-bold text-red-500 mb-4 pixel-font">
                    GAME OVER
                </h2>
                <p class="text-xl text-yellow-300 mb-6 pixel-font">
                    Don't give up, knight! The duel awaits your return!
                </p>
                <div class="space-y-4">
                    <a
                        href="/player/battle?id={battle.defender.playerId}"
                        on:click={() => {
                            location.reload();
                        }}
                        class="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded pixel-font"
                    >
                        Try Again
                    </a>
                    <a
                        href="/player/duel"
                        class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded pixel-font"
                    >
                        Main Menu
                    </a>
                </div>
            </div>
        </div>
    {/if}
    <audio
        id="bg-music"
        src="/musics/Battle-Conflict.mp3"
        autoplay={false}
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
                class="font-mono flex flex-col justify-start items-center text-center w-60 h-24 m-0 md:m-4 bg-[#d0d058] text-[#0f380f] rounded-lg overflow-hidden border-4 border-[#8bac0f] shadow-[8px_8px_0px_#306230]"
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
                    <div id="player-animation-idle" class="absolute"></div>
                    <div id="player-animation-attack" class="absolute"></div>
                </div>
                <div
                    class="h-40 w-40 relative flex justify-center items-center"
                    id="player-effect"
                >
            </div>
                <audio src="" id="player-audio" class="hidden"></audio>
            </div>

            <div class="h-40 w-40 relative flex justify-center items-center">
                <div
                    class="h-40 w-40 absolute flex justify-center items-center"
                    id="enemy-character"
                >
                    <div id="enemy-animation-idle" class="absolute"></div>
                    <div id="enemy-animation-attack" class="absolute"></div>
                </div>
                <div
                    class="h-40 w-40 relative flex justify-center items-center"
                    id="enemy-effect"
                ></div>
                <audio src="" id="enemy-audio" class="hidden"></audio>
            </div>
        </div>
        <div class="flex flex-col md:flex-row justify-between">
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
                <div class="  hidden md:grid grid-cols-2 md:grid-cols-3 gap-2">
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
                class="font-mono relative w-full md:w-2/4 mt-4 md:mt-0 m-0 md:m-4 bg-[#d0d058] text-[#0f380f] rounded-lg border-4 border-[#8bac0f] shadow-[8px_8px_0px_#306230]"
            >   

                <div class="p-1 md:p-4 space-y-1 md:space-y-4">
                    <div
                        class="absolute -top-6 md:-top-11 left-0 right-0 text-center"
                    >
                        <button
                            disabled={status !== "idle" ||
                                battle.status !== "pending"}
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
                {#if status == "attacking"}
                <div class="absolute bg-black bg-opacity-50 top-0 left-0 bottom-0 right-0 pointer-events-none"></div>
                {/if}
            </div>

            <div
                class="hidden md:block font-mono w-1/4 m-4 bg-[#d0d058] text-[#0f380f] rounded-lg overflow-hidden border-4 border-[#8bac0f] shadow-[8px_8px_0px_#306230]"
            >
                <div class="p-4 space-y-4">
                    <h1>Event Log</h1>
                    <div class="h-52 overflow-y-auto" id="event-logs">
                        {#each battle.battleLog as log}
                            {#if log.skill}
                                {#if log.skill.doAttack}
                                    <p>
                                        <b>{getPlayer(log.from).name}</b> use
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
                                        to <b>{getPlayer(log.to).name}</b> :
                                        give
                                        <b class="text-red-700">{log.damage}</b>
                                        damage
                                    </p>
                                {:else}
                                    <p>
                                        <b>{getPlayer(log.from).name}</b> using
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
                                    <b>{getPlayer(log.from).name}</b> attack
                                    <b>{getPlayer(log.to).name}</b>
                                    with critical hit : give
                                    <b class="text-red-700">{log.damage}</b> damage
                                </p>
                            {:else}
                                <p>
                                    <b>{getPlayer(log.from).name}</b> attack
                                    <b>{getPlayer(log.to).name}</b>
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
