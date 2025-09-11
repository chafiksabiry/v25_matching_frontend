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

function RepMatchingPanel() {
  const [reps, setReps] = useState<Rep[]>([]);
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [selectedGig, setSelectedGig] = useState<Gig | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showWeights, setShowWeights] = useState(true);
  const [weights, setWeights] = useState<MatchingWeights>({
    experience: 0,
    skills: 0,
    industry: 0,
    languages: 0,
    availability: 0,
    timezone: 0,
    activities: 0,
    region: 0,
  });
  const [matchStats, setMatchStats] = useState<MatchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [invitedAgents, setInvitedAgents] = useState<Set<string>>(new Set());
  const [companyInvitedAgents, setCompanyInvitedAgents] = useState<any[]>([]);
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
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [originalWeights, setOriginalWeights] = useState<MatchingWeights | null>(null);
  const [activeSection, setActiveSection] = useState<'matching' | 'invited' | 'enrollment' | 'active'>('matching');
  const [expandedReps, setExpandedReps] = useState<Set<string>>(new Set());
  const [expandedGigs, setExpandedGigs] = useState<Set<string>>(new Set());
  const [invitedAgentsList, setInvitedAgentsList] = useState<any[]>([]);
  const [enrollmentRequests, setEnrollmentRequests] = useState<any[]>([]);
  const [activeAgentsList, setActiveAgentsList] = useState<any[]>([]);

  // Fetch data from real backend


  useEffect(() => {
    const fetchData = async () => {
      setInitialLoading(true);
      setError(null);
      
      try {
        console.log("Fetching data from backend...");
        
        const companyId = Cookies.get('companyId') || '685abf28641398dc582f4c95';
        
        // Load essential data first
        const [gigsData, invitedAgentsData, enrollmentRequestsData, activeAgentsData] = await Promise.all([
          companyId ? getGigsByCompanyId(companyId) : getGigs(),
          getInvitedAgentsForCompany(companyId),
          getEnrollmentRequestsForCompany(companyId),
          getActiveAgentsForCompany(companyId)
        ]);
        
        // Set essential data
        setGigs(gigsData);
        setCompanyInvitedAgents(invitedAgentsData);
        setEnrollmentRequests(enrollmentRequestsData);
        setActiveAgentsList(activeAgentsData);
        
        // Then load secondary data
        const [representativesData, skillsData, languagesData] = await Promise.all([
          getReps(),
          getAllSkills(),
          getLanguages()
        ]);
        
        // Set secondary data
        setReps(representativesData);
        setSkills(skillsData);
        setLanguages(languagesData);
        
        console.log("=== BACKEND DATA ===");
        console.log("Gigs:", gigsData);
        console.log("Company Invited Agents:", invitedAgentsData);
        console.log("Enrollment Requests:", enrollmentRequestsData);
        
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to fetch data. Please try again.");
      } finally {
        setInitialLoading(false);
      }
    };

    fetchData();
  }, []);

  // Update agent lists when data changes
  useEffect(() => {
    // Skip if no data yet
    if (!companyInvitedAgents || !enrollmentRequests || !activeAgentsList) return;
    
    // Directly set the lists without filtering again
    setInvitedAgentsList(companyInvitedAgents.filter(agent => !agent.isActive && !agent.hasCompletedOnboarding));
    setEnrollmentRequests(enrollmentRequests);
    // Active agents come directly from the API endpoint
    console.log('✅ Setting active agents:', activeAgentsList);
  }, [companyInvitedAgents, enrollmentRequests, activeAgentsList]);

  const handleGigSelect = async (gig: Gig) => {
    console.log('🎯 GIG SELECTED:', gig.title, 'ID:', gig._id);
    setSelectedGig(gig);
    setLoading(true);
    setError(null);
    setMatches([]);
    setMatchStats(null);
    
    // Reset weights state
    setGigHasWeights(false);
    setHasUnsavedChanges(false);
    setOriginalWeights(null);
    
    let currentWeights = weights;
    
    try {
      // Try to load saved weights for this gig
      try {
        const savedWeights = await getGigWeights(gig._id || '');
        setWeights(savedWeights.matchingWeights);
        setOriginalWeights(savedWeights.matchingWeights);
        setGigHasWeights(true);
        setHasUnsavedChanges(false);
        currentWeights = savedWeights.matchingWeights;
        console.log('✅ Gig has saved weights, loaded:', savedWeights.matchingWeights);
      } catch (error: any) {
        // Handle different types of errors more gracefully
        if (error.message?.includes('No saved weights found')) {
          console.log('ℹ️ No saved weights found for gig:', gig._id, '- Using default weights');
        } else if (error.message?.includes('Failed to fetch')) {
          console.warn('⚠️ Network error loading weights for gig:', gig._id, '- Using current weights');
        } else {
          console.error('❌ Unexpected error loading weights for gig:', gig._id, error);
        }
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
      
      let matchesData;
      try {
        matchesData = await findMatchesForGig(gig._id || '', currentWeights);
      console.log("=== MATCHES DATA ===", matchesData);
      } catch (error: any) {
        console.error("❌ Error finding matches for gig:", error);
        
        // Provide user-friendly error message
        if (error.message?.includes('Failed to fetch')) {
          console.error("🌐 Network error: Unable to connect to matching service");
        } else if (error.message?.includes('500')) {
          console.error("🔧 Server error: Matching service encountered an internal error");
        } else {
          console.error("❓ Unexpected error:", error.message);
        }
        
        // Set empty matches data to prevent crashes
        matchesData = {
          preferedmatches: [],
          totalMatches: 0,
          perfectMatches: 0,
          partialMatches: 0,
          noMatches: 0
        };
      }
      
      // Debug first match score calculation
      if (matchesData.preferedmatches && matchesData.preferedmatches.length > 0) {
        const firstMatch = matchesData.preferedmatches[0];
        console.log("🔍 SCORE BREAKDOWN FOR FIRST MATCH:");
        console.log("- Agent:", firstMatch.agentInfo?.name);
        console.log("- Total Score from API:", firstMatch.totalMatchingScore);
        console.log("- Skills Score:", firstMatch.skillsMatch?.score, "× Weight:", currentWeights.skills, "=", (firstMatch.skillsMatch?.score || 0) * currentWeights.skills);
        console.log("- Languages Score:", firstMatch.languageMatch?.score, "× Weight:", currentWeights.languages, "=", (firstMatch.languageMatch?.score || 0) * currentWeights.languages);
        console.log("- Industry Score:", firstMatch.industryMatch?.score, "× Weight:", currentWeights.industry, "=", (firstMatch.industryMatch?.score || 0) * currentWeights.industry);
        console.log("- Activity Score:", firstMatch.activityMatch?.score, "× Weight:", currentWeights.activities, "=", (firstMatch.activityMatch?.score || 0) * currentWeights.activities);
        console.log("- Experience Score:", firstMatch.experienceMatch?.score, "× Weight:", currentWeights.experience, "=", (firstMatch.experienceMatch?.score || 0) * currentWeights.experience);
        console.log("- Timezone Score:", firstMatch.timezoneMatch?.score, "× Weight:", currentWeights.timezone, "=", (firstMatch.timezoneMatch?.score || 0) * currentWeights.timezone);
        console.log("- Region Score:", firstMatch.regionMatch?.score, "× Weight:", currentWeights.region, "=", (firstMatch.regionMatch?.score || 0) * currentWeights.region);
        console.log("- Availability Score:", firstMatch.availabilityMatch?.score, "× Weight:", currentWeights.availability, "=", (firstMatch.availabilityMatch?.score || 0) * currentWeights.availability);
        
        const calculatedTotal = 
          (firstMatch.skillsMatch?.score || 0) * currentWeights.skills +
          (firstMatch.languageMatch?.score || 0) * currentWeights.languages +
          (firstMatch.industryMatch?.score || 0) * currentWeights.industry +
          (firstMatch.activityMatch?.score || 0) * currentWeights.activities +
          (firstMatch.experienceMatch?.score || 0) * currentWeights.experience +
          (firstMatch.timezoneMatch?.score || 0) * currentWeights.timezone +
          (firstMatch.regionMatch?.score || 0) * currentWeights.region +
          (firstMatch.availabilityMatch?.score || 0) * currentWeights.availability;
          
        console.log("🧮 CALCULATED TOTAL:", calculatedTotal);
        console.log("📊 API TOTAL:", firstMatch.totalMatchingScore);
        console.log("❓ DIFFERENCE:", Math.abs(calculatedTotal - firstMatch.totalMatchingScore));
      }
      
      setMatches(matchesData.preferedmatches || matchesData.matches || []);
      setMatchStats(matchesData);
      
      // Organize agents by status after fetching matches
      setTimeout(() => organizeAgentsByStatus(), 100);
      
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
    
    // Check if weights have been modified from original
    if (originalWeights && gigHasWeights) {
      const hasChanges = Object.keys(newWeights).some(
        k => Math.abs(newWeights[k as keyof MatchingWeights] - originalWeights[k as keyof MatchingWeights]) > 0.001
      );
      setHasUnsavedChanges(hasChanges);
    }
    
    // Auto-search when weights change if a gig is selected (without reloading saved weights)
    if (selectedGig) {
      searchWithCurrentWeights();
    }
  };

  // New function to search with current weights without reloading from DB
  const searchWithCurrentWeights = async () => {
    if (!selectedGig) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log("Searching with current weights (no DB reload):", weights);
      const matchesData = await findMatchesForGig(selectedGig._id || '', weights);
      console.log("=== MATCHES DATA WITH CURRENT WEIGHTS ===", matchesData);
      
      setMatches(matchesData.preferedmatches || matchesData.matches || []);
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
    const defaultWeights: MatchingWeights = {
      experience: 0,
      skills: 0,
      industry: 0,
      languages: 0,
      availability: 0,
      timezone: 0,
      activities: 0,
      region: 0,
    };
    setWeights(defaultWeights);
    
    // Check if we have unsaved changes after reset
    if (originalWeights && gigHasWeights) {
      const hasChanges = Object.keys(defaultWeights).some(
        k => Math.abs(defaultWeights[k as keyof MatchingWeights] - originalWeights[k as keyof MatchingWeights]) > 0.001
      );
      setHasUnsavedChanges(hasChanges);
    }
    
    // Auto-search when weights are reset if a gig is selected (without reloading saved weights)
    if (selectedGig) {
      searchWithCurrentWeights();
    }
  };

  // Save weights for selected gig and search
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
      setOriginalWeights(weights);
      setHasUnsavedChanges(false);
      
      // Trigger new search with saved weights using the new function
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
      gigId: selectedGig._id || ''
      // Removed matchDetails completely to avoid backend language processing
    };
    
    console.log('🚀 Sending minimal request data:', requestData);
    
    try {
      const response = await createGigAgent(requestData);
      console.log('Gig-Rep created successfully:', response);
      
      // Add rep to invited list
      setInvitedAgents(prev => new Set([...prev, match.agentId]));
      
      // Update the match object to mark it as invited
      setMatches(prevMatches => 
        prevMatches.map(m => 
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

      // Refresh only essential data
      const companyId = Cookies.get('companyId') || '685abf28641398dc582f4c95';
      
      // Fetch only what we need
      const [invitedAgentsData, enrollmentRequestsData, activeAgentsData] = await Promise.all([
        getInvitedAgentsForCompany(companyId),
        getEnrollmentRequestsForCompany(companyId),
        getActiveAgentsForCompany(companyId)
      ]);
      
      // Update essential state
      setCompanyInvitedAgents(invitedAgentsData);
      setEnrollmentRequests(enrollmentRequestsData);
      setActiveAgentsList(activeAgentsData);
      
      // If a gig is selected, refresh its matches
      if (selectedGig) {
        const matchesData = await findMatchesForGig(selectedGig._id || '', weights);
        setMatches(matchesData.preferedmatches || matchesData.matches || []);
        setMatchStats(matchesData);
      }

    } catch (error) {
      console.error('Error creating gig-rep:', error);
      setGigAgentError('Failed to invite rep to gig. Please try again.');
    } finally {
      setCreatingGigAgent(false);
    }
  };

  // Helper functions to organize reps by status
  const organizeAgentsByStatus = () => {
    console.log('🔍 DEBUG: All matches data:', matches);
    console.log('🔍 DEBUG: invitedAgents Set:', invitedAgents);
    console.log('🔍 DEBUG: Company Invited Reps:', companyInvitedAgents);
    
    // Use company invited reps from API endpoint
    const invited = companyInvitedAgents.filter(agent => {
      // Show all reps who are not yet active, regardless of their status
      const isInvited = !agent.isActive && 
                       !agent.hasCompletedOnboarding;
      
      console.log(`🔍 Company Invited Rep ${agent.personalInfo?.name}:`, {
        status: agent.status,
        isActive: agent.isActive,
        hasCompletedOnboarding: agent.hasCompletedOnboarding,
        isInvited,
        fullData: agent
      });
      
      return isInvited;
    });
    
    // Use enrollment requests from API endpoint
    const enrollmentReqs = enrollmentRequests;
    console.log('📋 Enrollment Requests from API:', enrollmentReqs);
    
    // Use active reps from API endpoint
    const active = activeAgentsList;
    console.log('✅ Active Reps from API:', active);

    console.log('🔄 Organizing reps by status:');
    console.log('📧 Invited:', invited.length, invited.map(a => ({ name: a.personalInfo?.name, id: a._id })));
    console.log('📋 Enrollment Requests:', enrollmentReqs.length, enrollmentReqs.map(a => ({ name: a.personalInfo?.name, id: a._id })));
    console.log('✅ Active:', active.length, active.map(a => ({ name: a.personalInfo?.name, id: a._id })));

    setInvitedAgentsList(invited);
    setEnrollmentRequests(enrollmentReqs);
    setActiveAgentsList(active);
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
      const skill = skillArray.find(s => s._id === idString);
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
      let language = languages.find(l => l._id === codeString);
      if (language) return language.name;
      return 'Language';
    }
    
    // Try to find by code
    let language = languages.find(l => l.code === codeString);
    
    if (!language) {
      language = languages.find(l => l._id === codeString);
    }
    
    if (!language) {
      language = languages.find(l => l.name?.toLowerCase() === codeString.toLowerCase());
    }
    
    return language ? language.name : codeString;
  };

  // Toggle rep details expansion
  const toggleRepDetails = (agentId: string) => {
    setExpandedReps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(agentId)) {
        newSet.delete(agentId);
      } else {
        newSet.add(agentId);
      }
      return newSet;
    });
  };

  // Toggle gig details expansion
  const toggleGigDetails = (gigId: string) => {
    setExpandedGigs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(gigId)) {
        newSet.delete(gigId);
      } else {
        newSet.add(gigId);
      }
      return newSet;
    });
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col">
      {/* Compact Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-gray-200/50 shadow-sm flex-shrink-0">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-xl shadow-lg flex items-center justify-center">
                  <Users size={20} className="text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Reps Management
                </h1>
                <p className="text-xs text-gray-500">Intelligent matching & lifecycle management</p>
              </div>
            </div>
            
            {/* Stats Cards - Compact */}
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-3 py-1.5 rounded-lg border border-blue-200">
                <div className="text-sm font-bold text-blue-700">{reps.length}</div>
                <div className="text-xs text-blue-600">Total</div>
              </div>
              <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 px-3 py-1.5 rounded-lg border border-yellow-200">
                <div className="text-sm font-bold text-yellow-700">{invitedAgentsList.length}</div>
                <div className="text-xs text-yellow-600">Invited</div>
              </div>
              <div className="bg-gradient-to-r from-orange-50 to-orange-100 px-3 py-1.5 rounded-lg border border-orange-200">
                <div className="text-sm font-bold text-orange-700">{enrollmentRequests.length}</div>
                <div className="text-xs text-orange-600">Pending</div>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-green-100 px-3 py-1.5 rounded-lg border border-green-200">
                <div className="text-sm font-bold text-green-700">{activeAgentsList.length}</div>
                <div className="text-xs text-green-600">Active</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Full Height */}
      <main className="flex-1 flex flex-col min-h-0 px-4 py-4">
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-r-xl shadow-sm">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {initialLoading && (
          <div className="flex justify-center items-center py-20">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Zap size={24} className="text-orange-500 animate-pulse" />
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        {!initialLoading && (
          <>
            {/* Navigation Pills */}
            <div className="mb-8">
              <div className="flex space-x-2 bg-white/60 backdrop-blur-sm p-2 rounded-2xl border border-gray-200/50 shadow-sm">
                {[
                  { id: 'matching', label: 'Smart Matching', icon: '🎯', color: 'from-orange-500 to-red-500' },
                  { id: 'invited', label: 'Invited Reps', icon: '📧', color: 'from-blue-500 to-cyan-500' },
                  { id: 'enrollment', label: 'Enrollment', icon: '📋', color: 'from-yellow-500 to-orange-500' },
                  { id: 'active', label: 'Active Reps', icon: '✅', color: 'from-green-500 to-emerald-500' }
                ].map(section => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id as any)}
                    className={`flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                      activeSection === section.id
                        ? `bg-gradient-to-r ${section.color} text-white shadow-lg transform scale-105`
                        : 'text-gray-600 hover:bg-white/80 hover:text-gray-900'
                    }`}
                  >
                    <span className="text-lg">{section.icon}</span>
                    <span>{section.label}</span>
                  </button>
                ))}
              </div>
        </div>

            {/* Matching Section */}
            {activeSection === 'matching' && (
              <div className="flex-1 flex flex-col min-h-0">
                {/* Compact Header */}
                <div className="text-center mb-4 flex-shrink-0">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-1">
                    🎯 Smart Matching System
                  </h2>
                  <p className="text-gray-600 text-sm">Find and match the perfect reps for your gigs</p>
                </div>

                {/* 3-Column Layout - Full Height */}
                <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
                  
                  {/* Column 1: Weights Configuration */}
                  <div className="col-span-3 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-4 flex flex-col">
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center shadow-md">
                        <Settings size={16} className="text-white" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-gray-900">Matching Weights</h3>
                        <p className="text-xs text-gray-600">Configure factors</p>
                      </div>
                    </div>
                    
                    {hasUnsavedChanges && (
                      <div className="flex items-center space-x-2 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium animate-pulse mb-3">
                        <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
                        <span>Unsaved</span>
                      </div>
                    )}

                    {/* Weights List - Ultra Compact */}
                    <div className="flex-1 space-y-3 overflow-y-auto">
                      {Object.entries(weights).map(([key, value]) => (
                        <div key={`weight-${key}`} className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-3 border border-gray-200 shadow-sm">
                          <div className="flex justify-between items-center mb-2">
                            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                              {key}
                            </label>
                            <div className={`px-2 py-1 rounded-full text-xs font-bold ${
                              Math.round(value * 100) >= 20 ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white' :
                              Math.round(value * 100) >= 10 ? 'bg-orange-100 text-orange-800' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {Math.round(value * 100)}%
                            </div>
                          </div>
                          
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={value}
                            onChange={(e) => handleWeightChange(key, parseFloat(e.target.value))}
                            className="w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer slider"
                            style={{
                              background: `linear-gradient(to right, #f97316 0%, #dc2626 ${value * 100}%, #e5e7eb ${value * 100}%, #e5e7eb 100%)`
                            }}
                          />
                        </div>
                      ))}
                    </div>

                    {/* Action Buttons - Compact */}
                    <div className="space-y-2 mt-4 flex-shrink-0">
                      <button
                        onClick={resetWeights}
                        className="w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium text-xs"
                      >
                        Reset to Default
                      </button>
                      
                      {selectedGig && (
                        <button
                          onClick={saveWeightsForGig}
                          disabled={loading}
                          className={`w-full px-3 py-2 rounded-lg font-medium text-xs transition-all duration-200 ${
                            hasUnsavedChanges
                              ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600'
                              : gigHasWeights
                              ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600'
                              : 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {loading ? 'Saving...' : 
                           hasUnsavedChanges ? 'Save Changes' :
                           gigHasWeights ? 'Update Weights' : 
                           'Save Weights'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Column 2: Gigs Selection */}
                  <div className="col-span-4 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-4 flex flex-col">
                    <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center space-x-2">
                      <div className="w-7 h-7 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                        <Briefcase size={14} className="text-white" />
                      </div>
                      <span>Available Gigs</span>
                    </h3>
                    
                    <div className="flex-1 overflow-y-auto space-y-2">
                      {gigs.map((gig) => {
                        const isGigExpanded = expandedGigs.has(gig._id || '');
                        
                        return (
                          <div key={gig._id} className={`rounded-lg border-2 transition-all duration-200 ${
                            selectedGig?._id === gig._id
                              ? "border-orange-400 shadow-md bg-orange-50"
                              : "border-gray-200 hover:border-orange-300 hover:shadow-sm bg-white"
                          }`}>
                            {/* Gig Header - Clickable for selection */}
                            <div
                              className="cursor-pointer p-3"
                              onClick={() => handleGigSelect(gig)}
                            >
                              <div className="flex justify-between items-start mb-1">
                                <div className="flex items-center space-x-2 flex-1">
                                  <div className={`p-1.5 rounded-md ${
                                    selectedGig?._id === gig._id ? "bg-orange-500" : "bg-gray-400"
                                  }`}>
                                    <Briefcase size={12} className="text-white" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className={`font-bold text-xs truncate ${
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
                                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full flex items-center justify-center">
                                  <svg className="w-1.5 h-1.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
                              )}
                            </div>

                            {/* View Details Button */}
                            <div className="px-3 pb-3">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleGigDetails(gig._id || '');
                                }}
                                className="w-full flex items-center justify-center space-x-1 px-2 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-md transition-all duration-200 text-xs font-medium text-gray-700"
                              >
                                <span>Details</span>
                                <svg 
                                  className={`w-3 h-3 transform transition-transform duration-200 ${isGigExpanded ? 'rotate-180' : ''}`} 
                                  fill="none" 
                                  stroke="currentColor" 
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                              </button>
                            </div>

                            {/* Expanded Details */}
                            {isGigExpanded && (
                              <div className="px-3 pb-3 border-t border-gray-200 bg-gray-50">
                                <div className="pt-2 space-y-2 text-xs">
                                  
                                  {/* Industries */}
                                  {gig.industries && gig.industries.length > 0 && (
                                    <div>
                                      <p className="text-gray-700 font-medium mb-1">Industries:</p>
                                      <div className="flex flex-wrap gap-1">
                                        {gig.industries.map((industry: any, i: number) => {
                                          const displayName = industry.name || 
                                                             (typeof industry === 'string' && !industry.match(/^[0-9a-fA-F]{24}$/) ? industry : 'Industry');
                                          return (
                                            <span key={i} className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">
                                              {displayName}
                                            </span>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}

                                  {/* Activities */}
                                  {gig.activities && gig.activities.length > 0 && (
                                    <div>
                                      <p className="text-gray-700 font-medium mb-1">Activities:</p>
                                      <div className="flex flex-wrap gap-1">
                                        {gig.activities.map((activity: any, i: number) => {
                                          const displayName = activity.name || 
                                                             (typeof activity === 'string' && !activity.match(/^[0-9a-fA-F]{24}$/) ? activity : 'Activity');
                                          return (
                                            <span key={i} className="px-2 py-1 bg-teal-100 text-teal-800 rounded text-xs">
                                              {displayName}
                                            </span>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}

                                  {/* Experience */}
                                  <div className="flex items-center justify-between">
                                    <span className="text-gray-600 font-medium">Experience:</span>
                                    <span className="font-semibold">{gig.seniority?.yearsExperience || 'N/A'} years</span>
                                  </div>

                                  {/* Languages */}
                                  {gig.skills?.languages && gig.skills.languages.length > 0 && (
                                    <div>
                                      <p className="text-gray-700 font-medium mb-1">Languages:</p>
                                      <div className="flex flex-wrap gap-1">
                                        {gig.skills.languages.map((lang: any, i: number) => (
                                          <span key={i} className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                                            {getLanguageNameByCode(lang.language || lang.iso639_1 || lang)}
                                            {lang.proficiency && <span className="ml-1 text-purple-600">({lang.proficiency})</span>}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Skills - Professional */}
                                  {gig.skills?.professional && gig.skills.professional.length > 0 && (
                                    <div>
                                      <p className="text-gray-700 font-medium mb-1">Professional Skills:</p>
                                      <div className="flex flex-wrap gap-1">
                                        {gig.skills.professional.slice(0, 3).map((skillItem: any, i: number) => (
                                          <span key={`prof-${i}`} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                            {getSkillNameById(skillItem.skill || skillItem, 'professional')}
                                          </span>
                                        ))}
                                        {gig.skills.professional.length > 3 && (
                                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                            +{gig.skills.professional.length - 3}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  {/* Region & Timezone */}
                                  <div className="grid grid-cols-2 gap-2 text-xs">
                                    {gig.region && (
                                      <div>
                                        <span className="text-gray-600 font-medium">Region:</span>
                                        <p className="font-semibold">{gig.region}</p>
                                      </div>
                                    )}
                                    {gig.timezone && (
                                      <div>
                                        <span className="text-gray-600 font-medium">Timezone:</span>
                                        <p className="font-semibold">{gig.timezone}</p>
                                      </div>
                                    )}
                                  </div>

                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Column 3: Matching Results */}
                  <div className="col-span-5 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-4 flex flex-col">
                    <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center space-x-2">
                      <div className="w-7 h-7 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                        <Users size={14} className="text-white" />
                      </div>
                      <span>Matching Results</span>
                      {selectedGig && (
                        <span className="text-xs text-gray-600">for "{selectedGig?.title}"</span>
                      )}
                    </h3>
                    
                    <div className="flex-1 overflow-y-auto">
                      {!selectedGig ? (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <Briefcase size={24} className="text-gray-400" />
                            </div>
                            <p className="text-gray-600">Select a gig to see matching reps</p>
                          </div>
                        </div>
                      ) : loading ? (
                        <div className="flex justify-center items-center h-full">
                          <div className="relative">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                              <Zap size={16} className="text-orange-500 animate-pulse" />
                            </div>
                          </div>
                        </div>
                      ) : matches.length > 0 ? (
                        <div className="space-y-2">
                          {matches.map((match, index) => {
                            // Check if agent is already enrolled in this specific gig
                            const isAlreadyEnrolledInThisGig = activeAgentsList.some(
                              agent => agent.agentId._id === match.agentId && agent.gigId._id === selectedGig?._id
                            );
                            
                            const isInvited = match.isInvited !== undefined ? match.isInvited : invitedAgents.has(match.agentId);
                            const isEnrolled = isAlreadyEnrolledInThisGig || 
                                             match.isEnrolled || 
                                             match.status === 'accepted' || 
                                             match.agentResponse === 'accepted' || 
                                             match.enrollmentStatus === 'accepted' || 
                                             match.agentInfo?.status === 'accepted';
                            
                            const matchScore = Math.round((match.totalMatchingScore || 0) * 100);
                            const cardBgColor = matchScore >= 70 ? 'bg-green-50 border-green-200' :
                                              matchScore >= 50 ? 'bg-yellow-50 border-yellow-200' :
                                              'bg-red-50 border-red-200';
                            
                            const isExpanded = expandedReps.has(match.agentId);
                            
                            return (
                              <div key={`match-${match.agentId}-${index}`} className={`rounded-lg p-3 border-2 hover:shadow-md transition-all duration-300 ${cardBgColor}`}>
                                {/* Rep Header */}
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h4 className="text-xs font-bold text-gray-900 truncate">{match.agentInfo?.name}</h4>
                                      <div className={`px-2 py-1 rounded-full text-xs font-bold ${
                                        matchScore >= 70 ? 'bg-green-500 text-white' :
                                        matchScore >= 50 ? 'bg-yellow-500 text-white' :
                                        'bg-red-500 text-white'
                                      }`}>
                                        {matchScore}%
                                      </div>
                                    </div>
                                    <p className="text-xs text-gray-600 truncate">{match.agentInfo?.email}</p>
                                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                      {(match.agentInfo?.timezone?.countryName || match.agentInfo?.location) && (
                                        <span>📍 {match.agentInfo?.timezone?.countryName || match.agentInfo?.location}</span>
                                      )}
                                      {match.agentInfo?.professionalSummary?.yearsOfExperience && (
                                        <span>💼 {match.agentInfo.professionalSummary.yearsOfExperience.toString().replace(/\s+years?/gi, '')}y</span>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <div className="flex-shrink-0 ml-2">
                                    {isEnrolled ? (
                                      <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                        Enrolled
                                      </span>
                                    ) : match.alreadyEnrolled ? (
                                      <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                                        Enrolled
                                      </span>
                                    ) : isInvited ? (
                                      <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                        Invited
                                      </span>
                                    ) : (
                                      <button
                                        className="inline-flex items-center px-2 py-1 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-all duration-200 text-xs font-medium gap-1"
                                        onClick={() => handleCreateGigAgent(match)}
                                        disabled={creatingGigAgent}
                                      >
                                        <Zap className="w-3 h-3" />
                                        Invite
                                      </button>
                                    )}
                                  </div>
                                </div>

                                {/* View Details Button */}
                                <div className="flex justify-center">
                                  <button
                                    onClick={() => toggleRepDetails(match.agentId)}
                                    className="flex items-center space-x-1 px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-md transition-all duration-200 text-xs font-medium text-gray-700"
                                  >
                                    <span>Details</span>
                                    <svg 
                                      className={`w-3 h-3 transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
                                      fill="none" 
                                      stroke="currentColor" 
                                      viewBox="0 0 24 24"
                                    >
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                  </button>
                                </div>

                                {/* Expanded Details */}
                                {isExpanded && (
                                  <div className="mt-2 pt-2 border-t border-gray-200 space-y-2">
                                    <div className="grid grid-cols-2 gap-1">
                                      
                                      {/* Skills Match */}
                                      {match.skillsMatch && (
                                        <div className="bg-white rounded-md p-2 shadow-sm">
                                          <div className="flex items-center justify-between mb-1">
                                            <h5 className="font-semibold text-gray-800 text-xs">Skills</h5>
                                            <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${
                                              Math.round((match.skillsMatch.score || 0) * 100) >= 70 ? 'bg-green-100 text-green-800' :
                                              Math.round((match.skillsMatch.score || 0) * 100) >= 50 ? 'bg-yellow-100 text-yellow-800' :
                                              'bg-red-100 text-red-800'
                                            }`}>
                                              {Math.round((match.skillsMatch.score || 0) * 100)}%
                                            </span>
                                          </div>
                                          {match.skillsMatch.details?.matchingSkills && match.skillsMatch.details.matchingSkills.length > 0 && (
                                            <div className="flex flex-wrap gap-1">
                                              {match.skillsMatch.details.matchingSkills.slice(0, 2).map((skill: any, i: number) => (
                                                <span key={i} className="px-1 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">
                                                  {skill.skill?.name || skill.skillName || getSkillNameById(skill._id || skill.skillId || skill, skill.category || 'professional')}
                                                </span>
                                              ))}
                                              {match.skillsMatch.details.matchingSkills.length > 2 && (
                                                <span className="px-1 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                                                  +{match.skillsMatch.details.matchingSkills.length - 2}
                                                </span>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      )}

                                      {/* Languages Match */}
                                      {match.languageMatch && (
                                        <div className="bg-white rounded-md p-2 shadow-sm">
                                          <div className="flex items-center justify-between mb-1">
                                            <h5 className="font-semibold text-gray-800 text-xs">Languages</h5>
                                            <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${
                                              Math.round((match.languageMatch.score || 0) * 100) >= 70 ? 'bg-green-100 text-green-800' :
                                              Math.round((match.languageMatch.score || 0) * 100) >= 50 ? 'bg-yellow-100 text-yellow-800' :
                                              'bg-red-100 text-red-800'
                                            }`}>
                                              {Math.round((match.languageMatch.score || 0) * 100)}%
                                            </span>
                                          </div>
                                          {match.languageMatch.details?.matchingLanguages && match.languageMatch.details.matchingLanguages.length > 0 && (
                                            <div className="flex flex-wrap gap-1">
                                              {match.languageMatch.details.matchingLanguages.slice(0, 2).map((lang: any, i: number) => (
                                                <span key={i} className="px-1 py-0.5 bg-purple-100 text-purple-800 rounded text-xs">
                                                  {lang.language?.name || lang.languageName || getLanguageNameByCode(lang.language || lang.code || lang)}
                                                </span>
                                              ))}
                                              {match.languageMatch.details.matchingLanguages.length > 2 && (
                                                <span className="px-1 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                                                  +{match.languageMatch.details.matchingLanguages.length - 2}
                                                </span>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      )}

                                      {/* Industry Match */}
                                      {match.industryMatch && (
                                        <div className="bg-white rounded-md p-2 shadow-sm">
                                          <div className="flex items-center justify-between mb-1">
                                            <h5 className="font-semibold text-gray-800 text-xs">Industry</h5>
                                            <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${
                                              Math.round((match.industryMatch.score || 0) * 100) >= 70 ? 'bg-green-100 text-green-800' :
                                              Math.round((match.industryMatch.score || 0) * 100) >= 50 ? 'bg-yellow-100 text-yellow-800' :
                                              'bg-red-100 text-red-800'
                                            }`}>
                                              {Math.round((match.industryMatch.score || 0) * 100)}%
                                            </span>
                                          </div>
                                          {match.industryMatch.details?.matchingIndustries && match.industryMatch.details.matchingIndustries.length > 0 && (
                                            <div className="flex flex-wrap gap-1">
                                              {match.industryMatch.details.matchingIndustries.slice(0, 1).map((industry: any, i: number) => (
                                                <span key={i} className="px-1 py-0.5 bg-orange-100 text-orange-800 rounded text-xs">
                                                  {industry.industry?.name || industry.industryName || industry.name || industry}
                                                </span>
                                              ))}
                                              {match.industryMatch.details.matchingIndustries.length > 1 && (
                                                <span className="px-1 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                                                  +{match.industryMatch.details.matchingIndustries.length - 1}
                                                </span>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      )}

                                      {/* Experience Match */}
                                      {match.experienceMatch && (
                                        <div className="bg-white rounded-md p-2 shadow-sm">
                                          <div className="flex items-center justify-between mb-1">
                                            <h5 className="font-semibold text-gray-800 text-xs">Experience</h5>
                                            <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${
                                              Math.round((match.experienceMatch.score || 0) * 100) >= 70 ? 'bg-green-100 text-green-800' :
                                              Math.round((match.experienceMatch.score || 0) * 100) >= 50 ? 'bg-yellow-100 text-yellow-800' :
                                              'bg-red-100 text-red-800'
                                            }`}>
                                              {Math.round((match.experienceMatch.score || 0) * 100)}%
                                            </span>
                                          </div>
                                          <div className="text-xs text-gray-600">
                                            <p>Rep: {match.agentInfo?.professionalSummary?.yearsOfExperience || 'N/A'}y</p>
                                            <p>Req: {selectedGig?.seniority?.yearsExperience || 'N/A'}y</p>
                                          </div>
                                        </div>
                                      )}

                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <Briefcase size={24} className="text-gray-400" />
                            </div>
                            <p className="text-gray-600">No matches found for this gig.</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Success/Error Messages */}
                    {gigAgentSuccess && (
                      <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm">{gigAgentSuccess}</span>
                        </div>
                      </div>
                    )}

                    {gigAgentError && (
                      <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm">{gigAgentError}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 2. INVITED REPS */}
            {activeSection === 'invited' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">📧 Invited Reps</h2>
                  <p className="text-gray-600">Reps who have been invited but haven't responded yet</p>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                  {invitedAgentsList.length > 0 ? (
                    <div className="space-y-4">
                      {invitedAgentsList.map((agent, index) => (
                        <div key={`invited-${agent._id}-${index}`} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-gray-900">{agent.personalInfo?.name}</h3>
                              <p className="text-gray-600">{agent.personalInfo?.email}</p>
                              <p className="text-sm text-yellow-700 mt-1">
                                Invited • Waiting for response
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="inline-flex items-center px-3 py-2 bg-yellow-100 text-yellow-800 rounded-lg text-sm font-medium">
                                📧 Pending
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="bg-gray-50 rounded-xl p-8 max-w-md mx-auto">
                        <div className="text-6xl mb-4">📧</div>
                        <p className="text-gray-600 text-lg mb-2">No pending invitations</p>
                        <p className="text-sm text-gray-400">All invitations have been responded to.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 3. ENROLLMENT REQUESTS */}
            {activeSection === 'enrollment' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">📋 Enrollment Requests</h2>
                  <p className="text-gray-600">Reps who accepted invitations and are requesting to join</p>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                  {enrollmentRequests.length > 0 ? (
                    <div className="space-y-4">
                      {enrollmentRequests.map((agent, index) => (
                        <div key={`enrollment-${agent._id}-${index}`} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-gray-900">{agent.agentId?.personalInfo?.name}</h3>
                              <p className="text-gray-600">{agent.agentId?.personalInfo?.email}</p>
                              <div className="mt-2 space-y-1">
                                <p className="text-sm text-blue-700">
                                  <span className="font-medium">Status:</span> {agent.enrollmentStatus}
                                </p>
                                {agent.notes && (
                                  <p className="text-sm text-gray-600 italic">
                                    "{agent.notes}"
                                  </p>
                                )}
                                <p className="text-xs text-gray-500">
                                  For: {agent.gigId?.title}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button 
                                onClick={async () => {
                                  try {
                                    await acceptEnrollmentRequest(agent._id, "Welcome to the team! We are delighted to have you.");
                                    // Refresh data
                                    const companyId = Cookies.get('companyId') || '';
                                    const [invitedAgentsData, enrollmentRequestsData, activeAgentsData] = await Promise.all([
                                      getInvitedAgentsForCompany(companyId),
                                      getEnrollmentRequestsForCompany(companyId),
                                      getActiveAgentsForCompany(companyId)
                                    ]);
                                    setCompanyInvitedAgents(invitedAgentsData);
                                    setEnrollmentRequests(enrollmentRequestsData);
                                    setActiveAgentsList(activeAgentsData);
                                  } catch (error) {
                                    console.error('Error accepting enrollment request:', error);
                                    // TODO: Show error toast
                                  }
                                }}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 text-sm font-medium"
                              >
                                ✅ Approve
                              </button>
                              <button 
                                onClick={async () => {
                                  try {
                                    await rejectEnrollmentRequest(agent._id, "Sorry, we cannot proceed with your application at this time.");
                                    // Refresh data
                                    const companyId = Cookies.get('companyId') || '';
                                    const [invitedAgentsData, enrollmentRequestsData, activeAgentsData] = await Promise.all([
                                      getInvitedAgentsForCompany(companyId),
                                      getEnrollmentRequestsForCompany(companyId),
                                      getActiveAgentsForCompany(companyId)
                                    ]);
                                    setCompanyInvitedAgents(invitedAgentsData);
                                    setEnrollmentRequests(enrollmentRequestsData);
                                    setActiveAgentsList(activeAgentsData);
                                  } catch (error) {
                                    console.error('Error rejecting enrollment request:', error);
                                    // TODO: Show error toast
                                  }
                                }}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 text-sm font-medium"
                              >
                                ❌ Reject
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="bg-gray-50 rounded-xl p-8 max-w-md mx-auto">
                        <div className="text-6xl mb-4">📋</div>
                        <p className="text-gray-600 text-lg mb-2">No enrollment requests</p>
                        <p className="text-sm text-gray-400">No reps are waiting for approval.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 4. ACTIVE REPS */}
            {activeSection === 'active' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">✅ Active Reps</h2>
                  <p className="text-gray-600">Reps who are approved and actively working</p>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                  {activeAgentsList.length > 0 ? (
                    <div className="space-y-4">
                      {activeAgentsList.map((agent, index) => (
                        <div key={`active-${agent._id}-${index}`} className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-bold text-gray-900">{agent.agentId?.personalInfo?.name}</h3>
                                <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                                  ✅ Active
                                </span>
                              </div>
                              <p className="text-gray-600 mb-2">{agent.agentId?.personalInfo?.email}</p>
                              
                              <div className="mt-3 space-y-2">
                                <div className="flex items-center gap-4 text-sm">
                                  <span className="text-gray-600">
                                    <span className="font-medium">Experience:</span> {agent.agentId?.professionalSummary?.yearsOfExperience} years
                                  </span>
                                  <span className="text-gray-600">
                                    <span className="font-medium">Role:</span> {agent.agentId?.professionalSummary?.currentRole}
                                  </span>
                                </div>
                                
                                <div className="flex flex-wrap gap-2">
                                  {agent.agentId?.professionalSummary?.keyExpertise?.slice(0, 5).map((skill, i) => (
                                    <span key={i} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                                      {skill}
                                    </span>
                                  ))}
                                  {agent.agentId?.professionalSummary?.keyExpertise?.length > 5 && (
                                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                      +{agent.agentId.professionalSummary.keyExpertise.length - 5} more
                                    </span>
                                  )}
                                </div>
                                
                                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                  <div>
                                    <span className="font-medium">Availability:</span> {agent.agentId?.availability?.schedule?.length} days/week
                                  </div>
                                  <div>
                                    <span className="font-medium">Status:</span> {agent.agentId?.onboardingProgress?.currentPhase === 4 ? 'Fully Onboarded' : 'In Progress'}
                                  </div>
                                  <div>
                                    <span className="font-medium">Languages:</span> {agent.agentId?.personalInfo?.languages?.length || 0}
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex flex-col items-end space-y-2">
                              <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-200 text-sm font-medium">
                                Manage Profile
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="bg-gray-50 rounded-xl p-8 max-w-md mx-auto">
                        <div className="text-6xl mb-4">✅</div>
                        <p className="text-gray-600 text-lg mb-2">No active reps</p>
                        <p className="text-sm text-gray-400">Start by finding matches and inviting reps.</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Other Sections */}
                {activeSection === 'invited' && (
                  <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-8">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-6 text-center">
                      📧 Invited Reps
                    </h2>
                    <p className="text-gray-600 text-lg text-center mb-8">Reps who have been invited but haven't responded yet</p>
                    
                    {invitedAgentsList.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {invitedAgentsList.map((agent, index) => (
                          <div key={`invited-${agent._id}-${index}`} className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
                            <div className="flex items-center space-x-4 mb-4">
                              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                {agent.personalInfo?.name?.charAt(0) || 'U'}
                              </div>
                              <div className="flex-1">
                                <h3 className="text-lg font-bold text-gray-900">{agent.personalInfo?.name}</h3>
                                <p className="text-gray-600 text-sm">{agent.personalInfo?.email}</p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="inline-flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                                📧 Pending Response
                              </span>
                              <span className="text-xs text-gray-500">Waiting for response</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-24 h-24 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <span className="text-4xl">📧</span>
                        </div>
                        <p className="text-gray-600 text-lg mb-2">No pending invitations</p>
                        <p className="text-sm text-gray-400">All invitations have been responded to.</p>
                      </div>
                    )}
                  </div>
                )}

                {activeSection === 'enrollment' && (
                  <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-8">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-6 text-center">
                      📋 Enrollment Requests
                    </h2>
                    <p className="text-gray-600 text-lg text-center mb-8">Reps who accepted invitations and are requesting to join</p>
                    
                    {enrollmentRequests.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {enrollmentRequests.map((agent, index) => (
                          <div key={`enrollment-${agent._id}-${index}`} className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
                            <div className="flex items-center space-x-4 mb-4">
                              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                {agent.agentId?.personalInfo?.name?.charAt(0) || 'U'}
                              </div>
                              <div className="flex-1">
                                <h3 className="text-lg font-bold text-gray-900">{agent.agentId?.personalInfo?.name}</h3>
                                <p className="text-gray-600 text-sm">{agent.agentId?.personalInfo?.email}</p>
                              </div>
                            </div>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Status:</span>
                                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                  {agent.enrollmentStatus}
                                </span>
                              </div>
                              {agent.notes && (
                                <p className="text-sm text-gray-600 italic bg-gray-50 p-3 rounded-lg">
                                  "{agent.notes}"
                                </p>
                              )}
                              <p className="text-xs text-gray-500">
                                For: {agent.gigId?.title}
                              </p>
                              <div className="flex space-x-2">
                                <button 
                                  onClick={async () => {
                                    try {
                                      await acceptEnrollmentRequest(agent._id, "Welcome to the team! We are delighted to have you.");
                                      // Refresh data
                                      const companyId = Cookies.get('companyId') || '';
                                      const [invitedAgentsData, enrollmentRequestsData, activeAgentsData] = await Promise.all([
                                        getInvitedAgentsForCompany(companyId),
                                        getEnrollmentRequestsForCompany(companyId),
                                        getActiveAgentsForCompany(companyId)
                                      ]);
                                      setCompanyInvitedAgents(invitedAgentsData);
                                      setEnrollmentRequests(enrollmentRequestsData);
                                      setActiveAgentsList(activeAgentsData);
                                    } catch (error) {
                                      console.error('Error accepting enrollment request:', error);
                                    }
                                  }}
                                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                                >
                                  ✅ Approve
                                </button>
                                <button 
                                  onClick={async () => {
                                    try {
                                      await rejectEnrollmentRequest(agent._id, "Sorry, we cannot proceed with your application at this time.");
                                      // Refresh data
                                      const companyId = Cookies.get('companyId') || '';
                                      const [invitedAgentsData, enrollmentRequestsData, activeAgentsData] = await Promise.all([
                                        getInvitedAgentsForCompany(companyId),
                                        getEnrollmentRequestsForCompany(companyId),
                                        getActiveAgentsForCompany(companyId)
                                      ]);
                                      setCompanyInvitedAgents(invitedAgentsData);
                                      setEnrollmentRequests(enrollmentRequestsData);
                                      setActiveAgentsList(activeAgentsData);
                                    } catch (error) {
                                      console.error('Error rejecting enrollment request:', error);
                                    }
                                  }}
                                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                                >
                                  ❌ Reject
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <span className="text-4xl">📋</span>
                        </div>
                        <p className="text-gray-600 text-lg mb-2">No enrollment requests</p>
                        <p className="text-sm text-gray-400">No reps are waiting for approval.</p>
                      </div>
                    )}
                  </div>
                )}

                {activeSection === 'active' && (
                  <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-8">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-6 text-center">
                      ✅ Active Reps
                    </h2>
                    <p className="text-gray-600 text-lg text-center mb-8">Reps who are approved and actively working</p>
                    
                    {activeAgentsList.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {activeAgentsList.map((agent, index) => (
                          <div key={`active-${agent._id}-${index}`} className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
                            <div className="flex items-center space-x-4 mb-4">
                              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                {agent.agentId?.personalInfo?.name?.charAt(0) || 'U'}
                              </div>
                              <div className="flex-1">
                                <h3 className="text-lg font-bold text-gray-900">{agent.agentId?.personalInfo?.name}</h3>
                                <p className="text-gray-600 text-sm">{agent.agentId?.personalInfo?.email}</p>
                              </div>
                              <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                                ✅ Active
                              </span>
                            </div>
                            <div className="space-y-3">
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-600">Experience:</span>
                                  <p className="font-semibold">{agent.agentId?.professionalSummary?.yearsOfExperience} years</p>
                                </div>
                                <div>
                                  <span className="text-gray-600">Role:</span>
                                  <p className="font-semibold">{agent.agentId?.professionalSummary?.currentRole}</p>
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {agent.agentId?.professionalSummary?.keyExpertise?.slice(0, 3).map((skill, i) => (
                                  <span key={i} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                                    {skill}
                                  </span>
                                ))}
                                {agent.agentId?.professionalSummary?.keyExpertise?.length > 3 && (
                                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                    +{agent.agentId.professionalSummary.keyExpertise.length - 3} more
                                  </span>
                                )}
                              </div>
                              <div className="flex justify-between text-sm text-gray-600">
                                <span>Availability: {agent.agentId?.availability?.schedule?.length} days/week</span>
                                <span>Languages: {agent.agentId?.personalInfo?.languages?.length || 0}</span>
                              </div>
                              <button className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium">
                                Manage Profile
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-24 h-24 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <span className="text-4xl">✅</span>
                        </div>
                        <p className="text-gray-600 text-lg mb-2">No active reps</p>
                        <p className="text-sm text-gray-400">Start by finding matches and inviting reps.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default RepMatchingPanel;