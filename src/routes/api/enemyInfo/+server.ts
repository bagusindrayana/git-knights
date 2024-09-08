import { json, type RequestHandler } from "@sveltejs/kit";
import { getProfil,getGithubData } from "../../../lib/githubData";
import { getPlayer } from "../../../lib/mongo";




//handle post request check session and get user data
export const POST: RequestHandler = async (event): Promise<Response> => {
    const {username} = await event.request.json();
  
    
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

    const player = await getPlayer(user.id.toString());
    
    if(!player){
        return json({
            data: {
                error: "Player not registered",
            }
        }, {
            status: 404,
        });
    }


    // const data = await getGithubData(username);
    // data.playerData.id = user.id;
    // data.playerData.name = user.name;
    return json({
        data:{
            playerData: player
        }
    }, {
        status: 200
    });
}