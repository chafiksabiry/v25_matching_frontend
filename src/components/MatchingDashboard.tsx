import React, { useState, useEffect } from "react";
import { Rep, Gig, Match, MatchingWeights } from "../types";
import {
  getReps,
  getGigs,
  findMatchesForGig,
  findGigsForRep,
  generateOptimalMatches,
  getGigsByCompanyId,
} from "../api";
import { createGigAgent } from "../api/index";
import {
  Activity,
  Users,
  Briefcase,
  Zap,
  Settings,
  Clock,
  Brain,
} from "lucide-react";
import axios from "axios";
import Cookies from "js-cookie";

interface MatchResponse {
  matches: Match[];
  totalMatches?: number;
  perfectMatches?: number;
  partialMatches?: number;
  noMatches?: number;
  languageStats?: {
    perfectMatches: number;
    partialMatches: number;
    noMatches: number;
    totalMatches: number;
  };
  skillsStats?: {
    perfectMatches: number;
    partialMatches: number;
    noMatches: number;
    totalMatches: number;
    byType: {
      technical: { perfectMatches: number; partialMatches: number; noMatches: number };
      professional: { perfectMatches: number; partialMatches: number; noMatches: number };
      soft: { perfectMatches: number; partialMatches: number; noMatches: number };
    };
  };
}

interface BasicMatchResponse {
  matches: Match[];
}

const defaultMatchingWeights: MatchingWeights = {
  experience: 0.15,
  skills: 0.2,
  industry: 0.15,
  languages: 0.1,
  availability: 0.1,
  timezone: 0.05,
  performance: 0.2,
  region: 0.05,
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
      byType: {
        technical: {
          perfectMatches: number;
          partialMatches: number;
          noMatches: number;
        };
        professional: {
          perfectMatches: number;
          partialMatches: number;
          noMatches: number;
        };
        soft: {
          perfectMatches: number;
          partialMatches: number;
          noMatches: number;
        };
      };
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

  const handleTabClick = (tab: TabType) => {
    setActiveTab(tab);
    setCurrentPage(1);
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

  const handleGigSelect = (gig: Gig) => {
    setSelectedGig(gig);
    setCurrentPage(1);
    setTimeout(scrollToResults, 100);
  };

  const handleRepSelect = (rep: Rep) => {
    setSelectedRep(rep);
    setTimeout(scrollToResults, 100); // Petit délai pour laisser le temps aux résultats de se charger
  };

  const paginatedReps = reps.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
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
        const [repsData, gigsData] = await Promise.all([
          getReps(),
          companyId ? getGigsByCompanyId(companyId) : getGigs()
        ]);
        console.log("=== REPS DATA ===", JSON.stringify(repsData, null, 2));
        console.log("=== GIGS DATA ===", gigsData);
        setReps(repsData);
        setGigs(gigsData);
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
        let response: MatchResponse | BasicMatchResponse;
        if (activeTab === "gigs" && selectedGig) {
          setLoading(true);
          const gigResponse = await findMatchesForGig(selectedGig._id, weights);
          console.log("Gig Response Structure:", {
            matches: gigResponse.matches,
            totalMatches: gigResponse.totalMatches,
            perfectMatches: gigResponse.perfectMatches,
            partialMatches: gigResponse.partialMatches,
            noMatches: gigResponse.noMatches,
            languageStats: gigResponse.languageStats,
            skillsStats: gigResponse.skillsStats
          });
          console.log("First Match Structure:", gigResponse.matches[0]);
          setMatches(gigResponse.matches || []);
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
              totalMatches: 0,
              byType: {
                technical: { perfectMatches: 0, partialMatches: 0, noMatches: 0 },
                professional: { perfectMatches: 0, partialMatches: 0, noMatches: 0 },
                soft: { perfectMatches: 0, partialMatches: 0, noMatches: 0 }
              }
            }
          });
          setLoading(false);
        } else if (activeTab === "reps" && selectedRep) {
          setLoading(true);
          response = await findGigsForRep(selectedRep._id, weights);
          console.log("Rep Response Structure:", {
            matches: response.matches
          });
          console.log("First Match Structure:", response.matches[0]);
          setMatches(response.matches || []);
          setMatchStats(null);
          setLoading(false);
        } else if (activeTab === "optimal") {
          setLoading(true);
          response = await generateOptimalMatches(weights);
          console.log("Optimal Response Structure:", {
            matches: response.matches
          });
          console.log("First Match Structure:", response.matches[0]);
          setMatches(response.matches || []);
          setMatchStats(null);
          setLoading(false);
        } else {
          setMatches([]);
          setMatchStats(null);
        }
      } catch (error) {
        console.error("Error getting matches:", error);
        setError("Failed to get matches. Please try again.");
        setMatches([]);
        setMatchStats(null);
        setLoading(false);
      }
    };
    getMatches();
  }, [activeTab, selectedGig, selectedRep, weights, reps]);

  // Get rep or gig details for a match
  const getRepForMatch = (match: Match) =>
    reps.find((rep) => rep._id === match.repId);
  const getGigForMatch = (match: Match) =>
    gigs.find((gig) => gig._id === match.gigId);

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

  // Add custom animation classes
  const fadeIn = "animate-[fadeIn_0.5s_ease-in-out]";
  const slideUp = "animate-[slideUp_0.3s_ease-out]";
  const pulse = "animate-[pulse_2s_infinite]";

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

    // Afficher les données avant l'appel
    const requestData = {
      agentId: match.agentId,
      gigId: selectedGig._id
    };
    
    console.log('=== DONNÉES À ENVOYER ===');
    console.log('agentId:', requestData.agentId);
    console.log('gigId:', requestData.gigId);
    console.log('Match complet:', match);
    console.log('Gig sélectionné:', selectedGig);
    console.log('========================');
    
    // Afficher une alerte avec les données
    alert(`Données à envoyer:\n\nagentId: ${requestData.agentId}\ngigId: ${requestData.gigId}\n\nMatch agentId: ${match.agentId}\nGig _id: ${selectedGig._id}`);

    try {
      const response = await createGigAgent(requestData);

      console.log('Gig-Agent created successfully:', response);
      setGigAgentSuccess(`Agent successfully assigned to "${selectedGig.title}"! Email sent: ${response.emailSent ? 'Yes' : 'No'}`);
      
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
                try {
                  const companyId = Cookies.get("companyId");
                  if (companyId) {
                    await axios.put(
                      `${import.meta.env.VITE_COMPANY_API_URL}/onboarding/companies/${companyId}/onboarding/phases/3/steps/10`,
                      { status: "completed", currentStep: 13 }
                    );
                  }
                  window.location.href = "/app11";
                } catch (error) {
                  console.error("Error updating onboarding progress:", error);
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

            {/* Requirements Section - Moved to top */}
            {selectedGig && (
              <div className="mb-8 p-6 bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-xl border border-indigo-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-indigo-900 text-lg flex items-center gap-2">
                    <span>Requirements for "{selectedGig.title}"</span>
                  </h3>
                  <span className="text-sm text-indigo-600 bg-indigo-100 px-3 py-1 rounded-full">
                    {selectedGig.category}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Skills */}
                  {weights.skills > 0 && (
                    <div className="bg-white/80 p-4 rounded-lg shadow-sm">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-indigo-700 font-semibold text-base">🛠️ Skills</span>
                      </div>
                      <ul className="space-y-2">
                        {[
                          ...(selectedGig.skills?.professional || []),
                          ...(selectedGig.skills && Array.isArray((selectedGig.skills as any).technical) ? (selectedGig.skills as any).technical : []),
                          ...(selectedGig.skills && Array.isArray((selectedGig.skills as any).soft) ? (selectedGig.skills as any).soft : [])
                        ].map((skill: any, idx: number) => (
                          <li key={idx} className="flex items-center">
                            <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
                            <span className="text-indigo-800">{skill.skill}</span>
                            {skill.level ? (
                              <span className="ml-2 text-xs text-indigo-600 font-medium bg-indigo-100 px-2 py-0.5 rounded-full">
                                Level {skill.level}
                              </span>
                            ) : null}
                          </li>
                        ))}
                        {[
                          ...(selectedGig.skills?.professional || []),
                          ...(selectedGig.skills && Array.isArray((selectedGig.skills as any).technical) ? (selectedGig.skills as any).technical : []),
                          ...(selectedGig.skills && Array.isArray((selectedGig.skills as any).soft) ? (selectedGig.skills as any).soft : [])
                        ].length === 0 && (
                          <li className="text-indigo-400">No skill requirement</li>
                        )}
                      </ul>
                    </div>
                  )}

                  {/* Languages */}
                  {weights.languages > 0 && (
                    <div className="bg-white/80 p-4 rounded-lg shadow-sm">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-indigo-700 font-semibold text-base">🌐 Languages</span>
                      </div>
                      <ul className="space-y-2">
                        {selectedGig.skills && Array.isArray((selectedGig.skills as any).languages) && (selectedGig.skills as any).languages.length > 0
                          ? (selectedGig.skills as any).languages.map((lang: any, idx: number) => (
                              <li key={idx} className="flex items-center">
                                <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
                                <span className="text-indigo-800">{lang.language}</span>
                                {lang.proficiency ? (
                                  <span className="ml-2 text-xs text-indigo-600 font-medium bg-indigo-100 px-2 py-0.5 rounded-full">
                                    {lang.proficiency}
                                  </span>
                                ) : null}
                              </li>
                            ))
                          : <li className="text-indigo-400">No language requirement</li>
                        }
                      </ul>
                    </div>
                  )}

                  {/* Availability */}
                  {weights.availability > 0 && (
                    <div className="bg-white/80 p-4 rounded-lg shadow-sm">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-indigo-700 font-semibold text-base">⏰ Availability</span>
                      </div>
                      {(selectedGig as any).availability && Array.isArray((selectedGig as any).availability.schedule) && (selectedGig as any).availability.schedule.length > 0 ? (
                        <ul className="space-y-2">
                          {(selectedGig as any).availability.schedule.map((slot: any, idx: number) => (
                            <li key={idx} className="flex items-center">
                              <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
                              <span className="text-indigo-800">
                                <span className="font-semibold">{slot.day}:</span>
                                <span className="ml-2 text-xs text-indigo-600 font-medium bg-indigo-100 px-2 py-0.5 rounded-full">
                                  {slot.hours?.start || "?"} - {slot.hours?.end || "?"}
                                </span>
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="text-indigo-400">No availability requirement</div>
                      )}
                    </div>
                  )}
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
                      <p>Required Experience: {gig.requiredExperience}+ years</p>
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
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
          ) : matches.length > 0 ? (
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
                      <th className="px-6 py-4 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">Agent</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">Languages</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">Skills</th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-indigo-700 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {matches.map((match, index) => (
                      <tr 
                        key={index} 
                        className="hover:bg-indigo-50 transition-all duration-200"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-4">
                            {match.agentInfo?.photo ? (
                              <img src={match.agentInfo.photo} alt="avatar" className="w-12 h-12 rounded-full border-2 border-indigo-100 shadow-sm" />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg shadow-sm">
                                {match.agentInfo?.name?.[0] || "?"}
                              </div>
                            )}
                            <div>
                              <div className="font-semibold text-gray-900">{match.agentInfo?.name}</div>
                              <div className="text-sm text-gray-500">{match.agentInfo?.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {match.agentInfo?.languages?.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {match.agentInfo.languages.map((lang: { language: string; proficiency?: string }, i: number) => (
                                <span key={i} className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-medium">
                                  {lang.language} {lang.proficiency && <span>({lang.proficiency})</span>}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400">No languages</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {match.skillsMatch?.details?.matchingSkills?.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {match.skillsMatch.details.matchingSkills.map((skill: { skill: string; requiredLevel?: number }, i: number) => (
                                <span key={i} className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                                  {skill.skill} {skill.requiredLevel && <span>(Level {skill.requiredLevel})</span>}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400">No skills</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-lg"
                            onClick={() => handleCreateGigAgent(match)}
                          >
                            <Zap className="w-4 h-4 mr-2" />
                            Match
                          </button>
                        </td>
                      </tr>
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