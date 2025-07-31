import { 
  GigCriteria, 
  GigCriteriaSearchRequest, 
  GigCriteriaSearchResult 
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class GigCriteriaApi {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${API_BASE_URL}/gig-criteria`;
  }

  // Créer des critères pour un gig
  async createGigCriteria(gigId: string, criteriaCodes: any, metadata?: any): Promise<GigCriteria> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gigId,
          criteriaCodes,
          metadata
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create gig criteria');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating gig criteria:', error);
      throw error;
    }
  }

  // Obtenir tous les critères
  async getAllGigCriteria(): Promise<GigCriteria[]> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch gig criteria');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching gig criteria:', error);
      throw error;
    }
  }

  // Obtenir les critères d'un gig spécifique
  async getGigCriteria(gigId: string): Promise<GigCriteria> {
    try {
      const response = await fetch(`${this.baseUrl}/${gigId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch gig criteria');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching gig criteria:', error);
      throw error;
    }
  }

  // Mettre à jour les critères d'un gig
  async updateGigCriteria(gigId: string, criteriaCodes: any, metadata?: any): Promise<GigCriteria> {
    try {
      const response = await fetch(`${this.baseUrl}/${gigId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          criteriaCodes,
          metadata
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update gig criteria');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating gig criteria:', error);
      throw error;
    }
  }

  // Supprimer les critères d'un gig
  async deleteGigCriteria(gigId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${gigId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete gig criteria');
      }
    } catch (error) {
      console.error('Error deleting gig criteria:', error);
      throw error;
    }
  }

  // Ajouter un critère spécifique à un gig
  async addCriteriaToGig(gigId: string, category: string, criteria: any): Promise<GigCriteria> {
    try {
      const response = await fetch(`${this.baseUrl}/${gigId}/add-criteria`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category,
          criteria
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add criteria to gig');
      }

      return await response.json();
    } catch (error) {
      console.error('Error adding criteria to gig:', error);
      throw error;
    }
  }

  // Supprimer un critère spécifique d'un gig
  async removeCriteriaFromGig(gigId: string, category: string, criteriaId: string): Promise<GigCriteria> {
    try {
      const response = await fetch(`${this.baseUrl}/${gigId}/remove-criteria`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category,
          criteriaId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to remove criteria from gig');
      }

      return await response.json();
    } catch (error) {
      console.error('Error removing criteria from gig:', error);
      throw error;
    }
  }

  // Obtenir tous les codes de critères d'un gig
  async getGigCriteriaCodes(gigId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/${gigId}/codes`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch gig criteria codes');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching gig criteria codes:', error);
      throw error;
    }
  }

  // Rechercher des gigs par critères
  async searchGigsByCriteria(searchRequest: GigCriteriaSearchRequest): Promise<GigCriteriaSearchResult[]> {
    try {
      const response = await fetch(`${this.baseUrl}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchRequest),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to search gigs by criteria');
      }

      return await response.json();
    } catch (error) {
      console.error('Error searching gigs by criteria:', error);
      throw error;
    }
  }

  // Méthode utilitaire pour convertir un gig en critères
  convertGigToCriteria(gig: any): any {
    const criteriaCodes = {
      professionalSkills: gig.skills?.professional?.map((skill: any) => ({
        skillCode: skill.skill,
        level: skill.level,
        weight: 1
      })) || [],
      technicalSkills: gig.skills?.technical?.map((skill: any) => ({
        skillCode: skill.skill,
        level: skill.level,
        weight: 1
      })) || [],
      softSkills: gig.skills?.soft?.map((skill: any) => ({
        skillCode: skill.skill,
        level: skill.level,
        weight: 1
      })) || [],
      languages: gig.skills?.languages?.map((lang: any) => ({
        languageCode: lang.language,
        proficiency: lang.proficiency,
        weight: 1
      })) || [],
      industries: gig.industries?.map((industry: string) => ({
        industryCode: industry,
        weight: 1
      })) || [],
      activities: gig.activities?.map((activity: string) => ({
        activityCode: activity,
        weight: 1
      })) || [],
      destinationCode: gig.destination_zone ? {
        destinationCode: gig.destination_zone,
        weight: 1
      } : null,
      seniorityCode: gig.seniority?.level ? {
        seniorityCode: gig.seniority.level,
        weight: 1
      } : null
    };

    return {
      gigId: gig._id,
      criteriaCodes,
      metadata: {
        version: '1.0',
        description: `Criteria generated from gig: ${gig.title}`
      }
    };
  }
}

export const gigCriteriaApi = new GigCriteriaApi();
export default gigCriteriaApi; 