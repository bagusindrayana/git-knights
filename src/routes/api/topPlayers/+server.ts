import { Player } from "$lib/models/player";
import { json, type RequestHandler } from "@sveltejs/kit";
import { getPlayers, getPlayer } from "../../../lib/mongo";
import { page } from "$app/stores";

export const GET: RequestHandler = async (event): Promise<Response> => {
    const session = await event.locals.auth();
    const imageUrl = session?.user?.image;
    //get user id from imageUrl
    const userId = imageUrl
        ?.split("/")
    [imageUrl.split("/").length - 1].split("?")[0];
    const jsonPlayer = await getPlayer(userId!);
    const player = Player.fromJson(JSON.stringify(jsonPlayer));

    let baseXP = 1000;
    let level = player.currentLevel();

    let xpFilter:any = null;

    if(event.url.searchParams.get('recomended') == "true"){
        xpFilter = {
            min: player.exp - baseXP * level * (1 + (level-5) / 1000),
            max: player.exp + baseXP * level * (1 + (level-5) / 1000),
        };
    }

    const _page = Number(event.url.searchParams.get('page')) || 1;
    const _limit = Number(event.url.searchParams.get('limit')) || 10;
    const _q = event.url.searchParams.get('q');
    const datas = await getPlayers(_page, _limit,xpFilter,_q);
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
            bonus: player.bonusAttributes
        };
    });
    return json({
        data: players,
    });
}