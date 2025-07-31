import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export interface GigMatchingWeights {
  _id?: string;
  gigId: string;
  categoryWeights: {
    skills: number;
    activities: number;
    industries: number;
    languages: number;
    destination: number;
    seniority: number;
  };
  metadata?: {
    createdAt: Date;
    updatedAt: Date;
    description?: string;
  };
}

export interface GigWithWeights {
  gig: any;
  weights: {
    skills: number;
    activities: number;
    industries: number;
    languages: number;
    destination: number;
    seniority: number;
  };
}

// Get all gigs with their matching weights
export const getAllGigsWithWeights = async (): Promise<GigWithWeights[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/gig-matching-weights/all`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching gigs with weights:', error);
    throw error;
  }
};

// Get matching weights for a specific gig
export const getGigWeights = async (gigId: string): Promise<GigMatchingWeights> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/gig-matching-weights/${gigId}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching gig weights:', error);
    throw error;
  }
};

// Create or update matching weights for a gig
export const createOrUpdateGigWeights = async (
  gigId: string, 
  categoryWeights: Partial<GigMatchingWeights['categoryWeights']>
): Promise<GigMatchingWeights> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/gig-matching-weights/${gigId}`, {
      categoryWeights
    });
    return response.data.data;
  } catch (error) {
    console.error('Error creating/updating gig weights:', error);
    throw error;
  }
};

// Reset weights to defaults for a gig
export const resetGigWeights = async (gigId: string): Promise<GigMatchingWeights> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/gig-matching-weights/${gigId}/reset`);
    return response.data.data;
  } catch (error) {
    console.error('Error resetting gig weights:', error);
    throw error;
  }
};

// Delete matching weights for a gig
export const deleteGigWeights = async (gigId: string): Promise<void> => {
  try {
    await axios.delete(`${API_BASE_URL}/gig-matching-weights/${gigId}`);
  } catch (error) {
    console.error('Error deleting gig weights:', error);
    throw error;
  }
}; 