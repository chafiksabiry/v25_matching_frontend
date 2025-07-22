import axios from 'axios';

// Skills and Languages API calls
interface Skill {
  _id: string;
  name: string;
  description: string;
  category: string;
  isActive: boolean;
  __v: number;
  createdAt: string;
  updatedAt: string;
}

interface Language {
  _id: string;
  code: string;
  __v: number;
  createdAt: string;
  lastUpdated: string;
  name: string;
  nativeName: string;
  updatedAt: string;
}

interface SkillsResponse {
  success: boolean;
  data: Skill[];
  message: string;
}

interface LanguagesResponse {
  success: boolean;
  data: Language[];
  message: string;
}

export const getProfessionalSkills = async (): Promise<Skill[]> => {
  try {
    const REP_CREATION_API_URL = 'https://api-repcreationwizard.harx.ai/api';
    const response = await axios.get<SkillsResponse>(`${REP_CREATION_API_URL}/skills/professional`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching professional skills:', error);
    throw error;
  }
};

export const getTechnicalSkills = async (): Promise<Skill[]> => {
  try {
    const REP_CREATION_API_URL = 'https://api-repcreationwizard.harx.ai/api';
    const response = await axios.get<SkillsResponse>(`${REP_CREATION_API_URL}/skills/technical`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching technical skills:', error);
    throw error;
  }
};

export const getSoftSkills = async (): Promise<Skill[]> => {
  try {
    const REP_CREATION_API_URL = 'https://api-repcreationwizard.harx.ai/api';
    const response = await axios.get<SkillsResponse>(`${REP_CREATION_API_URL}/skills/soft`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching soft skills:', error);
    throw error;
  }
};

export const getAllSkills = async (): Promise<{
  professional: Skill[];
  technical: Skill[];
  soft: Skill[];
}> => {
  try {
    const [professional, technical, soft] = await Promise.all([
      getProfessionalSkills(),
      getTechnicalSkills(),
      getSoftSkills()
    ]);
    
    return {
      professional,
      technical,
      soft
    };
  } catch (error) {
    console.error('Error fetching all skills:', error);
    throw error;
  }
};

export const getLanguages = async (): Promise<Language[]> => {
  try {
    const REP_CREATION_API_URL = 'https://api-repcreationwizard.harx.ai/api';
    const response = await axios.get<LanguagesResponse>(`${REP_CREATION_API_URL}/languages`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching languages:', error);
    throw error;
  }
};

export type { Skill, Language }; 