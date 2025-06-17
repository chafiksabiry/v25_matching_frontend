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
  const response = await fetch(`${import.meta.env.VITE_API_URL_GIGS}/gigs/company/${companyId}`);
  const result = await response.json();
  return result.data;
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

// Matching algorithm API calls
interface MatchResponse {
  preferedmatches: Match[];
  totalMatches: number;
  perfectMatches: number;
  partialMatches: number;
  noMatches: number;
  languageStats: {
    perfectMatches: number;
    partialMatches: number;
    noMatches: number;
    totalMatches: number;
  };
  skillsStats: {
    perfectMatches: number;
    partialMatches: number;
    noMatches: number;
    totalMatches: number;
    byType: {
      technical: {
        perfectMatches: number;
        partialMatches: number;
        noMatches: number;
      };
      professional: {
        perfectMatches: number;
        partialMatches: number;
        noMatches: number;
      };
      soft: {
        perfectMatches: number;
        partialMatches: number;
        noMatches: number;
      };
    };
  };
}

export const findMatchesForGig = async (gigId: string, weights: MatchingWeights): Promise<MatchResponse> => {
  try {
    const response = await axios.get<MatchResponse>(`${import.meta.env.VITE_API_URL}/gig/${gigId}`, {
      data: { weights }
    });
    return response.data;
  } catch (error) {
    console.error('Error finding matches for gig:', error);
    throw error;
  }
};

export const findGigsForRep = async (
  repId: string, 
  weights: MatchingWeights, 
  limit: number = 10
): Promise<Match[]> => {
  const response = await api.post(`/matches/rep/${repId}`, { weights, limit });
  return response.data;
};

export const generateOptimalMatches = async (weights: MatchingWeights): Promise<Match[]> => {
  const response = await api.post('/matches/optimize', { weights });
  return response.data;
};

export default api;