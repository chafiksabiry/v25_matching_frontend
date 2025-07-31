import React, { useState } from 'react';
import { GigCriteriaSearchRequest, GigCriteriaSearchResult } from '../types';
import gigCriteriaApi from '../api/gigCriteriaApi';

interface GigCriteriaSearchProps {
  onSearchResults?: (results: GigCriteriaSearchResult[]) => void;
  onError?: (error: string) => void;
}

const GigCriteriaSearch: React.FC<GigCriteriaSearchProps> = ({
  onSearchResults,
  onError
}) => {
  const [loading, setLoading] = useState(false);
  const [searchCriteria, setSearchCriteria] = useState<GigCriteriaSearchRequest>({
    criteriaCodes: {},
    weights: {}
  });
  const [results, setResults] = useState<GigCriteriaSearchResult[]>([]);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const searchResults = await gigCriteriaApi.searchGigsByCriteria(searchCriteria);
      setResults(searchResults);
      onSearchResults?.(searchResults);
    } catch (error) {
      console.error('Error searching gigs:', error);
      onError?.(error instanceof Error ? error.message : 'Failed to search gigs');
    } finally {
      setLoading(false);
    }
  };

  const addSkill = (category: 'professionalSkills' | 'technicalSkills' | 'softSkills') => {
    const newSkill = { skillCode: '', level: 1, weight: 1 };
    setSearchCriteria(prev => ({
      ...prev,
      criteriaCodes: {
        ...prev.criteriaCodes,
        [category]: [...(prev.criteriaCodes[category] || []), newSkill]
      }
    }));
  };

  const updateSkill = (category: 'professionalSkills' | 'technicalSkills' | 'softSkills', index: number, field: string, value: any) => {
    setSearchCriteria(prev => ({
      ...prev,
      criteriaCodes: {
        ...prev.criteriaCodes,
        [category]: prev.criteriaCodes[category]?.map((skill, i) => 
          i === index ? { ...skill, [field]: value } : skill
        ) || []
      }
    }));
  };

  const removeSkill = (category: 'professionalSkills' | 'technicalSkills' | 'softSkills', index: number) => {
    setSearchCriteria(prev => ({
      ...prev,
      criteriaCodes: {
        ...prev.criteriaCodes,
        [category]: prev.criteriaCodes[category]?.filter((_, i) => i !== index) || []
      }
    }));
  };

  const addLanguage = () => {
    const newLanguage = { languageCode: '', proficiency: 'intermediate', weight: 1 };
    setSearchCriteria(prev => ({
      ...prev,
      criteriaCodes: {
        ...prev.criteriaCodes,
        languages: [...(prev.criteriaCodes.languages || []), newLanguage]
      }
    }));
  };

  const updateLanguage = (index: number, field: string, value: any) => {
    setSearchCriteria(prev => ({
      ...prev,
      criteriaCodes: {
        ...prev.criteriaCodes,
        languages: prev.criteriaCodes.languages?.map((lang, i) => 
          i === index ? { ...lang, [field]: value } : lang
        ) || []
      }
    }));
  };

  const removeLanguage = (index: number) => {
    setSearchCriteria(prev => ({
      ...prev,
      criteriaCodes: {
        ...prev.criteriaCodes,
        languages: prev.criteriaCodes.languages?.filter((_, i) => i !== index) || []
      }
    }));
  };

  const addIndustry = () => {
    const newIndustry = { industryCode: '', weight: 1 };
    setSearchCriteria(prev => ({
      ...prev,
      criteriaCodes: {
        ...prev.criteriaCodes,
        industries: [...(prev.criteriaCodes.industries || []), newIndustry]
      }
    }));
  };

  const updateIndustry = (index: number, field: string, value: any) => {
    setSearchCriteria(prev => ({
      ...prev,
      criteriaCodes: {
        ...prev.criteriaCodes,
        industries: prev.criteriaCodes.industries?.map((industry, i) => 
          i === index ? { ...industry, [field]: value } : industry
        ) || []
      }
    }));
  };

  const removeIndustry = (index: number) => {
    setSearchCriteria(prev => ({
      ...prev,
      criteriaCodes: {
        ...prev.criteriaCodes,
        industries: prev.criteriaCodes.industries?.filter((_, i) => i !== index) || []
      }
    }));
  };

  const addActivity = () => {
    const newActivity = { activityCode: '', weight: 1 };
    setSearchCriteria(prev => ({
      ...prev,
      criteriaCodes: {
        ...prev.criteriaCodes,
        activities: [...(prev.criteriaCodes.activities || []), newActivity]
      }
    }));
  };

  const updateActivity = (index: number, field: string, value: any) => {
    setSearchCriteria(prev => ({
      ...prev,
      criteriaCodes: {
        ...prev.criteriaCodes,
        activities: prev.criteriaCodes.activities?.map((activity, i) => 
          i === index ? { ...activity, [field]: value } : activity
        ) || []
      }
    }));
  };

  const removeActivity = (index: number) => {
    setSearchCriteria(prev => ({
      ...prev,
      criteriaCodes: {
        ...prev.criteriaCodes,
        activities: prev.criteriaCodes.activities?.filter((_, i) => i !== index) || []
      }
    }));
  };

  const updateWeight = (category: string, value: number) => {
    setSearchCriteria(prev => ({
      ...prev,
      weights: {
        ...prev.weights,
        [category]: value
      }
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-6">Search Gigs by Criteria</h3>

      {/* Professional Skills */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-medium">Professional Skills</h4>
          <button
            onClick={() => addSkill('professionalSkills')}
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
          >
            Add Skill
          </button>
        </div>
        <div className="space-y-2">
          {searchCriteria.criteriaCodes.professionalSkills?.map((skill, index) => (
            <div key={index} className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="Skill code"
                value={skill.skillCode}
                onChange={(e) => updateSkill('professionalSkills', index, 'skillCode', e.target.value)}
                className="border rounded px-3 py-1 flex-1"
              />
              <input
                type="number"
                placeholder="Level"
                value={skill.level}
                onChange={(e) => updateSkill('professionalSkills', index, 'level', parseInt(e.target.value))}
                className="border rounded px-3 py-1 w-20"
                min="1"
                max="10"
              />
              <input
                type="number"
                placeholder="Weight"
                value={skill.weight}
                onChange={(e) => updateSkill('professionalSkills', index, 'weight', parseFloat(e.target.value))}
                className="border rounded px-3 py-1 w-20"
                min="0"
                step="0.1"
              />
              <button
                onClick={() => removeSkill('professionalSkills', index)}
                className="text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Technical Skills */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-medium">Technical Skills</h4>
          <button
            onClick={() => addSkill('technicalSkills')}
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
          >
            Add Skill
          </button>
        </div>
        <div className="space-y-2">
          {searchCriteria.criteriaCodes.technicalSkills?.map((skill, index) => (
            <div key={index} className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="Skill code"
                value={skill.skillCode}
                onChange={(e) => updateSkill('technicalSkills', index, 'skillCode', e.target.value)}
                className="border rounded px-3 py-1 flex-1"
              />
              <input
                type="number"
                placeholder="Level"
                value={skill.level}
                onChange={(e) => updateSkill('technicalSkills', index, 'level', parseInt(e.target.value))}
                className="border rounded px-3 py-1 w-20"
                min="1"
                max="10"
              />
              <input
                type="number"
                placeholder="Weight"
                value={skill.weight}
                onChange={(e) => updateSkill('technicalSkills', index, 'weight', parseFloat(e.target.value))}
                className="border rounded px-3 py-1 w-20"
                min="0"
                step="0.1"
              />
              <button
                onClick={() => removeSkill('technicalSkills', index)}
                className="text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Soft Skills */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-medium">Soft Skills</h4>
          <button
            onClick={() => addSkill('softSkills')}
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
          >
            Add Skill
          </button>
        </div>
        <div className="space-y-2">
          {searchCriteria.criteriaCodes.softSkills?.map((skill, index) => (
            <div key={index} className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="Skill code"
                value={skill.skillCode}
                onChange={(e) => updateSkill('softSkills', index, 'skillCode', e.target.value)}
                className="border rounded px-3 py-1 flex-1"
              />
              <input
                type="number"
                placeholder="Level"
                value={skill.level}
                onChange={(e) => updateSkill('softSkills', index, 'level', parseInt(e.target.value))}
                className="border rounded px-3 py-1 w-20"
                min="1"
                max="10"
              />
              <input
                type="number"
                placeholder="Weight"
                value={skill.weight}
                onChange={(e) => updateSkill('softSkills', index, 'weight', parseFloat(e.target.value))}
                className="border rounded px-3 py-1 w-20"
                min="0"
                step="0.1"
              />
              <button
                onClick={() => removeSkill('softSkills', index)}
                className="text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Languages */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-medium">Languages</h4>
          <button
            onClick={addLanguage}
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
          >
            Add Language
          </button>
        </div>
        <div className="space-y-2">
          {searchCriteria.criteriaCodes.languages?.map((language, index) => (
            <div key={index} className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="Language code"
                value={language.languageCode}
                onChange={(e) => updateLanguage(index, 'languageCode', e.target.value)}
                className="border rounded px-3 py-1 flex-1"
              />
              <select
                value={language.proficiency}
                onChange={(e) => updateLanguage(index, 'proficiency', e.target.value)}
                className="border rounded px-3 py-1"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="native">Native</option>
              </select>
              <input
                type="number"
                placeholder="Weight"
                value={language.weight}
                onChange={(e) => updateLanguage(index, 'weight', parseFloat(e.target.value))}
                className="border rounded px-3 py-1 w-20"
                min="0"
                step="0.1"
              />
              <button
                onClick={() => removeLanguage(index)}
                className="text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Industries */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-medium">Industries</h4>
          <button
            onClick={addIndustry}
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
          >
            Add Industry
          </button>
        </div>
        <div className="space-y-2">
          {searchCriteria.criteriaCodes.industries?.map((industry, index) => (
            <div key={index} className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="Industry code"
                value={industry.industryCode}
                onChange={(e) => updateIndustry(index, 'industryCode', e.target.value)}
                className="border rounded px-3 py-1 flex-1"
              />
              <input
                type="number"
                placeholder="Weight"
                value={industry.weight}
                onChange={(e) => updateIndustry(index, 'weight', parseFloat(e.target.value))}
                className="border rounded px-3 py-1 w-20"
                min="0"
                step="0.1"
              />
              <button
                onClick={() => removeIndustry(index)}
                className="text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Activities */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-medium">Activities</h4>
          <button
            onClick={addActivity}
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
          >
            Add Activity
          </button>
        </div>
        <div className="space-y-2">
          {searchCriteria.criteriaCodes.activities?.map((activity, index) => (
            <div key={index} className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="Activity code"
                value={activity.activityCode}
                onChange={(e) => updateActivity(index, 'activityCode', e.target.value)}
                className="border rounded px-3 py-1 flex-1"
              />
              <input
                type="number"
                placeholder="Weight"
                value={activity.weight}
                onChange={(e) => updateActivity(index, 'weight', parseFloat(e.target.value))}
                className="border rounded px-3 py-1 w-20"
                min="0"
                step="0.1"
              />
              <button
                onClick={() => removeActivity(index)}
                className="text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Weights */}
      <div className="mb-6">
        <h4 className="font-medium mb-3">Search Weights</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Professional Skills Weight
            </label>
            <input
              type="number"
              value={searchCriteria.weights?.professionalSkills || 0}
              onChange={(e) => updateWeight('professionalSkills', parseFloat(e.target.value))}
              className="border rounded px-3 py-1 w-full"
              min="0"
              step="0.1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Technical Skills Weight
            </label>
            <input
              type="number"
              value={searchCriteria.weights?.technicalSkills || 0}
              onChange={(e) => updateWeight('technicalSkills', parseFloat(e.target.value))}
              className="border rounded px-3 py-1 w-full"
              min="0"
              step="0.1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Soft Skills Weight
            </label>
            <input
              type="number"
              value={searchCriteria.weights?.softSkills || 0}
              onChange={(e) => updateWeight('softSkills', parseFloat(e.target.value))}
              className="border rounded px-3 py-1 w-full"
              min="0"
              step="0.1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Languages Weight
            </label>
            <input
              type="number"
              value={searchCriteria.weights?.languages || 0}
              onChange={(e) => updateWeight('languages', parseFloat(e.target.value))}
              className="border rounded px-3 py-1 w-full"
              min="0"
              step="0.1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Industries Weight
            </label>
            <input
              type="number"
              value={searchCriteria.weights?.industries || 0}
              onChange={(e) => updateWeight('industries', parseFloat(e.target.value))}
              className="border rounded px-3 py-1 w-full"
              min="0"
              step="0.1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Activities Weight
            </label>
            <input
              type="number"
              value={searchCriteria.weights?.activities || 0}
              onChange={(e) => updateWeight('activities', parseFloat(e.target.value))}
              className="border rounded px-3 py-1 w-full"
              min="0"
              step="0.1"
            />
          </div>
        </div>
      </div>

      {/* Search Button */}
      <div className="flex justify-center">
        <button
          onClick={handleSearch}
          disabled={loading}
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Searching...' : 'Search Gigs'}
        </button>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="mt-8">
          <h4 className="font-medium mb-4">Search Results ({results.length})</h4>
          <div className="space-y-4">
            {results.map((result, index) => (
              <div key={index} className="border rounded p-4">
                <div className="flex justify-between items-start mb-2">
                  <h5 className="font-medium">{result.gig.title}</h5>
                  {result.matchScore && (
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                      Score: {result.matchScore.toFixed(2)}
                    </span>
                  )}
                </div>
                <p className="text-gray-600 text-sm mb-2">{result.gig.description}</p>
                <div className="text-xs text-gray-500">
                  <p>Gig ID: {result.gig._id}</p>
                  <p>Category: {result.gig.category}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GigCriteriaSearch; 