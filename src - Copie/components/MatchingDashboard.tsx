import React, { useState, useEffect } from 'react';
import { Users, Briefcase, Zap, Settings, Activity, CheckCircle2, Clock, Filter } from 'lucide-react';
import { Rep, Gig, Match, MatchingWeights, MatchResponse } from '../types';
import { getReps, getGigs, getGigsByCompanyId, findMatchesForGig, createGigAgent, getGigAgentsForGig, getInvitedAgentsForCompany, getEnrollmentRequestsForCompany, getActiveAgentsForCompany, acceptEnrollmentRequest, rejectEnrollmentRequest, getAllSkills, getLanguages, saveGigWeights, getGigWeights, resetGigWeights, Skill, Language, GigWeights } from '../api/matching';
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
    // Skip if no data yet
    if (!companyInvitedAgents || !enrollmentRequests || !activeAgentsList) return;

    // Directly set the lists without filtering again
    setInvitedAgentsList(companyInvitedAgents.filter((agent: any) => !agent.isActive && !agent.hasCompletedOnboarding));
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

    // Check if weights have been modified from original
    if (originalWeights && gigHasWeights) {
      const hasChanges = Object.keys(newWeights).some(
        k => Math.abs(newWeights[k as keyof MatchingWeights] - originalWeights[k as keyof MatchingWeights]) > 0.001
      );
      setHasUnsavedChanges(hasChanges);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto p-6">
        <h1>Rep Matching Panel - Implementation in Progress</h1>
        <p>Total Gigs: {gigs.length}</p>
        <p>Total Reps: {reps.length}</p>
        {error && <div className="error">{error}</div>}
        {initialLoading && <div>Loading...</div>}
      </div>
    </div>
  );
}

export default RepMatchingPanel;
