import React, { useState, useEffect } from 'react';
import {
  Users,
  Briefcase,
  Zap,
  Settings,
  Activity,
  CheckCircle2,
  Clock,
  Filter
} from 'lucide-react';
import { 
  Rep, 
  Gig, 
  Match, 
  MatchingWeights, 
  MatchResponse 
} from '../types/matching';
import {
  getReps,
  getGigs,
  getGigsByCompanyId,
  findMatchesForGig,
  createGigAgent,
  getGigAgentsForGig,
  getInvitedAgentsForCompany,
  getEnrollmentRequestsForCompany,
  getActiveAgentsForCompany,
  acceptEnrollmentRequest,
  rejectEnrollmentRequest,
  getAllSkills,
  getLanguages,
  saveGigWeights,
  getGigWeights,
  resetGigWeights,
  Skill,
  Language,
  GigWeights
} from '../api/matching';
import Cookies from 'js-cookie';


function MatchingDashboard() {
const defaultMatchingWeights: MatchingWeights = {
  experience: 0.20,
  skills: 0.20,
  industry: 0.15,
  languages: 0.15,
  availability: 0.10,
  timezone: 0.10,
  activities: 0.10,
  region: 0.10,
};
  // Debug component mounting
  useEffect(() => {
    console.log('🚀 COMPONENT MOUNTED');
    return () => {
      console.log('💀 COMPONENT UNMOUNTED');
    };
  }, []);

  const [reps, setReps] = useState<Rep[]>([]);
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [selectedGig, setSelectedGig] = useState<Gig | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showWeights, setShowWeights] = useState(false);
  const [weights, setWeights] = useState<MatchingWeights>(defaultMatchingWeights);
  const [matchStats, setMatchStats] = useState<MatchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [invitedAgents, setInvitedAgents] = useState<Set<string>>(new Set());
  const [creatingGigAgent, setCreatingGigAgent] = useState(false);
  const [gigAgentSuccess, setGigAgentSuccess] = useState<string | null>(null);
  const [gigAgentError, setGigAgentError] = useState<string | null>(null);
  const [skills, setSkills] = useState<{
    professional: Skill[];
    technical: Skill[];
    soft: Skill[];
  }>({ professional: [], technical: [], soft: [] });
  const [languages, setLanguages] = useState<Language[]>([]);
  const [gigHasWeights, setGigHasWeights] = useState(false);

  // Fetch data from backend
  useEffect(() => {
    const fetchData = async () => {
      setInitialLoading(true);
      setError(null);
      
      try {
        console.log("Fetching data from backend...");
        
        const companyId = Cookies.get('companyId') || '685abf28641398dc582f4c95';
        
        const [gigsData, representativesData, skillsData, languagesData] = await Promise.all([
          companyId ? getGigsByCompanyId(companyId) : getGigs(),
          getReps(),
          getAllSkills(),
          getLanguages()
        ]);
        
        setGigs(gigsData);
        setReps(representativesData);
        setSkills(skillsData);
        setLanguages(languagesData);
        
        console.log("=== BACKEND DATA ===");
        console.log("Gigs:", gigsData);
        
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to fetch data. Please try again.");
      } finally {
        setInitialLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleGigSelect = async (gig: Gig) => {
    console.log('🎯 GIG SELECTED:', gig.title, 'ID:', gig._id);
    setSelectedGig(gig);
    setLoading(true);
    setError(null);
    setMatches([]);
    setMatchStats(null);
    
    // Reset weights state
    setGigHasWeights(false);
    
    let currentWeights = weights;
    
    try {
      // Try to load saved weights for this gig
      try {
        const savedWeights = await getGigWeights(gig._id || '');
        setWeights(savedWeights.matchingWeights);
        setGigHasWeights(true);
        currentWeights = savedWeights.matchingWeights;
        console.log('✅ Gig has saved weights, loaded:', savedWeights.matchingWeights);
      } catch (error) {
        console.log('❌ No saved weights found for gig:', gig._id);
        setGigHasWeights(false);
        // Keep current weights
      }
      
      // Fetch invited reps for this gig
      const gigAgents = await getGigAgentsForGig(gig._id || '');
      const invitedAgentIds = new Set<string>(gigAgents.map((ga: any) => ga.agentId as string));
      setInvitedAgents(invitedAgentIds);
      console.log('📧 Invited reps for gig:', invitedAgentIds);
      
      // Find matches for the selected gig using current or loaded weights
      console.log("Searching for reps matching gig:", gig.title);
      console.log("🎯 WEIGHTS BEING SENT TO API:", currentWeights);
      const matchesData = await findMatchesForGig(gig._id || '', currentWeights);
      console.log("=== MATCHES DATA ===", matchesData);
      
      setMatches(matchesData.preferedmatches || []);
      setMatchStats(matchesData);
      
    } catch (error) {
      console.error("Error getting matches:", error);
      setError("Failed to get matches. Please try again.");
      setMatches([]);
      setMatchStats(null);
    } finally {
      setLoading(false);
    }
  };

  const handleWeightChange = (key: string, value: number) => {
    const newWeights = {
      ...weights,
      [key]: value,
    };
    
    setWeights(newWeights);
    
    // Auto-search when weights change if a gig is selected
    if (selectedGig) {
      searchWithCurrentWeights();
    }
  };

  // Search with current weights without reloading from DB
  const searchWithCurrentWeights = async () => {
    if (!selectedGig) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log("Searching with current weights (no DB reload):", weights);
      const matchesData = await findMatchesForGig(selectedGig._id || '', weights);
      console.log("=== MATCHES DATA WITH CURRENT WEIGHTS ===", matchesData);
      
      setMatches(matchesData.preferedmatches || []);
      setMatchStats(matchesData);
      
      // Fetch invited reps for this gig
      const gigAgents = await getGigAgentsForGig(selectedGig._id || '');
      const invitedAgentIds = new Set<string>(gigAgents.map((ga: any) => ga.agentId as string));
      setInvitedAgents(invitedAgentIds);
      
    } catch (error) {
      console.error("Error searching with current weights:", error);
      setError("Failed to get matches. Please try again.");
      setMatches([]);
      setMatchStats(null);
    } finally {
      setLoading(false);
    }
  };

  const resetWeights = () => {
    setWeights(defaultMatchingWeights);
    
    // Auto-search when weights are reset if a gig is selected
    if (selectedGig) {
      searchWithCurrentWeights();
    }
  };

  // Save weights for selected gig
  const saveWeightsForGig = async () => {
    console.log('🚨 SAVE WEIGHTS FOR GIG CALLED');
    
    if (!selectedGig) {
      console.error('No gig selected');
      setError('No gig selected');
      return;
    }

    console.log('🔄 MANUAL SAVE TRIGGERED - User clicked save button');
    setLoading(true);
    setError(null);
    
    try {
      // Save weights to backend
      await saveGigWeights(selectedGig._id || '', weights);
      console.log('✅ Weights saved successfully for gig:', selectedGig._id);
      setGigHasWeights(true);
      
      // Trigger new search with saved weights
      await searchWithCurrentWeights();
      
    } catch (error) {
      console.error('❌ Error saving weights or searching:', error);
      setError('Failed to save weights or search. Please try again.');
    } finally {
      setLoading(false);
    }
  };



  // Handle creating gig-rep (inviting rep to gig)
  const handleCreateGigAgent = async (match: Match) => {
    if (!selectedGig) {
      setGigAgentError("No gig selected");
      return;
    }

    setCreatingGigAgent(true);
    setGigAgentError(null);
    setGigAgentSuccess(null);

    console.log('Creating gig-rep with data:', {
      agentId: match.agentId,
      gigId: selectedGig._id,
      match: match
    });

    // Send only the essential IDs to avoid any object processing errors
    const requestData = {
      agentId: match.agentId,
      gigId: selectedGig._id || '',
      matchDetails: match
    };
    
    console.log('🚀 Sending minimal request data:', requestData);
    
    try {
      const response = await createGigAgent(requestData);
      console.log('Gig-Rep created successfully:', response);
      
      // Add rep to invited list
      setInvitedAgents((prev: Set<string>) => new Set([...prev, match.agentId]));
      
      // Update the match object to mark it as invited
      setMatches((prevMatches: Match[]) => 
        prevMatches.map((m: Match) => 
          m.agentId === match.agentId 
            ? { ...m, isInvited: true }
            : m
        )
      );
      
      setGigAgentSuccess(`Successfully invited ${match.agentInfo?.name} to ${selectedGig.title}`);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setGigAgentSuccess(null);
      }, 3000);

    } catch (error) {
      console.error('Error creating gig-rep:', error);
      setGigAgentError('Failed to invite rep to gig. Please try again.');
    } finally {
      setCreatingGigAgent(false);
    }
  };


  // Helper functions to get skill and language names
  const getSkillNameById = (skillId: string | any, skillType: 'professional' | 'technical' | 'soft') => {
    if (!skillId) return 'Unknown Skill';
    
    // If it's already an object with name, return the name
    if (typeof skillId === 'object' && skillId.name) {
      return skillId.name;
    }
    
    // Convert to string if it's an ObjectId
    const idString = typeof skillId === 'string' ? skillId : skillId.toString();
    
    // Don't display ObjectIds
    if (idString.match(/^[0-9a-fA-F]{24}$/)) {
      const skillArray = skills[skillType];
      const skill = skillArray.find((s: Skill) => s._id === idString);
      return skill ? skill.name : `${skillType.charAt(0).toUpperCase() + skillType.slice(1)} Skill`;
    }
    
    return idString;
  };

  const getLanguageNameByCode = (languageCode: string | any) => {
    if (!languageCode) return 'Unknown Language';
    
    // If it's already an object with name, return the name
    if (typeof languageCode === 'object' && languageCode.name) {
      return languageCode.name;
    }
    
    // Convert to string if it's an ObjectId
    const codeString = typeof languageCode === 'string' ? languageCode : languageCode.toString();
    
    // Don't display ObjectIds
    if (codeString.match(/^[0-9a-fA-F]{24}$/)) {
      let language = languages.find((l: Language) => l._id === codeString);
      if (language) return language.name;
      return 'Language';
    }
    
    // Try to find by code
    let language = languages.find((l: Language) => l.code === codeString);
    
    if (!language) {
      language = languages.find((l: Language) => l._id === codeString);
    }
    
    if (!language) {
      language = languages.find((l: Language) => l.name?.toLowerCase() === codeString.toLowerCase());
    }
    
    return language ? language.name : codeString;
  };







  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg">
        {/* Top Header */}
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Users size={24} className="text-yellow-300" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">HARX Smart Matching System</h1>
                <p className="text-orange-200 text-sm">Find and match the perfect reps for your gigs</p>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="hidden lg:flex items-center space-x-6 px-4 py-2 bg-white/10 rounded-lg text-sm">
              <div className="text-center">
                <div className="font-bold text-lg">{gigs.length}</div>
                <div className="text-orange-200 text-xs">Total Gigs</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg">{matches.length}</div>
                <div className="text-orange-200 text-xs">Matches</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-6">
        
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg shadow-md">
            <p className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </p>
          </div>
        )}

        {/* Loading Indicators */}
        {initialLoading && (
          <div className="flex justify-center items-center py-20">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <Zap size={24} className="text-orange-500 animate-pulse" />
              </div>
            </div>
          </div>
        )}

        {/* Section Content */}
        {!initialLoading && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">🎯 Smart Matching System</h2>
                <p className="text-gray-600">Find and match the perfect reps for your gigs</p>
              </div>
              <button
                onClick={() => setShowWeights(!showWeights)}
                className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 text-sm font-medium ${
                  showWeights 
                    ? 'bg-orange-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <Settings size={16} className={showWeights ? 'rotate-180' : ''} />
                <span>{showWeights ? 'Close Weights' : 'Adjust Weights'}</span>
              </button>
            </div>

            {/* Weights Configuration Panel */}
            {showWeights && (
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl p-8 mb-8 transform transition-all duration-500 ease-in-out border border-gray-200">
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl shadow-lg">
                      <Settings size={24} className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Matching Weights Configuration</h2>
                      <p className="text-gray-600 text-sm mt-1">Customize how each factor influences the matching algorithm</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={resetWeights}
                      disabled={loading}
                      className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl shadow-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 hover:shadow-xl"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span className="font-semibold">Reset to Default</span>
                    </button>
                  </div>
                </div>

                {/* Weights Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {Object.entries(weights).map(([key, value]: [string, number]) => (
                    <div key={`weight-${key}`} className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 group">
                      <div className="flex justify-between items-center mb-4">
                        <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                          {key}
                        </label>
                        <div className={`px-3 py-1 rounded-lg text-sm font-bold ${
                          Math.round(value * 100) >= 20 ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white' :
                          Math.round(value * 100) >= 10 ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {Math.round(value * 100)}%
                        </div>
                      </div>
                      
                      {/* Custom Slider */}
                      <div className="relative mb-3">
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={value}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            handleWeightChange(key, parseFloat(e.target.value))
                          }
                          className="w-full h-3 bg-gray-200 rounded-full appearance-none cursor-pointer slider"
                          style={{
                            background: `linear-gradient(to right, #f97316 0%, #dc2626 ${value * 100}%, #e5e7eb ${value * 100}%, #e5e7eb 100%)`
                          }}
                        />
                        <div 
                          className="absolute top-1/2 transform -translate-y-1/2 w-6 h-6 bg-gradient-to-r from-orange-500 to-red-600 rounded-full shadow-lg border-2 border-white pointer-events-none transition-all duration-200 group-hover:scale-110"
                          style={{ left: `calc(${value * 100}% - 12px)` }}
                        ></div>
                      </div>
                      
                      {/* Weight Description */}
                      <div className="text-xs text-gray-500 text-center">
                        {key === 'experience' && 'Years of relevant experience'}
                        {key === 'skills' && 'Skill compatibility score'}
                        {key === 'industry' && 'Industry background match'}
                        {key === 'languages' && 'Language proficiency'}
                        {key === 'availability' && 'Schedule availability'}
                        {key === 'timezone' && 'Time zone compatibility'}
                        {key === 'activities' && 'Activity performance'}
                        {key === 'region' && 'Geographic location'}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Save Button */}
                {selectedGig && (
                  <div className="flex justify-center">
                    <button
                      onClick={() => {
                        console.log('🎯 BUTTON CLICKED - User manually clicked save button');
                        saveWeightsForGig();
                      }}
                      disabled={loading}
                      className={`group relative px-10 py-4 rounded-2xl transition-all duration-300 flex items-center space-x-3 shadow-2xl transform hover:-translate-y-1 hover:shadow-3xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                        gigHasWeights 
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white' 
                        : 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white'
                      }`}
                    >
                      {/* Icon */}
                      {loading ? (
                        <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full"></div>
                      ) : (
                        <svg className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      
                      {/* Text */}
                      <span className="relative z-10">
                        {loading ? 'Saving weights...' : 
                         gigHasWeights ? `Update Weights for ${selectedGig.title}` : 
                         `Save Weights for ${selectedGig.title}`}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Gig Selection for Matching */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                <Briefcase size={20} className="text-orange-600" />
                <span>Select a Gig to Find Matching Reps</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {gigs.map((gig: Gig) => (
                  <div key={gig._id} className={`bg-white rounded-lg border-2 transition-all duration-200 ${
                    selectedGig?._id === gig._id
                      ? "border-orange-400 shadow-lg bg-orange-50"
                      : "border-gray-200 hover:border-orange-300 hover:shadow-md"
                  }`}>
                    {/* Gig Header - Clickable for selection */}
                    <div
                      className="cursor-pointer p-4"
                      onClick={() => handleGigSelect(gig)}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center space-x-2 flex-1">
                          <div className={`p-2 rounded-lg ${
                            selectedGig?._id === gig._id ? "bg-orange-500" : "bg-gray-400"
                          }`}>
                            <Briefcase size={16} className="text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className={`font-bold text-sm truncate ${
                              selectedGig?._id === gig._id ? "text-orange-900" : "text-gray-800"
                            }`}>
                              {gig.title}
                            </h4>
                            <p className="text-xs text-gray-600 truncate">{gig.companyName}</p>
                          </div>
                        </div>
                        
                        <span className={`px-2 py-1 rounded text-xs font-medium flex-shrink-0 ml-2 ${
                          selectedGig?._id === gig._id
                            ? "bg-orange-500 text-white"
                            : "bg-blue-100 text-blue-800"
                        }`}>
                          {gig.category}
                        </span>
                      </div>

                      {selectedGig?._id === gig._id && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>



            {/* Matching Results */}
            {selectedGig && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                    <Users size={20} className="text-orange-600" />
                    <span>Matches for "{selectedGig?.title}"</span>
                  </h3>
                </div>
                
                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="relative">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <Zap size={16} className="text-orange-500 animate-pulse" />
                      </div>
                    </div>
                  </div>
                ) : matches.length > 0 ? (
                  <div className="space-y-3">
                    {matches.map((match: Match, index: number) => {
                      const isInvited = match.isInvited !== undefined ? match.isInvited : invitedAgents.has(match.agentId);
                      const matchScore = Math.round((match.totalMatchingScore || 0) * 100);
                      const cardBgColor = matchScore >= 70 ? 'bg-green-50 border-green-200' :
                                        matchScore >= 50 ? 'bg-yellow-50 border-yellow-200' :
                                        'bg-red-50 border-red-200';
                      
                      return (
                        <div key={`match-${match.agentId}-${index}`} className={`rounded-xl p-6 border-2 hover:shadow-lg transition-all duration-300 ${cardBgColor}`}>
                          {/* Rep Header */}
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="text-lg font-bold text-gray-900 truncate">{match.agentInfo?.name}</h4>
                                <div className={`px-4 py-2 rounded-full text-sm font-bold shadow-sm ${
                                  matchScore >= 70 ? 'bg-green-500 text-white' :
                                  matchScore >= 50 ? 'bg-yellow-500 text-white' :
                                  'bg-red-500 text-white'
                                }`}>
                                  {matchScore}% Match
                                </div>
                              </div>
                              <p className="text-sm text-gray-600 truncate">{match.agentInfo?.email}</p>
                              <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                                {(match.agentInfo?.timezone?.countryName || match.agentInfo?.location) && (
                                  <span>📍 {match.agentInfo?.timezone?.countryName || match.agentInfo?.location}</span>
                                )}
                                {match.agentInfo?.timezone?.gmtDisplay && match.agentInfo.timezone.gmtDisplay !== 'Unknown' && (
                                  <span>🕒 {match.agentInfo.timezone.gmtDisplay}</span>
                                )}
                                {match.agentInfo?.professionalSummary?.yearsOfExperience && (
                                  <span>💼 {match.agentInfo.professionalSummary.yearsOfExperience.toString().replace(/\s+years?/gi, '')} years exp.</span>
                                )}
                                {match.agentInfo?.personalInfo?.languages && match.agentInfo.personalInfo.languages.length > 0 && (
                                  <span>🗣️ {match.agentInfo.personalInfo.languages.length} languages</span>
                                )}
                              </div>

                              {/* Rep Languages */}
                              {match.agentInfo?.personalInfo?.languages && match.agentInfo.personalInfo.languages.length > 0 && (
                                <div className="mt-2">
                                  <div className="flex flex-wrap gap-1">
                                    {match.agentInfo.personalInfo.languages.slice(0, 4).map((lang: any, i: number) => (
                                      <span key={i} className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                                        {lang.language?.name || lang.languageName || getLanguageNameByCode(lang.language || lang.code || lang)}
                                        {lang.proficiency && <span className="ml-1 text-purple-600">({lang.proficiency})</span>}
                                      </span>
                                    ))}
                                    {match.agentInfo.personalInfo.languages.length > 4 && (
                                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                        +{match.agentInfo.personalInfo.languages.length - 4}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex-shrink-0 ml-4">
                              {isInvited ? (
                                <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                                  Invited
                                </span>
                              ) : (
                                <button
                                  className="inline-flex items-center px-3 py-1 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-all duration-200 text-sm font-medium gap-1"
                                  onClick={() => handleCreateGigAgent(match)}
                                  disabled={creatingGigAgent}
                                >
                                  <Zap className="w-4 h-4" />
                                  Invite
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="bg-gray-50 rounded-xl p-6 max-w-md mx-auto">
                      <Briefcase size={24} className="text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">No matches found for this gig.</p>
                    </div>
                  </div>
                )}

                {/* Success/Error Messages */}
                {gigAgentSuccess && (
                  <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {gigAgentSuccess}
                    </div>
                  </div>
                )}

                {gigAgentError && (
                  <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      {gigAgentError}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default MatchingDashboard;