import { DayOfWeek, TimeSlot, DaySchedule, Availability } from '../types';

interface ScheduleMatchResult {
  score: number;
  details: {
    matchingDays: Array<{
      day: DayOfWeek;
      gigHours: TimeSlot;
      agentHours: TimeSlot;
    }>;
    missingDays: DayOfWeek[];
    insufficientHours: DayOfWeek[];
  };
  status: 'perfect_match' | 'partial_match' | 'no_match';
}

/**
 * Validates time format (HH:MM) in 24-hour format
 */
function isValidTimeFormat(time: string): boolean {
  return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
}

/**
 * Converts time string to minutes since midnight
 */
function timeToMinutes(time: string): number {
  if (!isValidTimeFormat(time)) {
    throw new Error(`Invalid time format: ${time}. Use 24-hour format like "09:00" or "17:30"`);
  }
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Checks if two time slots overlap
 */
function doTimeSlotsOverlap(slot1: TimeSlot, slot2: TimeSlot): boolean {
  if (!isValidTimeFormat(slot1.start) || !isValidTimeFormat(slot1.end) ||
      !isValidTimeFormat(slot2.start) || !isValidTimeFormat(slot2.end)) {
    throw new Error('Invalid time format in time slots');
  }

  const start1 = timeToMinutes(slot1.start);
  const end1 = timeToMinutes(slot1.end);
  const start2 = timeToMinutes(slot2.start);
  const end2 = timeToMinutes(slot2.end);

  return start1 < end2 && start2 < end1;
}

/**
 * Calculates the overlap duration between two time slots in minutes
 */
function calculateOverlapDuration(slot1: TimeSlot, slot2: TimeSlot): number {
  if (!isValidTimeFormat(slot1.start) || !isValidTimeFormat(slot1.end) ||
      !isValidTimeFormat(slot2.start) || !isValidTimeFormat(slot2.end)) {
    throw new Error('Invalid time format in time slots');
  }

  const start1 = timeToMinutes(slot1.start);
  const end1 = timeToMinutes(slot1.end);
  const start2 = timeToMinutes(slot2.start);
  const end2 = timeToMinutes(slot2.end);

  const overlapStart = Math.max(start1, start2);
  const overlapEnd = Math.min(end1, end2);

  return Math.max(0, overlapEnd - overlapStart);
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
 * Compares two schedules and returns a match result
 */
export function compareSchedules(gigAvailability: Availability, agentAvailability: Availability): ScheduleMatchResult {
  if (!gigAvailability?.schedule || !agentAvailability?.schedule) {
    return {
      score: 0,
      details: {
        matchingDays: [],
        missingDays: [],
        insufficientHours: []
      },
      status: 'no_match'
    };
  }

  // Validate schedules
  try {
    gigAvailability.schedule.forEach(validateDaySchedule);
    agentAvailability.schedule.forEach(validateDaySchedule);
  } catch (error) {
    console.error('Schedule validation error:', error);
    return {
      score: 0,
      details: {
        matchingDays: [],
        missingDays: [],
        insufficientHours: []
      },
      status: 'no_match'
    };
  }

  const matchingDays: Array<{
    day: DayOfWeek;
    gigHours: TimeSlot;
    agentHours: TimeSlot;
  }> = [];
  const missingDays: DayOfWeek[] = [];
  const insufficientHours: DayOfWeek[] = [];

  // Check each day in the gig schedule
  gigAvailability.schedule.forEach(gigDay => {
    const agentDay = agentAvailability.schedule.find(
      day => day.day === gigDay.day
    );

    if (!agentDay) {
      missingDays.push(gigDay.day);
      return;
    }

    // Check if the time slots overlap
    if (doTimeSlotsOverlap(gigDay.hours, agentDay.hours)) {
      const overlapDuration = calculateOverlapDuration(gigDay.hours, agentDay.hours);
      const gigDuration = timeToMinutes(gigDay.hours.end) - timeToMinutes(gigDay.hours.start);

      // If the overlap is less than the required duration, mark as insufficient
      if (overlapDuration < gigDuration) {
        insufficientHours.push(gigDay.day);
      }

      matchingDays.push({
        day: gigDay.day,
        gigHours: gigDay.hours,
        agentHours: agentDay.hours
      });
    } else {
      insufficientHours.push(gigDay.day);
    }
  });

  // Calculate the match score
  const totalDays = gigAvailability.schedule.length;
  const matchedDays = matchingDays.length;
  const score = totalDays > 0 ? matchedDays / totalDays : 0;

  // Determine the match status
  let status: 'perfect_match' | 'partial_match' | 'no_match';
  if (score === 1 && insufficientHours.length === 0) {
    status = 'perfect_match';
  } else if (score > 0) {
    status = 'partial_match';
  } else {
    status = 'no_match';
  }

  return {
    score,
    details: {
      matchingDays,
      missingDays,
      insufficientHours
    },
    status
  };
} 