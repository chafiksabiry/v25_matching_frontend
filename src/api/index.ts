import axios from 'axios';
import { Rep, Gig, Match, MatchingWeights } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5011/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Rep API calls
export const getReps = async (): Promise<Rep[]> => {
  const response = await api.get('/reps');
  return response.data;
};

export const getRepById = async (id: string): Promise<Rep> => {
  const response = await api.get(`/reps/${id}`);
  return response.data;
};

export const createRep = async (rep: Omit<Rep, '_id'>): Promise<Rep> => {
  const response = await api.post('/reps', rep);
  return response.data;
};

export const updateRep = async (id: string, rep: Partial<Rep>): Promise<Rep> => {
  const response = await api.put(`/reps/${id}`, rep);
  return response.data;
};

export const deleteRep = async (id: string): Promise<void> => {
  await api.delete(`/reps/${id}`);
};

// Gig API calls
export const getGigs = async (): Promise<Gig[]> => {
  const response = await api.get('/gigs');
  return response.data;
};

export const getGigsByCompanyId = async (companyId: string): Promise<Gig[]> => {
  const GIGS_API_URL = import.meta.env.VITE_API_URL_GIGS || 'https://api-gigsmanual.harx.ai/api';
  const response = await axios.get(`${GIGS_API_URL}/gigs/company/${companyId}`);
  return response.data;
};

export const getGigById = async (id: string): Promise<Gig> => {
  const response = await api.get(`/gigs/${id}`);
  return response.data;
};

export const createGig = async (gig: Omit<Gig, '_id'>): Promise<Gig> => {
  const response = await api.post('/gigs', gig);
  return response.data;
};

export const updateGig = async (id: string, gig: Partial<Gig>): Promise<Gig> => {
  const response = await api.put(`/gigs/${id}`, gig);
  return response.data;
};

export const deleteGig = async (id: string): Promise<void> => {
  await api.delete(`/gigs/${id}`);
};

// Match API calls
export const getMatches = async (): Promise<Match[]> => {
  const response = await api.get('/matches');
  return response.data;
};

export const getMatchById = async (id: string): Promise<Match> => {
  const response = await api.get(`/matches/${id}`);
  return response.data;
};

export const createMatch = async (match: Omit<Match, '_id'>): Promise<Match> => {
  const response = await api.post('/matches', match);
  return response.data;
};

export const updateMatch = async (id: string, match: Partial<Match>): Promise<Match> => {
  const response = await api.put(`/matches/${id}`, match);
  return response.data;
};

export const deleteMatch = async (id: string): Promise<void> => {
  await api.delete(`/matches/${id}`);
};

// New matching algorithm API calls using the provided endpoints
interface MatchResponse {
  matches: Match[];
  totalMatches?: number;
  perfectMatches?: number;
  partialMatches?: number;
  noMatches?: number;
  languageStats?: {
    perfectMatches: number;
    partialMatches: number;
    noMatches: number;
    totalMatches: number;
  };
  skillsStats?: {
    perfectMatches: number;
    partialMatches: number;
    noMatches: number;
    totalMatches: number;
    byType: {
      technical: { perfectMatches: number; partialMatches: number; noMatches: number };
      professional: { perfectMatches: number; partialMatches: number; noMatches: number };
      soft: { perfectMatches: number; partialMatches: number; noMatches: number };
    };
  };
}

// Find agents for a gig (using the new endpoint)
export const findMatchesForGig = async (gigId: string, weights: MatchingWeights): Promise<MatchResponse> => {
  try {
    const response = await api.post<MatchResponse>('/gigs/find-agents-for-gig', {
      gigId,
      weights
    });
    
    // Ensure the response has the expected structure
    const data = response.data;
    if (!data.matches) {
      console.warn('Response does not contain matches array:', data);
      return {
        matches: [],
        totalMatches: 0,
        perfectMatches: 0,
        partialMatches: 0,
        noMatches: 0
      };
    }
    
    return data;
  } catch (error) {
    console.error('Error finding matches for gig:', error);
    throw error;
  }
};

// Find gigs for an agent (using the new endpoint)
export const findGigsForRep = async (
  repId: string, 
  weights: MatchingWeights
): Promise<Match[]> => {
  try {
    const response = await api.post<MatchResponse>('/gigs/find-gigs-for-agent', {
      agentId: repId,
      weights
    });
    
    // Handle different response structures
    const data = response.data;
    if (Array.isArray(data)) {
      return data;
    } else if (data.matches && Array.isArray(data.matches)) {
      return data.matches;
    } else {
      console.warn('Unexpected response structure:', data);
      return [];
    }
  } catch (error) {
    console.error('Error finding gigs for rep:', error);
    throw error;
  }
};

// Generate optimal matches (this might need to be updated based on your backend)
export const generateOptimalMatches = async (weights: MatchingWeights): Promise<Match[]> => {
  try {
    // For now, we'll get all gigs and reps and do basic matching
    const [gigs, reps] = await Promise.all([getGigs(), getReps()]);
    
    // Simple matching logic - you might want to implement this differently
    const matches: Match[] = [];
    
    for (const gig of gigs) {
      for (const rep of reps) {
        // Basic matching score calculation
        let score = 0;
        
        // Skills matching
        if (weights.skills > 0) {
          const gigSkills = gig.skills?.professional || [];
          const repSkills = [
            ...(rep.skills?.technical || []),
            ...(rep.skills?.professional || []),
            ...(rep.skills?.soft || [])
          ];
          
          const matchingSkills = gigSkills.filter((gigSkill: any) => 
            repSkills.some((repSkill: any) => repSkill.skill === gigSkill.skill)
          );
          
          score += (matchingSkills.length / Math.max(gigSkills.length, 1)) * weights.skills;
        }
        
        // Experience matching
        if (weights.experience > 0) {
          const repExperience = parseInt(rep.professionalSummary?.yearsOfExperience || '0');
          const requiredExperience = gig.requiredExperience || 0;
          
          if (repExperience >= requiredExperience) {
            score += weights.experience;
          } else {
            score += (repExperience / requiredExperience) * weights.experience;
          }
        }
        
        // Language matching
        if (weights.languages > 0) {
          const gigLanguages = (gig as any).skills?.languages || [];
          const repLanguages = rep.personalInfo?.languages || [];
          
          const matchingLanguages = gigLanguages.filter((gigLang: any) => 
            repLanguages.some((repLang: any) => repLang.language === gigLang.language)
          );
          
          score += (matchingLanguages.length / Math.max(gigLanguages.length, 1)) * weights.languages;
        }
        
        if (score > 0.3) { // Only include matches with reasonable scores
          matches.push({
            _id: `${gig._id}-${rep._id}`,
            repId: rep._id || '',
            gigId: gig._id || '',
            score,
            title: gig.title,
            category: gig.category,
            requiredExperience: gig.requiredExperience,
            agentInfo: {
              name: rep.personalInfo?.name || '',
              email: rep.personalInfo?.email || ''
            }
          } as Match);
        }
      }
    }
    
    // Sort by score and return top matches
    return matches.sort((a, b) => b.score - a.score).slice(0, 10);
  } catch (error) {
    console.error('Error generating optimal matches:', error);
    throw error;
  }
};

// GigAgent API calls
export const createGigAgent = async (gigAgentData: {
  agentId: string;
  gigId: string;
  matchScore: number;
  matchDetails?: {
    languageMatch?: {
      score: number;
      details: {
        matchingLanguages: Array<{
          language: string;
          requiredLevel: string;
          agentLevel: string;
        }>;
        missingLanguages: string[];
        insufficientLanguages: Array<{
          language: string;
          requiredLevel: string;
          agentLevel: string;
        }>;
        matchStatus: 'perfect_match' | 'partial_match' | 'no_match';
      };
    };
    skillsMatch?: {
      details: {
        matchingSkills: Array<{
          skill: string;
          requiredLevel: number;
          agentLevel: number;
          type: string;
        }>;
        missingSkills: Array<{
          skill: string;
          type: string;
        }>;
        insufficientSkills: Array<{
          skill: string;
          requiredLevel: number;
          agentLevel: number;
          type: string;
        }>;
        matchStatus: 'perfect_match' | 'partial_match' | 'no_match';
      };
    };
    scheduleMatch?: {
      score: number;
      details: {
        matchingDays: Array<{
          day: string;
          gigHours: {
            start: string;
            end: string;
          };
          agentHours: {
            start: string;
            end: string;
          };
        }>;
        missingDays: string[];
        insufficientHours: Array<{
          day: string;
          gigHours: {
            start: string;
            end: string;
          };
          agentHours: {
            start: string;
            end: string;
          };
        }>;
      };
      matchStatus: 'perfect_match' | 'partial_match' | 'no_match';
    };
  };
}): Promise<{ message: string; gigAgent: any; emailSent: boolean; matchScore: number }> => {
  try {
    const response = await api.post('/gig-agents', gigAgentData);
    return response.data;
  } catch (error) {
    console.error('Error creating gig agent assignment:', error);
    throw error;
  }
};

export default api;