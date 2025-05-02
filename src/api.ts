import { Rep, Gig, Match, MatchingWeights } from './types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://38.242.208.242:5011/api';

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

// Fonction pour trouver les matches pour un gig
export const findMatchesForGig = async (gigId: string, weights: MatchingWeights): Promise<{ matches: Match[] }> => {
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
    
    if (!data.matches || !Array.isArray(data.matches)) {
      throw new Error('Invalid response format: expected matches array');
    }
    
    return data;
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