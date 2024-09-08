import { json, type RequestHandler } from "@sveltejs/kit";
import { getUsername } from "../../../lib/githubData";
import { connect,insertData,getPlayer } from "$lib/mongo";
import items from "../../../lib/data/item.json";
import { Item } from "$lib/models/player";




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


    const imageUrl = session?.user?.image;
    //get user id from imageUrl
    const userId = imageUrl
        ?.split("/")
    [imageUrl.split("/").length - 1].split("?")[0];
    
    const findPlayer = await getPlayer(userId!.toString());
    if(!sync || sync == "false"){
        

        if(findPlayer){
            let itemsData = findPlayer.items.map((item:any)=>{
                
                let itemData = item;
                const find = items.find((i:any)=>i.id===item.id);
                if(find){
                    itemData = Item.fromJson(JSON.stringify(find));
                    itemData.description = itemData.name + " : " +itemData.description;
                    itemData.name = item.name;
                    itemData.quantity = item.quantity;
                    itemData.color = item.color;

                }
                return itemData;
            });
            findPlayer.items = itemsData;
            return json({
                data:{
                    playerData:findPlayer
                }
            });
        }
    }
    
    const data = await getUsername(userId);
    if(findPlayer){
        // data.playerData.items = findPlayer.items;
        data.playerData.slots = findPlayer.slots;
        data.playerData.skillSlots = findPlayer.skillSlots;
    }
    insertData(data.playerData);
    return json({
        data: data,
        newUser : findPlayer ? false : true
    }, {
        status: 200
    });
}