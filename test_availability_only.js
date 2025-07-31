// Test script to verify that only availability is used and schedule is completely removed
// Run this script to test the availability-only implementation

import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/matching_system';

async function testAvailabilityOnly() {
  try {
    console.log('🧪 Testing availability-only implementation...');
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    const weightsCollection = mongoose.connection.collection('gigmatchingweights');
    const gigsCollection = mongoose.connection.collection('gigs');
    
    // Check if any weights still have schedule field
    const weightsWithSchedule = await weightsCollection.find({
      'matchingWeights.schedule': { $exists: true }
    }).toArray();
    
    if (weightsWithSchedule.length > 0) {
      console.log(`❌ Found ${weightsWithSchedule.length} weight documents still containing 'schedule' field`);
      console.log('These documents need to be updated:');
      weightsWithSchedule.forEach(doc => {
        console.log(`  - Gig ID: ${doc.gigId}, Schedule weight: ${doc.matchingWeights.schedule}`);
      });
    } else {
      console.log('✅ No weight documents contain "schedule" field');
    }
    
    // Check if gigs have proper availability structure
    const gigsWithAvailability = await gigsCollection.find({
      'availability.schedule': { $exists: true }
    }).toArray();
    
    console.log(`📊 Found ${gigsWithAvailability.length} gigs with availability.schedule`);
    
    if (gigsWithAvailability.length > 0) {
      console.log('✅ Sample gig availability structure:');
      const sampleGig = gigsWithAvailability[0];
      console.log(`  - Gig ID: ${sampleGig._id}`);
      console.log(`  - Schedule days: ${sampleGig.availability.schedule.length}`);
      if (sampleGig.availability.schedule.length > 0) {
        const firstDay = sampleGig.availability.schedule[0];
        console.log(`  - First day: ${firstDay.day} (${firstDay.hours.start}-${firstDay.hours.end})`);
      }
    }
    
    // Check if any gigs still have schedule field
    const gigsWithSchedule = await gigsCollection.find({
      'schedule': { $exists: true }
    }).toArray();
    
    if (gigsWithSchedule.length > 0) {
      console.log(`⚠️  Found ${gigsWithSchedule.length} gigs still containing 'schedule' field`);
      console.log('These should be migrated to use availability instead');
    } else {
      console.log('✅ No gigs contain legacy "schedule" field');
    }
    
    console.log('🎉 Availability-only test completed!');
    
  } catch (error) {
    console.error('❌ Error during test:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the test
testAvailabilityOnly().catch(console.error); 