// Migration script to add availability.schedule to existing gigs
// Run this script to update existing gigs with availability schedule

const { MongoClient } = require('mongodb');

async function addAvailabilitySchedule() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('harx_matching'); // Replace with your actual database name
    const gigsCollection = db.collection('gigs'); // Replace with your actual collection name

    // Find all gigs that don't have availability.schedule
    const gigsWithoutSchedule = await gigsCollection.find({
      $or: [
        { 'availability.schedule': { $exists: false } },
        { availability: { $exists: false } }
      ]
    }).toArray();

    console.log(`Found ${gigsWithoutSchedule.length} gigs without availability.schedule`);

    if (gigsWithoutSchedule.length > 0) {
      // Default availability schedule (Monday to Friday, 9 AM to 5 PM)
      const defaultSchedule = [
        {
          day: 'Monday',
          hours: { start: '09:00', end: '17:00' }
        },
        {
          day: 'Tuesday',
          hours: { start: '09:00', end: '17:00' }
        },
        {
          day: 'Wednesday',
          hours: { start: '09:00', end: '17:00' }
        },
        {
          day: 'Thursday',
          hours: { start: '09:00', end: '17:00' }
        },
        {
          day: 'Friday',
          hours: { start: '09:00', end: '17:00' }
        }
      ];

      // Update all gigs to add availability.schedule
      const result = await gigsCollection.updateMany(
        {
          $or: [
            { 'availability.schedule': { $exists: false } },
            { availability: { $exists: false } }
          ]
        },
        {
          $set: {
            availability: {
              schedule: defaultSchedule,
              timeZone: 'UTC',
              flexibility: ['flexible']
            }
          }
        }
      );

      console.log(`Updated ${result.modifiedCount} gigs with default availability schedule`);
      console.log('Successfully added availability.schedule to all gigs');
    } else {
      console.log('All gigs already have availability.schedule');
    }

    // Also update gig_matching_weights to ensure availability is included
    const weightsCollection = db.collection('gig_matching_weights');
    
    const weightsWithoutAvailability = await weightsCollection.find({
      'matchingWeights.availability': { $exists: false }
    }).toArray();

    console.log(`Found ${weightsWithoutAvailability.length} weight documents without availability`);

    if (weightsWithoutAvailability.length > 0) {
      const weightsResult = await weightsCollection.updateMany(
        { 'matchingWeights.availability': { $exists: false } },
        {
          $set: {
            'matchingWeights.availability': 0.1
          }
        }
      );

      console.log(`Updated ${weightsResult.modifiedCount} weight documents with availability`);
    }

  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

// Run the migration
addAvailabilitySchedule().catch(console.error); 