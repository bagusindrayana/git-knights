import 'dotenv/config'
import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.MONGO_URL);

async function connect() {
    await client.connect();
    const db = client.db(process.env.MONGO_DATABASE);
    return { client, db };
}

const { db } = await connect();
const collections = db.collection("players");
const players = await collections.find({}).toArray();