import React, { useState, useEffect } from 'react';
import { 
  getGigWeights, 
  createOrUpdateGigWeights, 
  resetGigWeights,
  type GigMatchingWeights 
} from '../api/gigMatchingWeightsApi';
import { 
  Settings, 
  Save, 
  RotateCcw, 
  CheckCircle, 
  AlertCircle,
  Loader2
} from 'lucide-react';

interface GigMatchingWeightsManagerProps {
  gigId: string;
  onWeightsUpdated?: (weights: GigMatchingWeights) => void;
  onError?: (error: any) => void;
}

const GigMatchingWeightsManager: React.FC<GigMatchingWeightsManagerProps> = ({
  gigId,
  onWeightsUpdated,
  onError
}) => {
  const [weights, setWeights] = useState<GigMatchingWeights['categoryWeights']>({
    skills: 0.5,
    activities: 0.5,
    industries: 0.5,
    languages: 0.5,
    destination: 0.5,
    seniority: 0.5
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadWeights();
  }, [gigId]);

  const loadWeights = async () => {
    if (!gigId) return;
    
    setLoading(true);
    try {
      const weightsData = await getGigWeights(gigId);
      setWeights(weightsData.categoryWeights);
      setMessage(null);
    } catch (error) {
      console.error('Error loading weights:', error);
      onError?.(error);
      setMessage({ type: 'error', text: 'Failed to load weights' });
    } finally {
      setLoading(false);
    }
  };

  const handleWeightChange = (category: keyof typeof weights, value: number) => {
    setWeights(prev => ({
      ...prev,
      [category]: Math.max(0, Math.min(1, value))
    }));
  };

  const handleSave = async () => {
    if (!gigId) return;
    
    setSaving(true);
    try {
      const updatedWeights = await createOrUpdateGigWeights(gigId, weights);
      setMessage({ type: 'success', text: 'Weights saved successfully!' });
      onWeightsUpdated?.(updatedWeights);
      
      // Clear success message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error saving weights:', error);
      onError?.(error);
      setMessage({ type: 'error', text: 'Failed to save weights' });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!gigId) return;
    
    setSaving(true);
    try {
      const resetWeightsData = await resetGigWeights(gigId);
      setWeights(resetWeightsData.categoryWeights);
      setMessage({ type: 'success', text: 'Weights reset to defaults!' });
      onWeightsUpdated?.(resetWeightsData);
      
      // Clear success message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error resetting weights:', error);
      onError?.(error);
      setMessage({ type: 'error', text: 'Failed to reset weights' });
    } finally {
      setSaving(false);
    }
  };

  const categoryLabels = {
    skills: 'Skills',
    activities: 'Activities',
    industries: 'Industries',
    languages: 'Languages',
    destination: 'Destination',
    seniority: 'Seniority'
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="animate-spin h-6 w-6 text-indigo-600" />
        <span className="ml-2 text-gray-600">Loading weights...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Settings className="h-5 w-5 text-indigo-600" />
          <h3 className="text-lg font-semibold text-gray-900">Matching Weights</h3>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleReset}
            disabled={saving}
            className="flex items-center space-x-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reset</span>
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-indigo-600 text-white hover:bg-indigo-700 rounded-md transition-colors disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>{saving ? 'Saving...' : 'Apply'}</span>
          </button>
        </div>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-md flex items-center space-x-2 ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <span className="text-sm">{message.text}</span>
        </div>
      )}

      <div className="space-y-4">
        {Object.entries(weights).map(([category, value]) => (
          <div key={category} className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-gray-700">
                {categoryLabels[category as keyof typeof categoryLabels]}
              </label>
              <span className="text-sm text-gray-500 font-mono">
                {Math.round(value * 100)}%
              </span>
            </div>
            <div className="relative">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={value}
                onChange={(e) => handleWeightChange(category as keyof typeof weights, parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #4f46e5 0%, #4f46e5 ${value * 100}%, #e5e7eb ${value * 100}%, #e5e7eb 100%)`
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-md">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Weight Guidelines:</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• <strong>0.0-0.3:</strong> Low priority - minimal impact on matching</li>
          <li>• <strong>0.4-0.6:</strong> Medium priority - balanced consideration</li>
          <li>• <strong>0.7-1.0:</strong> High priority - significant impact on matching</li>
        </ul>
      </div>
    </div>
  );
};

export default GigMatchingWeightsManager; 