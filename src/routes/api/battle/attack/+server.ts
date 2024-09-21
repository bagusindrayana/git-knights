import { BasePlayer, Battle, BattleLog } from "$lib/models/battle";
import { Item, ItemSkill, Player } from "$lib/models/player";
import { getBattleData, insertBattleData, getPlayer, insertData } from "$lib/mongo";
import { json, type RequestHandler } from "@sveltejs/kit";

function transformAttr(attr: string):string {
    if (attr == "hp") {
        return "hp";
    } else if (attr == "atk") {
        return "attack";
    } else if (attr == "def") {
        return "defense";
    } else if (attr == "spd") {
        return "speed";
    } else if (attr == "str") {
        return "strength";
    }
    return attr;
}

function getSkillEffect(attacker: {
    hp: number,
    currentHp: number,
    attack: number,
    defense: number,
    speed: number,
    strength: number
}, defender: {
    hp: number,
    currentHp: number,
    attack: number,
    defense: number,
    speed: number,
    strength: number
},player:Player, skill?: ItemSkill) {
    if (!skill) return { attacker, defender, newAttacker: attacker, newDefender: defender };
    const splitId = skill.id.split("_");
    let item:Item = player.getItem(splitId[1])!;
    const newAttacker = { ...attacker };
    const newDefender = { ...defender };

    type AttackerKey = keyof typeof newAttacker;
    type DefenderKey = keyof typeof newDefender;

    const effectPlayerVals: number[] = [];
    const effectEnemyVals: number[] = [];

    skill.effects.forEach((effect: any) => {
        let effectPlayer: number = 0;
        let effectEnemy: number = 0;
        const attr:string = transformAttr(effect.attrTarget);
        if (effect.for == "Player") {
            let attrVal = newAttacker[attr as AttackerKey];
            if (attr == "hp") {
                attrVal = attacker.currentHp;
            }
            let nilaiBonus: number = item.currentItemSkillEffect(effect);
            if (effect.unit == "Percent") {
                if (effect.type == "Increase") {
                    effectPlayer +=
                        (attrVal * nilaiBonus) / 100;
                } else {
                    effectPlayer -=
                        (attrVal * nilaiBonus) / 100;
                }
            } else {
                if (effect.type == "Increase") {
                    effectPlayer += nilaiBonus;
                } else {
                    effectPlayer -= nilaiBonus;
                }
            }
        } else {
            let nilaiBonus: number = item.currentItemSkillEffect(effect);
            let attrVal = newDefender[attr as DefenderKey];
            if (attr == "hp") {
                attrVal = defender.currentHp;
            }
            if (effect.unit == "Percent") {
                if (effect.type == "Increase") {

                    effectEnemy +=
                        (attrVal * nilaiBonus) / 100;
                } else {
                    effectEnemy -=
                        (attrVal * nilaiBonus) / 100;
                }
            } else {
                if (effect.type == "Increase") {
                    effectEnemy += nilaiBonus;
                } else {
                    effectEnemy -= nilaiBonus;
                }
            }
        }

        if (attr == "hp") {
            newAttacker.currentHp = attacker.currentHp + Math.round(effectPlayer);
            newDefender.currentHp = defender.currentHp + Math.round(effectEnemy);
        } else {
           
            newAttacker[attr as AttackerKey] = Math.max(0, attacker[attr as AttackerKey] + Math.round(effectPlayer));
            newDefender[attr as DefenderKey] = Math.max(0, defender[attr as DefenderKey] + Math.round(effectEnemy));

        }
        effectPlayerVals.push(effectPlayer);
        effectEnemyVals.push(effectEnemy);



    });


    return {
        attacker: attacker,
        defender: defender,
        newAttacker: newAttacker,
        newDefender: newDefender,
        effectPlayerVals: effectPlayerVals,
        effectEnemyVals: effectEnemyVals,
    };
}


function calculateEvasionChance(attackerSPD: number, defenderSPD: number): number {
    const evasionChance = Math.max(0, Math.min(0.3, (defenderSPD - attackerSPD) / 100)); // max 30% evasion
    return evasionChance;
}

function calculateDamage(skillDamage:number,attacker: {
    hp: number,
    attack: number,
    defense: number,
    speed: number,
    strength: number
}, defender: {
    hp: number,
    attack: number,
    defense: number,
    speed: number,
    strength: number
}): any {

    // const defenderDamageReduction = defender.defense > 0 ? (defender.defense) / ((defender.defense) + 50) : 50; // Mengurangi damage berdasarkan DEF musuh

    // // Penggunaan STR penyerang untuk meningkatkan damage
    // let baseDamage = (((skillDamage + attacker.attack) + (attacker.strength * 2)) * (attacker.strength/(defender.strength > 0 ? defender.strength : attacker.strength))) * (1 - defenderDamageReduction);

    // // Pengurangan tambahan oleh STR musuh
    // const strengthReduction = (defender.strength) * 0.1; // STR musuh mengurangi damage lebih lanjut
    // if (strengthReduction > baseDamage) {
    //     baseDamage = baseDamage - (strengthReduction / 2);
    // } else {
    //     baseDamage = baseDamage - strengthReduction;
    // }

    // baseDamage = Math.max(1, baseDamage);

    // // Menggunakan HP musuh sebagai faktor random untuk damage
    // const randomFactor = 1 + (Math.random() * 0.1) * ((defender.hp) / 100); // Random 0-10% tergantung HP musuh
    // let totalDamage = baseDamage * randomFactor;

    // totalDamage = Math.max(0, Math.round(totalDamage));


    // const criticalHitChance = (attacker.strength) / ((attacker.strength) + (defender.speed));
    // const isCriticalHit = Math.random() < criticalHitChance;

    // if (isCriticalHit) {
    //     totalDamage *= 2;
    // }

    // const evasionChance = calculateEvasionChance(attacker.speed, defender.speed);
    // const rnd = Math.random();
    // const isDodge = rnd < evasionChance;
    // if (isDodge) {
    //     totalDamage = 0;
    // }

    // return {
    //     finalDamage: totalDamage,
    //     isCriticalHit: isCriticalHit,
    //     isDodge: isDodge,
    // };

    const atkMod = attacker.attack + attacker.strength;
    const defMod = defender.defense + defender.strength / 2;


    

    // Chance for critical hit (maximum 50%)
    const criticalHitChance = (attacker.strength) / ((attacker.strength) + (defender.speed));
    const isCriticalHit = Math.random() < criticalHitChance;

    // Base damage
    let damage = Math.max(0, (skillDamage + atkMod) - defMod);

    // Apply critical multiplier if critical hit
    if (isCriticalHit) {
        damage *= 2;
    }


    const evasionChance = calculateEvasionChance(attacker.speed, defender.speed);
    const rnd = Math.random();
    const isDodge = rnd < evasionChance;
    if (isDodge) {
        damage = 0;
    }

    return {
        finalDamage: Math.max(0,damage),
        isCriticalHit: isCriticalHit,
        isDodge: isDodge,
    };
}

export const POST: RequestHandler = async (event): Promise<Response> => {
    const { battleId, attackerId, defenderId, skill, originalAttacker } = await event.request.json();
    let battleJson = await getBattleData(battleId, "pending");
    if (!battleJson) {
        return json({ error: "Battle not found" }, { status: 404 });
    }

    const battleData = Battle.fromJson(JSON.stringify(battleJson));

    if(battleData.status !== "pending") {
        return json({ error: "Battle is already finish" }, { status: 400 });
    }

    let findAttacker = originalAttacker ? battleData.attacker : battleData.defender;
    if (!findAttacker) {
        return json({ error: "Attacker not found" }, { status: 404 });
    }

    let findDefender = originalAttacker ? battleData.defender : battleData.attacker;
    if (!findDefender) {
        return json({ error: "Defender not found" }, { status: 404 });
    }

    battleData.attacker.skills.forEach((skill) => {
        if (skill.currentCooldown > 0) {
            skill.currentCooldown -= 1;
        }
    });

    battleData.defender.skills.forEach((skill) => {
        if (skill.currentCooldown > 0) {
            skill.currentCooldown -= 1;
        }
    });

    let player: Player = Player.fromJson(JSON.stringify(await getPlayer(findAttacker.playerId)));
    let skilDamage = 0;
    const effectData = (skill && skill.currentCooldown == 0) ? getSkillEffect({
        hp: findAttacker.hp,
        currentHp: findAttacker.currentHp,
        attack: findAttacker.attack,
        defense: findAttacker.defense,
        speed: findAttacker.speed,
        strength: findAttacker.strength
    }, {
        hp: findDefender.hp,
        currentHp: findDefender.currentHp,
        attack: findDefender.attack,
        defense: findDefender.defense,
        speed: findDefender.speed,
        strength: findDefender.strength
    },player, ItemSkill.fromJson(JSON.stringify(skill))) : getSkillEffect({
        hp: findAttacker.hp,
        currentHp: findAttacker.currentHp,
        attack: findAttacker.attack,
        defense: findAttacker.defense,
        speed: findAttacker.speed,
        strength: findAttacker.strength
    }, {
        hp: findDefender.hp,
        currentHp: findDefender.currentHp,
        attack: findDefender.attack,
        defense: findDefender.defense,
        speed: findDefender.speed,
        strength: findDefender.strength
    },player);
    if(skill){
        const splitId = skill.id.split("_");

        
        let item:Item = player.getItem(splitId[1])!;
        skilDamage = item.currentItemSkillDamage(skill) + (findAttacker.strength/2);

        
    }
    const damageResult = calculateDamage(skilDamage,{
        hp: findAttacker.hp,
        attack: findAttacker.attack,
        defense: findAttacker.defense,
        speed: findAttacker.speed,
        strength: findAttacker.strength
    }, {
        hp: findDefender.hp,
        attack: findDefender.attack,
        defense: findDefender.defense,
        speed: findDefender.speed,
        strength: findDefender.strength
    });
    if (skill) {
        if (skill.doAttack) {
            effectData.newDefender.currentHp -= Math.round(damageResult.finalDamage);
            effectData.newDefender.currentHp = Math.max(0, effectData.newDefender.currentHp);
        } else {
            damageResult.finalDamage = 0;
            damageResult.isCriticalHit = false;
            damageResult.isDodge = false;
        }

    } else {
        effectData.newDefender.currentHp -= Math.round(damageResult.finalDamage);
        effectData.newDefender.currentHp = Math.max(0, effectData.newDefender.currentHp);
    }

    if (originalAttacker) {
        battleData.attacker.currentHp = effectData.newAttacker.currentHp;
        battleData.attacker.attack = effectData.newAttacker.attack;
        battleData.attacker.defense = effectData.newAttacker.defense;
        battleData.attacker.speed = effectData.newAttacker.speed;
        battleData.attacker.strength = effectData.newAttacker.strength;

        if (skill) {
            const skillIndex = battleData.attacker.skills.findIndex((s) => s.id == skill.id);
            if(skillIndex >= 0){
                battleData.attacker.skills[skillIndex].currentCooldown = skill.cooldownRound;
            }
        }

        battleData.defender.currentHp = effectData.newDefender.currentHp;
        battleData.defender.attack = effectData.newDefender.attack;
        battleData.defender.defense = effectData.newDefender.defense;
        battleData.defender.speed = effectData.newDefender.speed;
        battleData.defender.strength = effectData.newDefender.strength;

        
    } else {
        battleData.attacker.currentHp = effectData.newDefender.currentHp;
        battleData.attacker.attack = effectData.newDefender.attack;
        battleData.attacker.defense = effectData.newDefender.defense;
        battleData.attacker.speed = effectData.newDefender.speed;
        battleData.attacker.strength = effectData.newDefender.strength;



        battleData.defender.currentHp = effectData.newAttacker.currentHp;
        battleData.defender.attack = effectData.newAttacker.attack;
        battleData.defender.defense = effectData.newAttacker.defense;
        battleData.defender.speed = effectData.newAttacker.speed;
        battleData.defender.strength = effectData.newAttacker.strength;

        if (skill) {
            const skillIndex = battleData.defender.skills.findIndex((s) => s.id == skill.id);
            if(skillIndex >= 0){
                battleData.defender.skills[skillIndex].currentCooldown = skill.cooldownRound;
            }
        }

        
    }

    battleData.battleLog.push(new BattleLog({
        round: battleData.battleLog.length + 1,
        from: findAttacker.playerId,
        to: findDefender.playerId,
        skill: skill,
        damage: damageResult.finalDamage,
        isCriticalHit: damageResult.isCriticalHit,
        description: damageResult.isDodge ? "Dodge" : ""
    }));

    if(battleData.attacker.currentHp <= 0 && battleData.defender.currentHp <= 0){
        
        battleData.status = "draw";
        if (battleData.attacker.playerId != battleData.defender.playerId) {
            const player = await getPlayer(battleData.attacker.playerId);
            if(battleData.defender.playerLevel > battleData.attacker.playerLevel){
                player.score += 1 * (battleData.defender.playerLevel-battleData.attacker.playerLevel);
                await insertData(player);
            }
            
            
        }
    } else if(battleData.attacker.currentHp <= 0){
        
        battleData.status = "lose";
        if (battleData.attacker.playerId != battleData.defender.playerId) {
            const player = await getPlayer(battleData.attacker.playerId);
            if(battleData.defender.playerLevel < battleData.attacker.playerLevel){
                player.score -= 5 * (battleData.attacker.playerLevel-battleData.defender.playerLevel);
                battleData.score = -5 * (battleData.attacker.playerLevel-battleData.defender.playerLevel);
            } else {
                player.score -= 5;
                battleData.score = -5;
            }
            if(player.score < 0){
                player.score = 0;
            }
            await insertData(player);
        }
    } else if(battleData.defender.currentHp <= 0){
        battleData.status = "win";
        if (battleData.attacker.playerId != battleData.defender.playerId) {
            const player = await getPlayer(battleData.attacker.playerId);
            console.log("prev score : ",player.score);
            if(battleData.defender.playerLevel > battleData.attacker.playerLevel){
                player.score += 5 * (battleData.defender.playerLevel-battleData.attacker.playerLevel);
                battleData.score = 5 * (battleData.defender.playerLevel-battleData.attacker.playerLevel);
            } else {
                player.score += 5;
                battleData.score = 5;
                
            }
            await insertData(player);
        }
    } else {
        battleData.status = "pending";
    }

    if(!originalAttacker){
        battleData.round += 1;
    }

    await insertBattleData(battleData);

    return json({
        attacker: effectData.newAttacker,
        defender: effectData.newDefender,
        damageResult: damageResult,
        battleData: battleData
    })


}