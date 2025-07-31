import { Match, MatchResponse, MatchingWeights } from '../types';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5011/api';

/**
 * Trouve les correspondances pour un gig spécifique
 * @param gigId - L'ID du gig
 * @param weights - Les poids de matching
 * @returns Promise<MatchResponse> - La réponse avec les matches et statistiques
 */
export const findMatchesForGig = async (gigId: string, weights: MatchingWeights): Promise<MatchResponse> => {
  try {
    console.log('Calling findMatchesForGig with:', { gigId, weights });
    
    const response = await axios.post(`${API_BASE_URL}/matches/gig/${gigId}`, {
      weights
    });

    console.log('API Response:', response.data);
    
    // Vérifier si la réponse a la structure attendue
    if (response.data.preferedmatches) {
      return response.data as MatchResponse;
    } else {
      // Fallback pour l'ancienne structure
      return {
        preferedmatches: response.data.matches || [],
        totalMatches: response.data.totalMatches || 0,
        perfectMatches: response.data.perfectMatches || 0,
        partialMatches: response.data.partialMatches || 0,
        noMatches: response.data.noMatches || 0,
        languageStats: response.data.languageStats || {
          perfectMatches: 0,
          partialMatches: 0,
          noMatches: 0,
          totalMatches: 0
        },
        skillsStats: response.data.skillsStats || {
          perfectMatches: 0,
          partialMatches: 0,
          noMatches: 0,
          totalMatches: 0,
          byType: {
            technical: { perfectMatches: 0, partialMatches: 0, noMatches: 0 },
            professional: { perfectMatches: 0, partialMatches: 0, noMatches: 0 },
            soft: { perfectMatches: 0, partialMatches: 0, noMatches: 0 }
          }
        },
        timezoneStats: response.data.timezoneStats || {
          perfectMatches: 0,
          partialMatches: 0,
          noMatches: 0,
          totalMatches: 0
        },
        regionStats: response.data.regionStats || {
          perfectMatches: 0,
          partialMatches: 0,
          noMatches: 0,
          totalMatches: 0
        },
        availabilityStats: response.data.availabilityStats || {
          perfectMatches: 0,
          partialMatches: 0,
          noMatches: 0,
          totalMatches: 0
        },

      };
    }
  } catch (error) {
    console.error('Error in findMatchesForGig:', error);
    throw error;
  }
};

/**
 * Trouve les gigs correspondants pour un agent spécifique
 * @param agentId - L'ID de l'agent
 * @param weights - Les poids de matching
 * @returns Promise<{ matches: Match[] }> - La réponse avec les matches
 */
export const findGigsForRep = async (agentId: string, weights: MatchingWeights): Promise<{ matches: Match[] }> => {
  try {
    console.log('Calling findGigsForRep with:', { agentId, weights });
    
    const response = await axios.post(`${API_BASE_URL}/matches/agent/${agentId}`, {
      weights
    });

    console.log('API Response:', response.data);
    
    return {
      matches: response.data.matches || []
    };
  } catch (error) {
    console.error('Error in findGigsForRep:', error);
    throw error;
  }
};

/**
 * Génère des correspondances optimales
 * @param weights - Les poids de matching
 * @returns Promise<{ matches: Match[] }> - La réponse avec les matches
 */
export const generateOptimalMatches = async (weights: MatchingWeights): Promise<{ matches: Match[] }> => {
  try {
    console.log('Calling generateOptimalMatches with:', { weights });
    
    const response = await axios.post(`${API_BASE_URL}/matches/optimal`, {
      weights
    });

    console.log('API Response:', response.data);
    
    return {
      matches: response.data.matches || []
    };
  } catch (error) {
    console.error('Error in generateOptimalMatches:', error);
    throw error;
  }
};

/**
 * Récupère tous les agents (reps)
 * @returns Promise<any[]> - Liste des agents
 */
export const getReps = async (): Promise<any[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/agents`);
    return response.data;
  } catch (error) {
    console.error('Error fetching reps:', error);
    throw error;
  }
};

/**
 * Récupère tous les gigs
 * @returns Promise<any[]> - Liste des gigs
 */
export const getGigs = async (): Promise<any[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/gigs`);
    return response.data;
  } catch (error) {
    console.error('Error fetching gigs:', error);
    throw error;
  }
};

/**
 * Récupère les gigs par ID de compagnie
 * @param companyId - L'ID de la compagnie
 * @returns Promise<any[]> - Liste des gigs
 */
export const getGigsByCompanyId = async (companyId: string): Promise<any[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/gigs/company/${companyId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching gigs by company:', error);
    throw error;
  }
};

/**
 * Crée une assignation gig-agent
 * @param data - Les données de l'assignation
 * @returns Promise<any> - La réponse de l'API
 */
export const createGigAgent = async (data: {
  agentId: string;
  gigId: string;
  matchDetails: any;
}): Promise<any> => {
  try {
    console.log('Creating gig-agent with data:', data);
    
    const response = await axios.post(`${API_BASE_URL}/gig-agents`, data);
    
    console.log('Gig-agent created successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating gig-agent:', error);
    throw error;
  }
}; 