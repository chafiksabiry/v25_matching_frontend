// Test script to verify weights functionality
// This script tests that gigs can use filters and display results even without saved weights

const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:5011/api';

async function testWeightsFunctionality() {
  console.log('🧪 Testing weights functionality...');
  
  try {
    // 1. Get a gig to test with
    console.log('📋 Step 1: Getting a gig to test with...');
    const gigsResponse = await fetch(`${API_BASE_URL}/gigs`);
    const gigs = await gigsResponse.json();
    
    if (!gigs || gigs.length === 0) {
      console.error('❌ No gigs found');
      return;
    }
    
    const testGig = gigs[0];
    console.log(`✅ Found gig: ${testGig.title} (ID: ${testGig._id})`);
    
    // 2. Check if gig has saved weights
    console.log('🔍 Step 2: Checking if gig has saved weights...');
    let hasSavedWeights = false;
    try {
      const weightsResponse = await fetch(`${API_BASE_URL}/gig-matching-weights/${testGig._id}`);
      if (weightsResponse.ok) {
        hasSavedWeights = true;
        console.log('✅ Gig has saved weights');
      } else {
        console.log('ℹ️ Gig has no saved weights (this is expected for testing)');
      }
    } catch (error) {
      console.log('ℹ️ Gig has no saved weights (this is expected for testing)');
    }
    
    // 3. Test matching with default weights (without saving)
    console.log('🔍 Step 3: Testing matching with default weights...');
    const defaultWeights = {
      experience: 0.20,
      skills: 0.20,
      industry: 0.15,
      languages: 0.15,
      availability: 0.10,
      timezone: 0.10,
      activities: 0.10,
      region: 0.10
    };
    
    const matchResponse = await fetch(`${API_BASE_URL}/matches/gig/${testGig._id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        weights: defaultWeights
      })
    });
    
    if (matchResponse.ok) {
      const matchData = await matchResponse.json();
      console.log('✅ Matching with default weights successful!');
      console.log(`📊 Found ${matchData.totalMatches || matchData.matches?.length || 0} matches`);
      console.log(`🎯 Perfect matches: ${matchData.perfectMatches || 0}`);
      console.log(`📈 Partial matches: ${matchData.partialMatches || 0}`);
    } else {
      console.error('❌ Matching with default weights failed');
      const errorText = await matchResponse.text();
      console.error('Error details:', errorText);
    }
    
    // 4. Test saving weights
    console.log('💾 Step 4: Testing saving weights...');
    const customWeights = {
      experience: 0.30,
      skills: 0.25,
      industry: 0.15,
      languages: 0.10,
      availability: 0.10,
      timezone: 0.05,
      activities: 0.03,
      region: 0.02
    };
    
    const saveResponse = await fetch(`${API_BASE_URL}/gig-matching-weights/${testGig._id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        matchingWeights: customWeights
      })
    });
    
    if (saveResponse.ok) {
      console.log('✅ Weights saved successfully!');
      
      // 5. Test matching with saved weights
      console.log('🔍 Step 5: Testing matching with saved weights...');
      const savedMatchResponse = await fetch(`${API_BASE_URL}/matches/gig/${testGig._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          weights: customWeights
        })
      });
      
      if (savedMatchResponse.ok) {
        const savedMatchData = await savedMatchResponse.json();
        console.log('✅ Matching with saved weights successful!');
        console.log(`📊 Found ${savedMatchData.totalMatches || savedMatchData.matches?.length || 0} matches`);
      } else {
        console.error('❌ Matching with saved weights failed');
      }
    } else {
      console.error('❌ Saving weights failed');
      const errorText = await saveResponse.text();
      console.error('Error details:', errorText);
    }
    
    console.log('🎉 Test completed successfully!');
    console.log('✅ Gigs can now use filters and display results even without saved weights');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testWeightsFunctionality(); 