import { compareSchedules } from './scheduleMatching';
import { Match, Availability } from '../types';

/**
 * Calculate the matching score between a rep and a gig
 */
export function calculateMatchScore(
  gigAvailability: Availability,
  agentAvailability: Availability,
  weights: {
    skills: number;
    languages: number;
    schedule: number;
  }
): number {
  // Get schedule match result
  const scheduleMatch = compareSchedules(gigAvailability, agentAvailability);

  // Calculate weighted score
  const scheduleScore = scheduleMatch.score * weights.schedule;

  return scheduleScore;
}

export function formatScore(score: number): string {
  // Format the score - adjust the implementation as needed for your application
  if (typeof score !== 'number' || isNaN(score)) {
    return 'N/A';
  }
  return `${(score * 100).toFixed(1)}%`;
}