import { Battle } from "$lib/models/battle";
import { json, type RequestHandler } from "@sveltejs/kit";
import { myHistory, getPlayer } from "../../../lib/mongo";
import { page } from "$app/stores";

export const GET: RequestHandler = async (event): Promise<Response> => {
    const session = await event.locals.auth();
    const imageUrl = session?.user?.image;
    //get user id from imageUrl
    const userId = imageUrl
        ?.split("/")
    [imageUrl.split("/").length - 1].split("?")[0];

    if (!userId) {
        return json({
            data: [],
        },{
            status: 404
        });
    }
    

    const _page = Number(event.url.searchParams.get('page')) || 1;
    const _limit = Number(event.url.searchParams.get('limit')) || 5;
    const _q = event.url.searchParams.get('q');
    const datas = await myHistory(userId!,_page, _limit,_q);
    const battles: any[] = datas.map((data: any) => {
        const battle = Battle.fromJson(JSON.stringify(data));
        return {
            id: battle.id,
            attacker:{
                name: battle.attacker.playerName,
                id: battle.attacker.playerId,
                level: battle.attacker.playerLevel,
                stats: battle.attacker.originalStats,
            },
            defender : {
                name: battle.defender.playerName,
                id: battle.defender.playerId,
                level: battle.defender.playerLevel,
                stats: battle.defender.originalStats,
            },
            status: battle.status,
            score: battle.score,
            
        };
    });
    return json({
        data: battles,
    });
}