import { Rep, Gig, Match, MatchingWeights } from './types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5011/api';

// Fonction pour récupérer tous les reps
export const getReps = async (): Promise<Rep[]> => {
  console.log('getReps called');
  try {
    const response = await fetch(`${API_BASE_URL}/reps`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch reps');
    }

    const data = await response.json();
    console.log('Parsed getReps response:', data);
    
    if (!Array.isArray(data)) {
      throw new Error('Invalid response format: expected an array of reps');
    }
    
    return data;
  } catch (error) {
    console.error('Error in getReps:', error);
    throw error;
  }
};

// Fonction pour récupérer tous les gigs
export const getGigs = async (): Promise<Gig[]> => {
  console.log('getGigs called');
  try {
    const response = await fetch(`${API_BASE_URL}/gigs`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch gigs');
    }
    
    const data = await response.json();
    console.log('Parsed getGigs response:', data);
    
    if (!Array.isArray(data)) {
      throw new Error('Invalid response format: expected an array of gigs');
    }
    
    return data;
  } catch (error) {
    console.error('Error in getGigs:', error);
    throw error;
  }
};

export const getGigsByCompanyId = async (companyId: string): Promise<Gig[]> => {
  const response = await fetch(`${import.meta.env.VITE_API_URL_GIGS}/gigs/company/${companyId}`);
  const result = await response.json();
  return result.data;
};

// Fonction pour trouver les matches pour un gig
export const findMatchesForGig = async (gigId: string, weights: MatchingWeights): Promise<{
  skillsStats: { perfectMatches: number; partialMatches: number; noMatches: number; totalMatches: number; byType: { technical: { perfectMatches: number; partialMatches: number; noMatches: number; }; professional: { perfectMatches: number; partialMatches: number; noMatches: number; }; soft: { perfectMatches: number; partialMatches: number; noMatches: number; }; }; };
  languageStats: { perfectMatches: number; partialMatches: number; noMatches: number; totalMatches: number; };
  noMatches: number;
  partialMatches: number;
  perfectMatches: number;
  totalMatches: number;
  preferedmatches: never[]; matches: Match[] 
}> => {
  console.log('findMatchesForGig called with:', { gigId, weights });
  try {
    const response = await fetch(`${API_BASE_URL}/matches/gig/${gigId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ weights }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to find matches for gig');
    }
    
    const data = await response.json();
    console.log('Parsed API response:', data);
    
    if (!data.preferedmatches || !Array.isArray(data.preferedmatches)) {
      throw new Error('Invalid response format: expected preferedmatches array');
    }
    
    return { matches: data.preferedmatches };
  } catch (error) {
    console.error('Error in findMatchesForGig:', error);
    throw error;
  }
};

// Fonction pour trouver les gigs pour un rep
export const findGigsForRep = async (repId: string, weights: MatchingWeights): Promise<{ matches: Match[] }> => {
  console.log('findGigsForRep called with:', { repId, weights });
  try {
    const response = await fetch(`${API_BASE_URL}/matches/rep/${repId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ weights }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to find gigs for rep');
    }
    
    const data = await response.json();
    console.log('Parsed API response:', data);
    
    if (!data.matches || !Array.isArray(data.matches)) {
      throw new Error('Invalid response format: expected matches array');
    }
    
    return data;
  } catch (error) {
    console.error('Error in findGigsForRep:', error);
    throw error;
  }
};

// Fonction pour générer les matches optimaux
export const generateOptimalMatches = async (weights: MatchingWeights): Promise<{ matches: Match[] }> => {
  console.log('generateOptimalMatches called with weights:', weights);
  try {
    const response = await fetch(`${API_BASE_URL}/matches/optimize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ weights }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to generate optimal matches');
    }
    
    const data = await response.json();
    console.log('Parsed API response:', data);
    
    if (!data.matches || !Array.isArray(data.matches)) {
      throw new Error('Invalid response format: expected matches array');
    }
    
    return data;
  } catch (error) {
    console.error('Error in generateOptimalMatches:', error);
    throw error;
  }
};

// Gig-Agent API calls
interface GigAgentRequest {
  agentId: string;
  gigId: string;
}

interface GigAgentResponse {
  message: string;
  gigAgent: any;
  emailSent: boolean;
  matchScore: number;
}

export const createGigAgent = async (data: GigAgentRequest): Promise<GigAgentResponse> => {
  try {
    const MATCHING_API_URL = import.meta.env.VITE_MATCHING_API_URL || 'https://api-matching.harx.ai/api';
    const response = await fetch(`${MATCHING_API_URL}/gig-agents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create gig-agent assignment');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating gig-agent assignment:', error);
    throw error;
  }
}; 