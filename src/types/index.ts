export interface Rep {
  _id?: string;
  userId: string;
  status: string;
  completionSteps: {
    basicInfo: boolean;
    experience: boolean;
    skills: boolean;
    languages: boolean;
    assessment: boolean;
  };
  availability: {
    days: string[];
    timeZones: string[];
    flexibility: string[];
    hours: {
      start: string;
      end: string;
    };
  };
  personalInfo: {
    name: string;
    location: string;
    email: string;
    phone: string;
    languages: Array<{
      language: string;
      proficiency: string;
      _id: string;
    }>;
  };
  professionalSummary: {
    yearsOfExperience: string;
    currentRole: string;
    industries: string[];
    keyExpertise: string[];
    notableCompanies: string[];
    profileDescription: string;
  };
  skills: {
    technical: Array<{
      skill: string;
      level: number;
      details: string;
      _id: string;
    }>;
    professional: Array<{
      skill: string;
      level: number;
      details: string;
      _id: string;
    }>;
    soft: Array<{
      skill: string;
      level: number;
      details: string;
      _id: string;
    }>;
    contactCenter: Array<{
      skill: string;
      level: number;
      details: string;
      _id: string;
    }>;
  };
  experience: Array<{
    title: string;
    company: string;
    startDate: string | Date;
    endDate: string | Date;
    responsibilities: string[];
    achievements: string[];
    _id: string;
  }>;
  achievements: string[];
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
}

export interface Gig {
  _id?: string;
  companyId: string;
  companyName: string;
  title: string;
  description: string;
  category: Industry;
  requiredSkills: Skill[];
  preferredLanguages: Language[];
  requiredExperience: number; // 1-10
  expectedConversionRate: number; // 0-1
  compensation: {
    base: number;
    commission: number;
  };
  duration: {
    startDate: string;
    endDate: string;
  };
  timezone: string;
  targetRegion: string;
  status?: 'open' | 'in-progress' | 'completed' | 'cancelled';
}

export interface Match {
  _id: string;
  score: number;
  // Propriétés pour les matches de type rep
  personalInfo?: {
    name: string;
    location: string;
    languages: Array<{
      language: string;
      proficiency?: string;
      _id?: string;
      assessmentResults?: {
        completeness?: {
          score: number;
          feedback: string;
        };
        fluency?: {
          score: number;
          feedback: string;
        };
        proficiency?: {
          score: number;
          feedback: string;
        };
        overall?: {
          score: number;
          strengths?: string;
          areasForImprovement?: string;
        };
        completedAt?: string;
      };
    }>;
  };
  professionalSummary?: {
    currentRole: string;
    yearsOfExperience: string;
    industries?: string[];
    keyExpertise?: string[];
  };
  // Propriétés pour les matches de type gig
  title?: string;
  category?: string;
  requiredExperience?: number;
  preferredLanguages?: string[];
  // Propriétés communes
  status?: 'pending' | 'accepted' | 'rejected' | 'completed';
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export type Skill = 
  | 'Cold Calling'
  | 'Lead Generation'
  | 'Sales Closing'
  | 'Customer Service'
  | 'Product Demonstration'
  | 'Negotiation'
  | 'Relationship Building'
  | 'Technical Support'
  | 'Market Research'
  | 'Social Media Marketing';

export type Industry = 
  | 'Technology'
  | 'Healthcare'
  | 'Finance'
  | 'Retail'
  | 'Manufacturing'
  | 'Education'
  | 'Real Estate'
  | 'Hospitality'
  | 'Automotive'
  | 'Entertainment';

export type Language = 
  | 'English'
  | 'Spanish'
  | 'French'
  | 'German'
  | 'Mandarin'
  | 'Japanese'
  | 'Portuguese'
  | 'Arabic'
  | 'Hindi'
  | 'Russian';

export interface Availability {
  day: string;
  startTime: string;
  endTime: string;
}

export interface MatchingWeights {
  experience: number;
  skills: number;
  industry: number;
  language: number;
  availability: number;
  timezone: number;
  performance: number;
  region: number;
}