import { BasePlayer, Battle, BattleLog } from "$lib/models/battle";
import { ItemSkill } from "$lib/models/player";
import { getBattleData, insertBattleData } from "$lib/mongo";
import { json, type RequestHandler } from "@sveltejs/kit";

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
}, skill?: ItemSkill) {
    if (!skill) return { attacker, defender, newAttacker: attacker, newDefender: defender };


    const newAttacker = { ...attacker };
    const newDefender = { ...defender };

    type AtatckerKey = keyof typeof newAttacker;
    type DefenderKey = keyof typeof newDefender;

    const effectPlayerVals: number[] = [];
    const effectEnemyVals: number[] = [];

    skill.effects.forEach((effect: any) => {
        let effectPlayer: number = 0;
        let effectEnemy: number = 0;
        const attr = effect.attrTarget;

        if (effect.for == "Player") {
            let attrVal = newAttacker[attr as AtatckerKey];
            if (attr == "hp") {
                attrVal = attacker.currentHp;
            }
            let nilaiBonus: number = effect.value;
            if (effect.unit == "Percent") {
                if (effect.unit == "Increase") {
                    effectPlayer +=
                        (attrVal * nilaiBonus) / 100;
                } else {
                    effectPlayer -=
                        (attrVal * nilaiBonus) / 100;
                }
            } else {
                if (effect.unit == "Increase") {
                    effectPlayer += nilaiBonus;
                } else {
                    effectPlayer -= nilaiBonus;
                }
            }
        } else {
            let nilaiBonus: number = effect.value;
            let attrVal = newDefender[attr as DefenderKey];
            if (attr == "hp") {
                attrVal = defender.currentHp;
            }
            if (effect.unit == "Percent") {
                if (effect.unit == "Increase") {

                    effectEnemy +=
                        (attrVal * nilaiBonus) / 100;
                } else {
                    effectEnemy -=
                        (attrVal * nilaiBonus) / 100;
                }
            } else {
                if (effect.unit == "Increase") {
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

            newAttacker[attr as AtatckerKey] = Math.max(0, attacker[attr as AtatckerKey] + Math.round(effectPlayer));
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
    const evasionChance = Math.max(0, Math.min(0.1, (defenderSPD - attackerSPD) / 100)); // max 30% evasion
    return evasionChance;
}

function calculateDamage(attacker: {
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

    const defenderDamageReduction = (defender.defense) / ((defender.defense) + 50); // Mengurangi damage berdasarkan DEF musuh

    // Penggunaan STR penyerang untuk meningkatkan damage
    let baseDamage = ((attacker.strength) + (attacker.strength) * 0.3) * (1 - defenderDamageReduction);
    console.log("baseDamage", baseDamage);

    // Pengurangan tambahan oleh STR musuh
    const strengthReduction = (defender.strength) * 0.1; // STR musuh mengurangi damage lebih lanjut
    if (strengthReduction > baseDamage) {
        baseDamage = baseDamage - (strengthReduction / 2);
    } else {
        baseDamage = baseDamage - strengthReduction;
    }

    baseDamage = Math.max(1, baseDamage);

    console.log("strengthReduction", baseDamage);

    // Menggunakan HP musuh sebagai faktor random untuk damage
    const randomFactor = 1 + (Math.random() * 0.1) * ((defender.hp) / 1000); // Random 0-10% tergantung HP musuh
    let totalDamage = baseDamage * randomFactor;
    console.log("randomFactor", totalDamage);

    totalDamage = Math.max(0, Math.round(totalDamage));


    const criticalHitChance = (attacker.strength) / ((attacker.strength) + (defender.speed));
    const isCriticalHit = Math.random() < criticalHitChance;

    if (isCriticalHit) {
        totalDamage *= 2;
    }

    const evasionChance = calculateEvasionChance(attacker.speed, defender.speed);
    const rnd = Math.random();
    console.log(rnd, evasionChance);
    const isDodge = rnd < evasionChance;
    if (isDodge) {
        totalDamage = 0;
    }

    return {
        finalDamage: totalDamage,
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
    }, ItemSkill.fromJson(JSON.stringify(skill))) : getSkillEffect({
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
    });

    const damageResult = calculateDamage({
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

        battleData.battleLog.push(new BattleLog({
            round: battleData.battleLog.length + 1,
            from: findAttacker.playerId,
            to: findDefender.playerId,
            skill: skill,
            damage: damageResult.finalDamage,
            isCriticalHit: damageResult.isCriticalHit,
            description: damageResult.isDodge ? "Dodge" : ""
        }));
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

        battleData.battleLog.push(new BattleLog({
            round: battleData.battleLog.length + 1,
            from: findDefender.playerId,
            to: findAttacker.playerId,
            skill: skill,
            damage: damageResult.finalDamage,
            isCriticalHit: damageResult.isCriticalHit,
            description: damageResult.isDodge ? "Dodge" : ""
        }));
    }


    await insertBattleData(battleData);

    return json({
        attacker: effectData.newAttacker,
        defender: effectData.newDefender,
        damageResult: damageResult,
        battleData: battleData
    })


}