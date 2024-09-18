import { json, type RequestHandler } from "@sveltejs/kit";
import { getUsername } from "../../../../lib/githubData";
import { insertData } from "../../../../lib/mongo";
import tags from "../../../../lib/data/tag.json";
import { Tag } from "$lib/models/player";

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

    const {slots,skillSlots} = await event.request.json();

    const imageUrl = session?.user?.image;
    //get user id from imageUrl
    const userId = imageUrl
        ?.split("/")
    [imageUrl.split("/").length - 1].split("?")[0];
    const data = await getUsername(userId);
    data.playerData.slots = slots;
    data.playerData.skillSlots = skillSlots;
    let playerTags:Tag[] = [];
    for (let i = 0; i < tags.length; i++) {
        const tag = tags[i];
        let find = true;
        for (let x = 0; x < tag.requireItems.length; x++) {
            const item = tag.requireItems[x];
            let count = slots.filter((slot:string) => slot === item.id).length;
            if(find){
                find = count >= item.amount;
            } else {
                break;
            }
        }

        if(find){
            const findItem = data.playerData.getItem(tag.requireItems[0].id);
            playerTags.push(new Tag({
                name: tag.name,
                color: findItem ? findItem.color : ''
            }));
        }
    }
    data.playerData.tags = playerTags;

    insertData(data.playerData);

    return json(data,{
        status:200
    })
};