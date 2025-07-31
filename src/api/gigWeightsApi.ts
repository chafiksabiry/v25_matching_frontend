import axios from 'axios';
import { MatchingWeights } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5011/api';

export interface GigWeights {
  _id?: string;
  gigId: string;
  matchingWeights: MatchingWeights;
}

// Save matching weights for a gig
export const saveGigWeights = async (gigId: string, matchingWeights: MatchingWeights): Promise<GigWeights> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/gig-matching-weights/${gigId}`, {
      matchingWeights
    });
    return response.data.data;
  } catch (error) {
    console.error('Error saving gig weights:', error);
    throw error;
  }
};

// Get matching weights for a gig
export const getGigWeights = async (gigId: string): Promise<GigWeights> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/gig-matching-weights/${gigId}`);
    return response.data.data;
  } catch (error) {
    console.error('Error getting gig weights:', error);
    throw error;
  }
};

// Reset weights to defaults for a gig
export const resetGigWeights = async (gigId: string): Promise<GigWeights> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/gig-matching-weights/${gigId}/reset`);
    return response.data.data;
  } catch (error) {
    console.error('Error resetting gig weights:', error);
    throw error;
  }
}; 