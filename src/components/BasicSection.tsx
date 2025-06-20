import React, { useState } from 'react';
import { InfoText } from './InfoText';
import { predefinedOptions } from '../lib/guidance';
import { Briefcase, GraduationCap, Target, BookOpen, Brain, Globe, Search } from 'lucide-react';
import i18n from 'i18n-iso-countries';
import fr from 'i18n-iso-countries/langs/fr.json';
import en from 'i18n-iso-countries/langs/en.json';

// Register languages
i18n.registerLocale(fr);
i18n.registerLocale(en);

interface BasicSectionProps {
  data: {
    title: string;
    description: string;
    category: string;
    destination_zone: string;
    seniority: {
      level: string;
      yearsExperience: string;
    };
  };
  onChange: (data: any) => void;
  errors: { [key: string]: string[] };
}

export function BasicSection({ data, onChange, errors }: BasicSectionProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleCountrySelect = (country: string) => {
    onChange({ ...data, destination_zone: country });
  };

  const getCountriesByZone = (zone: string) => {
    const zoneCountries: { [key: string]: string[] } = {
      'Europe': ['FR', 'DE', 'ES', 'IT', 'NL', 'BE', 'CH', 'AT', 'PT', 'GR', 'PL', 'CZ', 'HU', 'RO', 'BG', 'HR', 'SK', 'SI', 'DK', 'FI', 'SE', 'NO', 'IE', 'GB', 'EE', 'LV', 'LT', 'LU', 'MT', 'CY'],
      'Amérique du Nord': ['US', 'CA', 'MX'],
      'Amérique du Sud': ['BR', 'AR', 'CL', 'CO', 'PE', 'VE', 'EC', 'BO', 'PY', 'UY', 'GY', 'SR', 'TT', 'JM', 'HT', 'DO', 'CU', 'HN', 'NI', 'CR', 'PA', 'SV', 'GT', 'BZ'],
      'Asie': ['CN', 'JP', 'KR', 'IN', 'ID', 'TH', 'VN', 'MY', 'PH', 'SG', 'HK', 'TW'],
      'Afrique': ['ZA', 'EG', 'MA', 'NG', 'KE', 'GH', 'SN', 'TN', 'DZ', 'CI', 'AO', 'TZ', 'ZM', 'ZW', 'NA', 'MG', 'MU', 'MR', 'MZ', 'NE', 'RW', 'SC', 'SL', 'SO', 'SD', 'SZ', 'TG', 'UG'],
      'Océanie': ['AU', 'NZ'],
      'Moyen-Orient': ['AE', 'SA', 'QA', 'KW', 'PS', 'TR', 'LB']
    };

    return (zoneCountries[zone] || [])
      .map(code => {
        const name = i18n.getName(code, 'en');
        return name ? { code, name } : null;
      })
      .filter((country): country is { code: string; name: string } => country !== null);
  };

  const filteredZones = predefinedOptions.basic.destinationZones.filter(zone => {
    const countries = getCountriesByZone(zone);
    return countries.some(country => 
      country.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-8">
      <InfoText>
        Start by providing the basic information about the contact center role. Be specific and clear
        about the position's requirements and responsibilities.
      </InfoText>

      {/* Title and Description */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Briefcase className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">Position Details</h3>
            <p className="text-sm text-gray-600">Define the role title and main responsibilities</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              value={data.title}
              onChange={(e) => onChange({ ...data, title: e.target.value })}
              className={`mt-1 block w-full rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                errors.title ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="e.g., Senior Customer Service Representative"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.join(', ')}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={data.description}
              onChange={(e) => onChange({ ...data, description: e.target.value })}
              rows={4}
              className={`mt-1 block w-full rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                errors.description ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Describe the role, key responsibilities, and what success looks like in this position..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.join(', ')}</p>
            )}
          </div>
        </div>
      </div>

      {/* Category */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Target className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">Role Category</h3>
            <p className="text-sm text-gray-600">Select the primary focus area</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {predefinedOptions.basic.categories.map((category) => (
            <button
              key={category}
              onClick={() => onChange({ ...data, category })}
              className={`flex items-center gap-3 p-4 rounded-xl text-left transition-colors ${
                data.category === category
                  ? 'bg-purple-100 text-purple-700 border border-purple-200'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                data.category === category
                  ? 'bg-purple-600'
                  : 'border-2 border-gray-300'
              }`}>
                {data.category === category && (
                  <div className="w-2.5 h-2.5 rounded-full bg-white" />
                )}
              </div>
              <span className="flex-1">{category}</span>
            </button>
          ))}
        </div>
        {errors.category && (
          <p className="mt-2 text-sm text-red-600">{errors.category.join(', ')}</p>
        )}
      </div>

      {/* Destination Zone */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-amber-100 rounded-lg">
            <Globe className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">Destination Zone</h3>
            <p className="text-sm text-gray-600">Select one or more target regions</p>
          </div>
        </div>

        <div className="mb-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder="Rechercher un pays..."
            />
          </div>
        </div>

        <div className="space-y-6">
          {filteredZones.map((zone) => {
            const countries = getCountriesByZone(zone);
            const filteredCountries = countries.filter(country => 
              country.name.toLowerCase().includes(searchTerm.toLowerCase())
            );

            if (filteredCountries.length === 0) return null;

            return (
              <div key={zone} className="space-y-3">
                <h4 className="text-sm font-medium text-gray-900">{zone}</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {filteredCountries.map((country) => (
                    <button
                      key={country.code}
                      type="button"
                      onClick={() => handleCountrySelect(country.code)}
                      className={`flex items-center gap-2 p-2 rounded-lg text-left transition-colors text-sm ${
                        data.destination_zone === country.code
                          ? 'bg-amber-100 text-amber-700 border border-amber-200'
                          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                        data.destination_zone === country.code
                          ? 'bg-amber-600'
                          : 'border-2 border-gray-300'
                      }`}>
                        {data.destination_zone === country.code && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                      <span className="flex-1 truncate">{country.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {errors.destination_zone && (
          <p className="mt-2 text-sm text-red-600">{errors.destination_zone.join(', ')}</p>
        )}
      </div>

      {/* Seniority */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-emerald-100 rounded-lg">
            <GraduationCap className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">Experience Level</h3>
            <p className="text-sm text-gray-600">Define seniority and experience requirements</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Seniority Level</label>
            <select
              value={data.seniority.level}
              onChange={(e) =>
                onChange({
                  ...data,
                  seniority: { ...data.seniority, level: e.target.value }
                })
              }
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">Select seniority level</option>
              {predefinedOptions.basic.seniorityLevels.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Years of Experience</label>
            <input
              type="text"
              value={data.seniority.yearsExperience}
              onChange={(e) =>
                onChange({
                  ...data,
                  seniority: { ...data.seniority, yearsExperience: e.target.value }
                })
              }
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="e.g., 2-3 years"
            />
          </div>
        </div>

        {data.seniority.level && data.seniority.yearsExperience && (
          <div className="mt-4 p-4 bg-white rounded-lg border border-emerald-200">
            <div className="flex items-center gap-3">
              <Brain className="w-5 h-5 text-emerald-600" />
              <div>
                <span className="font-medium text-gray-900">{data.seniority.level}</span>
                <span className="text-gray-600 mx-2">•</span>
                <span className="text-gray-700">{data.seniority.yearsExperience} experience</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}