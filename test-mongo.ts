import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('Error: MONGODB_URI is not defined in .env.local');
  process.exit(1);
}

const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    console.log('Successfully connected to MongoDB!');
    
    const db = client.db('campus_os');
    const collectionsToCreate = ['users', 'resumes', 'code_reviews', 'interviews', 'expenses', 'learning_progress'];
    
    // Check existing collections to avoid errors
    const existingCollections = await db.listCollections().toArray();
    const existingNames = existingCollections.map(c => c.name);
    
    for (const name of collectionsToCreate) {
      if (!existingNames.includes(name)) {
        await db.createCollection(name);
        console.log(`Created collection: ${name}`);
      } else {
        console.log(`Collection already exists: ${name}`);
      }
    }
    
    console.log('All required collections are ready.');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  } finally {
    await client.close();
  }
}

run();
