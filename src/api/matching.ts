import OpenAI from 'openai';
import { Rep, Gig, Match } from '../types';
import axios from 'axios';
import { compareSchedules } from '../utils/scheduleMatching';
import { Match, Availability } from '../types';

// Initialize OpenAI client with API key
const openai = new OpenAI({
  apiKey: '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',
  dangerouslyAllowBrowser: true
});

/**
 * Finds the best matches between a gig (job posting) and a list of reps (candidates)
 * using OpenAI's GPT-4 model to analyze compatibility.
 * 
 * @param gig - The job posting to match candidates against
 * @param reps - Array of candidate profiles to evaluate
 * @returns Promise<Match[]> - Array of matches with scores and reasoning
 */
export const findMatchesWithAI = async (gig: Gig, reps: Rep[]): Promise<Match[]> => {
  try {
    // Construct a detailed prompt for the AI model that includes all relevant information
    // about the job posting and candidate profiles
    const prompt = `
      Analyze the following job posting and candidate profiles to find the best matches.
      Consider skills, experience, availability, and other relevant factors.
      
      Job Posting:
      Title: ${gig.title}
      Category: ${gig.category}
      Description: ${gig.description}
      Required Experience: ${gig.seniority?.yearsExperience}
      Skills Required: ${JSON.stringify(gig.skills)}
      Schedule: ${JSON.stringify(gig.schedule)}
      
      Candidates:
      ${reps.map(rep => `
        Name: ${rep.personalInfo?.name}
        Current Role: ${rep.professionalSummary?.currentRole}
        Experience: ${rep.professionalSummary?.yearsOfExperience}
        Skills: ${JSON.stringify(rep.skills)}
        Languages: ${rep.personalInfo?.languages?.map(l => l.language).join(', ')}
        Availability: ${JSON.stringify(rep.availability)}
      `).join('\n')}
      
      Please analyze these profiles and return a JSON array of matches with scores between 0 and 1.
      Each match should include:
      - repName: The name of the matched rep (from the personalInfo.name field)
      - score: A number between 0 and 1 indicating match quality
      - reasoning: A brief explanation of why this is a good match
    `;

    // Call OpenAI's API to get the matching analysis
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4-turbo-preview",
      response_format: { type: "json_object" }
    });

    // Parse the AI response and transform it into the required Match format
    const content = completion.choices[0].message.content;
    if (!content) throw new Error('No content received from OpenAI');
    const response = JSON.parse(content);
    const matches = response.matches.map((match: any) => {
      // Trouver le rep correspondant dans la liste des reps
      const matchedRep = reps.find(r => r.personalInfo?.name === match.repName);
      if (!matchedRep) {
        console.warn(`Rep not found for name: ${match.repName}`);
        return null;
      }
      return {
        _id: Math.random().toString(36).substring(2, 9),
        repId: matchedRep._id, // Utiliser l'ID réel du rep
        gigId: gig._id,
        score: match.score,
        reasoning: match.reasoning
      };
    }).filter(Boolean); // Filtrer les matches null
    
    // Log detailed rep data for each match
    matches.forEach((match: { _id: string; repId: string; score: number; reasoning: string }) => {
      const rep = reps.find(r => r._id === match.repId);
      console.log(`=== DETAILED REP DATA FOR MATCH ${match._id} ===`);
      console.log('Match Score:', match.score);
      console.log('Reasoning:', match.reasoning);
      console.log('Rep Details:', JSON.stringify(rep, null, 2));
      
      // Fetch and log additional rep details from API
      getRepDetails(match.repId, reps)
        .then(detailedRep => {
          console.log('Additional Rep Details:', JSON.stringify(detailedRep, null, 2));
        })
        .catch(error => {
          console.error('Error fetching additional rep details:', error);
        });
      
      console.log('----------------------------------------');
    });

    console.log('=== MATCHES DATA ===', JSON.stringify(matches, null, 2));
    return matches;
  } catch (error) {
    console.error('Error in AI matching:', error);
    throw error;
  }
};

export const getRepDetails = async (repId: string, reps: Rep[]): Promise<any> => {
  try {
    // Return the rep from the local data instead of making an API call
    const localRep = reps.find(r => r._id === repId);
    if (localRep) {
      console.log('Using local rep data:', localRep);
      return localRep;
    }
    // If rep not found, return a minimal rep object instead of throwing
    console.warn(`Rep with ID ${repId} not found in local data`);
    return {
      _id: repId,
      personalInfo: { name: 'Unknown Rep' },
      professionalSummary: { yearsOfExperience: 'N/A' }
    };
  } catch (error) {
    console.error('Error getting rep details:', error);
    return {
      _id: repId,
      personalInfo: { name: 'Error loading rep' },
      professionalSummary: { yearsOfExperience: 'N/A' }
    };
  }
};

export const findMatchesForGigById = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id);
    if (!gig) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'Gig not found' });
    }

    console.log('Gig data:', {
      id: gig._id,
      title: gig.title,
      skills: gig.skills,
      languages: gig.skills?.languages,
      availability: gig.availability
    });

    // Get weights from request body or use defaults
    const weights = req.body.weights || { skills: 0.4, languages: 0.3, schedule: 0.3 };
    console.log('Using weights:', weights);

    console.log('Recherche des agents avec les critères suivants:', {
      'personalInfo.languages': { $exists: true, $ne: [] }
    });

    const agents = await Agent.find({})
      .select('personalInfo skills availability');

    console.log('Nombre total d\'agents trouvés:', agents.length);
    console.log('Liste complète des agents:', agents.map(agent => ({
      id: agent._id,
      name: agent.personalInfo?.name,
      languages: agent.personalInfo?.languages?.map(lang => ({
        language: lang.language,
        proficiency: lang.proficiency
      })),
      availability: agent.availability
    })));

    // Filtrer les agents qui ont des langues
    const agentsWithLanguages = agents.filter(agent => 
      agent.personalInfo?.languages && 
      agent.personalInfo.languages.length > 0
    );

    console.log('Nombre d\'agents avec des langues:', agentsWithLanguages.length);
    console.log('Agents avec des langues:', agentsWithLanguages.map(agent => ({
      id: agent._id,
      name: agent.personalInfo?.name,
      languages: agent.personalInfo?.languages?.map(lang => ({
        language: lang.language,
        proficiency: lang.proficiency
      }))
    })));

    const matches = agentsWithLanguages.map(agent => {
      console.log('Traitement de l\'agent:', {
        id: agent._id,
        name: agent.personalInfo?.name,
        languages: agent.personalInfo?.languages,
        availability: agent.availability
      });

      // Language matching
      const requiredLanguages = gig.skills?.languages || [];
      const agentLanguages = agent.personalInfo?.languages || [];
      
      console.log('Correspondance des langues pour', agent.personalInfo?.name, ':', {
        required: requiredLanguages,
        agent: agentLanguages
      });

      let matchingLanguages = [];
      let missingLanguages = [];
      let insufficientLanguages = [];

      requiredLanguages.forEach(reqLang => {
        if (!reqLang?.language) return;
        
        const normalizedReqLang = normalizeLanguage(reqLang.language);
        console.log('Recherche de correspondance pour la langue:', {
          required: reqLang.language,
          normalized: normalizedReqLang
        });

        const agentLang = agentLanguages.find(
          lang => lang?.language && normalizeLanguage(lang.language) === normalizedReqLang
        );

        if (agentLang) {
          console.log('Langue trouvée pour', agent.personalInfo?.name, ':', {
            language: agentLang.language,
            proficiency: agentLang.proficiency
          });
          const langScore = getLanguageLevelScore(agentLang.proficiency);
          const requiredScore = getLanguageLevelScore(reqLang.proficiency);
          
          console.log('Language score comparison:', {
            language: reqLang.language,
            agentProficiency: agentLang.proficiency,
            requiredProficiency: reqLang.proficiency,
            agentScore: langScore,
            requiredScore: requiredScore
          });

          if (langScore >= requiredScore) {
            matchingLanguages.push({
              language: reqLang.language,
              requiredLevel: reqLang.proficiency,
              agentLevel: agentLang.proficiency
            });
          } else {
            insufficientLanguages.push({
              language: reqLang.language,
              requiredLevel: reqLang.proficiency,
              agentLevel: agentLang.proficiency
            });
          }
        } else {
          missingLanguages.push(reqLang.language);
        }
      });

      // Skills matching
      const requiredSkills = [
        ...(gig.skills?.technical || []).map(s => ({ skill: s.skill, level: s.level, type: 'technical' })),
        ...(gig.skills?.professional || []).map(s => ({ skill: s.skill, level: s.level, type: 'professional' })),
        ...(gig.skills?.soft || []).map(s => ({ skill: s.skill, level: s.level, type: 'soft' }))
      ];

      const agentSkills = [
        ...(agent.skills?.technical || []).map(s => ({ skill: s.skill, level: s.level, type: 'technical' })),
        ...(agent.skills?.professional || []).map(s => ({ skill: s.skill, level: s.level, type: 'professional' })),
        ...(agent.skills?.soft || []).map(s => ({ skill: s.skill, level: s.level, type: 'soft' }))
      ];

      console.log('Skills matching:', {
        required: requiredSkills,
        agent: agentSkills
      });

      let matchingSkills = [];
      let missingSkills = [];
      let insufficientSkills = [];

      // Check if agent has all required skills
      const hasAllRequiredSkills = requiredSkills.every(reqSkill => {
        if (!reqSkill?.skill) return true;
        
        const normalizedReqSkill = reqSkill.skill.toLowerCase().trim();
        const agentSkill = agentSkills.find(
          skill => skill?.skill && skill.skill.toLowerCase().trim() === normalizedReqSkill && skill.type === reqSkill.type
        );

        if (agentSkill) {
          console.log('Skill level comparison:', {
            skill: reqSkill.skill,
            agentLevel: agentSkill.level,
            requiredLevel: reqSkill.level
          });

          if (agentSkill.level >= reqSkill.level) {
            matchingSkills.push({
              skill: reqSkill.skill,
              requiredLevel: reqSkill.level,
              agentLevel: agentSkill.level,
              type: reqSkill.type
            });
            return true;
          } else {
            insufficientSkills.push({
              skill: reqSkill.skill,
              requiredLevel: reqSkill.level,
              agentLevel: agentSkill.level,
              type: reqSkill.type
            });
            return false;
          }
        } else {
          missingSkills.push({
            skill: reqSkill.skill,
            type: reqSkill.type
          });
          return false;
        }
      });

      // Schedule matching using the new structure
      const scheduleMatch = compareSchedules(gig.availability, agent.availability);
      console.log('Schedule match result:', scheduleMatch);

      // Determine match status based on direct matches
      const languageMatchStatus = matchingLanguages.length === requiredLanguages.length ? "perfect_match" : 
                                 matchingLanguages.length > 0 ? "partial_match" : "no_match";
      
      // Skills match status is now based on having ALL required skills
      const skillsMatchStatus = hasAllRequiredSkills ? "perfect_match" : "no_match";

      console.log('Match statuses:', {
        language: languageMatchStatus,
        skills: skillsMatchStatus,
        schedule: scheduleMatch.status
      });

      // Overall match status is perfect only if all criteria are perfect
      const overallMatchStatus = (languageMatchStatus === "perfect_match" && 
                                skillsMatchStatus === "perfect_match" && 
                                scheduleMatch.status === "perfect_match") ? "perfect_match" :
                                (languageMatchStatus === "no_match" && 
                                 skillsMatchStatus === "no_match" && 
                                 scheduleMatch.status === "no_match") ? "no_match" :
                                "partial_match";

      return {
        agentId: agent._id,
        agentInfo: {
          name: agent.personalInfo.name,
          email: agent.personalInfo?.email || '',
          photo: agent.personalInfo?.photo || null,
          location: agent.personalInfo?.location || '',
          phone: agent.personalInfo?.phone || '',
          languages: agent.personalInfo?.languages || [],
          professionalSummary: agent.professionalSummary || {},
          skills: agent.skills || {},
          experience: agent.experience || []
        },
        languageMatch: {
          details: {
            matchingLanguages,
            missingLanguages,
            insufficientLanguages,
            matchStatus: languageMatchStatus
          }
        },
        skillsMatch: {
          details: {
            matchingSkills,
            missingSkills,
            insufficientSkills,
            matchStatus: skillsMatchStatus
          }
        },
        scheduleMatch: {
          score: scheduleMatch.score,
          details: scheduleMatch.details,
          matchStatus: scheduleMatch.status
        },
        matchStatus: overallMatchStatus
      };
    });

    // Sort matches by overall score
    matches.sort((a, b) => b.overallScore - a.overallScore);

    // Filter matches based on weights
    let filteredMatches = matches;
    console.log('Avant filtrage - Nombre total de matches:', matches.length);
    
    if (weights.skills > 0.5 && weights.languages < 0.5) {
      console.log('Filtrage priorité aux skills');
      filteredMatches = matches
        .filter(match => match.skillsMatch.details.matchStatus === "perfect_match" && 
                        match.languageMatch.details.matchStatus === "perfect_match" &&
                        match.scheduleMatch.matchStatus === "perfect_match");
    } else if (weights.skills < 0.5 && weights.languages > 0.5) {
      console.log('Filtrage priorité aux langues');
      filteredMatches = matches.filter(match => {
        console.log('Vérification match:', {
          agentId: match.agentId,
          languageStatus: match.languageMatch.details.matchStatus,
          scheduleStatus: match.scheduleMatch.matchStatus
        });
        return match.languageMatch.details.matchStatus === "perfect_match" &&
               match.scheduleMatch.matchStatus === "perfect_match";
      });
    }
    
    console.log('Après filtrage - Nombre de matches:', filteredMatches.length);
    console.log('Matches filtrés:', filteredMatches.map(match => ({
      agentId: match.agentId,
      name: match.agentInfo.name,
      languageStatus: match.languageMatch.details.matchStatus,
      scheduleStatus: match.scheduleMatch.matchStatus
    })));

    // Calculate language match statistics
    const languageStats = {
      perfectMatches: filteredMatches.filter(m => m.languageMatch.details.matchStatus === "perfect_match").length,
      partialMatches: filteredMatches.filter(m => m.languageMatch.details.matchStatus === "partial_match").length,
      noMatches: filteredMatches.filter(m => m.languageMatch.details.matchStatus === "no_match").length,
      totalMatches: filteredMatches.length
    };

    // Calculate skills match statistics
    const skillsStats = {
      perfectMatches: filteredMatches.filter(m => m.skillsMatch.details.matchStatus === "perfect_match").length,
      partialMatches: filteredMatches.filter(m => m.skillsMatch.details.matchStatus === "partial_match").length,
      noMatches: filteredMatches.filter(m => m.skillsMatch.details.matchStatus === "no_match").length,
      totalMatches: filteredMatches.length,
      byType: {
        technical: {
          perfectMatches: filteredMatches.filter(m => m.skillsMatch.details.matchingSkills.some(s => s.type === 'technical')).length,
          partialMatches: filteredMatches.filter(m => m.skillsMatch.details.matchingSkills.some(s => s.type === 'technical')).length,
          noMatches: filteredMatches.length - filteredMatches.filter(m => m.skillsMatch.details.matchingSkills.some(s => s.type === 'technical')).length
        },
        professional: {
          perfectMatches: filteredMatches.filter(m => m.skillsMatch.details.matchingSkills.some(s => s.type === 'professional')).length,
          partialMatches: filteredMatches.filter(m => m.skillsMatch.details.matchingSkills.some(s => s.type === 'professional')).length,
          noMatches: filteredMatches.length - filteredMatches.filter(m => m.skillsMatch.details.matchingSkills.some(s => s.type === 'professional')).length
        },
        soft: {
          perfectMatches: filteredMatches.filter(m => m.skillsMatch.details.matchingSkills.some(s => s.type === 'soft')).length,
          partialMatches: filteredMatches.filter(m => m.skillsMatch.details.matchingSkills.some(s => s.type === 'soft')).length,
          noMatches: filteredMatches.length - filteredMatches.filter(m => m.skillsMatch.details.matchingSkills.some(s => s.type === 'soft')).length
        }
      }
    };

    // Calculate schedule match statistics
    const scheduleStats = {
      perfectMatches: filteredMatches.filter(m => m.scheduleMatch.matchStatus === "perfect_match").length,
      partialMatches: filteredMatches.filter(m => m.scheduleMatch.matchStatus === "partial_match").length,
      noMatches: filteredMatches.filter(m => m.scheduleMatch.matchStatus === "no_match").length,
      totalMatches: filteredMatches.length
    };

    res.json({
      preferedmatches: filteredMatches,
      totalMatches: filteredMatches.length,
      perfectMatches: filteredMatches.filter(m => m.matchStatus === "perfect_match").length,
      partialMatches: filteredMatches.filter(m => m.matchStatus === "partial_match").length,
      noMatches: filteredMatches.filter(m => m.matchStatus === "no_match").length,
      languageStats,
      skillsStats,
      scheduleStats
    });
  } catch (error) {
    console.error("Error in findMatchesForGigById:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
}; 