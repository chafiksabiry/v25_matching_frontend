import React, { useState } from 'react';
import { InfoText } from './InfoText';
import { predefinedOptions } from '../lib/guidance';
import { SelectionList } from './SelectionList';
import { Clock, AlertCircle, Sunrise, Sunset, Sun, Moon } from 'lucide-react';

interface TimeRange {
  start: string;
  end: string;
}

interface ScheduleSectionProps {
  data: {
    days: string[];
    hours: string;
    timeZones: string[];
    flexibility: string[];
    minimumHours: {
      daily?: number;
      weekly?: number;
      monthly?: number;
    };
    startTime?: string;
    endTime?: string;
  };
  onChange: (data: any) => void;
  errors: { [key: string]: string[] };
  hasBaseCommission?: boolean;
}

export function ScheduleSection({ data, onChange, errors, hasBaseCommission }: ScheduleSectionProps) {
  const [startTime, setStartTime] = useState(data.startTime || '09:00');
  const [endTime, setEndTime] = useState(data.endTime || '17:00');

  const handleTimeChange = (type: 'start' | 'end', value: string) => {
    const newTime = type === 'start' ? { startTime: value, endTime } : { startTime, endTime: value };
    const formattedTime = `${formatTime(newTime.startTime)} - ${formatTime(newTime.endTime)}`;
    
    if (type === 'start') {
      setStartTime(value);
    } else {
      setEndTime(value);
    }

    onChange({
      ...data,
      hours: formattedTime,
      ...newTime
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handleMinimumHoursChange = (period: 'daily' | 'weekly' | 'monthly', value: string) => {
    const numericValue = value === '' ? undefined : Math.max(0, parseInt(value) || 0);
    const maxValues = {
      daily: 24,
      weekly: 168,
      monthly: 744
    };

    const limitedValue = numericValue !== undefined ? 
      Math.min(numericValue, maxValues[period]) : undefined;

    onChange({
      ...data,
      minimumHours: {
        ...data.minimumHours,
        [period]: limitedValue
      }
    });
  };

  return (
    <div className="space-y-6">
      <InfoText>
        Define the working schedule and time zone coverage.
        {hasBaseCommission && ' Minimum hours are required for base commission.'}
      </InfoText>

      <div className="space-y-6">
        {/* Working Days */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Working Days</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {weekdays.map((day) => (
              <button
                key={day}
                onClick={() => {
                  const days = data.days.includes(day)
                    ? data.days.filter((d) => d !== day)
                    : [...data.days, day];
                  onChange({ ...data, days });
                }}
                className={`px-3 py-1 rounded-full text-sm ${
                  data.days.includes(day)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
          {errors.days && <p className="mt-1 text-sm text-red-600">{errors.days.join(', ')}</p>}
        </div>

        {/* Working Hours */}
        <div className="bg-white rounded-xl border border-blue-100 overflow-hidden">
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <h3 className="font-medium text-gray-900">Working Hours</h3>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Sunrise className="w-4 h-4 text-orange-500" />
                    <span>Start Time</span>
                  </div>
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => handleTimeChange('start', e.target.value)}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Sunset className="w-4 h-4 text-indigo-500" />
                    <span>End Time</span>
                  </div>
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => handleTimeChange('end', e.target.value)}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600">Working Hours:</span>
                </div>
                <span className="text-lg font-medium text-gray-900">
                  {data.hours || `${formatTime(startTime)} - ${formatTime(endTime)}`}
                </span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-4 gap-4">
              <button
                onClick={() => {
                  setStartTime('09:00');
                  setEndTime('17:00');
                  handleTimeChange('start', '09:00');
                  handleTimeChange('end', '17:00');
                }}
                className="flex flex-col items-center gap-1 p-3 rounded-lg border border-gray-200 hover:bg-gray-50"
              >
                <Sun className="w-5 h-5 text-orange-500" />
                <span className="text-xs text-gray-600">9-5</span>
              </button>

              <button
                onClick={() => {
                  setStartTime('08:00');
                  setEndTime('16:00');
                  handleTimeChange('start', '08:00');
                  handleTimeChange('end', '16:00');
                }}
                className="flex flex-col items-center gap-1 p-3 rounded-lg border border-gray-200 hover:bg-gray-50"
              >
                <Sunrise className="w-5 h-5 text-blue-500" />
                <span className="text-xs text-gray-600">Early</span>
              </button>

              <button
                onClick={() => {
                  setStartTime('10:00');
                  setEndTime('18:00');
                  handleTimeChange('start', '10:00');
                  handleTimeChange('end', '18:00');
                }}
                className="flex flex-col items-center gap-1 p-3 rounded-lg border border-gray-200 hover:bg-gray-50"
              >
                <Clock className="w-5 h-5 text-purple-500" />
                <span className="text-xs text-gray-600">Late</span>
              </button>

              <button
                onClick={() => {
                  setStartTime('13:00');
                  setEndTime('21:00');
                  handleTimeChange('start', '13:00');
                  handleTimeChange('end', '21:00');
                }}
                className="flex flex-col items-center gap-1 p-3 rounded-lg border border-gray-200 hover:bg-gray-50"
              >
                <Moon className="w-5 h-5 text-indigo-500" />
                <span className="text-xs text-gray-600">Evening</span>
              </button>
            </div>
          </div>
        </div>

        {/* Minimum Hours Requirements */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
          <div className="flex items-center gap-2 text-gray-900">
            <Clock className="w-5 h-5" />
            <h3 className="font-medium">
              Minimum Hours Requirements
              {hasBaseCommission && <span className="text-red-500 ml-1">*</span>}
            </h3>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Per Day</label>
              <div className="mt-1">
                <input
                  type="number"
                  min="0"
                  max="24"
                  value={data.minimumHours?.daily ?? ''}
                  onChange={(e) => handleMinimumHoursChange('daily', e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 8"
                />
                <p className="mt-1 text-xs text-gray-500">Maximum: 24 hours</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Per Week</label>
              <div className="mt-1">
                <input
                  type="number"
                  min="0"
                  max="168"
                  value={data.minimumHours?.weekly ?? ''}
                  onChange={(e) => handleMinimumHoursChange('weekly', e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 40"
                />
                <p className="mt-1 text-xs text-gray-500">Maximum: 168 hours</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Per Month</label>
              <div className="mt-1">
                <input
                  type="number"
                  min="0"
                  max="744"
                  value={data.minimumHours?.monthly ?? ''}
                  onChange={(e) => handleMinimumHoursChange('monthly', e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 160"
                />
                <p className="mt-1 text-xs text-gray-500">Maximum: 744 hours</p>
              </div>
            </div>
          </div>

          {hasBaseCommission && !data.minimumHours?.daily && !data.minimumHours?.weekly && !data.minimumHours?.monthly && (
            <div className="flex items-start gap-2 p-3 bg-yellow-50 text-yellow-800 rounded-lg">
              <AlertCircle className="w-5 h-5 mt-0.5" />
              <div>
                <p className="font-medium">Minimum Hours Required</p>
                <p className="text-sm">
                  Please specify minimum hours (daily, weekly, or monthly) when base commission is enabled.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Time Zones */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Time Zones</label>
          <SelectionList
            options={predefinedOptions.basic.timeZones}
            selected={data.timeZones}
            onChange={(timeZones) => onChange({ ...data, timeZones })}
            multiple={true}
            layout="flow"
          />
          {errors.timeZones && (
            <p className="mt-1 text-sm text-red-600">{errors.timeZones.join(', ')}</p>
          )}
        </div>

        {/* Schedule Flexibility */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Schedule Flexibility</label>
          <SelectionList
            options={predefinedOptions.basic.scheduleFlexibility}
            selected={data.flexibility || []}
            onChange={(flexibility) => onChange({ ...data, flexibility })}
            multiple={true}
            layout="flow"
            size="sm"
          />
          <p className="mt-2 text-sm text-gray-500">
            Select all applicable schedule flexibility options
          </p>
        </div>
      </div>
    </div>
  );
}