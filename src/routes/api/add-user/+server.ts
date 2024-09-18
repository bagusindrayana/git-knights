import tags from "../../../lib/data/tag.json";
import { json, type RequestHandler } from "@sveltejs/kit";
import { insertData } from "../../../lib/mongo";
import { getGithubData, getUsername } from "$lib/githubData";
import { Tag } from "$lib/models/player";
import skills from "../../../lib/data/skill.json";

export const GET: RequestHandler = async (event): Promise<Response> => {
    const username = await event.url.searchParams.get("id");
    const data = await getGithubData(username!);
    data.playerData.applyEquipedEffect();
    data.playerData.equipRandomItems();
    data.playerData.equipRandomSkills(skills);
    let playerTags:Tag[] = [];
    for (let i = 0; i < tags.length; i++) {
        const tag = tags[i];
        let find = true;
        for (let x = 0; x < tag.requireItems.length; x++) {
            const item = tag.requireItems[x];
            let count = data.playerData.slots.filter((slot:string|null) => slot === item.id).length;
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
    return json({
        data: data,
    }, {
        status: 200
    });
}