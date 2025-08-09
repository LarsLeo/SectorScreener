import { MongoClient, Db } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:password123@localhost:27017';
const DB_NAME = process.env.MONGODB_DB_NAME || 'sector_screener';

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
    if (cachedClient && cachedDb) {
        return { client: cachedClient, db: cachedDb };
    }

    const client = new MongoClient(MONGODB_URI);
    await client.connect();

    const db = client.db(DB_NAME);

    cachedClient = client;
    cachedDb = db;

    return { client, db };
}

export async function closeDatabaseConnection(): Promise<void> {
    if (cachedClient) {
        await cachedClient.close();
        cachedClient = null;
        cachedDb = null;
    }
}
