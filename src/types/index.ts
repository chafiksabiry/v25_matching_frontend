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

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export interface TimeSlot {
  start: string; // HH:MM format in 24-hour
  end: string; // HH:MM format in 24-hour
}

export interface DaySchedule {
  day: DayOfWeek;
  hours: TimeSlot;
}

export interface Availability {
  schedule: DaySchedule[];
  timeZone: string;
  flexibility: string[];
}

export interface Match {
  _id: string;
  repId: string;
  gigId: string;
  score: number;
  title?: string;
  category?: string;
  requiredExperience?: number;
  requiredSkills?: string[];
  
  // Basic agent information
  agentInfo?: {
    name: string;
    email: string;
    photo?: string | null;
    location?: string;
    phone?: string;
    languages?: Array<{
      language: string;
      proficiency?: string;
    }>;
    skills?: {
      technical?: Array<{ skill: string; level?: number }>;
      professional?: Array<{ skill: string; level?: number }>;
      soft?: Array<{ skill: string; level?: number }>;
      contactCenter?: Array<{ skill: string; level?: number }>;
    };
    experience?: Array<{
      title: string;
      company: string;
      startDate: string | Date;
      endDate: string | Date;
    }>;
  };
  
  // Detailed matching information (optional)
  languageMatch?: {
    details: {
      matchStatus: 'perfect_match' | 'partial_match' | 'no_match';
      matchingLanguages: Array<{
        language: string;
        status: 'perfect_match' | 'partial_match' | 'no_match';
        requiredLevel?: string;
        agentLevel?: string;
      }>;
      missingLanguages?: Array<{
        language: string;
        requiredLevel?: string;
      }>;
      insufficientLanguages?: Array<{
        language: string;
        requiredLevel?: string;
        agentLevel?: string;
      }>;
    };
  };
  
  skillsMatch?: {
    details: {
      matchStatus: 'perfect_match' | 'partial_match' | 'no_match';
      matchingSkills: Array<{
        skill: string;
        status: 'perfect_match' | 'partial_match' | 'no_match';
        requiredLevel?: number;
        agentLevel?: number;
      }>;
      missingSkills?: Array<{
        skill: string;
        requiredLevel?: number;
      }>;
      insufficientSkills?: Array<{
        skill: string;
        requiredLevel?: number;
        agentLevel?: number;
      }>;
    };
  };
  
  availability?: Availability;
  
  // Additional properties that might be returned by the new API
  matchStatus?: string;
  agentId?: string;
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