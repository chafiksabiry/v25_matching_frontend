/// <reference types="vite/client" />

// Add type definitions for environment variables
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      VITE_API_URL?: string;
      VITE_API_URL_GIGS?: string;
      VITE_MATCHING_API_URL?: string;
    }
  }
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5011/api';
const GIGS_API_URL = import.meta.env.VITE_API_URL_GIGS || 'https://v25gigsmanualcreationbackend-production.up.railway.app/api';

// Reps
export const getReps = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/reps`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error in getReps:', error);
    throw error;
  }
};

// Gigs
export const getGigs = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/gigs`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error in getGigs:', error);
    throw error;
  }
};

// Get gigs by company ID
export const getGigsByCompanyId = async (companyId) => {
  try {
    const response = await fetch(`${GIGS_API_URL}/gigs/company/${companyId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error in getGigsByCompanyId:', error);
    throw error;
  }
};

// Matches
export const findMatchesForGig = async (gigId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/matches/gig/${gigId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    if (!data.preferedmatches || !Array.isArray(data.preferedmatches)) {
      throw new Error('Invalid response format: expected preferedmatches array');
    }
    return { matches: data.preferedmatches };
  } catch (error) {
    console.error('Error finding matches for gig:', error);
    throw error;
  }
};

export const findGigsForRep = async (repId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/matches/rep/${repId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error finding gigs for rep:', error);
    throw error;
  }
};

export const generateOptimalMatches = async (data) => {
  try {
    const response = await fetch(`${API_BASE_URL}/matches/optimize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error generating optimal matches:', error);
    throw error;
  }
};

// CRUD operations for matches
export const getAllMatches = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/matches`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error getting all matches:', error);
    throw error;
  }
};

export const createMatch = async (matchData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/matches`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(matchData)
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating match:', error);
    throw error;
  }
};

export const updateMatch = async (id, matchData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/matches/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(matchData)
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error updating match:', error);
    throw error;
  }
};

export const deleteMatch = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/matches/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error deleting match:', error);
    throw error;
  }
}; 