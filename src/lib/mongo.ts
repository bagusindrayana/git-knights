import { MONGO_URL } from '$env/static/private';
import { MongoClient } from 'mongodb';
import type { Battle } from './models/battle';

const client = new MongoClient(MONGO_URL);

// connect to the database
export async function connect(): Promise<{ client: MongoClient, db: any }> {
    await client.connect();
    const db = client.db('git-knights');
    return { client, db };
}

export async function insertData(playerData: any) {
    //insert playerData to mongoDb
    const { db } = await connect();
    const collection = db.collection("players");
    //check if player already exist
    const findPlayer = await collection.findOne({ id: playerData.id });
    if (findPlayer) {
        await collection.updateOne({ id: playerData.id }, { $set: playerData });
    } else {
        await collection.insertOne(playerData);
    }

    return playerData;
}

export async function getPlayer(id: string) {
    const { db } = await connect();
    const collection = db.collection("players");
    const player = await collection.findOne({ id: id });
    return player;
}

//get players with paginate
export async function getPlayers(page: number, limit: number, xpFilter?: { min: number, max: number }) {
    const { db } = await connect();
    const collection = db.collection("players");
    const players = await collection.find((xpFilter)?{ exp: { $gte: xpFilter.min, $lte: xpFilter.max } }:{}).sort({ exp: -1 }).skip((page - 1) * limit).limit(limit).toArray();
        return players;
}

export async function insertBattleData(battaleData: Battle) {
    //insert playerData to mongoDb
    const { db } = await connect();
    const collection = db.collection("battles");
    //check if player already exist
    const findPlayer = await collection.findOne({ id: battaleData.id,timestamp:battaleData.timestamp });
    if (findPlayer) {
        await collection.updateOne({ id: battaleData.id,timestamp:battaleData.timestamp }, { $set: battaleData });
    } else {
        await collection.insertOne(battaleData);
    }
    return battaleData;
}

export async function getBattleData(id: string,status?:string) {
    const { db } = await connect();
    const collection = db.collection("battles");
    const battleData = await collection.findOne({ id: id,status:status });
    return battleData;
}