import { Player } from "$lib/models/player";
import { json, type RequestHandler } from "@sveltejs/kit";
import {  getTopPlayers } from "../../../lib/mongo";

export const GET: RequestHandler = async (event): Promise<Response> => {
    const session = await event.locals.auth();
    const imageUrl = session?.user?.image;

    const _page = Number(event.url.searchParams.get('page')) || 1;
    const _limit = Number(event.url.searchParams.get('limit')) || 10;
    const _q = event.url.searchParams.get('q');
    const datas = await getTopPlayers(_page, _limit,_q);
    const players: any[] = datas.map((data: any) => {
        const player = Player.fromJson(JSON.stringify(data));
        player.applyEquipedEffect();
        return {
            id: data.id,
            name: data.name,
            level: player.currentLevel(),
            atk: player.attack,
            def: player.defense,
            hp: player.hp,
            exp: player.exp,
            str: player.strength,
            spd: player.speed,
            bonus: player.bonusAttributes,
            score: player.score,
            tags: player.tags
        };
    });
    return json({
        data: players,
    });
}