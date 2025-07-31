import React, { useState, useEffect } from 'react';
import { 
  GigCriteria, 
  GigCriteriaCodes, 
  GigCriteriaSkill, 
  GigCriteriaLanguage,
  GigCriteriaIndustry,
  GigCriteriaActivity
} from '../types';
import gigCriteriaApi from '../api/gigCriteriaApi';

interface GigCriteriaManagerProps {
  gigId: string;
  onCriteriaUpdated?: (criteria: GigCriteria) => void;
  onError?: (error: string) => void;
}

const GigCriteriaManager: React.FC<GigCriteriaManagerProps> = ({
  gigId,
  onCriteriaUpdated,
  onError
}) => {
  const [criteria, setCriteria] = useState<GigCriteria | null>(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [newSkill, setNewSkill] = useState({ skillCode: '', level: 1, weight: 1 });
  const [newLanguage, setNewLanguage] = useState({ languageCode: '', proficiency: 'intermediate', weight: 1 });
  const [newIndustry, setNewIndustry] = useState({ industryCode: '', weight: 1 });
  const [newActivity, setNewActivity] = useState({ activityCode: '', weight: 1 });

  useEffect(() => {
    loadCriteria();
  }, [gigId]);

  const loadCriteria = async () => {
    setLoading(true);
    try {
      const data = await gigCriteriaApi.getGigCriteria(gigId);
      setCriteria(data);
    } catch (error) {
      console.error('Error loading criteria:', error);
      onError?.(error instanceof Error ? error.message : 'Failed to load criteria');
    } finally {
      setLoading(false);
    }
  };

  const createCriteria = async () => {
    setLoading(true);
    try {
      const newCriteria = {
        criteriaCodes: {
          professionalSkills: [],
          technicalSkills: [],
          softSkills: [],
          languages: [],
          industries: [],
          activities: [],
          destinationCode: null,
          seniorityCode: null
        },
        metadata: {
          version: '1.0',
          description: 'Initial criteria setup'
        }
      };

      const data = await gigCriteriaApi.createGigCriteria(gigId, newCriteria.criteriaCodes, newCriteria.metadata);
      setCriteria(data);
      onCriteriaUpdated?.(data);
    } catch (error) {
      console.error('Error creating criteria:', error);
      onError?.(error instanceof Error ? error.message : 'Failed to create criteria');
    } finally {
      setLoading(false);
    }
  };

  const updateCriteria = async (updatedCriteria: GigCriteriaCodes) => {
    if (!criteria) return;

    setLoading(true);
    try {
      const data = await gigCriteriaApi.updateGigCriteria(gigId, updatedCriteria, criteria.metadata);
      setCriteria(data);
      onCriteriaUpdated?.(data);
      setEditing(false);
    } catch (error) {
      console.error('Error updating criteria:', error);
      onError?.(error instanceof Error ? error.message : 'Failed to update criteria');
    } finally {
      setLoading(false);
    }
  };

  const addSkill = async (category: 'professionalSkills' | 'technicalSkills' | 'softSkills') => {
    if (!criteria || !newSkill.skillCode) return;

    const updatedCriteria = { ...criteria.criteriaCodes };
    updatedCriteria[category] = [...updatedCriteria[category], newSkill];
    
    await updateCriteria(updatedCriteria);
    setNewSkill({ skillCode: '', level: 1, weight: 1 });
  };

  const addLanguage = async () => {
    if (!criteria || !newLanguage.languageCode) return;

    const updatedCriteria = { ...criteria.criteriaCodes };
    updatedCriteria.languages = [...updatedCriteria.languages, newLanguage];
    
    await updateCriteria(updatedCriteria);
    setNewLanguage({ languageCode: '', proficiency: 'intermediate', weight: 1 });
  };

  const addIndustry = async () => {
    if (!criteria || !newIndustry.industryCode) return;

    const updatedCriteria = { ...criteria.criteriaCodes };
    updatedCriteria.industries = [...updatedCriteria.industries, newIndustry];
    
    await updateCriteria(updatedCriteria);
    setNewIndustry({ industryCode: '', weight: 1 });
  };

  const addActivity = async () => {
    if (!criteria || !newActivity.activityCode) return;

    const updatedCriteria = { ...criteria.criteriaCodes };
    updatedCriteria.activities = [...updatedCriteria.activities, newActivity];
    
    await updateCriteria(updatedCriteria);
    setNewActivity({ activityCode: '', weight: 1 });
  };

  const removeItem = async (category: keyof GigCriteriaCodes, index: number) => {
    if (!criteria) return;

    const updatedCriteria = { ...criteria.criteriaCodes };
    if (Array.isArray(updatedCriteria[category])) {
      (updatedCriteria[category] as any[]).splice(index, 1);
      await updateCriteria(updatedCriteria);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!criteria) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Gig Criteria</h3>
        <p className="text-gray-600 mb-4">No criteria found for this gig.</p>
        <button
          onClick={createCriteria}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
        >
          Create Criteria
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Gig Criteria</h3>
        <button
          onClick={() => setEditing(!editing)}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
        >
          {editing ? 'Cancel' : 'Edit'}
        </button>
      </div>

      {/* Professional Skills */}
      <div className="mb-6">
        <h4 className="font-medium mb-3">Professional Skills</h4>
        <div className="space-y-2">
          {criteria.criteriaCodes.professionalSkills.map((skill, index) => (
            <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded">
              <div>
                <span className="font-medium">{skill.skillCode}</span>
                <span className="text-gray-500 ml-2">Level: {skill.level}</span>
                <span className="text-gray-500 ml-2">Weight: {skill.weight}</span>
              </div>
              {editing && (
                <button
                  onClick={() => removeItem('professionalSkills', index)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          {editing && (
            <div className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="Skill code"
                value={newSkill.skillCode}
                onChange={(e) => setNewSkill({ ...newSkill, skillCode: e.target.value })}
                className="border rounded px-3 py-1 flex-1"
              />
              <input
                type="number"
                placeholder="Level"
                value={newSkill.level}
                onChange={(e) => setNewSkill({ ...newSkill, level: parseInt(e.target.value) })}
                className="border rounded px-3 py-1 w-20"
                min="1"
                max="10"
              />
              <input
                type="number"
                placeholder="Weight"
                value={newSkill.weight}
                onChange={(e) => setNewSkill({ ...newSkill, weight: parseFloat(e.target.value) })}
                className="border rounded px-3 py-1 w-20"
                min="0"
                step="0.1"
              />
              <button
                onClick={() => addSkill('professionalSkills')}
                className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
              >
                Add
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Technical Skills */}
      <div className="mb-6">
        <h4 className="font-medium mb-3">Technical Skills</h4>
        <div className="space-y-2">
          {criteria.criteriaCodes.technicalSkills.map((skill, index) => (
            <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded">
              <div>
                <span className="font-medium">{skill.skillCode}</span>
                <span className="text-gray-500 ml-2">Level: {skill.level}</span>
                <span className="text-gray-500 ml-2">Weight: {skill.weight}</span>
              </div>
              {editing && (
                <button
                  onClick={() => removeItem('technicalSkills', index)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          {editing && (
            <div className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="Skill code"
                value={newSkill.skillCode}
                onChange={(e) => setNewSkill({ ...newSkill, skillCode: e.target.value })}
                className="border rounded px-3 py-1 flex-1"
              />
              <input
                type="number"
                placeholder="Level"
                value={newSkill.level}
                onChange={(e) => setNewSkill({ ...newSkill, level: parseInt(e.target.value) })}
                className="border rounded px-3 py-1 w-20"
                min="1"
                max="10"
              />
              <input
                type="number"
                placeholder="Weight"
                value={newSkill.weight}
                onChange={(e) => setNewSkill({ ...newSkill, weight: parseFloat(e.target.value) })}
                className="border rounded px-3 py-1 w-20"
                min="0"
                step="0.1"
              />
              <button
                onClick={() => addSkill('technicalSkills')}
                className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
              >
                Add
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Soft Skills */}
      <div className="mb-6">
        <h4 className="font-medium mb-3">Soft Skills</h4>
        <div className="space-y-2">
          {criteria.criteriaCodes.softSkills.map((skill, index) => (
            <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded">
              <div>
                <span className="font-medium">{skill.skillCode}</span>
                <span className="text-gray-500 ml-2">Level: {skill.level}</span>
                <span className="text-gray-500 ml-2">Weight: {skill.weight}</span>
              </div>
              {editing && (
                <button
                  onClick={() => removeItem('softSkills', index)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          {editing && (
            <div className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="Skill code"
                value={newSkill.skillCode}
                onChange={(e) => setNewSkill({ ...newSkill, skillCode: e.target.value })}
                className="border rounded px-3 py-1 flex-1"
              />
              <input
                type="number"
                placeholder="Level"
                value={newSkill.level}
                onChange={(e) => setNewSkill({ ...newSkill, level: parseInt(e.target.value) })}
                className="border rounded px-3 py-1 w-20"
                min="1"
                max="10"
              />
              <input
                type="number"
                placeholder="Weight"
                value={newSkill.weight}
                onChange={(e) => setNewSkill({ ...newSkill, weight: parseFloat(e.target.value) })}
                className="border rounded px-3 py-1 w-20"
                min="0"
                step="0.1"
              />
              <button
                onClick={() => addSkill('softSkills')}
                className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
              >
                Add
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Languages */}
      <div className="mb-6">
        <h4 className="font-medium mb-3">Languages</h4>
        <div className="space-y-2">
          {criteria.criteriaCodes.languages.map((language, index) => (
            <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded">
              <div>
                <span className="font-medium">{language.languageCode}</span>
                <span className="text-gray-500 ml-2">Proficiency: {language.proficiency}</span>
                <span className="text-gray-500 ml-2">Weight: {language.weight}</span>
              </div>
              {editing && (
                <button
                  onClick={() => removeItem('languages', index)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          {editing && (
            <div className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="Language code"
                value={newLanguage.languageCode}
                onChange={(e) => setNewLanguage({ ...newLanguage, languageCode: e.target.value })}
                className="border rounded px-3 py-1 flex-1"
              />
              <select
                value={newLanguage.proficiency}
                onChange={(e) => setNewLanguage({ ...newLanguage, proficiency: e.target.value })}
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
                value={newLanguage.weight}
                onChange={(e) => setNewLanguage({ ...newLanguage, weight: parseFloat(e.target.value) })}
                className="border rounded px-3 py-1 w-20"
                min="0"
                step="0.1"
              />
              <button
                onClick={addLanguage}
                className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
              >
                Add
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Industries */}
      <div className="mb-6">
        <h4 className="font-medium mb-3">Industries</h4>
        <div className="space-y-2">
          {criteria.criteriaCodes.industries.map((industry, index) => (
            <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded">
              <div>
                <span className="font-medium">{industry.industryCode}</span>
                <span className="text-gray-500 ml-2">Weight: {industry.weight}</span>
              </div>
              {editing && (
                <button
                  onClick={() => removeItem('industries', index)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          {editing && (
            <div className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="Industry code"
                value={newIndustry.industryCode}
                onChange={(e) => setNewIndustry({ ...newIndustry, industryCode: e.target.value })}
                className="border rounded px-3 py-1 flex-1"
              />
              <input
                type="number"
                placeholder="Weight"
                value={newIndustry.weight}
                onChange={(e) => setNewIndustry({ ...newIndustry, weight: parseFloat(e.target.value) })}
                className="border rounded px-3 py-1 w-20"
                min="0"
                step="0.1"
              />
              <button
                onClick={addIndustry}
                className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
              >
                Add
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Activities */}
      <div className="mb-6">
        <h4 className="font-medium mb-3">Activities</h4>
        <div className="space-y-2">
          {criteria.criteriaCodes.activities.map((activity, index) => (
            <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded">
              <div>
                <span className="font-medium">{activity.activityCode}</span>
                <span className="text-gray-500 ml-2">Weight: {activity.weight}</span>
              </div>
              {editing && (
                <button
                  onClick={() => removeItem('activities', index)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          {editing && (
            <div className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="Activity code"
                value={newActivity.activityCode}
                onChange={(e) => setNewActivity({ ...newActivity, activityCode: e.target.value })}
                className="border rounded px-3 py-1 flex-1"
              />
              <input
                type="number"
                placeholder="Weight"
                value={newActivity.weight}
                onChange={(e) => setNewActivity({ ...newActivity, weight: parseFloat(e.target.value) })}
                className="border rounded px-3 py-1 w-20"
                min="0"
                step="0.1"
              />
              <button
                onClick={addActivity}
                className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
              >
                Add
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Metadata */}
      <div className="mt-6 p-4 bg-gray-50 rounded">
        <h4 className="font-medium mb-2">Metadata</h4>
        <div className="text-sm text-gray-600">
          <p>Version: {criteria.metadata.version}</p>
          <p>Created: {new Date(criteria.metadata.createdAt).toLocaleDateString()}</p>
          <p>Updated: {new Date(criteria.metadata.updatedAt).toLocaleDateString()}</p>
          {criteria.metadata.description && (
            <p>Description: {criteria.metadata.description}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default GigCriteriaManager; 