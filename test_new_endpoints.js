const axios = require('axios');

const API_URL = 'http://localhost:5011/api';

// Test data from the user
const testData = {
  agentId: "680b63026204b8b9ba9f13ea",
  gigId: "685c0110614ab3e834e5174b"
};

const weights = {
  experience: 0.15,
  skills: 0.2,
  industry: 0.15,
  language: 0.1,
  availability: 0.1,
  timezone: 0.05,
  performance: 0.2,
  region: 0.05,
};

async function testEndpoints() {
  console.log('🧪 Testing new matching endpoints...\n');

  try {
    // Test 1: Find agents for a gig
    console.log('1️⃣ Testing find-agents-for-gig endpoint...');
    const agentsResponse = await axios.post(`${API_URL}/gigs/find-agents-for-gig`, {
      gigId: testData.gigId,
      weights
    });
    console.log('✅ Success! Found agents for gig:');
    console.log('   Response structure:', Object.keys(agentsResponse.data));
    console.log('   Number of matches:', agentsResponse.data.matches?.length || 0);
    if (agentsResponse.data.matches && agentsResponse.data.matches.length > 0) {
      console.log('   First match structure:', Object.keys(agentsResponse.data.matches[0]));
    }
    console.log('');

    // Test 2: Find gigs for an agent
    console.log('2️⃣ Testing find-gigs-for-agent endpoint...');
    const gigsResponse = await axios.post(`${API_URL}/gigs/find-gigs-for-agent`, {
      agentId: testData.agentId,
      weights
    });
    console.log('✅ Success! Found gigs for agent:');
    console.log('   Response structure:', Object.keys(gigsResponse.data));
    console.log('   Number of matches:', gigsResponse.data.matches?.length || 0);
    if (gigsResponse.data.matches && gigsResponse.data.matches.length > 0) {
      console.log('   First match structure:', Object.keys(gigsResponse.data.matches[0]));
    }
    console.log('');

    // Test 3: Get all gigs
    console.log('3️⃣ Testing get-gigs endpoint...');
    const allGigsResponse = await axios.get(`${API_URL}/gigs`);
    console.log('✅ Success! Retrieved all gigs:');
    console.log('   Number of gigs:', allGigsResponse.data.length);
    if (allGigsResponse.data.length > 0) {
      console.log('   First gig structure:', Object.keys(allGigsResponse.data[0]));
    }
    console.log('');

    console.log('🎉 All tests completed successfully!');
    console.log('\n📝 Summary:');
    console.log(`   - Find agents for gig: ${agentsResponse.data.matches?.length || 0} matches`);
    console.log(`   - Find gigs for agent: ${gigsResponse.data.matches?.length || 0} matches`);
    console.log(`   - Total gigs available: ${allGigsResponse.data.length}`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

// Run the tests
testEndpoints(); 