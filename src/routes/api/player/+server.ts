import { json, type RequestHandler } from "@sveltejs/kit";
import { getUsername } from "../../../lib/githubData";
import { connect, insertData, getPlayer } from "$lib/mongo";
import items from "../../../lib/data/item.json";
import { Item } from "$lib/models/player";
import tags from "../../../lib/data/tag.json";
import { Tag } from "$lib/models/player";
import { logger } from '$lib/stores/logger';




//handle post request check session and get user data
export const POST: RequestHandler = async (event): Promise<Response> => {
    //get "sync"
    const sync = await event.url.searchParams.get("sync");
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
    try {
        const imageUrl = session?.user?.image;
        //get user id from imageUrl
        const userId = imageUrl
            ?.split("/")
        [imageUrl.split("/").length - 1].split("?")[0];

        const findPlayer = await getPlayer(userId!.toString());
        if (!sync || sync == "false") {


            if (findPlayer) {
                let itemsData = findPlayer.items.map((item: any) => {

                    let itemData = item;
                    const find = items.find((i: any) => i.id === item.id);
                    if (find) {
                        itemData = Item.fromJson(JSON.stringify(find));
                        itemData.description = itemData.name + " : " + itemData.description;
                        itemData.name = item.name;
                        itemData.quantity = item.quantity;
                        itemData.color = item.color;

                    }
                    return itemData;
                });
                findPlayer.items = itemsData;
                return json({
                    data: {
                        playerData: findPlayer
                    }
                });
            }
        }

        const data = await getUsername(userId);
        if (findPlayer) {
            // data.playerData.items = findPlayer.items;
            data.playerData.slots = findPlayer.slots;
            data.playerData.skillSlots = findPlayer.skillSlots;
            data.playerData.characterColor = findPlayer.characterColor;
        }
        let playerTags: Tag[] = [];
        for (let i = 0; i < tags.length; i++) {
            const tag = tags[i];
            let find = true;
            for (let x = 0; x < tag.requireItems.length; x++) {
                const item = tag.requireItems[x];
                let count = data.playerData.slots.filter((slot: string | null) => slot === item.id).length;
                if (find) {
                    find = count >= item.amount;
                } else {
                    break;
                }
            }

            if (find) {
                const findItem = data.playerData.getItem(tag.requireItems[0].id);
                playerTags.push(new Tag({
                    name: tag.name,
                    color: findItem ? findItem.color : ''
                }));
            }
        }
        data.playerData.tags = playerTags;
        await insertData(data.playerData);
        return json({
            data: data,
            newUser: findPlayer ? false : true
        }, {
            status: 200
        });
    } catch (error) {
        logger.error(error);
        return json({
            data: error,

        }, {
            status: 500
        });
    }
}