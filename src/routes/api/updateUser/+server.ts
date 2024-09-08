import { json, type RequestHandler } from "@sveltejs/kit";
import { getUsername } from "../../../lib/githubData";
import { insertData } from "../../../lib/mongo";

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

    insertData(data.playerData);

    return json(data,{
        status:200
    })
};