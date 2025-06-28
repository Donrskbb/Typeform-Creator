import { MongoClient } from 'mongodb';

let client = null;
let db = null;

async function connectToMongoDB() {
  if (!client) {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MongoDB URI not configured');
    }

    client = new MongoClient(uri);
    await client.connect();
    db = client.db(process.env.MONGODB_DATABASE || 'typeform-creator');
    console.log('📊 Connected to MongoDB');
  }
  return db;
}

export async function submitToMongoDB(formData) {
  const database = await connectToMongoDB();
  const collection = database.collection('submissions');
  
  const submission = {
    ...formData,
    submittedAt: new Date(),
    ip: null, // Could be added from request
    userAgent: null // Could be added from request
  };

  const result = await collection.insertOne(submission);
  return result;
}

export async function getSubmissions(limit = 100) {
  const database = await connectToMongoDB();
  const collection = database.collection('submissions');
  
  const submissions = await collection
    .find({})
    .sort({ submittedAt: -1 })
    .limit(limit)
    .toArray();
    
  return submissions;
}