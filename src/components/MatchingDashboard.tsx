import React, { useState, useEffect } from "react";
import { Rep, Gig, Match, MatchingWeights } from "../types";
import {
  getReps,
  getGigs,
  findMatchesForGig,
  findGigsForRep,
  generateOptimalMatches,
  getGigsByCompanyId,
  createGigAgent,
} from "../api";
import { getAllSkills, getLanguages, type Skill, type Language } from "../api/skillsApi";
import { saveGigWeights, getGigWeights, resetGigWeights } from "../api/gigWeightsApi";

import {
  Activity,
  Users,
  Briefcase,
  Zap,
  Settings,
  Clock,
  Brain,
  Search,
} from "lucide-react";
import axios from "axios";
import Cookies from "js-cookie";
import { Toaster } from 'react-hot-toast';


const defaultMatchingWeights: MatchingWeights = {
  experience: 0.25,
  skills: 0.25,
  industry: 0.15,
  languages: 0.15,
  availability: 0.10,
  timezone: 0.10,
  activities: 0.10,
  region: 0.10,
};

type TabType = "gigs" | "reps" | "optimal";

const MatchingDashboard: React.FC = () => {
  const [reps, setReps] = useState<Rep[]>([]);
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [selectedGig, setSelectedGig] = useState<Gig | null>(null);
  const [selectedRep, setSelectedRep] = useState<Rep | null>(null);
  const [weights, setWeights] = useState<MatchingWeights>(
    defaultMatchingWeights
  );
  const [activeTab, setActiveTab] = useState<TabType>("gigs");
  const [showWeights, setShowWeights] = useState(false);
  const [matches, setMatches] = useState<Match[]>([]);
  const [gigHasWeights, setGigHasWeights] = useState(false);
  const [matchStats, setMatchStats] = useState<{
    totalMatches: number;
    perfectMatches: number;
    partialMatches: number;
    noMatches: number;
    languageStats: {
      perfectMatches: number;
      partialMatches: number;
      noMatches: number;
      totalMatches: number;
    };
    skillsStats: {
      perfectMatches: number;
      partialMatches: number;
      noMatches: number;
      totalMatches: number;
    };
    industryStats: {
      perfectMatches: number;
      partialMatches: number;
      neutralMatches: number;
      noMatches: number;
      totalMatches: number;
    };
    activityStats: {
      perfectMatches: number;
      partialMatches: number;
      neutralMatches: number;
      noMatches: number;
      totalMatches: number;
    };
    experienceStats: {
      perfectMatches: number;
      partialMatches: number;
      noMatches: number;
      totalMatches: number;
    };
    timezoneStats: {
      perfectMatches: number;
      partialMatches: number;
      noMatches: number;
      totalMatches: number;
    };
    regionStats: {
      perfectMatches: number;
      partialMatches: number;
      noMatches: number;
      totalMatches: number;
    };

  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [creatingGigAgent, setCreatingGigAgent] = useState(false);
  const [gigAgentSuccess, setGigAgentSuccess] = useState<string | null>(null);
  const [gigAgentError, setGigAgentError] = useState<string | null>(null);
  const [expandedMatches, setExpandedMatches] = useState<Set<number>>(new Set());
  const [skills, setSkills] = useState<{
    professional: Skill[];
    technical: Skill[];
    soft: Skill[];
  }>({ professional: [], technical: [], soft: [] });
  const [languages, setLanguages] = useState<Language[]>([]);
  const [shouldAutoSearch, setShouldAutoSearch] = useState(false);

  const handleTabClick = (tab: TabType) => {
    setActiveTab(tab);
    setCurrentPage(1);
    // Enable auto search for other tabs (reps and optimal)
    setShouldAutoSearch(tab !== "gigs");
  };

  const resultsTableRef = React.useRef<HTMLDivElement>(null);

  const scrollToResults = () => {
    if (resultsTableRef.current) {
      resultsTableRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const handleGigSelect = async (gig: any) => {
    console.log('🎯 GIG SELECTED:', gig.title, 'ID:', gig._id);
    setSelectedGig(gig);
    setCurrentPage(1);
    
    // Reset weights to defaults first
    setWeights(defaultMatchingWeights);
    setGigHasWeights(false);
    
    let savedWeights = null;
    
    // Check if gig has saved weights and load them into Adjust Weights
    try {
      savedWeights = await getGigWeights(gig._id || '');
      setWeights(savedWeights.matchingWeights);
      setGigHasWeights(true);
      console.log('✅ Gig has saved weights, loaded into Adjust Weights:', gig._id);
    } catch (error) {
      console.log('❌ No saved weights found for gig:', gig._id);
      setGigHasWeights(false);
    }
    
    // Clear previous matches when selecting a new gig
    setMatches([]);
    setMatchStats(null);
    
    // Automatically search for matches with current weights
    setLoading(true);
    try {
      const gigResponse = await findMatchesForGig(gig._id || '', savedWeights?.matchingWeights || defaultMatchingWeights);
      console.log('=== GIG RESPONSE AFTER SELECTION ===', gigResponse);
      
      setMatches(gigResponse.matches || gigResponse.preferedmatches || []);
      setMatchStats({
        totalMatches: gigResponse.totalMatches || 0,
        perfectMatches: gigResponse.perfectMatches || 0,
        partialMatches: gigResponse.partialMatches || 0,
        noMatches: gigResponse.noMatches || 0,
        languageStats: gigResponse.languageStats || {
          perfectMatches: 0,
          partialMatches: 0,
          noMatches: 0,
          totalMatches: 0
        },
        skillsStats: gigResponse.skillsStats || {
          perfectMatches: 0,
          partialMatches: 0,
          noMatches: 0,
          totalMatches: 0
        },
        industryStats: (gigResponse as any).industryStats || {
          perfectMatches: 0,
          partialMatches: 0,
          neutralMatches: 0,
          noMatches: 0,
          totalMatches: 0
        },
        activityStats: (gigResponse as any).activityStats || {
          perfectMatches: 0,
          partialMatches: 0,
          neutralMatches: 0,
          noMatches: 0,
          totalMatches: 0
        },
        experienceStats: (gigResponse as any).experienceStats || {
          perfectMatches: 0,
          partialMatches: 0,
          noMatches: 0,
          totalMatches: 0
        },
        timezoneStats: (gigResponse as any).timezoneStats || {
          perfectMatches: 0,
          partialMatches: 0,
          noMatches: 0,
          totalMatches: 0
        },
        regionStats: (gigResponse as any).regionStats || {
          perfectMatches: 0,
          partialMatches: 0,
          noMatches: 0,
          totalMatches: 0
        }
      });
    } catch (error) {
      console.error('Error searching for matches after gig selection:', error);
      setError("Failed to get matches. Please try again.");
    } finally {
      setLoading(false);
    }
    
    setTimeout(scrollToResults, 100);
  };

  const paginatedGigs = gigs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(
    (activeTab === "gigs" ? gigs.length : reps.length) / itemsPerPage
  );

  // Fetch reps and gigs on component mount
  useEffect(() => {
    const fetchData = async () => {
      setInitialLoading(true);
      try {
        console.log("Fetching data...");
        const companyId = Cookies.get('companyId') || '685abf28641398dc582f4c95';
        const [repsData, gigsData, skillsData, languagesData] = await Promise.all([
          getReps(),
          companyId ? getGigsByCompanyId(companyId) : getGigs(),
          getAllSkills(),
          getLanguages()
        ]);
        console.log("=== REPS DATA ===", JSON.stringify(repsData, null, 2));
        console.log("=== GIGS DATA ===", gigsData);
        console.log("=== SKILLS DATA ===", skillsData);
        console.log("=== LANGUAGES DATA ===", languagesData);
        setReps(repsData);
        setGigs(gigsData);
        setSkills(skillsData);
        setLanguages(languagesData);
        

      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to fetch data. Please try again.");
      } finally {
        setInitialLoading(false);
      }
    };

    fetchData();
  }, []);



  // Get matches based on current selection
  useEffect(() => {
    const getMatches = async () => {
      if (initialLoading) return;
      try {
        let response: any;
        if (activeTab === "reps" && selectedRep && shouldAutoSearch) {
          setLoading(true);
          response = await findGigsForRep(selectedRep._id || '', weights);
          setMatches(response.preferedmatches || response.matches || []);
          setMatchStats(null);
          setLoading(false);
        } else if (activeTab === "optimal" && shouldAutoSearch) {
          setLoading(true);
          response = await generateOptimalMatches(weights);
          setMatches(response.preferedmatches || response.matches || []);
          setMatchStats(null);
          setLoading(false);
        } else if (activeTab === "gigs" && !selectedGig) {
          // Clear matches when no gig is selected
          setMatches([]);
          setMatchStats(null);
        }
        // Note: For gigs tab, matches are now only loaded when save button is clicked
      } catch (error) {
        console.error("Error getting matches:", error);
        setError("Failed to get matches. Please try again.");
        setMatches([]);
        setMatchStats(null);
        setLoading(false);
      }
    };
    getMatches();
  }, [activeTab, selectedRep, weights, reps, initialLoading, shouldAutoSearch]);

  // Helper functions to get skill and language names
  const getSkillNameById = (skillId: string, skillType: 'professional' | 'technical' | 'soft') => {
    const skillArray = skills[skillType];
    const skill = skillArray.find(s => s._id === skillId);
    console.log(`Looking for skill ${skillId} in ${skillType}:`, skill);
    return skill ? skill.name : skillId;
  };

  const getLanguageNameByCode = (languageCode: string) => {
    // Try to find by code first
    let language = languages.find(l => l.code === languageCode);
    
    // If not found by code, try to find by ID
    if (!language) {
      language = languages.find(l => l._id === languageCode);
    }
    
    // If still not found, try to find by name (case insensitive)
    if (!language) {
      language = languages.find(l => l.name.toLowerCase() === languageCode.toLowerCase());
    }
    
    console.log(`Looking for language ${languageCode}:`, language);
    console.log(`Available languages codes:`, languages.slice(0, 5).map(l => l.code));
    console.log(`Available languages IDs:`, languages.slice(0, 5).map(l => l._id));
    
    return language ? language.name : languageCode;
  };



  // Handle weight change
  const handleWeightChange = (key: keyof MatchingWeights, value: number) => {
    setWeights((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Reset weights to default
  const resetWeights = () => {
    setWeights(defaultMatchingWeights);
  };

  // Save weights for selected gig and search
  const saveWeightsForGig = async () => {
    console.log('🚨 SAVE WEIGHTS FOR GIG CALLED');
    console.log('Stack trace:', new Error().stack);
    
    if (!selectedGig) {
      console.error('No gig selected');
      return;
    }

    console.log('🔄 MANUAL SAVE TRIGGERED - User clicked save button');
    
    // Check if gig already has saved weights
    try {
      const existingWeights = await getGigWeights(selectedGig._id || '');
      console.log('⚠️ Gig already has saved weights, skipping save operation');
      setGigHasWeights(true);
    } catch (error) {
      // No existing weights found, proceed with saving
      console.log('✅ No existing weights found, saving new weights');
      try {
        await saveGigWeights(selectedGig._id || '', weights);
        console.log('✅ Weights saved successfully for gig:', selectedGig._id);
        setGigHasWeights(true);
      } catch (saveError) {
        console.error('❌ Error saving weights:', saveError);
        return;
      }
    }
    
    // Enable auto search and trigger search with updated weights after saving
    setShouldAutoSearch(true);
    setLoading(true);
    
    try {
      const gigResponse = await findMatchesForGig(selectedGig._id || '', weights);
      console.log('=== GIG RESPONSE AFTER SAVE ===', gigResponse);
      
      setMatches(gigResponse.matches || gigResponse.preferedmatches || []);
      setMatchStats({
        totalMatches: gigResponse.totalMatches || 0,
        perfectMatches: gigResponse.perfectMatches || 0,
        partialMatches: gigResponse.partialMatches || 0,
        noMatches: gigResponse.noMatches || 0,
        languageStats: gigResponse.languageStats || {
          perfectMatches: 0,
          partialMatches: 0,
          noMatches: 0,
          totalMatches: 0
        },
        skillsStats: gigResponse.skillsStats || {
          perfectMatches: 0,
          partialMatches: 0,
          noMatches: 0,
          totalMatches: 0
        },
        industryStats: (gigResponse as any).industryStats || {
          perfectMatches: 0,
          partialMatches: 0,
          neutralMatches: 0,
          noMatches: 0,
          totalMatches: 0
        },
        activityStats: (gigResponse as any).activityStats || {
          perfectMatches: 0,
          partialMatches: 0,
          neutralMatches: 0,
          noMatches: 0,
          totalMatches: 0
        },
        experienceStats: (gigResponse as any).experienceStats || {
          perfectMatches: 0,
          partialMatches: 0,
          noMatches: 0,
          totalMatches: 0
        },
        timezoneStats: (gigResponse as any).timezoneStats || {
          perfectMatches: 0,
          partialMatches: 0,
          noMatches: 0,
          totalMatches: 0
        },
        regionStats: (gigResponse as any).regionStats || {
          perfectMatches: 0,
          partialMatches: 0,
          noMatches: 0,
          totalMatches: 0
        }
      });
      setLoading(false);
      
      // Scroll to results after search
      setTimeout(scrollToResults, 100);
    } catch (error) {
      console.error('Error in search after save:', error);
      setLoading(false);
    }
  };

  // Load weights for selected gig
  const loadWeightsForGig = async (gigId: string) => {
    try {
      const gigWeights = await getGigWeights(gigId);
      setWeights(gigWeights.matchingWeights);
      setGigHasWeights(true);
      console.log('Loaded existing weights for gig:', gigId);
    } catch (error: any) {
      console.log('No saved weights found for gig:', gigId, error?.response?.status);
      // Keep default weights if loading fails (404 means no saved weights)
      setGigHasWeights(false);
    }
  };

  // Add custom animation classes
  const fadeIn = "animate-[fadeIn_0.5s_ease-in-out]";
  const slideUp = "animate-[slideUp_0.3s_ease-out]";

  // Toggle match details visibility

  // Add this function to handle gig-agent creation
  const handleCreateGigAgent = async (match: Match) => {
    if (!selectedGig) {
      setGigAgentError("No gig selected");
      return;
    }

    setCreatingGigAgent(true);
    setGigAgentError(null);
    setGigAgentSuccess(null);

    // Debug logging
    console.log('Creating gig-agent with data:', {
      agentId: match.agentId,
      gigId: selectedGig._id,
      match: match
    });

    console.log("match object:", match);

    const requestData = {
      agentId: match.agentId,
      gigId: selectedGig._id || '',
      matchDetails: match
    };
    
    console.log('=== DONNÉES À ENVOYER ===');
    console.log('agentId:', requestData.agentId);
    console.log('gigId:', requestData.gigId);
    console.log('Match complet:', match);
    console.log('Gig sélectionné:', selectedGig);
    console.log('========================');
    
    try {
      const response = await createGigAgent(requestData);

      console.log('Gig-Agent created successfully:', response);
      
      // Close the modal after successful creation
      setTimeout(() => {
        setGigAgentSuccess(null);
      }, 3000);

    } catch (error) {
      console.error('Error creating gig-agent:', error);
      setGigAgentError('Failed to assign agent to gig. Please try again.');
    } finally {
      setCreatingGigAgent(false);
    }
  };

  if (selectedGig) {
    console.log('Selected Gig details:', selectedGig);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Toaster position="top-left" />
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-700 to-indigo-800 text-white p-6 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="bg-white/10 p-2 rounded-lg">
              <Zap size={28} className="text-yellow-300 animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">HARX Smart Matching System</h1>
              <p className="text-indigo-200 text-sm mt-1">Intelligent Talent Matching Platform</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={async () => {
                // Ajouter des console logs avant le back to onboarding
                console.log("=== BACK TO ONBOARDING TRIGGERED ===");
                console.log("Current URL:", window.location.href);
                console.log("Current timestamp:", new Date().toISOString());
                console.log("User agent:", navigator.userAgent);
                
                try {
                  const companyId = Cookies.get("companyId");
                  console.log("Company ID:", companyId);
                  console.log("Company API URL:", import.meta.env.VITE_COMPANY_API_URL);
                  
                  // Debug logs
                  if (!companyId) {
                    console.warn("No companyId found in cookies, proceeding without updating onboarding");
                    window.location.href = "/app11";
                    return;
                  }

                  if (!import.meta.env.VITE_COMPANY_API_URL) {
                    console.error("VITE_COMPANY_API_URL is not defined");
                    window.location.href = "/app11";
                    return;
                  }

                  // Marquer le step 10 de la phase 4 comme completed
                  console.log("Updating step 10 status...");
                  console.log("Step URL:", `${import.meta.env.VITE_COMPANY_API_URL}/onboarding/companies/${companyId}/onboarding/phases/3/steps/10`);
                  console.log("Step request data:", { status: "completed" });
                  
                  let stepUpdated = false;
                  
                  // Essayer d'abord phase 3, step 10
                  try {
                    const stepResponse = await axios.put(
                      `${import.meta.env.VITE_COMPANY_API_URL}/onboarding/companies/${companyId}/onboarding/phases/3/steps/10`,
                      { status: "completed" }
                    );
                    console.log("Step update response (phase 3):", stepResponse.data);
                    stepUpdated = true;
                  } catch (stepError: any) {
                    console.error("Step update error (phase 3):", stepError);
                    console.error("Step error response:", stepError.response?.data);
                    console.error("Step error status:", stepError.response?.status);
                    
                    // Essayer phase 4, step 10
                    try {
                      console.log("Trying phase 4, step 10...");
                      const stepResponse2 = await axios.put(
                        `${import.meta.env.VITE_COMPANY_API_URL}/onboarding/companies/${companyId}/onboarding/phases/4/steps/10`,
                        { status: "completed",  }
                      );
                      console.log("Step update response (phase 4):", stepResponse2.data);
                      stepUpdated = true;
                    } catch (stepError2: any) {
                      console.error("Step update error (phase 4):", stepError2);
                      console.error("Step error response (phase 4):", stepError2.response?.data);
                    }
                  }
                  
                  // Mettre à jour la phase courante vers la phase 4 (si pas déjà en phase 4)
                  console.log("Updating current phase...");
                  console.log("Phase URL:", `${import.meta.env.VITE_COMPANY_API_URL}/onboarding/companies/${companyId}/onboarding/current-phase`);
                  console.log("Phase request data:", { phase: 4 });
                  
                  try {
                    const phaseResponse = await axios.put(
                      `${import.meta.env.VITE_COMPANY_API_URL}/onboarding/companies/${companyId}/onboarding/current-phase`,
                      { phase: 4 }
                    );
                    console.log("Phase update response:", phaseResponse.data);
                  } catch (phaseError: any) {
                    console.error("Phase update error:", phaseError);
                    console.error("Phase error response:", phaseError.response?.data);
                    console.error("Phase error status:", phaseError.response?.status);
                  }
                  
                  console.log("Onboarding progress updated successfully");
                  window.location.href = "/app11";
                } catch (error: any) {
                  console.error("Error updating onboarding progress:", error);
                  console.error("Error details:", {
                    message: error?.message || "Unknown error",
                    response: error?.response?.data,
                    status: error?.response?.status
                  });
                  
                  // Continue to redirect even if API calls fail
                  window.location.href = "/app11";
                }
              }}
              className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 px-6 py-2.5 rounded-lg transition-all duration-200 text-white font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <span>Back to onboarding</span>
            </button>
            <button
              onClick={() => setShowWeights(!showWeights)}
              className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <Settings size={18} className="animate-spin-slow" />
              <span>Adjust Weights</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-6 space-y-6">


        {/* Error Message */}
        {error && (
          <div className={`bg-red-100 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg shadow-md ${fadeIn}`}>
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
          <div className="flex justify-center items-center py-12">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <Zap size={24} className="text-indigo-500 animate-pulse" />
              </div>
            </div>
          </div>
        )}

        {/* Weights Configuration Panel */}
        {showWeights && (
          <div className={`bg-white rounded-xl shadow-lg p-6 mb-6 transform transition-all duration-300 ease-in-out ${slideUp}`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
                <Settings size={20} className="text-indigo-600" />
                <span>Matching Weights Configuration</span>
              </h2>
              <div className="flex items-center space-x-3">
                <button
                  onClick={resetWeights}
                  className="text-sm bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Reset to Default</span>
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Object.entries(weights).map(([key, value]) => (
                <div key={`weight-${key}`} className="space-y-3 bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-gray-700 capitalize">
                      {key}
                    </label>
                    <span className="text-sm font-semibold text-indigo-600">
                      {Math.round(value * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={value}
                    onChange={(e) =>
                      handleWeightChange(
                        key as keyof MatchingWeights,
                        parseFloat(e.target.value)
                      )
                    }
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-4 italic">
              Note: These weights determine how much each factor contributes to the overall matching score.
            </p>
            {selectedGig && (
              <div className="mt-4 flex justify-center">
                <button
                  onClick={(e) => {
                    console.log('🎯 BUTTON CLICKED - User manually clicked save button');
                    console.log('Event:', e);
                    saveWeightsForGig();
                  }}
                  className={`text-sm px-6 py-3 rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-lg ${
                    gigHasWeights 
                      ? 'bg-green-600 hover:bg-green-700 text-white' 
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>
                    {gigHasWeights ? `Update weights & Search for ${selectedGig.title}` : `Save weights & Search for ${selectedGig.title}`}
                  </span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
          <div className="flex border-b">
            <button
              className={`flex-1 py-4 px-6 text-center font-medium transition-all duration-200 ${
                activeTab === "gigs"
                  ? "bg-indigo-600 text-white shadow-lg"
                  : "text-gray-600 hover:text-indigo-600 hover:bg-indigo-50"
              }`}
              onClick={() => handleTabClick("gigs")}
            >
              <div className="flex items-center justify-center space-x-2">
                <Briefcase size={18} />
                <span>Match Reps to Gig</span>
              </div>
            </button>
            <button
              className={`flex-1 py-4 px-6 text-center font-medium transition-all duration-200 ${
                activeTab === "reps"
                  ? "bg-indigo-600 text-white shadow-lg"
                  : "text-gray-600 hover:text-indigo-600 hover:bg-indigo-50"
              }`}
              onClick={() => handleTabClick("reps")}
              style={{ display: "none" }}
            >
              <div className="flex items-center justify-center space-x-2">
                <Users size={18} />
                <span>Find Gigs for Rep</span>
              </div>
            </button>
            <button
              className={`flex-1 py-4 px-6 text-center font-medium transition-all duration-200 ${
                activeTab === "optimal"
                  ? "bg-indigo-600 text-white shadow-lg"
                  : "text-gray-600 hover:text-indigo-600 hover:bg-indigo-50"
              }`}
              onClick={() => handleTabClick("optimal")}
            >
              <div className="flex items-center justify-center space-x-2">
                <Activity size={18} />
                <span>Optimal Matching</span>
              </div>
            </button>

          </div>
        </div>

        {/* Selection Area */}
        {activeTab === "gigs" && !loading && (
          <div className={`bg-white rounded-xl shadow-lg p-6 mb-6 transform transition-all duration-300 ${slideUp}`}>
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center space-x-2">
              <Briefcase size={24} className="text-indigo-600" />
              <span>Select a Gig to Find Matching Reps</span>
            </h2>
            
            {/* Instructions */}
            {selectedGig && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${
                      gigHasWeights ? 'text-green-800' : 'text-blue-800'
                    }`}>
                      {gigHasWeights 
                        ? `Click "Adjust Weights" to update weights for ${selectedGig.title}, then click "Update weights & Search" to refresh results`
                        : `Click "Adjust Weights" to configure weights for ${selectedGig.title}, then click "Save weights & Search" to refresh results`
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Gigs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedGigs.map((gig) => (
                <div
                  key={`gig-${gig._id}`}
                  className={`border rounded-xl p-6 cursor-pointer transition-all duration-200 transform hover:-translate-y-1 ${
                    selectedGig?._id === gig._id
                      ? "border-2 border-indigo-600 bg-indigo-50 ring-2 ring-indigo-600 ring-opacity-50 shadow-lg"
                      : "border-gray-200 hover:border-indigo-600 hover:shadow-md"
                  }`}
                  onClick={() => handleGigSelect(gig)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3
                      className={`font-medium text-lg ${
                        selectedGig?._id === gig._id
                          ? "text-indigo-900"
                          : "text-gray-800"
                      }`}
                    >
                      {gig.title}
                    </h3>
                    <span className="text-xs px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">
                      {gig.category}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">
                    {gig.companyName}
                  </p>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Clock size={16} className="text-gray-400" />
                      <p>Required Experience: {gig.seniority?.yearsExperience}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Activity size={16} className="text-gray-400" />
                      <p>
                        Expected Conversion:{" "}
                        {gig.expectedConversionRate
                          ? `${(gig.expectedConversionRate * 100).toFixed(1)}%`
                          : "N/A"}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p>Region: {gig.targetRegion || "Any"}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-b-xl mt-6">
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                  <div>
                    {(() => {
                      const totalItems = activeTab === "gigs" ? gigs.length : reps.length;
                      const startIdx = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
                      const endIdx = Math.min(currentPage * itemsPerPage, totalItems);
                      return (
                        <p className="text-sm text-gray-700">
                          Showing <span className="font-medium">{startIdx}</span> to <span className="font-medium">{endIdx}</span> of <span className="font-medium">{totalItems}</span> results
                        </p>
                      );
                    })()}
                  </div>
                  <div>
                    <nav
                      className="isolate inline-flex -space-x-px rounded-lg shadow-sm"
                      aria-label="Pagination"
                    >
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={`page-${page}`}
                          onClick={() => setCurrentPage(page)}
                          className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold border border-gray-300 transition-all duration-200 ${
                            currentPage === page
                              ? "z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                              : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0"
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </nav>
                  </div>
                </div>
              </div>
            )}


          </div>
        )}



        {/* Results Area */}
        <div ref={resultsTableRef} className={`bg-white rounded-xl shadow-lg p-6 mb-6 relative transform transition-all duration-300 ${slideUp}`}>
          {loading && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-20 rounded-xl">
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <Zap size={24} className="text-indigo-500 animate-pulse" />
                </div>
              </div>
            </div>
          )}
          {aiLoading ? (
            <div className="flex items-center justify-center space-x-3 text-gray-600 py-8">
              <Brain className="animate-spin" size={24} />
              <span className="text-lg">AI is analyzing matches...</span>
            </div>
          ) : (
            <>
              {console.log('=== RENDERING MATCHES ===', matches)}
              {console.log('=== MATCHES LENGTH IN RENDER ===', matches.length)}
              {matches.length > 0 && matches[0]?.agentInfo?.languages && 
                console.log('=== LANGUAGE IDs IN MATCHING DATA ===', matches[0].agentInfo.languages.map((l: any) => l.language))
              }
              {matches.length > 0 ? (
                <>
                  {activeTab === "gigs" && selectedGig && (
                    <div className="mb-8">
                      <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center space-x-3">
                        <Briefcase size={28} className="text-indigo-600" />
                        <span>Top Matching for "{selectedGig.title}"</span>
                      </h2>
                      <p className="text-lg text-gray-600 flex items-center space-x-2">
                        <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
                          {matches.length} {matches.length === 1 ? 'Match' : 'Matches'} Found
                        </span>
                      </p>
                    </div>
                  )}
                  <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-100">
                    <table className="min-w-full bg-white">
                      <thead className="bg-indigo-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">Personal Info</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">Languages</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">Skills</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">Industries</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">Activities</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">Availability</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">Experience</th>
                          <th className="px-6 py-4 text-center text-xs font-bold text-indigo-700 uppercase tracking-wider">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {matches.map((match, index) => (
                          <React.Fragment key={index}>
                            <tr 
                              className="hover:bg-indigo-50 transition-all duration-200"
                            >
                            <td className="px-6 py-4">
                              <div className="flex items-start space-x-4">
                                {match.agentInfo?.photo ? (
                                  <img src={match.agentInfo.photo} alt="avatar" className="w-14 h-14 rounded-full border-2 border-indigo-100 shadow-sm" />
                                ) : (
                                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                                    {match.agentInfo?.name?.[0] || "?"}
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="font-bold text-gray-900 text-lg mb-1">{match.agentInfo?.name}</div>
                                  <div className="text-sm text-gray-600 mb-2 flex items-center">
                                    <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    {match.agentInfo?.email}
                                  </div>
                                  {/* TIMEZONE SIMPLIFIÉ */}
                                  <div className="mt-2 flex items-center space-x-2 text-sm text-gray-700">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>
                                      {match.agentInfo?.timezone?.timezoneName} ({match.agentInfo?.timezone?.gmtDisplay})
                                    </span>
                                  </div>
                                  {/* REGION */}
                                  <div className="flex items-center space-x-2 text-sm text-gray-700 mt-1">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>
                                      {match.agentInfo?.timezone?.countryName || "N/A"}
                                    </span>
                                  </div>
                                  {/* FIN REGION */}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {/* LANGUAGES SIMPLIFIÉ */}
                              {match.agentInfo?.languages?.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                  {match.agentInfo.languages.map((lang: { language: string; proficiency?: string }, i: number) => {
                                    let levelLabel = '';
                                    if (lang.proficiency) {
                                      if (["A1", "A2"].includes(lang.proficiency)) levelLabel = 'Beginner';
                                      else if (["B1", "B2"].includes(lang.proficiency)) levelLabel = 'Intermediate';
                                      else if (["C1", "C2"].includes(lang.proficiency)) levelLabel = 'Advanced';
                                    }
                                    
                                    // Try to get the language name from our languages data
                                    const languageName = getLanguageNameByCode(lang.language);
                                    
                                    // Debug: Log language lookup
                                    console.log(`Language lookup: ${lang.language} -> ${languageName}`);
                                    
                                    return (
                                      <span key={i} className="px-2 py-1 rounded text-xs bg-blue-50 text-blue-800 border border-blue-200">
                                        {languageName}
                                        {lang.proficiency && ` (${lang.proficiency}${levelLabel ? ' - ' + levelLabel : ''})`}
                                      </span>
                                    );
                                  })}
                                </div>
                              ) : (
                                <div className="text-gray-400 text-sm">No languages specified</div>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              {/* SKILLS SIMPLIFIÉ */}
                              {match.skillsMatch?.details?.matchingSkills?.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                  {match.skillsMatch.details.matchingSkills.map((skill: { skill: string; skillName: string; type: string }, i: number) => {
                                    // Try to get the skill name from our skills data
                                    const skillName = skill.type && skill.skill ? 
                                      getSkillNameById(skill.skill, skill.type as 'professional' | 'technical' | 'soft') : 
                                      skill.skillName || skill.skill;
                                    
                                    // Determine color based on skill type
                                    let bgColor = 'bg-gray-100';
                                    let textColor = 'text-gray-800';
                                    let borderColor = 'border-gray-200';
                                    
                                    if (skill.type === 'professional') {
                                      bgColor = 'bg-blue-100';
                                      textColor = 'text-blue-800';
                                      borderColor = 'border-blue-200';
                                    } else if (skill.type === 'technical') {
                                      bgColor = 'bg-green-100';
                                      textColor = 'text-green-800';
                                      borderColor = 'border-green-200';
                                    } else if (skill.type === 'soft') {
                                      bgColor = 'bg-purple-100';
                                      textColor = 'text-purple-800';
                                      borderColor = 'border-purple-200';
                                    }
                                    
                                    return (
                                      <span key={i} className={`px-2 py-1 rounded text-xs ${bgColor} ${textColor} border ${borderColor}`}>
                                        {skillName}
                                        {skill.type && <span className="text-xs opacity-75 ml-1">({skill.type})</span>}
                                      </span>
                                    );
                                  })}
                                </div>
                              ) : (
                                <div className="text-gray-400 text-sm">No matching skills</div>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              {/* INDUSTRIES */}
                              {match.industryMatch?.details?.matchingIndustries?.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                  {match.industryMatch.details.matchingIndustries.map((industry: { industryName: string }, i: number) => (
                                    <span key={i} className="px-2 py-1 rounded text-xs text-green-800 bg-green-100 border border-green-200">
                                      {industry.industryName}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-gray-400 text-sm">No matching industries</div>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              {/* ACTIVITIES */}
                              {match.activityMatch?.details?.matchingActivities?.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                  {match.activityMatch.details.matchingActivities.map((activity: { activityName: string }, i: number) => (
                                    <span key={i} className="px-2 py-1 rounded text-xs text-purple-800 bg-purple-100 border border-purple-200">
                                      {activity.activityName}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-gray-400 text-sm">No matching activities</div>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              {/* AVAILABILITY */}
                              {match.availabilityMatch ? (
                                <div className="flex flex-col gap-1">
                                  <div className="text-sm font-medium text-gray-900">
                                    {match.availabilityMatch.details.matchingDays.length} days match
                                  </div>
                                  <div className="text-xs text-gray-600">
                                    Score: {(match.availabilityMatch.score * 100).toFixed(1)}%
                                  </div>
                                  <div className={`text-xs px-2 py-1 rounded ${
                                    match.availabilityMatch.matchStatus === 'perfect_match' 
                                      ? 'bg-green-100 text-green-800' 
                                      : match.availabilityMatch.matchStatus === 'partial_match'
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-red-100 text-red-800'
                                  }`}>
                                    {match.availabilityMatch.matchStatus === 'perfect_match' ? '✓ Perfect' : 
                                     match.availabilityMatch.matchStatus === 'partial_match' ? '~ Partial' : '✗ No Match'}
                                  </div>
                                </div>
                              ) : (
                                <div className="text-gray-400 text-sm">No availability data</div>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              {/* EXPERIENCE */}
                              {match.experienceMatch ? (
                                <div className="flex flex-col gap-1">
                                  <div className="text-sm font-medium text-gray-900">
                                    {match.experienceMatch.details.agentExperience} years
                                  </div>
                                  <div className="text-xs text-gray-600">
                                    Required: {match.experienceMatch.details.gigRequiredExperience} years
                                  </div>
                                  <div className={`text-xs px-2 py-1 rounded ${
                                    match.experienceMatch.matchStatus === 'perfect_match' 
                                      ? 'bg-green-100 text-green-800' 
                                      : match.experienceMatch.matchStatus === 'partial_match'
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-red-100 text-red-800'
                                  }`}>
                                    {match.experienceMatch.matchStatus === 'perfect_match' ? '✓ Perfect' : 
                                     match.experienceMatch.matchStatus === 'partial_match' ? '~ Partial' : '✗ No Match'}
                                  </div>
                                </div>
                              ) : (
                                <div className="text-gray-400 text-sm">No experience data</div>
                              )}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <button
                                className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-500 to-violet-600 text-white rounded-lg shadow-md hover:from-blue-600 hover:to-violet-700 transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-lg font-semibold text-base gap-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                                onClick={() => handleCreateGigAgent(match)}
                                title="Inviter cet agent à ce gig"
                              >
                                <Zap className="w-5 h-5 mr-1 animate-pulse" />
                                Invite
                              </button>
                            </td>
                          </tr>
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>

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
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="bg-gray-50 rounded-xl p-8 max-w-md mx-auto">
                    <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Briefcase size={24} className="text-indigo-600" />
                    </div>
                    <p className="text-gray-600 text-lg mb-2">No matches found yet.</p>
                    {activeTab === "gigs" && (
                      <p className="text-sm text-gray-400">
                        Select a gig to find matching reps.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 p-8 mt-12">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="bg-indigo-600/20 p-2 rounded-lg">
                <Zap size={20} className="text-yellow-400" />
              </div>
              <div>
                <span className="text-white font-medium text-lg">HARX Smart Matching System</span>
                <p className="text-sm text-gray-500 mt-1">Intelligent Talent Matching Platform</p>
              </div>
            </div>
            <div className="text-sm">© 2025 HARX. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MatchingDashboard;