/**
 * Calculate the matching score between a rep and a gig
 */
export function calculateMatchScore(rep, gig, weights) {
  // Calculate individual scores
  const experienceScore = calculateExperienceScore(rep.experience, gig.requiredExperience);
  const skillsScore = calculateSkillsScore(rep.skills, gig.requiredSkills);
  const categoryScore = calculateCategoryScore(rep.industries, gig.category);
  const languageScore = calculateLanguageScore(rep.languages, gig.preferredLanguages);
  const availabilityScore = calculateAvailabilityScore(rep.availability, gig.duration);
  const timezoneScore = calculateTimezoneScore(rep.timezone, gig.timezone);
  const performanceScore = calculatePerformanceScore(rep.conversionRate, rep.reliability, rep.rating, gig.expectedConversionRate);
  const regionScore = calculateRegionScore(rep.region, gig.targetRegion);

  // Apply weights to individual scores
  const weightedExperienceScore = experienceScore * weights.experience;
  const weightedSkillsScore = skillsScore * weights.skills;
  const weightedCategoryScore = categoryScore * weights.industry;
  const weightedLanguageScore = languageScore * weights.language;
  const weightedAvailabilityScore = availabilityScore * weights.availability;
  const weightedTimezoneScore = timezoneScore * weights.timezone;
  const weightedPerformanceScore = performanceScore * weights.performance;
  const weightedRegionScore = regionScore * weights.region;

  // Calculate total score (0-1 range)
  const totalScore = 
    weightedExperienceScore + 
    weightedSkillsScore + 
    weightedCategoryScore + 
    weightedLanguageScore + 
    weightedAvailabilityScore + 
    weightedTimezoneScore + 
    weightedPerformanceScore + 
    weightedRegionScore;

  return {
    repId: rep._id,
    gigId: gig._id,
    score: totalScore,
    matchDetails: {
      experienceScore,
      skillsScore,
      categoryScore,
      languageScore,
      availabilityScore,
      timezoneScore,
      performanceScore,
      regionScore
    }
  };
}

/**
 * Calculate experience score based on rep's experience vs. gig's required experience
 */
function calculateExperienceScore(repExperience, requiredExperience) {
  if (repExperience >= requiredExperience) {
    // Bonus for exceeding required experience, but with diminishing returns
    return Math.min(1, 0.8 + (repExperience - requiredExperience) * 0.04);
  } else {
    // Penalty for not meeting required experience
    return Math.max(0, repExperience / requiredExperience * 0.8);
  }
}

/**
 * Calculate skills score based on overlap between rep's skills and gig's required skills
 */
function calculateSkillsScore(repSkills, requiredSkills) {
  if (requiredSkills.length === 0) return 1;
  
  let matchedSkills = 0;
  for (const skill of requiredSkills) {
    if (repSkills.includes(skill)) {
      matchedSkills++;
    }
  }
  
  return matchedSkills / requiredSkills.length;
}

/**
 * Calculate category score based on rep's industries and gig's category
 */
function calculateCategoryScore(repIndustries, gigCategory) {
  if (!repIndustries || !gigCategory) return 0;
  if (!Array.isArray(repIndustries)) return 0;
  return repIndustries.includes(gigCategory) ? 1 : 0;
}

/**
 * Calculate language score based on overlap between rep's languages and gig's preferred languages
 */
function calculateLanguageScore(repLanguages, preferredLanguages) {
  if (preferredLanguages.length === 0) return 1;
  
  let matchedLanguages = 0;
  for (const language of preferredLanguages) {
    if (repLanguages.includes(language)) {
      matchedLanguages++;
    }
  }
  
  return matchedLanguages / preferredLanguages.length;
}

/**
 * Calculate availability score based on rep's availability vs. gig's duration
 */
function calculateAvailabilityScore(repAvailability, gigDuration) {
  // For simplicity, we'll just check if the rep has availability on weekdays
  // In a real implementation, this would be more sophisticated
  const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const availableDays = repAvailability.map(a => a.day);
  
  let coveredDays = 0;
  for (const day of weekdays) {
    if (availableDays.includes(day)) {
      coveredDays++;
    }
  }
  
  return coveredDays / weekdays.length;
}

/**
 * Calculate timezone score based on rep's timezone vs. gig's timezone
 */
function calculateTimezoneScore(repTimezone, gigTimezone) {
  // For simplicity, exact match = 1, otherwise 0.5
  // In a real implementation, this would calculate actual time differences
  return repTimezone === gigTimezone ? 1 : 0.5;
}

/**
 * Calculate performance score based on rep's historical performance metrics
 */
function calculatePerformanceScore(
  repConversionRate, 
  repReliability, 
  repRating, 
  expectedConversionRate
) {
  // Conversion rate comparison (0-0.4)
  const conversionScore = repConversionRate >= expectedConversionRate 
    ? 0.4 
    : 0.4 * (repConversionRate / expectedConversionRate);
  
  // Reliability score (0-0.3)
  const reliabilityScore = repReliability / 10 * 0.3;
  
  // Rating score (0-0.3)
  const ratingScore = repRating / 5 * 0.3;
  
  return conversionScore + reliabilityScore + ratingScore;
}

/**
 * Calculate region score based on rep's region vs. gig's target region
 */
function calculateRegionScore(repRegion, targetRegion) {
  return repRegion === targetRegion ? 1 : 0;
}

/**
 * Find the best matches for a specific gig
 */
export function findMatchesForGig(gig, reps, weights, limit = 10) {
  const matches = [];
  
  for (const rep of reps) {
    const match = calculateMatchScore(rep, gig, weights);
    matches.push(match);
  }
  
  // Sort matches by score in descending order and limit results
  return matches.sort((a, b) => b.score - a.score).slice(0, limit);
}

/**
 * Find the best gigs for a specific rep
 */
export function findGigsForRep(rep, gigs, weights, limit = 10) {
  const matches = [];
  
  for (const gig of gigs) {
    const match = calculateMatchScore(rep, gig, weights);
    matches.push(match);
  }
  
  // Sort matches by score in descending order and limit results
  return matches.sort((a, b) => b.score - a.score).slice(0, limit);
}

/**
 * Generate all possible matches between reps and gigs
 */
export function generateAllMatches(reps, gigs, weights) {
  const allMatches = [];
  
  for (const rep of reps) {
    for (const gig of gigs) {
      const match = calculateMatchScore(rep, gig, weights);
      allMatches.push(match);
    }
  }
  
  return allMatches.sort((a, b) => b.score - a.score);
}

/**
 * Optimize matches to ensure best overall allocation
 * This is a simplified version of the Hungarian algorithm for optimal assignment
 */
export function optimizeMatches(reps, gigs, weights) {
  // Generate all possible matches
  const allMatches = generateAllMatches(reps, gigs, weights);
  
  // Track assigned reps and gigs
  const assignedReps = new Set();
  const assignedGigs = new Set();
  const optimalMatches = [];
  
  // Greedy assignment (not truly optimal, but simpler for demonstration)
  for (const match of allMatches) {
    if (!assignedReps.has(match.repId.toString()) && !assignedGigs.has(match.gigId.toString())) {
      optimalMatches.push(match);
      assignedReps.add(match.repId.toString());
      assignedGigs.add(match.gigId.toString());
      
      // Stop when all reps or all gigs are assigned
      if (assignedReps.size === reps.length || assignedGigs.size === gigs.length) {
        break;
      }
    }
  }
  
  return optimalMatches;
}

/**
 * Format match score as percentage
 */
export function formatScore(score) {
  return `${Math.round(score * 100)}%`;
}