import { json, type RequestHandler } from "@sveltejs/kit";
import { insertData, getPlayer } from "../../../../lib/mongo";
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

    try {
        //slots

        const { characterColor } = await event.request.json();

        const imageUrl = session?.user?.image;
        //get user id from imageUrl
        const userId = imageUrl
            ?.split("/")
        [imageUrl.split("/").length - 1].split("?")[0];
        const data = await getPlayer(userId!);

        data.characterColor = characterColor;
        await insertData(data);

        return json({
            "message": "Ok"
        }, {
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