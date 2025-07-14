const axios = require('axios');

const API_BASE_URL = 'http://localhost:5011/api';

async function testMatchingAPI() {
  try {
    console.log('Testing Matching API...');
    
    // Test avec un gig ID spécifique
    const gigId = '686b89bf9b64bf944052bcb6'; // Remplacez par un vrai gig ID
    const weights = {
      experience: 0.15,
      skills: 0.2,
      industry: 0.15,
      languages: 0.1,
      availability: 0.1,
      timezone: 0.05,
      performance: 0.2,
      region: 0.05,
    };

    console.log('Calling API with:', { gigId, weights });
    
    const response = await axios.post(`${API_BASE_URL}/matches/gig/${gigId}`, {
      weights
    });

    console.log('API Response Status:', response.status);
    console.log('API Response Headers:', response.headers);
    console.log('API Response Data:', JSON.stringify(response.data, null, 2));
    
    if (response.data.preferedmatches) {
      console.log('✅ Preferedmatches found:', response.data.preferedmatches.length);
      console.log('First match:', response.data.preferedmatches[0]);
    } else {
      console.log('❌ No preferedmatches in response');
    }

  } catch (error) {
    console.error('Error testing API:', error.response?.data || error.message);
  }
}

testMatchingAPI(); 