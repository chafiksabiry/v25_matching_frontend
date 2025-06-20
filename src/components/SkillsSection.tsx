import React from 'react';
import { InfoText } from './InfoText';
import { SkillSelector } from './SkillSelector';
import { predefinedOptions } from '../lib/guidance';
import { Languages, BookOpen, Laptop, Users } from 'lucide-react';

interface SkillsSectionProps {
  data: {
    languages: Array<{ name: string; level: string }>;
    soft: string[];
    professional: string[];
    technical: string[];
  };
  onChange: (data: any) => void;
  errors: { [key: string]: string[] };
}

export function SkillsSection({ data, onChange, errors }: SkillsSectionProps) {
  return (
    <div className="space-y-6">
      <InfoText>
        Define all required skills for the role, including languages, technical tools, and soft skills.
        Be specific about proficiency levels where applicable.
      </InfoText>

      <div className="grid grid-cols-1 gap-8">
        {/* Languages */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Languages className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Languages</h3>
              <p className="text-sm text-gray-600">Specify required languages and proficiency levels</p>
            </div>
          </div>
          <SkillSelector
            skills={data.languages}
            onChange={(languages) => onChange({ ...data, languages })}
            type="language"
            showLevel={true}
          />
          {errors.languages && (
            <p className="mt-2 text-sm text-red-600">{errors.languages.join(', ')}</p>
          )}
        </div>

        {/* Professional Skills */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BookOpen className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Professional Skills</h3>
              <p className="text-sm text-gray-600">Add required professional and industry-specific skills</p>
            </div>
          </div>
          <SkillSelector
            skills={data.professional.map(skill => ({ name: skill }))}
            onChange={(skills) => onChange({ ...data, professional: skills.map(s => s.name) })}
            type="professional"
          />
        </div>

        {/* Technical Skills */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Laptop className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Technical Skills</h3>
              <p className="text-sm text-gray-600">Specify required technical tools and software proficiency</p>
            </div>
          </div>
          <SkillSelector
            skills={data.technical.map(skill => ({ name: skill }))}
            onChange={(skills) => onChange({ ...data, technical: skills.map(s => s.name) })}
            type="technical"
          />
        </div>

        {/* Soft Skills */}
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Users className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Soft Skills</h3>
              <p className="text-sm text-gray-600">Add interpersonal and communication skills</p>
            </div>
          </div>
          <SkillSelector
            skills={data.soft.map(skill => ({ name: skill }))}
            onChange={(skills) => onChange({ ...data, soft: skills.map(s => s.name) })}
            type="soft"
          />
        </div>
      </div>

      {/* Skill Summary */}
      {(data.languages.length > 0 || data.professional.length > 0 || 
        data.technical.length > 0 || data.soft.length > 0) && (
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Skills Summary</h4>
          <div className="space-y-2">
            {data.languages.length > 0 && (
              <div className="flex items-center gap-2">
                <Languages className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-gray-600">
                  {data.languages.length} language{data.languages.length > 1 ? 's' : ''} required
                </span>
              </div>
            )}
            {data.professional.length > 0 && (
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-purple-600" />
                <span className="text-sm text-gray-600">
                  {data.professional.length} professional skill{data.professional.length > 1 ? 's' : ''}
                </span>
              </div>
            )}
            {data.technical.length > 0 && (
              <div className="flex items-center gap-2">
                <Laptop className="w-4 h-4 text-emerald-600" />
                <span className="text-sm text-gray-600">
                  {data.technical.length} technical skill{data.technical.length > 1 ? 's' : ''}
                </span>
              </div>
            )}
            {data.soft.length > 0 && (
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-orange-600" />
                <span className="text-sm text-gray-600">
                  {data.soft.length} soft skill{data.soft.length > 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}