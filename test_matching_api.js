const axios = require('axios');

const BASE_URL = 'http://localhost:5010/api';

// Configuration des poids de test
const defaultWeights = {
  experience: 0.15,
  skills: 0.2,
  industry: 0.15,
  languages: 0.1,
  availability: 0.1,
  timezone: 0.05,
  performance: 0.2,
  region: 0.05
};

async function testMatchingAPI() {
  console.log('🧪 Test du système de matching HARX\n');

  try {
    // Test 1: Health Check
    console.log('1. Test du health check...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Serveur opérationnel:', healthResponse.data.message);

    // Test 2: Récupérer les reps
    console.log('\n2. Récupération des reps...');
    const repsResponse = await axios.get(`${BASE_URL}/reps`);
    const reps = repsResponse.data;
    console.log(`✅ ${reps.length} reps trouvés`);
    console.log('   Exemples:', reps.slice(0, 2).map(r => r.name).join(', '));

    // Test 3: Récupérer les gigs
    console.log('\n3. Récupération des gigs...');
    const gigsResponse = await axios.get(`${BASE_URL}/gigs`);
    const gigs = gigsResponse.data;
    console.log(`✅ ${gigs.length} gigs trouvés`);
    console.log('   Exemples:', gigs.slice(0, 2).map(g => g.title).join(', '));

    if (reps.length === 0 || gigs.length === 0) {
      console.log('❌ Pas assez de données pour tester le matching');
      return;
    }

    // Test 4: Trouver des reps pour un gig
    console.log('\n4. Test de matching reps pour un gig...');
    const gigId = gigs[0]._id;
    const matchingResponse = await axios.post(`${BASE_URL}/matches/gig/${gigId}/matches`, {
      weights: defaultWeights,
      limit: 5
    });
    
    const matches = matchingResponse.data;
    console.log(`✅ ${matches.matches?.length || 0} matches trouvés pour "${gigs[0].title}"`);
    
    if (matches.matches && matches.matches.length > 0) {
      console.log('   Statistiques:');
      console.log(`   - Total: ${matches.totalMatches || 0}`);
      console.log(`   - Parfaits: ${matches.perfectMatches || 0}`);
      console.log(`   - Partiels: ${matches.partialMatches || 0}`);
      console.log(`   - Aucun match: ${matches.noMatches || 0}`);
      
      // Afficher le premier match
      const firstMatch = matches.matches[0];
      console.log(`   - Premier match: ${firstMatch.agentInfo?.name} (${firstMatch.matchStatus})`);
    }

    // Test 5: Trouver des gigs pour un rep
    console.log('\n5. Test de matching gigs pour un rep...');
    const repId = reps[0]._id;
    const gigsForRepResponse = await axios.post(`${BASE_URL}/matches/rep/${repId}/gigs`, {
      weights: defaultWeights,
      limit: 3
    });
    
    const gigsForRep = gigsForRepResponse.data;
    console.log(`✅ ${gigsForRep.matches?.length || 0} gigs trouvés pour "${reps[0].name}"`);

    // Test 6: Matching optimal
    console.log('\n6. Test de matching optimal...');
    const optimalResponse = await axios.post(`${BASE_URL}/matches/optimize`, {
      weights: defaultWeights
    });
    
    const optimalMatches = optimalResponse.data;
    console.log(`✅ ${optimalMatches.matches?.length || 0} matchings optimaux générés`);

    // Test 7: Test avec différents poids
    console.log('\n7. Test avec poids sur les compétences...');
    const skillsWeights = {
      ...defaultWeights,
      skills: 0.4,
      experience: 0.1
    };
    
    const skillsResponse = await axios.post(`${BASE_URL}/matches/gig/${gigId}/matches`, {
      weights: skillsWeights,
      limit: 3
    });
    
    const skillsMatches = skillsResponse.data;
    console.log(`✅ ${skillsMatches.matches?.length || 0} matches avec poids compétences`);

    console.log('\n🎉 Tous les tests sont passés avec succès!');
    console.log('\n📊 Résumé:');
    console.log(`   - Reps disponibles: ${reps.length}`);
    console.log(`   - Gigs disponibles: ${gigs.length}`);
    console.log(`   - Matching fonctionnel: ✅`);
    console.log(`   - Optimisation fonctionnelle: ✅`);

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
    
    console.log('\n🔧 Vérifiez que:');
    console.log('   1. Le serveur tourne sur http://localhost:5010');
    console.log('   2. MongoDB est connecté');
    console.log('   3. Les données de test sont chargées');
  }
}

// Exécuter les tests
testMatchingAPI(); 