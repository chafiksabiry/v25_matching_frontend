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
// Local function to get gig agents for a specific gig
const getGigAgentsForGig = async (gigId: string): Promise<any[]> => {
  try {
    const MATCHING_API_URL = import.meta.env.VITE_MATCHING_API_URL || 'https://api-matching.harx.ai/api';
    const response = await fetch(`${MATCHING_API_URL}/gig-agents/gig/${gigId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch gig agents');
    }
    return await response.json();
  } catch (error: any) {
    console.error('Error fetching gig agents for gig:', error);
    throw error;
  }
};
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
  experience: 0.20,
  skills: 0.20,
  industry: 0.15,
  languages: 0.15,
  availability: 0.10,
  timezone: 0.10,
  activities: 0.10,
  region: 0.10,
};

type TabType = "gigs" | "reps" | "optimal";

const MatchingDashboard: React.FC = () => {
  // Debug component mounting
  useEffect(() => {
    console.log('🚀 COMPONENT MOUNTED');
    return () => {
      console.log('💀 COMPONENT UNMOUNTED');
    };
  }, []);

  const [reps, setReps] = useState<Rep[]>([]);
  const [gigs, setGigs] = useState<Gig[]>([]);
  
  // Debug gigs state changes
  useEffect(() => {
    console.log('🔍 GIGS STATE CHANGED:', gigs.length, gigs);
  }, [gigs]);
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
  
  // Debug loading state changes
  useEffect(() => {
    console.log('⏳ LOADING STATE CHANGED:', loading);
  }, [loading]);
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
  const [invitedAgents, setInvitedAgents] = useState<Set<string>>(new Set());
  
  // Track last search parameters to avoid unnecessary API calls
  const [lastSearchedGigId, setLastSearchedGigId] = useState<string | null>(null);
  const [lastSearchedWeights, setLastSearchedWeights] = useState<MatchingWeights | null>(null);
  const [lastSearchedTab, setLastSearchedTab] = useState<TabType | null>(null);
  const [lastSearchedRepId, setLastSearchedRepId] = useState<string | null>(null);

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
    
    // Don't reset weights to defaults - keep current weights
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
      // Keep current weights instead of resetting to defaults
    }
    
    // Clear previous matches when selecting a new gig
    setMatches([]);
    setMatchStats(null);
    
    // Fetch invited agents for this gig
    try {
      const gigAgents = await getGigAgentsForGig(gig._id || '');
      const invitedAgentIds = new Set<string>(gigAgents.map((ga: any) => ga.agentId as string));
      setInvitedAgents(invitedAgentIds);
      console.log('📧 Invited agents for gig:', invitedAgentIds);
    } catch (error) {
      console.error('Error fetching invited agents:', error);
      setInvitedAgents(new Set<string>());
    }
    
    // Enable auto search to trigger automatic search
    setShouldAutoSearch(true);
    
    setTimeout(scrollToResults, 100);
  };

  const paginatedGigs = gigs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // Debug pagination
  console.log('🔍 GIGS DEBUG:', {
    totalGigs: gigs.length,
    currentPage,
    itemsPerPage,
    paginatedGigs: paginatedGigs.length,
    gigsData: gigs
  });
  
  const totalPages = Math.ceil(
    (activeTab === "gigs" ? gigs.length : reps.length) / itemsPerPage
  );

  // Fetch reps and gigs on component mount
  useEffect(() => {
    console.log('🔄 FETCH DATA EFFECT TRIGGERED');
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
        
        // Debug gigs before setting state
        console.log('🎯 GIGS DEBUG BEFORE STATE:', {
          isArray: Array.isArray(gigsData),
          length: gigsData?.length,
          firstGig: gigsData?.[0],
          gigStructure: gigsData?.[0] ? Object.keys(gigsData[0]) : 'No gig'
        });
        
        setReps(repsData);
        setGigs(gigsData);
        setSkills(skillsData);
        setLanguages(languagesData);
        
        // Debug gigs after setting state
        console.log('🎯 GIGS DEBUG AFTER STATE SET');
        setTimeout(() => {
          console.log('🎯 GIGS STATE:', gigs);
        }, 100);
        

      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to fetch data. Please try again.");
      } finally {
        setInitialLoading(false);
      }
    };

    fetchData();
  }, []);



  // Fetch matches based on selected tab and criteria
  useEffect(() => {
    const getMatches = async () => {
      // Skip if still loading initial data
      if (initialLoading) return;
      
      // Check if parameters have actually changed to avoid unnecessary API calls
      const currentGigId = selectedGig?._id || null;
      const currentRepId = selectedRep?._id || null;
      
      const parametersChanged = 
        lastSearchedTab !== activeTab ||
        lastSearchedGigId !== currentGigId ||
        lastSearchedRepId !== currentRepId ||
        (activeTab === "gigs" && currentGigId && JSON.stringify(lastSearchedWeights) !== JSON.stringify(weights)) ||
        shouldAutoSearch; // Always search if shouldAutoSearch is true
      
      if (!parametersChanged) {
        console.log('🔄 Skipping search - parameters unchanged');
        return;
      }
      
      console.log('🔄 Parameters changed, triggering search');
      console.log('Current tab:', activeTab);
      console.log('Current gig ID:', currentGigId);
      console.log('Current rep ID:', currentRepId);
      console.log('Current weights:', weights);
      
      setLoading(true);
      setError(null);
      
      try {
        if (activeTab === "gigs" && selectedGig) {
          console.log("Searching for reps matching gig:", selectedGig.title);
          const matchesData = await findMatchesForGig(selectedGig._id || '', weights);
          console.log("=== MATCHES DATA ===", matchesData);
          setMatches(matchesData.preferedmatches || []);
          setMatchStats({
            totalMatches: matchesData.totalMatches || 0,
            perfectMatches: matchesData.perfectMatches || 0,
            partialMatches: matchesData.partialMatches || 0,
            noMatches: matchesData.noMatches || 0,
            languageStats: matchesData.languageStats || {
              perfectMatches: 0,
              partialMatches: 0,
              noMatches: 0,
              totalMatches: 0
            },
            skillsStats: matchesData.skillsStats || {
              perfectMatches: 0,
              partialMatches: 0,
              noMatches: 0,
              totalMatches: 0
            },
            industryStats: (matchesData as any).industryStats || {
              perfectMatches: 0,
              partialMatches: 0,
              neutralMatches: 0,
              noMatches: 0,
              totalMatches: 0
            },
            activityStats: (matchesData as any).activityStats || {
              perfectMatches: 0,
              partialMatches: 0,
              neutralMatches: 0,
              noMatches: 0,
              totalMatches: 0
            },
            experienceStats: (matchesData as any).experienceStats || {
              perfectMatches: 0,
              partialMatches: 0,
              noMatches: 0,
              totalMatches: 0
            },
            timezoneStats: (matchesData as any).timezoneStats || {
              perfectMatches: 0,
              partialMatches: 0,
              noMatches: 0,
              totalMatches: 0
            },
            regionStats: (matchesData as any).regionStats || {
              perfectMatches: 0,
              partialMatches: 0,
              noMatches: 0,
              totalMatches: 0
            },
            availabilityStats: (matchesData as any).availabilityStats || {
              perfectMatches: 0,
              partialMatches: 0,
              noMatches: 0,
              totalMatches: 0
            }
          } as any);
          
          // Update last search parameters after successful search
          setLastSearchedTab(activeTab);
          setLastSearchedGigId(currentGigId);
          setLastSearchedRepId(currentRepId);
          setLastSearchedWeights(JSON.parse(JSON.stringify(weights))); // Deep copy
          setShouldAutoSearch(false);
          
        } else if (activeTab === "reps" && selectedRep) {
          console.log("Searching for gigs matching rep:", selectedRep.personalInfo.name);
          const matchesData = await findGigsForRep(selectedRep._id || '', weights);
          console.log("=== MATCHES DATA ===", matchesData);
          setMatches(matchesData.matches || []);
          setMatchStats(null); // findGigsForRep doesn't return stats
          
          // Update last search parameters after successful search
          setLastSearchedTab(activeTab);
          setLastSearchedGigId(currentGigId);
          setLastSearchedRepId(currentRepId);
          setLastSearchedWeights(JSON.parse(JSON.stringify(weights))); // Deep copy
          setShouldAutoSearch(false);
          
        } else if (activeTab === "optimal") {
          console.log("Generating optimal matches...");
          const matchesData = await generateOptimalMatches(weights);
          console.log("=== OPTIMAL MATCHES DATA ===", matchesData);
          setMatches(matchesData.matches || []);
          setMatchStats(null); // generateOptimalMatches doesn't return stats
          
          // Update last search parameters after successful search
          setLastSearchedTab(activeTab);
          setLastSearchedGigId(currentGigId);
          setLastSearchedRepId(currentRepId);
          setLastSearchedWeights(JSON.parse(JSON.stringify(weights))); // Deep copy
          setShouldAutoSearch(false);
          
        } else if (activeTab === "gigs" && !selectedGig) {
          // Clear matches when no gig is selected
          setMatches([]);
          setMatchStats(null);
          setLoading(false); // Important: Reset loading state when no gig is selected
        }
      } catch (error) {
        console.error("Error getting matches:", error);
        setError("Failed to get matches. Please try again.");
        setMatches([]);
        setMatchStats(null);
      } finally {
        // Always reset loading state regardless of success or error
        setLoading(false);
      }
    };
    getMatches();
  }, [activeTab, selectedRep, selectedGig, weights, reps, initialLoading, shouldAutoSearch, lastSearchedTab, lastSearchedGigId, lastSearchedRepId, lastSearchedWeights]);

  // Fetch invited agents when matches are loaded for a gig
  useEffect(() => {
    const fetchInvitedAgents = async () => {
      if (activeTab === "gigs" && selectedGig && matches.length > 0) {
        try {
          const gigAgents = await getGigAgentsForGig(selectedGig._id || '');
          const invitedAgentIds = new Set<string>(gigAgents.map((ga: any) => ga.agentId as string));
          setInvitedAgents(invitedAgentIds);
          console.log('📧 Invited agents for gig (matches loaded):', invitedAgentIds);
        } catch (error) {
          console.error('Error fetching invited agents:', error);
          setInvitedAgents(new Set<string>());
        }
      }
    };
    
    fetchInvitedAgents();
  }, [activeTab, selectedGig, matches]);

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
    
    // Auto-search when weights change if a gig is selected
    if (selectedGig && activeTab === "gigs") {
      setShouldAutoSearch(true);
      // Remove searchTrigger increment - we'll use parameter comparison instead
    }
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
    
    // Always try to save weights first (create or update)
    try {
      await saveGigWeights(selectedGig._id || '', weights);
      console.log('✅ Weights saved successfully for gig:', selectedGig._id);
      setGigHasWeights(true);
    } catch (saveError) {
      console.error('❌ Error saving weights:', saveError);
      // Continue with search even if saving fails
    }
    
    // Enable auto search and trigger search with current weights
    setShouldAutoSearch(true);
    setLoading(true);
    
    try {
      const gigResponse = await findMatchesForGig(selectedGig._id || '', weights);
      console.log('=== GIG RESPONSE AFTER SAVE ===', gigResponse);
      
      setMatches(gigResponse.preferedmatches || gigResponse.matches || []);
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
      
      // Fetch invited agents after getting matches
      try {
        const gigAgents = await getGigAgentsForGig(selectedGig._id || '');
        const invitedAgentIds = new Set<string>(gigAgents.map((ga: any) => ga.agentId as string));
        setInvitedAgents(invitedAgentIds);
        console.log('📧 Invited agents for gig (after save):', invitedAgentIds);
      } catch (error) {
        console.error('Error fetching invited agents after save:', error);
        setInvitedAgents(new Set<string>());
      }
      
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
      
      // Add agent to invited list
      setInvitedAgents(prev => new Set([...prev, match.agentId]));
      
      // Update the match object to mark it as invited
      setMatches(prevMatches => 
        prevMatches.map(m => 
          m.agentId === match.agentId 
            ? { ...m, isInvited: true }
            : m
        )
      );
      
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
              onClick={async (e) => {
                // Prevent multiple clicks
                e.currentTarget.disabled = true;
                e.currentTarget.innerHTML = '<div class="flex items-center space-x-2"><div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div><span>Updating...</span></div>';
                
                console.log("=== BACK TO ONBOARDING TRIGGERED ===");
                console.log("🌐 Current URL:", window.location.href);
                console.log("⏰ Current timestamp:", new Date().toISOString());
                console.log("🔍 User Agent:", navigator.userAgent);
                console.log("📍 Window location details:", {
                  href: window.location.href,
                  pathname: window.location.pathname,
                  search: window.location.search,
                  hash: window.location.hash,
                  origin: window.location.origin
                });
                
                try {
                  const companyId = Cookies.get("companyId");
                  console.log("🍪 Company ID:", companyId);
                  console.log("🌐 Company API URL:", import.meta.env.VITE_COMPANY_API_URL);
                  
                  // Debug all available cookies
                  console.log("🍪 All cookies:", document.cookie);
                  console.log("🍪 Available cookie keys:", Object.keys(Cookies.get()));
                  
                  // Debug environment variables
                  console.log("🔧 Environment variables:", {
                    NODE_ENV: import.meta.env.NODE_ENV,
                    MODE: import.meta.env.MODE,
                    VITE_COMPANY_API_URL: import.meta.env.VITE_COMPANY_API_URL,
                    VITE_MATCHING_API_URL: import.meta.env.VITE_MATCHING_API_URL
                  });
                  
                  if (!companyId) {
                    console.warn("⚠️ No companyId found in cookies, proceeding without updating onboarding");
                    window.location.href = "/app11";
                    return;
                  }

                  if (!import.meta.env.VITE_COMPANY_API_URL) {
                    console.error("❌ VITE_COMPANY_API_URL is not defined");
                    window.location.href = "/app11";
                    return;
                  }

                  // Step 1: Récupérer l'état actuel de l'onboarding
                  console.log("📊 Fetching current onboarding state...");
                  let currentOnboardingState = null;
                  try {
                    const stateResponse = await axios.get(
                      `${import.meta.env.VITE_COMPANY_API_URL}/onboarding/companies/${companyId}/onboarding`
                    );
                    currentOnboardingState = stateResponse.data;
                    console.log("✅ Current onboarding state:", currentOnboardingState);
                  } catch (stateError: any) {
                    console.warn("⚠️ Could not fetch onboarding state:", stateError.response?.data);
                  }

                  // Step 2: Mettre à jour le step approprié
                  console.log("🔄 Updating onboarding step...");
                  let stepUpdated = false;
                  const stepsToTry = [
                    { phase: 3, step: 10, name: "Phase 3, Step 10" },
                    { phase: 4, step: 10, name: "Phase 4, Step 10" },
                    { phase: 3, step: 9, name: "Phase 3, Step 9" },
                    { phase: 4, step: 9, name: "Phase 4, Step 9" }
                  ];

                  for (const stepConfig of stepsToTry) {
                    try {
                      console.log(`🎯 Trying to update ${stepConfig.name}...`);
                      const stepResponse = await axios.put(
                        `${import.meta.env.VITE_COMPANY_API_URL}/onboarding/companies/${companyId}/onboarding/phases/${stepConfig.phase}/steps/${stepConfig.step}`,
                        { 
                          status: "completed",
                          updatedAt: new Date().toISOString(),
                          source: "matching-dashboard"
                        }
                      );
                      console.log(`✅ Successfully updated ${stepConfig.name}:`, stepResponse.data);
                      stepUpdated = true;
                      break;
                    } catch (stepError: any) {
                      console.log(`❌ Failed to update ${stepConfig.name}:`, stepError.response?.status, stepError.response?.data?.message);
                      // Continue to next step configuration
                    }
                  }

                  if (stepUpdated) {
                    console.log("✅ Step successfully updated!");
                  } else {
                    console.warn("⚠️ No step could be updated, but continuing...");
                  }

                  // Step 3: Mettre à jour la phase courante
                  console.log("🔄 Updating current phase...");
                  const phasesToTry = [4, 5]; // Try phase 4 first, then 5
                  let phaseUpdated = false;

                  for (const targetPhase of phasesToTry) {
                    try {
                      console.log(`🎯 Trying to update to phase ${targetPhase}...`);
                      const phaseResponse = await axios.put(
                        `${import.meta.env.VITE_COMPANY_API_URL}/onboarding/companies/${companyId}/onboarding/current-phase`,
                        { 
                          phase: targetPhase,
                          updatedAt: new Date().toISOString(),
                          source: "matching-dashboard"
                        }
                      );
                      console.log(`✅ Successfully updated to phase ${targetPhase}:`, phaseResponse.data);
                      phaseUpdated = true;
                      break;
                    } catch (phaseError: any) {
                      console.log(`❌ Failed to update to phase ${targetPhase}:`, phaseError.response?.status, phaseError.response?.data?.message);
                      // Continue to next phase
                    }
                  }

                  if (phaseUpdated) {
                    console.log("✅ Phase successfully updated!");
                  } else {
                    console.warn("⚠️ No phase could be updated, but continuing...");
                  }

                  // Step 4: Vérifier l'état final
                  try {
                    console.log("🔍 Verifying final onboarding state...");
                    const finalStateResponse = await axios.get(
                      `${import.meta.env.VITE_COMPANY_API_URL}/onboarding/companies/${companyId}/onboarding`
                    );
                    console.log("✅ Final onboarding state:", finalStateResponse.data);
                  } catch (verifyError: any) {
                    console.warn("⚠️ Could not verify final state:", verifyError.response?.data);
                  }

                  console.log("🎉 Onboarding update process completed successfully!");
                  
                  // Debug summary before redirect
                  console.log("=== DEBUG SUMMARY BEFORE REDIRECT ===");
                  console.log("✅ Step updated:", stepUpdated);
                  console.log("✅ Phase updated:", phaseUpdated);
                  console.log("🍪 Company ID:", companyId);
                  console.log("🌐 API URL:", import.meta.env.VITE_COMPANY_API_URL);
                  console.log("🎯 Target redirect:", "/app11");
                  console.log("⏰ Current time:", new Date().toISOString());
                  console.log("🔍 Current URL before redirect:", window.location.href);
                  console.log("📊 Success rates:", {
                    stepUpdateSuccess: stepUpdated,
                    phaseUpdateSuccess: phaseUpdated,
                    overallSuccess: stepUpdated || phaseUpdated
                  });
                  console.log("===================================");
                  
                  // Small delay for user feedback
                  setTimeout(() => {
                    console.log("🚀 REDIRECTING NOW to /app11...");
                    window.location.href = "/app11";
                  }, 1000); // Increased delay to see debug info

                } catch (error: any) {
                  console.error("💥 Error updating onboarding progress:", error);
                  console.error("Error details:", {
                    message: error?.message || "Unknown error",
                    response: error?.response?.data,
                    status: error?.response?.status
                  });
                  
                  // Debug summary in error case
                  console.log("=== DEBUG SUMMARY (ERROR CASE) ===");
                  console.log("❌ Error occurred during update process");
                  console.log("🍪 Company ID:", companyId);
                  console.log("🌐 API URL:", import.meta.env.VITE_COMPANY_API_URL);
                  console.log("🎯 Target redirect:", "/app11");
                  console.log("⏰ Current time:", new Date().toISOString());
                  console.log("🔍 Current URL before redirect:", window.location.href);
                  console.log("💥 Error type:", error?.constructor?.name);
                  console.log("💥 Error message:", error?.message);
                  console.log("💥 HTTP Status:", error?.response?.status);
                  console.log("===================================");
                  
                  // Re-enable button and show error state
                  e.currentTarget.disabled = false;
                  e.currentTarget.innerHTML = '<span>⚠️ Error - Redirecting...</span>';
                  
                  // Continue to redirect even if API calls fail
                  setTimeout(() => {
                    console.log("🚀 REDIRECTING NOW to /app11 (after error)...");
                    window.location.href = "/app11";
                  }, 2000); // Slightly longer delay to see error debug info
                }
              }}
              className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 px-6 py-2.5 rounded-lg transition-all duration-200 text-white font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
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
                    {gigHasWeights ? `Save updated weights for ${selectedGig.title}` : `Save weights for ${selectedGig.title}`}
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
        {console.log('🔍 GIGS SECTION CONDITIONS:', { activeTab, loading, initialLoading })}
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
                        ? `Click "Adjust Weights" to update weights for ${selectedGig.title}. Results will update automatically when you change weights. Use "Update weights & Search" to save your changes.`
                        : `Click "Adjust Weights" to configure weights for ${selectedGig.title}. Results will update automatically when you change weights. Use "Save weights & Search" to save your changes.`
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Gigs Grid */}
            {console.log('🎯 RENDERING GIGS:', { paginatedGigs, activeTab, loading })}
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
                                </div>
                              ) : (
                                <div className="text-gray-400 text-sm">No experience data</div>
                              )}
                            </td>
                            <td className="px-6 py-4 text-center">
                              {(() => {
                                // Utiliser l'information isInvited du backend si disponible, sinon utiliser le state local
                                const isInvited = match.isInvited !== undefined ? match.isInvited : invitedAgents.has(match.agentId);
                                console.log(`🔍 Agent ${match.agentId} invited status:`, isInvited, 'From backend:', match.isInvited, 'From local state:', invitedAgents.has(match.agentId));
                                return isInvited ? (
                                  <div className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg shadow-md font-semibold text-base gap-2">
                                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                    Invited
                                  </div>
                                ) : (
                                  <button
                                    className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-500 to-violet-600 text-white rounded-lg shadow-md hover:from-blue-600 hover:to-violet-700 transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-lg font-semibold text-base gap-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                                    onClick={() => handleCreateGigAgent(match)}
                                    title="Inviter cet agent à ce gig"
                                  >
                                    <Zap className="w-5 h-5 mr-1 animate-pulse" />
                                    Invite
                                  </button>
                                );
                              })()}
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