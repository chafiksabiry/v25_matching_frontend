import OpenAI from 'openai';
import { Rep, Gig, Match } from '../types';

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
      - repId: The ID of the matched rep
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
    const response = JSON.parse(completion.choices[0].message.content);
    return response.matches.map((match: any) => ({
      _id: Math.random().toString(36).substr(2, 9), // Generate a unique ID for each match
      repId: match.repId,
      gigId: gig._id,
      score: match.score,
      reasoning: match.reasoning
    }));
  } catch (error) {
    console.error('Error in AI matching:', error);
    throw error;
  }
}; 