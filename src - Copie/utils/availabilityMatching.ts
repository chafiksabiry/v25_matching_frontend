import { DayOfWeek, TimeSlot, DaySchedule, Availability } from '../types';

interface AvailabilityMatchResult {
  score: number;
  matchingDays: Array<{
    day: string;
    gigHours: { start: string; end: string };
    agentHours: { start: string; end: string };
  }>;
  missingDays: string[];
  insufficientHours: any[];
  matchStatus: 'perfect_match' | 'partial_match' | 'no_match';
}

/**
 * Converts time string to minutes for comparison
 */
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Validates time format (HH:MM)
 */
function isValidTimeFormat(time: string): boolean {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
}

/**
 * Validates a day schedule
 */
function validateDaySchedule(schedule: DaySchedule): void {
  if (!schedule.day || !['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].includes(schedule.day)) {
    throw new Error(`Invalid day: ${schedule.day}. Must be one of: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday`);
  }

  if (!schedule.hours || !schedule.hours.start || !schedule.hours.end) {
    throw new Error('Missing hours in schedule');
  }

  if (!isValidTimeFormat(schedule.hours.start)) {
    throw new Error(`Invalid start time format: ${schedule.hours.start}. Use 24-hour format like "09:00" or "17:30"`);
  }

  if (!isValidTimeFormat(schedule.hours.end)) {
    throw new Error(`Invalid end time format: ${schedule.hours.end}. Use 24-hour format like "17:00" or "21:30"`);
  }

  const startMinutes = timeToMinutes(schedule.hours.start);
  const endMinutes = timeToMinutes(schedule.hours.end);

  if (startMinutes >= endMinutes) {
    throw new Error(`Invalid time range: start time (${schedule.hours.start}) must be before end time (${schedule.hours.end})`);
  }
}

/**
 * Compares two availability schedules and returns a match result
 */
export function compareAvailabilitySchedules(gigAvailability: Availability, agentAvailability: Availability): AvailabilityMatchResult {
  if (!gigAvailability?.schedule || !agentAvailability?.schedule) {
    return {
      score: 0,
      matchingDays: [],
      missingDays: [],
      insufficientHours: [],
      matchStatus: 'no_match'
    };
  }

  try {
    // Validate schedules
    try {
      gigAvailability.schedule.forEach(validateDaySchedule);
      agentAvailability.schedule.forEach(validateDaySchedule);
    } catch (error) {
      console.error('Schedule validation error:', error);
      return {
        score: 0,
        matchingDays: [],
        missingDays: [],
        insufficientHours: [],
        matchStatus: 'no_match'
      };
    }

    const matchingDays: Array<{
      day: string;
      gigHours: { start: string; end: string };
      agentHours: { start: string; end: string };
    }> = [];
    const missingDays: string[] = [];
    const insufficientHours: any[] = [];

    // Check each day in the gig schedule
    gigAvailability.schedule.forEach(gigDay => {
      const agentDay = agentAvailability.schedule.find(
        agentSchedule => agentSchedule.day === gigDay.day
      );

      if (!agentDay) {
        missingDays.push(gigDay.day);
        return;
      }

      // Check if hours overlap
      const gigStart = timeToMinutes(gigDay.hours.start);
      const gigEnd = timeToMinutes(gigDay.hours.end);
      const agentStart = timeToMinutes(agentDay.hours.start);
      const agentEnd = timeToMinutes(agentDay.hours.end);

      // Calculate overlap
      const overlapStart = Math.max(gigStart, agentStart);
      const overlapEnd = Math.min(gigEnd, agentEnd);
      const overlap = Math.max(0, overlapEnd - overlapStart);

      if (overlap > 0) {
        // Calculate overlap percentage
        const gigDuration = gigEnd - gigStart;
        const overlapPercentage = overlap / gigDuration;

        if (overlapPercentage >= 0.8) {
          // Perfect match (80% or more overlap)
          matchingDays.push({
            day: gigDay.day,
            gigHours: gigDay.hours,
            agentHours: agentDay.hours
          });
        } else if (overlapPercentage >= 0.5) {
          // Partial match (50% or more overlap)
          matchingDays.push({
            day: gigDay.day,
            gigHours: gigDay.hours,
            agentHours: agentDay.hours
          });
        } else {
          insufficientHours.push({
            day: gigDay.day,
            required: gigDay.hours,
            available: agentDay.hours,
            overlapPercentage
          });
        }
      } else {
        insufficientHours.push({
          day: gigDay.day,
          required: gigDay.hours,
          available: agentDay.hours,
          overlapPercentage: 0
        });
      }
    });

    // Calculate overall score
    const totalDays = gigAvailability.schedule.length;
    const perfectMatches = matchingDays.length;
    const score = totalDays > 0 ? perfectMatches / totalDays : 0;

    // Determine match status
    let matchStatus: 'perfect_match' | 'partial_match' | 'no_match';
    if (score >= 0.8) {
      matchStatus = 'perfect_match';
    } else if (score >= 0.5) {
      matchStatus = 'partial_match';
    } else {
      matchStatus = 'no_match';
    }

    return {
      score,
      matchingDays,
      missingDays,
      insufficientHours,
      matchStatus
    };
  } catch (error) {
    console.error('Error comparing availability schedules:', error);
    return {
      score: 0,
      matchingDays: [],
      missingDays: [],
      insufficientHours: [],
      matchStatus: 'no_match'
    };
  }
} 