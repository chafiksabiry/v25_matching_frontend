import React, { useState, useEffect } from 'react';
import { Rep, Gig, Match, MatchingWeights } from '../types';
import { formatScore } from '../utils/matchingAlgorithm';
import { getReps, getGigs, findMatchesForGig, findGigsForRep, generateOptimalMatches } from '../api';
import { findMatchesWithAI } from '../api/matching';
import { Activity, Users, Briefcase, Zap, Settings, Clock } from 'lucide-react';
import axios from 'axios';
import Cookies from 'js-cookie';

const defaultMatchingWeights: MatchingWeights = {
  experience: 0.15,
  skills: 0.20,
  industry: 0.15,
  language: 0.10,
  availability: 0.10,
  timezone: 0.05,
  performance: 0.20,
  region: 0.05
};

type TabType = 'gigs' | 'reps' | 'optimal';

const MatchingDashboard: React.FC = () => {
  const [reps, setReps] = useState<Rep[]>([]);
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [selectedGig, setSelectedGig] = useState<Gig | null>(null);
  const [selectedRep, setSelectedRep] = useState<Rep | null>(null);
  const [weights, setWeights] = useState<MatchingWeights>(defaultMatchingWeights);
  const [activeTab, setActiveTab] = useState<TabType>('gigs');
  const [showWeights, setShowWeights] = useState(false);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  
  const resultsTableRef = React.useRef<HTMLDivElement>(null);

  const scrollToResults = () => {
    if (resultsTableRef.current) {
      resultsTableRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleGigSelect = (gig: Gig) => {
    setSelectedGig(gig);
    setTimeout(scrollToResults, 100); // Petit délai pour laisser le temps aux résultats de se charger
  };

  const handleRepSelect = (rep: Rep) => {
    setSelectedRep(rep);
    setTimeout(scrollToResults, 100); // Petit délai pour laisser le temps aux résultats de se charger
  };

  const paginatedReps = reps.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const paginatedGigs = gigs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(reps.length / itemsPerPage);

  // Fetch reps and gigs on component mount
  useEffect(() => {
    const fetchData = async () => {
      setInitialLoading(true);
      try {
        console.log('Fetching data...');
        const [repsData, gigsData] = await Promise.all([
          getReps(),
          getGigs()
        ]);
        console.log('=== REPS DATA ===', repsData);
        console.log('=== GIGS DATA ===', gigsData);
        setReps(repsData);
        setGigs(gigsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch data. Please try again.');
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
        console.log('Getting matches...', { activeTab, selectedGig, selectedRep });
        
        let response;
        if (activeTab === 'gigs' && selectedGig) {
          console.log('Finding matches for gig:', selectedGig);
          // Use AI matching instead of regular matching
          const matches = await findMatchesWithAI(selectedGig, reps);
          console.log('=== MATCHES FOR GIG ===', matches);
          setMatches(matches);
        } else if (activeTab === 'reps' && selectedRep) {
          console.log('Finding matches for rep:', selectedRep);
          response = await findGigsForRep(selectedRep._id, weights);
          console.log('=== MATCHES FOR REP ===', response);
          setMatches(response.matches || []);
        } else if (activeTab === 'optimal') {
          setLoading(true);
          console.log('Generating optimal matches');
          response = await generateOptimalMatches(weights);
          console.log('=== OPTIMAL MATCHES ===', response);
          setMatches(response.matches || []);
          setLoading(false);
        } else {
          setMatches([]);
        }
      } catch (error) {
        console.error('Error getting matches:', error);
        setError('Failed to get matches. Please try again.');
        setMatches([]);
      }
    };
    
    getMatches();
  }, [activeTab, selectedGig, selectedRep, weights, reps]);
  
  // Get rep or gig details for a match
  const getRepForMatch = (match: Match) => reps.find(rep => rep._id === match.repId);
  const getGigForMatch = (match: Match) => gigs.find(gig => gig._id === match.gigId);

  // Handle weight change
  const handleWeightChange = (key: keyof MatchingWeights, value: number) => {
    setWeights(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Reset weights to default
  const resetWeights = () => {
    setWeights(defaultMatchingWeights);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-indigo-700 text-white p-6 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Zap size={28} className="text-yellow-300" />
            <h1 className="text-2xl font-bold">HARX Smart Matching System</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={async () => {
                try {
                  const companyId = Cookies.get("companyId");
                  
                  if (companyId) {
                    await axios.put(
                      `${import.meta.env.VITE_COMPANY_API_URL}/onboarding/companies/${companyId}/onboarding/phases/3/steps/10`,
                      { status: 'completed', currentStep: 13 }
                    );
                  }
                  window.location.href = '/app11';
                } catch (error) {
                  console.error('Error updating onboarding progress:', error);
                  window.location.href = '/app11';
                }
              }}
              className="flex items-center space-x-2 bg-indigo-500 hover:bg-indigo-400 px-6 py-2.5 rounded-lg transition text-white font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <span>Back to onboarding</span>
            </button>
            <button 
              onClick={() => setShowWeights(!showWeights)}
              className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-md transition"
            >
              <Settings size={18} />
              <span>Adjust Weights</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-6">
        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <p>{error}</p>
          </div>
        )}
        
        {/* Loading Indicator */}
        {initialLoading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        )}

        {/* Weights Configuration Panel */}
        {showWeights && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Matching Weights Configuration</h2>
              <button 
                onClick={resetWeights}
                className="text-sm bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded"
              >
                Reset to Default
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(weights).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-sm font-medium text-gray-700 capitalize">
                      {key} ({Math.round(value * 100)}%)
                    </label>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={value}
                    onChange={(e) => handleWeightChange(key as keyof MatchingWeights, parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-4">
              Note: These weights determine how much each factor contributes to the overall matching score.
            </p>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="flex border-b">
            <button 
              className={`flex-1 py-4 px-6 text-center font-medium ${
                activeTab === 'gigs' 
                ? 'bg-indigo-600 text-white' 
                : 'text-gray-600 hover:text-indigo-600'
              }`}
              onClick={() => setActiveTab('gigs')}
            >
              <div className="flex items-center justify-center space-x-2">
                <Briefcase size={18} />
                <span>Match Reps to Gig</span>
              </div>
            </button>
            <button 
              className={`flex-1 py-4 px-6 text-center font-medium ${
                activeTab === 'reps' 
                ? 'bg-indigo-600 text-white' 
                : 'text-gray-600 hover:text-indigo-600'
              }`}
              onClick={() => setActiveTab('reps')}
              style={{ display: 'none' }}
            >
              <div className="flex items-center justify-center space-x-2">
                <Users size={18} />
                <span>Find Gigs for Rep</span>
              </div>
            </button>
            <button 
              className={`flex-1 py-4 px-6 text-center font-medium ${
                activeTab === 'optimal' 
                ? 'bg-indigo-600 text-white' 
                : 'text-gray-600 hover:text-indigo-600'
              }`}
              onClick={() => setActiveTab('optimal')}
            >
              <div className="flex items-center justify-center space-x-2">
                <Activity size={18} />
                <span>Optimal Matching</span>
              </div>
            </button>
          </div>
        </div>

        {/* Selection Area */}
        {activeTab === 'gigs' && !loading && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Select a Gig to Find Matching Reps</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedGigs.map(gig => (
                <div 
                  key={gig._id}
                  className={`border rounded-lg p-4 cursor-pointer ${
                    selectedGig?._id === gig._id 
                    ? 'border-2 border-indigo-600 bg-indigo-50 ring-2 ring-indigo-600 ring-opacity-50' 
                    : 'border-gray-200 hover:border-indigo-600 hover:shadow-md'
                  }`}
                  onClick={() => handleGigSelect(gig)}
                >
                  <div className="flex justify-between items-start">
                    <h3 className={`font-medium ${selectedGig?._id === gig._id ? 'text-indigo-900' : 'text-gray-800'}`}>
                      {gig.title}
                    </h3>
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                      {gig.category}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{gig.companyName}</p>
                  <div className="mt-3 text-xs text-gray-600">
                    <p>Required Experience: {gig.requiredExperience}+ years</p>
                    <p>Expected Conversion: {gig.expectedConversionRate ? `${(gig.expectedConversionRate * 100).toFixed(1)}%` : 'N/A'}</p>
                    <p>Region: {gig.targetRegion || 'Any'}</p>
                  </div>
                </div>
              ))}
            </div>
            {/* Pagination Controls */}
            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
              <div className="flex flex-1 justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium ${
                    currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
                  disabled={currentPage === totalPages}
                  className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium ${
                    currentPage === totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{((currentPage - 1) * itemsPerPage) + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(currentPage * itemsPerPage, activeTab === 'gigs' ? gigs.length : reps.length)}</span> of{' '}
                    <span className="font-medium">{activeTab === 'gigs' ? gigs.length : reps.length}</span> results
                  </p>
                </div>
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <button
                      onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center rounded-l-md px-2 py-2 ${
                        currentPage === 1
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-indigo-600 hover:bg-indigo-50'
                      } border border-gray-300`}
                    >
                      <span className="sr-only">Previous</span>
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                      </svg>
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                          currentPage === page
                            ? 'z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                            : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
                      disabled={currentPage === totalPages}
                      className={`relative inline-flex items-center rounded-r-md px-2 py-2 ${
                        currentPage === totalPages
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-indigo-600 hover:bg-indigo-50'
                      } border border-gray-300`}
                    >
                      <span className="sr-only">Next</span>
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
            {/* Voir plus button */}
            {/* {activeTab === 'gigs' && gigs.length > itemsPerPage && (
              <div className="mt-4 flex justify-center">
                <button
                  onClick={() => setItemsPerPage(gigs.length)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Voir plus
                </button>
              </div>
            )} */}
          </div>
        )}

        {activeTab === 'reps' && !loading && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6" style={{ display: 'none' }}>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Select a Rep to Find Matching Gigs</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedReps.map(rep => (
                <div 
                  key={rep._id}
                  className={`border rounded-lg p-4 cursor-pointer ${
                    selectedRep?._id === rep._id 
                    ? 'border-2 border-indigo-600 bg-indigo-50 ring-2 ring-indigo-600 ring-opacity-50' 
                    : 'border-gray-200 hover:border-indigo-600 hover:shadow-md'
                  }`}
                  onClick={() => handleRepSelect(rep)}
                >
                  <div className="flex justify-between items-start">
                    <h3 className={`font-medium ${selectedRep?._id === rep._id ? 'text-indigo-900' : 'text-gray-800'}`}>
                      {rep.personalInfo?.name || 'No name specified'}
                    </h3>
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                      {rep.professionalSummary?.yearsOfExperience || 'No experience specified'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {rep.professionalSummary?.currentRole || 'No current role specified'}
                  </p>
                  <div className="mt-3 text-xs text-gray-600">
                    <p>Skills: {
                      [
                        ...(rep.skills?.technical || []).map(s => s.skill),
                        ...(rep.skills?.professional || []).map(s => s.skill),
                        ...(rep.skills?.soft || []).map(s => s.skill)
                      ].join(', ') || 'No skills specified'
                    }</p>
                    <p>Industries: {rep.professionalSummary?.industries?.join(', ') || 'No industries specified'}</p>
                    <p>Languages: {rep.personalInfo?.languages?.map(l => l.language).join(', ') || 'No languages specified'}</p>
                    <p>Location: {rep.personalInfo?.location || 'No location specified'}</p>
                  </div>
                </div>
              ))}
            </div>
            {/* Voir plus button */}
            {/* {activeTab === 'reps' && reps.length > itemsPerPage && (
              <div className="mt-4 flex justify-center">
                <button
                  onClick={() => setItemsPerPage(reps.length)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Voir plus
                </button>
              </div>
            )} */}
          </div>
        )}

        {activeTab === 'optimal' && !loading && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Activity size={24} className="text-indigo-600" />
                <h2 className="text-xl font-semibold text-gray-800">Optimal Matching Results</h2>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">{matches.length}</span> optimal pairings found
                </div>
                <button 
                  onClick={() => {
                    setLoading(true);
                    let promise;
                    switch (activeTab as TabType) {
                      case 'gigs':
                        promise = selectedGig 
                          ? findMatchesForGig(selectedGig._id, weights)
                          : Promise.resolve([]);
                        break;
                      case 'reps':
                        promise = selectedRep
                          ? findGigsForRep(selectedRep._id, weights)
                          : Promise.resolve([]);
                        break;
                      case 'optimal':
                        promise = generateOptimalMatches(weights);
                        break;
                      default:
                        promise = Promise.resolve([]);
                    }

                    promise
                      .then((response: { matches?: Match[] } | Match[]) => {
                        setMatches(Array.isArray(response) ? response : response.matches || []);
                      })
                      .finally(() => {
                        setLoading(false);
                      });
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm flex items-center space-x-2"
                >
                  <Zap size={16} />
                  <span>Regenerate Matches</span>
                </button>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">About Optimal Matching</h3>
              <p className="text-sm text-gray-600">
                This algorithm finds the best possible combinations of reps and gigs to maximize overall success probability
                and satisfaction. It considers all factors simultaneously to create the most efficient pairings.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-green-800 mb-2">Global Match Score</h4>
                <div className="text-2xl font-bold text-green-600">
                  {matches.length > 0 ? 
                    `${(matches.reduce((acc, m) => acc + m.score, 0) / matches.length * 100).toFixed(1)}%` 
                    : 'N/A'}
                </div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-800 mb-2">Total Matches</h4>
                <div className="text-2xl font-bold text-blue-600">
                  {matches.length}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results Area */}
        {matches.length > 0 && !loading && (
          <div ref={resultsTableRef} className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
            <div className="p-6 border-b bg-gradient-to-r from-indigo-600 to-indigo-700">
              <h2 className="text-xl font-semibold text-white">
                {activeTab === 'gigs' 
                  ? `Top Matching Reps for "${selectedGig?.title}"`
                  : `Best Gigs for ${selectedRep?.personalInfo?.name}`}
              </h2>
              <p className="text-indigo-100 mt-1">
                {matches.length} matches found
              </p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-indigo-50">
                  <tr>
                    {activeTab === 'gigs' ? (
                      <>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">Location</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">Current Role</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">Skills</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">Score</th>
                      </>
                    ) : (
                      <>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">Gig Title</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">Required Experience</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">Required Skills</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">Score</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {matches.map((match, index) => (
                    <tr key={match._id} className={`hover:bg-indigo-50 transition-colors duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      {activeTab === 'gigs' ? (
                        <>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-indigo-900">
                              {getRepForMatch(match)?.personalInfo?.name}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600">
                              {getRepForMatch(match)?.personalInfo?.location}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600">
                              {getRepForMatch(match)?.professionalSummary?.currentRole}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600">
                              {getRepForMatch(match)?.professionalSummary?.keyExpertise?.join(', ')}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-4">
                              <div className="flex-1">
                                <div className="w-full bg-gray-100 rounded-full h-4 relative overflow-hidden">
                                  <div 
                                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 to-indigo-600 transition-all duration-500 ease-out"
                                    style={{ width: `${(match.score || 0) * 100}%` }}
                                  >
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center justify-center bg-indigo-100 rounded-lg px-3 py-1">
                                <span className="text-base font-bold text-indigo-700">
                                  {formatScore(match.score || 0)}
                                </span>
                              </div>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-indigo-900">
                              {match.title}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600">
                              {match.category}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600">
                              {getGigForMatch(match)?.seniority?.yearsExperience} years
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600">
                              {getGigForMatch(match)?.skills?.professional?.join(', ')}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-4">
                              <div className="flex-1">
                                <div className="w-full bg-gray-100 rounded-full h-4 relative overflow-hidden">
                                  <div 
                                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 to-indigo-600 transition-all duration-500 ease-out"
                                    style={{ width: `${(match.score || 0) * 100}%` }}
                                  >
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center justify-center bg-indigo-100 rounded-lg px-3 py-1">
                                <span className="text-base font-bold text-indigo-700">
                                  {formatScore(match.score || 0)}
                                </span>
                              </div>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Voir plus button for matches */}
            {matches.length > 0 && !loading && (
              <div className="mt-4 flex justify-center">
                <button
                  onClick={async () => {
                    setLoading(true);
                    try {
                      let response;
                      if (activeTab === 'gigs' && selectedGig) {
                        response = await findMatchesForGig(selectedGig._id, weights);
                      } else if (activeTab === 'reps' && selectedRep) {
                        response = await findGigsForRep(selectedRep._id, weights);
                      } else if (activeTab === 'optimal') {
                        response = await generateOptimalMatches(weights);
                      }
                      if (response && response.matches) {
                        setMatches(response.matches);
                      }
                    } catch (error) {
                      console.error('Error loading more matches:', error);
                      setError('Failed to load more matches. Please try again.');
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Voir plus
                </button>
              </div>
            )}
          </div>
        )}

        {/* No Results Message */}
        {matches.length === 0 && !loading && (activeTab === 'gigs' || activeTab === 'reps') && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="flex justify-center mb-4">
              <Clock size={48} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">No Matches Yet</h3>
            <p className="text-gray-600">
              {activeTab === 'gigs' 
                ? 'Select a gig to see matching reps' 
                : 'Select a rep to see matching gigs'}
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-400 p-6 mt-12">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Zap size={20} className="text-yellow-400" />
              <span className="text-white font-medium">HARX Smart Matching System</span>
            </div>
            <div className="text-sm">
              © 2025 HARX. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MatchingDashboard;