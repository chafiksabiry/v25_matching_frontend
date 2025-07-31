// Migration script to remove 'schedule' field from gig weights
// Run this script to clean up existing data and remove schedule field

import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/matching_system';

async function removeScheduleField() {
  try {
    console.log('🔧 Starting migration to remove "schedule" field from gig weights...');
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    const weightsCollection = mongoose.connection.collection('gigmatchingweights');
    
    // Find all documents that have a 'schedule' field in matchingWeights
    const documentsWithSchedule = await weightsCollection.find({
      'matchingWeights.schedule': { $exists: true }
    }).toArray();
    
    console.log(`📊 Found ${documentsWithSchedule.length} documents with 'schedule' field`);
    
    if (documentsWithSchedule.length > 0) {
      // Remove the 'schedule' field from all documents
      const result = await weightsCollection.updateMany(
        { 'matchingWeights.schedule': { $exists: true } },
        { $unset: { 'matchingWeights.schedule': 1 } }
      );
      
      console.log(`✅ Successfully removed 'schedule' field from ${result.modifiedCount} documents`);
    } else {
      console.log('ℹ️  No documents found with "schedule" field');
    }
    
    // Verify the migration
    const remainingScheduleDocs = await weightsCollection.find({
      'matchingWeights.schedule': { $exists: true }
    }).toArray();
    
    if (remainingScheduleDocs.length === 0) {
      console.log('✅ Migration completed successfully - no "schedule" fields remain');
    } else {
      console.log(`⚠️  Warning: ${remainingScheduleDocs.length} documents still have "schedule" field`);
    }
    
    console.log('🎉 Migration completed!');
    
  } catch (error) {
    console.error('❌ Error during migration:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the migration
removeScheduleField().catch(console.error); 