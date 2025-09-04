import { Match, MatchResponse, MatchingWeights } from '../types/index';
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
  matchDetails?: any;
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

/**
 * Récupère les gig-agents pour un gig spécifique
 */
export const getGigAgentsForGig = async (gigId: string): Promise<any[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/gig-agents/gig/${gigId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching gig agents:', error);
    throw error;
  }
};

/**
 * Récupère les agents invités pour une compagnie
 */
export const getInvitedAgentsForCompany = async (companyId: string): Promise<any[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/invited-agents/company/${companyId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching invited agents:', error);
    throw error;
  }
};

/**
 * Récupère les demandes d'inscription pour une compagnie
 */
export const getEnrollmentRequestsForCompany = async (companyId: string): Promise<any[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/enrollment-requests/company/${companyId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching enrollment requests:', error);
    throw error;
  }
};

/**
 * Récupère les agents actifs pour une compagnie
 */
export const getActiveAgentsForCompany = async (companyId: string): Promise<any[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/active-agents/company/${companyId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching active agents:', error);
    throw error;
  }
};

/**
 * Accepte une demande d'inscription
 */
export const acceptEnrollmentRequest = async (requestId: string, notes?: string): Promise<any> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/enrollment-requests/${requestId}/accept`, { notes });
    return response.data;
  } catch (error) {
    console.error('Error accepting enrollment request:', error);
    throw error;
  }
};

/**
 * Rejette une demande d'inscription
 */
export const rejectEnrollmentRequest = async (requestId: string, notes?: string): Promise<any> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/enrollment-requests/${requestId}/reject`, { notes });
    return response.data;
  } catch (error) {
    console.error('Error rejecting enrollment request:', error);
    throw error;
  }
};

// Types et interfaces
export interface Skill {
  _id: string;
  name: string;
  category: 'professional' | 'technical' | 'soft';
}

export interface Language {
  _id: string;
  code: string;
  name: string;
  nativeName: string;
}

export interface GigWeights {
  _id: string;
  gigId: string;
  matchingWeights: MatchingWeights;
  createdAt: string;
  updatedAt: string;
}

/**
 * Récupère tous les skills
 */
export const getAllSkills = async (): Promise<{ professional: Skill[]; technical: Skill[]; soft: Skill[]; }> => {
  try {
    // Mock data - replace with actual API call
    return {
      professional: [
        { _id: '1', name: 'Project Management', category: 'professional' },
        { _id: '2', name: 'Sales', category: 'professional' },
        { _id: '3', name: 'Marketing', category: 'professional' },
      ],
      technical: [
        { _id: '4', name: 'JavaScript', category: 'technical' },
        { _id: '5', name: 'Python', category: 'technical' },
        { _id: '6', name: 'React', category: 'technical' },
      ],
      soft: [
        { _id: '7', name: 'Communication', category: 'soft' },
        { _id: '8', name: 'Leadership', category: 'soft' },
        { _id: '9', name: 'Teamwork', category: 'soft' },
      ]
    };
  } catch (error) {
    console.error('Error fetching skills:', error);
    throw error;
  }
};

/**
 * Récupère toutes les langues
 */
export const getLanguages = async (): Promise<Language[]> => {
  try {
    // Mock data - replace with actual API call
    return [
      { _id: '1', code: 'en', name: 'English', nativeName: 'English' },
      { _id: '2', code: 'fr', name: 'French', nativeName: 'français' },
      { _id: '3', code: 'es', name: 'Spanish', nativeName: 'español' },
      { _id: '4', code: 'de', name: 'German', nativeName: 'Deutsch' },
      { _id: '5', code: 'ar', name: 'Arabic', nativeName: 'العربية' },
    ];
  } catch (error) {
    console.error('Error fetching languages:', error);
    throw error;
  }
};

/**
 * Sauvegarde les poids pour un gig
 */
export const saveGigWeights = async (gigId: string, weights: MatchingWeights): Promise<GigWeights> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/gig-weights`, {
      gigId,
      matchingWeights: weights
    });
    return response.data;
  } catch (error) {
    console.error('Error saving gig weights:', error);
    throw error;
  }
};

/**
 * Récupère les poids pour un gig
 */
export const getGigWeights = async (gigId: string): Promise<GigWeights> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/gig-weights/${gigId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting gig weights:', error);
    throw error;
  }
};

/**
 * Reset les poids pour un gig
 */
export const resetGigWeights = async (gigId: string): Promise<void> => {
  try {
    await axios.delete(`${API_BASE_URL}/gig-weights/${gigId}`);
  } catch (error) {
    console.error('Error resetting gig weights:', error);
    throw error;
  }
}; 