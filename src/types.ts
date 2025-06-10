import { ReactNode } from "react";

export interface Rep {
  _id: string;
  userId: string;
  status: 'in_progress' | 'completed' | string;
  completionSteps: {
    basicInfo: boolean;
    experience: boolean;
    skills: boolean;
    languages: boolean;
    assessment: boolean;
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
      assessmentResults?: {
        completeness: {
          score: number;
          feedback: string;
        };
        fluency: {
          score: number;
          feedback: string;
        };
        proficiency: {
          score: number;
          feedback: string;
        };
        overall: {
          score: number;
          strengths: string;
          areasForImprovement: string;
        };
        completedAt: string;
      };
    }>;
  };
  professionalSummary: {
    yearsOfExperience: string;
    currentRole: string;
    industries: string[];
    keyExpertise: string[];
    notableCompanies: string[];
  };
  skills: {
    technical: Array<{
      skill: string;
      level: number;
      details?: string;
      _id: string;
    }>;
    professional: Array<{
      skill: string;
      level: number;
      details?: string;
      _id: string;
    }>;
    soft: Array<{
      skill: string;
      level: number;
      details?: string;
      _id: string;
    }>;
  };
  achievements: Array<{
    description: string;
    impact: string;
    context: string;
    skills: string[];
    _id: string;
  }>;
  experience: Array<{
    title: string;
    company: string;
    startDate: string;
    endDate: string;
    responsibilities: string[];
    achievements: string[];
    _id: string;
  }>;
  assessments: {
    contactCenter: Array<{
      category: string;
      skill: string;
      score: number;
      strengths: string[];
      improvements: string[];
      feedback: string;
      tips: string[];
      keyMetrics: {
        professionalism: number;
        effectiveness: number;
        customerFocus: number;
      };
      completedAt: string;
      _id: string;
    }>;
  };
  availability: {
    days: string[];
    hours: string;
    timezone: string;
    flexibility: string[];
  };
  lastUpdated: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface Gig {
  _id: string;
  title: string;
  companyName: string;
  companyId: string;
  seniority: {
    level: string;
    yearsExperience: string;
  };
  category: string;
  description: string;
  requiredExperience?: number;
  expectedConversionRate?: number;
  targetRegion?: string;
  skills: {
    professional: string[];
    technical: string[];
    soft: string[];
    languages: Array<{
      name: string;
      level?: string;
    }>;
  };
  schedule: {
    minimumHours: {
      daily?: number;
      weekly?: number;
      monthly?: number;
    };
    days: string[];
    hours: string;
    timeZones: string[];
    flexibility: string[];
  };
  
}

export interface MatchingWeights {
  experience: number;  // Score d'expérience (0-100)
  skills: number;      // Score de compétences (0-100)
  industry: number;    // Score d'industrie (0-100)
  language: number;    // Score de langue (0-100)
  availability: number; // Score de disponibilité (0-100)
  timezone: number;    // Score de fuseau horaire (0-100)
  performance: number; // Score de performance (0-100)
  region: number;      // Score de région (0-100)
}

export interface Match {
  _id: string;
  repId: string;
  gigId: string;
  title: string;
  description: string;
  category: string;
  seniority: {
    level: string;
    yearsExperience: string;
  };
  skills: {
    professional: string[];
    technical: string[];
    soft: string[];
    languages: Array<{
      name: string;
      level?: string;
    }>;
  };
  schedule: {
    minimumHours: {
      daily?: number;
      weekly?: number;
      monthly?: number;
    };
    days: string[];
    hours: string;
    timeZones: string[];
    flexibility: string[];
  };
  commission: {
    minimumVolume: {
      amount: string;
      period: string;
      unit: string;
    };
    transactionCommission?: {
      type: string;
      amount: string;
    };
    base: string;
    baseAmount: string;
    bonus?: string;
    bonusAmount?: string;
    structure?: string;
    currency: string;
  };
  leads: {
    types: Array<{
      type: string;
      percentage: number;
      description: string;
      conversionRate: number;
      _id: string;
    }>;
    sources: string[];
  };
  team: {
    size: string;
    structure: Array<{
      seniority: {
        level: string;
        yearsExperience: string;
      };
      roleId: string;
      count: number;
      _id: string;
    }>;
    territories: string[];
  };
  documentation: {
    product: Array<{
      name: string;
      url: string;
      _id: string;
    }>;
    process: Array<{
      name: string;
      url: string;
      _id: string;
    }>;
    training: Array<{
      name: string;
      url: string;
      _id: string;
    }>;
  };
  createdAt: string;
  updatedAt: string;
  __v: number;
  score: number;
}

// ... rest of the types ... 