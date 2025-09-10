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
} from '../types';
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
  const [showWeights, setShowWeights] = useState(false);
  const [weights, setWeights] = useState<MatchingWeights>({
    experience: 0.20,
    skills: 0.20,
    industry: 0.15,
    languages: 0.15,
    availability: 0.10,
    timezone: 0.10,
    activities: 0.10,
    region: 0.10,
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
    if (!companyInvitedAgents || !enrollmentRequests || !activeAgentsList) return;
    
    setInvitedAgentsList(companyInvitedAgents.filter(agent => !agent.isActive && !agent.hasCompletedOnboarding));
    setEnrollmentRequests(enrollmentRequests);
    console.log('✅ Setting active agents:', activeAgentsList);
  }, [companyInvitedAgents, enrollmentRequests, activeAgentsList]);

  const handleGigSelect = async (gig: Gig) => {
    console.log('🎯 GIG SELECTED:', gig.title, 'ID:', gig._id);
    setSelectedGig(gig);
    setLoading(true);
    setError(null);
    setMatches([]);
    setMatchStats(null);
    
    let currentWeights = weights;
    
    try {
      // Fetch invited reps for this gig
      const gigAgents = await getGigAgentsForGig(gig._id || '');
      const invitedAgentIds = new Set<string>(gigAgents.map((ga: any) => ga.agentId as string));
      setInvitedAgents(invitedAgentIds);
      
      // Find matches for the selected gig using current weights
      const matchesData = await findMatchesForGig(gig._id || '', currentWeights);
      setMatches(matchesData.preferedmatches || matchesData.matches || []);
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
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header with Navigation Tabs */}
      <header className="bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Users size={24} className="text-yellow-300" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Reps Management System</h1>
                <p className="text-orange-200 text-sm">Manage reps through their complete lifecycle</p>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="hidden lg:flex items-center space-x-6 px-4 py-2 bg-white/10 rounded-lg text-sm">
              <div className="text-center">
                <div className="font-bold text-lg">{reps.length}</div>
                <div className="text-orange-200 text-xs">Total Reps</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg">{invitedAgentsList.length}</div>
                <div className="text-orange-200 text-xs">Invited</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg">{enrollmentRequests.length}</div>
                <div className="text-orange-200 text-xs">Requests</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg">{activeAgentsList.length}</div>
                <div className="text-orange-200 text-xs">Active</div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-t border-white/20">
          <div className="container mx-auto px-4">
            <nav className="flex space-x-0">
              {[
                { id: 'matching', label: 'Smart Matching System', icon: '🎯', description: 'Find & match perfect reps' },
                { id: 'invited', label: 'Invited Reps', icon: '📧', description: 'Pending invitations' },
                { id: 'enrollment', label: 'Enrollment Requests', icon: '📋', description: 'Rep applications' },
                { id: 'active', label: 'Active Reps', icon: '✅', description: 'Working reps' }
              ].map(section => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id as any)}
                  className={`flex-1 px-4 py-4 text-left transition-all duration-200 border-b-2 ${
                    activeSection === section.id
                      ? 'border-yellow-300 bg-white/10'
                      : 'border-transparent hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{section.icon}</span>
                    <div>
                      <div className={`font-medium ${activeSection === section.id ? 'text-yellow-300' : 'text-white'}`}>
                        {section.label}
                      </div>
                      <div className="text-orange-200 text-xs">{section.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </nav>
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
          <>
            {/* SMART MATCHING SYSTEM */}
            {activeSection === 'matching' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">🎯 Smart Matching System</h2>
                    <p className="text-gray-600">Find and match the perfect reps for your gigs</p>
                  </div>
                  <button
                    onClick={() => setShowWeights(!showWeights)}
                    className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 text-sm font-medium ${
                      showWeights ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    <Settings size={16} className={showWeights ? 'rotate-180' : ''} />
                    <span>{showWeights ? 'Close Weights' : 'Adjust Weights'}</span>
                  </button>
                </div>

                {/* Gig Selection */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                    <Briefcase size={20} className="text-orange-600" />
                    <span>Select a Gig to Find Matching Reps</span>
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {gigs.map((gig) => (
                      <div key={gig._id} className={`bg-white rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                        selectedGig?._id === gig._id
                          ? "border-orange-400 shadow-lg bg-orange-50"
                          : "border-gray-200 hover:border-orange-300 hover:shadow-md"
                      }`} onClick={() => handleGigSelect(gig)}>
                        <div className="p-4 relative">
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
                        {matches.map((match, index) => {
                          const matchScore = Math.round((match.totalMatchingScore || 0) * 100);
                          const cardBgColor = matchScore >= 70 ? 'bg-green-50 border-green-200' :
                                            matchScore >= 50 ? 'bg-yellow-50 border-yellow-200' :
                                            'bg-red-50 border-red-200';
                          
                          return (
                            <div key={`match-${match.agentId}-${index}`} className={`rounded-xl p-6 border-2 hover:shadow-lg transition-all duration-300 ${cardBgColor}`}>
                              <div className="flex items-center justify-between">
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
                                    {match.agentInfo?.professionalSummary?.yearsOfExperience && (
                                      <span>💼 {match.agentInfo.professionalSummary.yearsOfExperience} years exp.</span>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="flex-shrink-0 ml-4">
                                  <button className="inline-flex items-center px-3 py-1 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-all duration-200 text-sm font-medium gap-1">
                                    <Zap className="w-4 h-4" />
                                    Invite
                                  </button>
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
                  </div>
                )}
              </div>
            )}

            {/* INVITED REPS */}
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
                              <p className="text-sm text-yellow-700 mt-1">Invited • Waiting for response</p>
                            </div>
                            <span className="inline-flex items-center px-3 py-2 bg-yellow-100 text-yellow-800 rounded-lg text-sm font-medium">
                              📧 Pending
                            </span>
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

            {/* ENROLLMENT REQUESTS */}
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
                                <p className="text-xs text-gray-500">
                                  For: {agent.gigId?.title}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 text-sm font-medium">
                                ✅ Approve
                              </button>
                              <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 text-sm font-medium">
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

            {/* ACTIVE REPS */}
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
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default RepMatchingPanel;
