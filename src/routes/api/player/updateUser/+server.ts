import { json, type RequestHandler } from "@sveltejs/kit";
import { getUsername } from "../../../../lib/githubData";
import { getPlayer, insertData } from "../../../../lib/mongo";
import tags from "../../../../lib/data/tag.json";
import { Player, Tag } from "$lib/models/player";
import { logger } from '$lib/stores/logger';

export const POST: RequestHandler = async (event): Promise<Response> => {
    const session = await event.locals.auth();
    if (!session) {
        return json({
            data: {
                error: "Unauthorized",
            }
        }, {
            status: 401,
        });
    }

    //slots

    try {
        const { slots, skillSlots } = await event.request.json();

        const imageUrl = session?.user?.image;
        //get user id from imageUrl
        const userId = imageUrl
            ?.split("/")
        [imageUrl.split("/").length - 1].split("?")[0];

        const data = await getPlayer(userId!);

        const player = Player.fromJson(JSON.stringify(data));

        player.slots = slots;
        player.skillSlots = skillSlots;
        let playerTags: Tag[] = [];
        for (let i = 0; i < tags.length; i++) {
            const tag = tags[i];
            let find = true;
            for (let x = 0; x < tag.requireItems.length; x++) {
                const item = tag.requireItems[x];
                let count = slots.filter((slot: string) => slot === item.id).length;
                if (find) {
                    find = count >= item.amount;
                } else {
                    break;
                }
            }

            if (find) {
                const findItem = player.getItem(tag.requireItems[0].id);
                playerTags.push(new Tag({
                    name: tag.name,
                    color: findItem ? findItem.color : ''
                }));
            }
        }
        player.tags = playerTags;


        await insertData(player);

        return json(player, {
            status: 200
        })
    } catch (error) {
        logger.error(error);
        return json({
            data: error,

        }, {
            status: 500
        });
    }
};