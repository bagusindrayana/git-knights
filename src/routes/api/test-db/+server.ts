import { json } from "@sveltejs/kit";
import { connect } from "../../../lib/mongo";

export async function GET({ params }: { params: any }) {
    connect()
	.then((): void => {
		console.log('MongoDB started');
	})
	.catch((e) => {
		console.log('MongoDB failed to start');
		console.log(e);
	});
    return json({client:"TEST"});
}

