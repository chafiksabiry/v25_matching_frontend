const axios = require('axios');

const API_URL = 'http://localhost:5011/api';

// Test data from the user
const testData = {
  agentId: "680b63026204b8b9ba9f13ea",
  gigId: "685c0110614ab3e834e5174b"
};

async function testGigAgentEndpoint() {
  console.log('🧪 Testing GigAgent creation endpoint...\n');

  try {
    // Test GigAgent creation
    console.log('1️⃣ Testing POST /gig-agents endpoint...');
    const gigAgentData = {
      agentId: testData.agentId,
      gigId: testData.gigId,
      matchScore: 0.75,
      matchDetails: {
        languageMatch: {
          score: 0.5,
          details: {
            matchingLanguages: [
              {
                language: "English",
                requiredLevel: "B2",
                agentLevel: "B1"
              }
            ],
            missingLanguages: ["French"],
            insufficientLanguages: [],
            matchStatus: "partial_match"
          }
        },
        skillsMatch: {
          details: {
            matchingSkills: [
              {
                skill: "Communication",
                requiredLevel: 5,
                agentLevel: 4,
                type: "soft"
              }
            ],
            missingSkills: [
              {
                skill: "Intercom",
                type: "technical"
              }
            ],
            insufficientSkills: [],
            matchStatus: "partial_match"
          }
        }
      }
    };

    const response = await axios.post(`${API_URL}/gig-agents`, gigAgentData);
    console.log('✅ Success! GigAgent created:');
    console.log('   Message:', response.data.message);
    console.log('   GigAgent ID:', response.data.gigAgent._id);
    console.log('   Email Sent:', response.data.emailSent);
    console.log('   Match Score:', response.data.matchScore);
    console.log('   Status:', response.data.gigAgent.status);
    console.log('');

    console.log('🎉 GigAgent creation test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

// Run the test
testGigAgentEndpoint(); 