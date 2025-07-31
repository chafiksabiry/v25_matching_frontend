// Migration script to remove 'schedule' field from gig weights
// Run this script to clean up existing data

const { MongoClient } = require('mongodb');

async function removeScheduleField() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('harx_matching'); // Replace with your actual database name
    const collection = db.collection('gig_matching_weights'); // Replace with your actual collection name

    // Find all documents that have a 'schedule' field in matchingWeights
    const documentsWithSchedule = await collection.find({
      'matchingWeights.schedule': { $exists: true }
    }).toArray();

    console.log(`Found ${documentsWithSchedule.length} documents with 'schedule' field`);

    if (documentsWithSchedule.length > 0) {
      // Update all documents to remove the 'schedule' field
      const result = await collection.updateMany(
        { 'matchingWeights.schedule': { $exists: true } },
        { $unset: { 'matchingWeights.schedule': 1 } }
      );

      console.log(`Updated ${result.modifiedCount} documents`);
      console.log('Successfully removed "schedule" field from all gig weights');
    } else {
      console.log('No documents found with "schedule" field');
    }

  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

// Run the migration
removeScheduleField().catch(console.error); 