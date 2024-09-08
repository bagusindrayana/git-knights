import { ItemSkill, Player } from "$lib/models/player";
import { json, type RequestHandler } from "@sveltejs/kit";
import skills from "../../../lib/data/skill.json";

function getSkillEffect(attacker: Player, defender: Player, skill?: ItemSkill) {
    if (!skill) return { attacker, defender, newAttacker: attacker, newDefender: defender };


    const newAttacker = Player.fromJson(JSON.stringify(attacker));
    const newDefender = Player.fromJson(JSON.stringify(defender));

    const effectPlayerVals: number[] = [];
    const effectEnemyVals: number[] = [];

    skill.effects.forEach((effect: any) => {
        let effectPlayer: number = 0;
        let effectEnemy: number = 0;
        const attr = effect.attrTarget;

        if (effect.for == "Player") {
            let attrVal = defender.getAttr(attr);
            if (attr == "hp") {
                attrVal = attacker.currentHP;
            }
            let nilaiBonus: number = effect.value;
            if (effect.unit == "Percent") {
                if (effect.unit == "Increase") {
                    effectPlayer +=
                        ((attrVal + attacker.getBonusAttr(attr)) * nilaiBonus) / 100;
                } else {
                    effectPlayer -=
                        ((attrVal + attacker.getBonusAttr(attr)) * nilaiBonus) / 100;
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
            let attrVal = defender.getAttr(attr);
            if (attr == "hp") {
                attrVal = defender.currentHP;
            }
            if (effect.unit == "Percent") {
                if (effect.unit == "Increase") {

                    effectEnemy +=
                        ((attrVal + defender.getBonusAttr(attr)) * nilaiBonus) / 100;
                } else {
                    effectEnemy -=
                        ((attrVal + defender.getBonusAttr(attr)) * nilaiBonus) / 100;
                }
            } else {
                if (effect.unit == "Increase") {
                    effectEnemy += nilaiBonus;
                } else {
                    effectEnemy -= nilaiBonus;
                }
            }
        }
        effectPlayerVals.push(effectPlayer);
        effectEnemyVals.push(effectEnemy);
        if (attr == "hp") {
            newAttacker.currentHP = attacker.currentHP + Math.round(effectPlayer);
            newDefender.currentHP = defender.currentHP + Math.round(effectEnemy);
        } else {
            
            if(newAttacker.getAttr(attr) <= 0){
                newAttacker.setAttr(attr, 0);
                newAttacker.setBonusAttr(attr, Math.max(0, attacker.getBonusAttr(attr) + Math.round(effectPlayer)));
            } else {
                newAttacker.setAttr(attr, Math.max(0, attacker.getAttr(attr) + Math.round(effectPlayer)));
            }

           
            if(newDefender.getAttr(attr) <= 0){
                newDefender.setAttr(attr, 0);
                newDefender.setBonusAttr(attr, Math.max(0, defender.getBonusAttr(attr) + Math.round(effectEnemy)));
            } else {
                newDefender.setAttr(attr, Math.max(0, defender.getAttr(attr) + Math.round(effectEnemy)));
            }
            
        }


    });


    return {
        attacker: attacker as Player,
        defender: defender as Player,
        newAttacker: newAttacker as Player,
        newDefender: newDefender as Player,
        effectPlayerVals: effectPlayerVals,
        effectEnemyVals: effectEnemyVals,
    };
}


function calculateEvasionChance(attackerSPD: number, defenderSPD: number): number {
    const evasionChance = Math.max(0, Math.min(0.1, (defenderSPD - attackerSPD) / 100)); // max 30% evasion
    return evasionChance;
}

function calculateDamage(attacker: Player, defender: Player): any {
   
    const defenderDamageReduction = (defender.defense+ defender.bonusAttributes.def) / ((defender.defense+defender.bonusAttributes.def) + 50); // Mengurangi damage berdasarkan DEF musuh

    // Penggunaan STR penyerang untuk meningkatkan damage
    let baseDamage = ((attacker.strength+attacker.bonusAttributes.atk) + (attacker.strength+attacker.bonusAttributes.str) * 0.3) * (1 - defenderDamageReduction);
    console.log("baseDamage",baseDamage);

    // Pengurangan tambahan oleh STR musuh
    const strengthReduction = (defender.strength+defender.bonusAttributes.str) * 0.1; // STR musuh mengurangi damage lebih lanjut
    if(strengthReduction > baseDamage){
        baseDamage = baseDamage - (strengthReduction/2);
    } else {
        baseDamage = baseDamage - strengthReduction;
    }

    baseDamage = Math.max(1, baseDamage);

    console.log("strengthReduction",baseDamage);

    // Menggunakan HP musuh sebagai faktor random untuk damage
    const randomFactor = 1 + (Math.random() * 0.1) * ((defender.hp+defender.bonusAttributes.hp) / 1000); // Random 0-10% tergantung HP musuh
    let totalDamage = baseDamage * randomFactor;
    console.log("randomFactor",totalDamage);

    totalDamage = Math.max(0, Math.round(totalDamage));


    const criticalHitChance = (attacker.strength + attacker.bonusAttributes.str) / ((attacker.strength + attacker.bonusAttributes.str) + (defender.speed + defender.bonusAttributes.spd));
    const isCriticalHit = Math.random() < criticalHitChance;

    if(isCriticalHit){
        totalDamage *= 2;
    }

    const evasionChance = calculateEvasionChance(attacker.speed+attacker.bonusAttributes.spd, defender.speed+defender.bonusAttributes.spd);
    const rnd = Math.random();
    console.log(rnd,evasionChance);
    const isDodge = rnd < evasionChance;
    if(isDodge){
        totalDamage = 0;
    }

    return {
        finalDamage: totalDamage,
        isCriticalHit: isCriticalHit,
        isDodge: isDodge,
    };
}

export const POST: RequestHandler = async (event): Promise<Response> => {
    const { attacker, defender, skill } = await event.request.json();
    const effectData = (skill && skill.currentCooldown == 0) ? getSkillEffect(Player.fromJson(JSON.stringify(attacker)), Player.fromJson(JSON.stringify(defender)), ItemSkill.fromJson(JSON.stringify(skill))) : getSkillEffect(Player.fromJson(JSON.stringify(attacker)), Player.fromJson(JSON.stringify(defender)));
    let damage = calculateDamage(effectData.newAttacker, effectData.newDefender);
    if (skill) {
        if (skill.doAttack) {
            effectData.newDefender.currentHP -= Math.round(damage.finalDamage);
            effectData.newDefender.currentHP = Math.max(0, effectData.newDefender.currentHP);
        } else {
            damage.finalDamage = 0;
            damage.isCriticalHit = false;
            damage.isDodge = false;
        }

    } else {
        effectData.newDefender.currentHP -= Math.round(damage.finalDamage);
        effectData.newDefender.currentHP = Math.max(0, effectData.newDefender.currentHP);
    }
    return json({
        attacker: effectData.newAttacker,
        defender: effectData.newDefender,
        damage: damage
    })



    // const defenderSpdRatio = effectData.newDefender.speed / effectData.newAttacker.speed;
    // let block_chance = 0;
    // if (defenderSpdRatio >= 1.5) {
    //     block_chance = 0.5;
    // } else if (defenderSpdRatio >= 1) {
    //     block_chance = 0.3;
    // } else {
    //     block_chance = 0.1;
    // }

    // const rnd = Math.random();
    // console.log(rnd);
    // if(rnd < block_chance){
    //     //random between (random + block chance, 1)
    //     damage = damage * (Math.random() * (1 - block_chance) + block_chance);
    // } else {
    //     damage = damage;
    // }

}