// Verification script to check availability.schedule setup
// Run this script to verify that everything is configured correctly

const { MongoClient } = require('mongodb');

async function verifyAvailabilitySetup() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('harx_matching'); // Replace with your actual database name
    
    console.log('\n=== VERIFICATION REPORT ===\n');

    // 1. Check gigs collection
    const gigsCollection = db.collection('gigs');
    const totalGigs = await gigsCollection.countDocuments();
    const gigsWithSchedule = await gigsCollection.countDocuments({
      'availability.schedule': { $exists: true }
    });
    const gigsWithoutSchedule = await gigsCollection.countDocuments({
      $or: [
        { 'availability.schedule': { $exists: false } },
        { availability: { $exists: false } }
      ]
    });

    console.log('📊 GIGS COLLECTION:');
    console.log(`   Total gigs: ${totalGigs}`);
    console.log(`   Gigs with availability.schedule: ${gigsWithSchedule}`);
    console.log(`   Gigs without availability.schedule: ${gigsWithoutSchedule}`);
    console.log(`   ✅ Coverage: ${((gigsWithSchedule / totalGigs) * 100).toFixed(1)}%`);

    // 2. Check gig_matching_weights collection
    const weightsCollection = db.collection('gig_matching_weights');
    const totalWeights = await weightsCollection.countDocuments();
    const weightsWithAvailability = await weightsCollection.countDocuments({
      'matchingWeights.availability': { $exists: true }
    });
    const weightsWithoutAvailability = await weightsCollection.countDocuments({
      'matchingWeights.availability': { $exists: false }
    });

    console.log('\n📊 GIG MATCHING WEIGHTS:');
    console.log(`   Total weight documents: ${totalWeights}`);
    console.log(`   Weights with availability: ${weightsWithAvailability}`);
    console.log(`   Weights without availability: ${weightsWithoutAvailability}`);
    console.log(`   ✅ Coverage: ${((weightsWithAvailability / totalWeights) * 100).toFixed(1)}%`);

    // 3. Sample data verification
    console.log('\n📋 SAMPLE DATA VERIFICATION:');
    
    // Sample gig with availability
    const sampleGig = await gigsCollection.findOne({
      'availability.schedule': { $exists: true }
    });
    
    if (sampleGig) {
      console.log('   ✅ Sample gig with availability.schedule found:');
      console.log(`      Gig ID: ${sampleGig._id}`);
      console.log(`      Title: ${sampleGig.title}`);
      console.log(`      Schedule days: ${sampleGig.availability.schedule.length}`);
      console.log(`      First day: ${sampleGig.availability.schedule[0]?.day} (${sampleGig.availability.schedule[0]?.hours.start}-${sampleGig.availability.schedule[0]?.hours.end})`);
    } else {
      console.log('   ❌ No gigs with availability.schedule found');
    }

    // Sample weights with availability
    const sampleWeights = await weightsCollection.findOne({
      'matchingWeights.availability': { $exists: true }
    });
    
    if (sampleWeights) {
      console.log('   ✅ Sample weights with availability found:');
      console.log(`      Gig ID: ${sampleWeights.gigId}`);
      console.log(`      Availability weight: ${sampleWeights.matchingWeights.availability}`);
    } else {
      console.log('   ❌ No weights with availability found');
    }

    // 4. Summary
    console.log('\n📈 SUMMARY:');
    const gigsCoverage = totalGigs > 0 ? (gigsWithSchedule / totalGigs) * 100 : 0;
    const weightsCoverage = totalWeights > 0 ? (weightsWithAvailability / totalWeights) * 100 : 0;
    
    if (gigsCoverage >= 90 && weightsCoverage >= 90) {
      console.log('   🎉 EXCELLENT: Availability setup is properly configured!');
    } else if (gigsCoverage >= 70 && weightsCoverage >= 70) {
      console.log('   ✅ GOOD: Availability setup is mostly configured');
    } else {
      console.log('   ⚠️  ATTENTION: Some data needs to be updated');
    }

    console.log(`   Gigs coverage: ${gigsCoverage.toFixed(1)}%`);
    console.log(`   Weights coverage: ${weightsCoverage.toFixed(1)}%`);

    // 5. Recommendations
    console.log('\n💡 RECOMMENDATIONS:');
    if (gigsWithoutSchedule > 0) {
      console.log(`   - Run migration script to add availability.schedule to ${gigsWithoutSchedule} gigs`);
    }
    if (weightsWithoutAvailability > 0) {
      console.log(`   - Run migration script to add availability to ${weightsWithoutAvailability} weight documents`);
    }
    if (gigsCoverage >= 90 && weightsCoverage >= 90) {
      console.log('   - All data is properly configured!');
    }

  } catch (error) {
    console.error('Error during verification:', error);
  } finally {
    await client.close();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run the verification
verifyAvailabilitySetup().catch(console.error); 