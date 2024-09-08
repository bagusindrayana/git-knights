import { json, type RequestHandler } from "@sveltejs/kit";
import { getProfil,getGithubData } from "../../../lib/githubData";
import { getPlayer } from "../../../lib/mongo";




//handle post request check session and get user data
export const POST: RequestHandler = async (event): Promise<Response> => {
    const {username,id} = await event.request.json();
  
    let userId = id;
    if(username != null && username != undefined){
        const user = await getProfil(username);

        if(!user){
            return json({
                data: {
                    error: "User not found",
                }
            }, {
                status: 404,
            });
        }
        
        userId = user.id;
    }

    const player = await getPlayer(userId.toString());
    
    if(!player){
        return json({
            data: {
                error: "Player not registered",
            }
        }, {
            status: 404,
        });
    }

    return json({
        data:{
            playerData: player
        }
    }, {
        status: 200
    });
}