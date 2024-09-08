import { Battle, Attacker, Defender } from "$lib/models/battle";
import { Item, ItemSkill, Player } from "$lib/models/player";
import { getPlayer, insertBattleData, getBattleData } from "$lib/mongo";
import { json, type RequestHandler } from "@sveltejs/kit";
import skills from "$lib/data/skill.json";

export const POST: RequestHandler = async (event): Promise<Response> => {
    const { attackerId, defenderId } = await event.request.json();

    const attackerJson = await getPlayer(attackerId.toString());
    const defenderJson = await getPlayer(defenderId.toString());
    const attackerPlayer: Player = Player.fromJson(JSON.stringify(attackerJson));
    attackerPlayer.applyEquipedEffect();
    const defenderPlayer: Player = Player.fromJson(JSON.stringify(defenderJson));
    defenderPlayer.applyEquipedEffect();

    const attackerEquipedItems:Item[] = attackerPlayer.getEquipedItems();
    const defenderEquipedItems:Item[] = defenderPlayer.getEquipedItems();

    const attackerEquipedSkills:ItemSkill[] = attackerPlayer.getEquipedSkills(skills);
    const defenderEquipedSkills:ItemSkill[] = defenderPlayer.getEquipedSkills(skills);
    


    const attacker = new Attacker({
        playerId: attackerPlayer.id!,
        hp: attackerPlayer.hp+attackerPlayer.bonusAttributes.hp,
        attack: attackerPlayer.attack+attackerPlayer.bonusAttributes.atk,
        defense: attackerPlayer.defense+attackerPlayer.bonusAttributes.def,
        speed: attackerPlayer.speed+attackerPlayer.bonusAttributes.spd,
        strength: attackerPlayer.strength+attackerPlayer.bonusAttributes.str,
        currentHp: attackerPlayer.hp+attackerPlayer.bonusAttributes.hp,
        originalStats: {
            hp: attackerPlayer.hp,
            attack: attackerPlayer.attack,
            defense: attackerPlayer.defense,
            speed: attackerPlayer.speed,
            strength: attackerPlayer.strength
        },
        exp: attackerPlayer.exp,
        items: attackerEquipedItems,
        skills: attackerEquipedSkills
    });

    const defender = new Defender({
        playerId: defenderPlayer.id!,
        hp: defenderPlayer.hp+defenderPlayer.bonusAttributes.hp,
        attack: defenderPlayer.attack+defenderPlayer.bonusAttributes.atk,
        defense: defenderPlayer.defense+defenderPlayer.bonusAttributes.def,
        speed: defenderPlayer.speed+defenderPlayer.bonusAttributes.spd,
        strength: defenderPlayer.strength+defenderPlayer.bonusAttributes.str,
        currentHp: defenderPlayer.hp+defenderPlayer.bonusAttributes.hp,
        originalStats: {
            hp: defenderPlayer.hp,
            attack: defenderPlayer.attack,
            defense: defenderPlayer.defense,
            speed: defenderPlayer.speed,
            strength: defenderPlayer.strength
        },
        exp: defenderPlayer.exp,
        items: defenderEquipedItems,
        skills: defenderEquipedSkills
    });



    const battleId = `${attackerId}-${defenderId}`;
    let battleData = await getBattleData(battleId,"pending");
   
    if (!battleData) {
        const newBattleData = new Battle({ id: battleId, attacker: attacker, defender: defender, battleLog: [] });
        await insertBattleData(newBattleData)
        battleData = newBattleData;
    } else {
        battleData = Battle.fromJson(JSON.stringify(battleData));
    }

    return json({
        data: battleData
    });


}