import { MONGO_URL, MONGO_DATABASE } from '$env/static/private';
import { MongoClient } from 'mongodb';
import type { Battle } from './models/battle';

const client = new MongoClient(MONGO_URL);

// connect to the database
export async function connect(): Promise<{ client: MongoClient, db: any }> {
    await client.connect();
    const db = client.db(MONGO_DATABASE);
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
export async function getPlayers(page: number, limit: number, xpFilter?: { min: number, max: number }, q?: string | null) {
    const { db } = await connect();
    const collection = db.collection("players");
    collection.createIndex({ name: 'text', id: 'text' })
    if (q) {
        const players = await collection.find((xpFilter) ? { $text: { $search: q }, exp: { $gte: xpFilter.min, $lte: xpFilter.max } } : { $text: { $search: q } }).sort({ exp: -1 }).skip((page - 1) * limit).limit(limit).toArray();
        return players;
    } else {
        const players = await collection.find((xpFilter) ? { exp: { $gte: xpFilter.min, $lte: xpFilter.max } } : {}).sort({ exp: -1 }).skip((page - 1) * limit).limit(limit).toArray();
        return players;
    }

}

export async function insertBattleData(battaleData: Battle) {
    //insert playerData to mongoDb
    const { db } = await connect();
    const collection = db.collection("battles");
    //check if player already exist
    const findPlayer = await collection.findOne({ id: battaleData.id, timestamp: battaleData.timestamp });
    if (findPlayer) {
        await collection.updateOne({ id: battaleData.id, timestamp: battaleData.timestamp }, { $set: battaleData });
    } else {
        await collection.insertOne(battaleData);
    }
    return battaleData;
}

export async function getBattleData(id: string, status?: string) {
    const { db } = await connect();
    const collection = db.collection("battles");
    const battleData = await collection.findOne({ id: id, status: status });
    return battleData;
}

export async function countBattleToday(playerId: String, enemyId: string) {
    const { db } = await connect();
    const collection = db.collection("battles");
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);  // Set to 00:00:00.000
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);  // Set to 23:59:59.999

    const count = await collection.countDocuments({
        "attacker.playerId": playerId,
        "defender.playerId": enemyId,
        timestamp: {
            $gte: startOfToday.getTime(),
            $lt: endOfToday.getTime()
        },
        status: { $nin: ["pending"] }
    });
    return count;
}

export async function myHistory(id: string, page: number, limit: number, q?: string | null) {
    const { db } = await connect();
    const collection = db.collection("battles");
    collection.createIndex({ "defender.playerId": 'text', "defender.playerName": 'text' })
    if (q) {
        const battleData = await collection.find({ $text: { $search: q }, "attacker.playerId": id, status: { $nin: ["pending"] } }).skip((page - 1) * limit).sort({ timestamp: -1 }).limit(limit).toArray();
        return battleData;
    } else {
        const battleData = await collection.find({ "attacker.playerId": id, status: { $nin: ["pending"] } }).skip((page - 1) * limit).sort({ timestamp: -1 }).limit(limit).toArray();
        return battleData;
    }
}

export async function getTopPlayers(page: number, limit: number, q?: string | null) {
    const { db } = await connect();
    const collection = db.collection("players");
    collection.createIndex({ name: 'text', id: 'text' })
    if (q) {
        const players = await collection.find({ $text: { $search: q } }).sort({ score: -1 }).skip((page - 1) * limit).limit(limit).toArray();
        return players;
    } else {
        const players = await collection.find({}).sort({ score: -1 }).skip((page - 1) * limit).limit(limit).toArray();
        return players;
    }

}