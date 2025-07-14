import React, { useState } from 'react';

interface AgentInfo {
  name: string;
  email: string;
  photo?: string | null;
  location: string;
  phone: string;
  languages: Array<{
    _id: string;
    language: string;
    proficiency: string;
    iso639_1: string;
  }>;
  skills: {
    technical: Array<{
      _id: string;
      skill: string;
      level: number;
      name: string;
    }>;
    professional: Array<{
      _id: string;
      skill: string;
      level: number;
      name: string;
    }>;
    soft: Array<{
      _id: string;
      skill: string;
      level: number;
      name: string;
    }>;
    contactCenter: any[];
  };
  experience: any[];
}

interface Match {
  agentId: string;
  agentInfo: AgentInfo;
  languageMatch: any;
  skillsMatch: any;
  timezoneMatch: any;
  regionMatch: any;
  scheduleMatch: any;
  matchStatus: string;
}

const PreferedMatchesTest: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>([]);

  const testData: Match = {
    agentId: "686b89bf9b64bf944052bcb6",
    agentInfo: {
      name: "Formoterol bilon",
      email: "formoterol-rep@yopmail.com",
      photo: null,
      location: "",
      phone: "",
      languages: [
        {
          "_id": "686b89bf9b64bf944052bcb8",
          "language": "English",
          "proficiency": "C1",
          "iso639_1": "en"
        },
        {
          "_id": "686b92329b64bf944052be9c",
          "language": "frensh",
          "proficiency": "A2",
          "iso639_1": "fr"
        }
      ],
      skills: {
        technical: [
          {
            "_id": "6874a9302f8db069ee2c09b8",
            "skill": "6868132ac44e8a46719af39e",
            "level": 0,
            "name": "CRM Systems Daily Use"
          }
        ],
        professional: [
          {
            "_id": "6874a9302f8db069ee2c09b9",
            "skill": "68681321c44e8a46719af37c",
            "level": 0,
            "name": "Call Dispositioning"
          }
        ],
        soft: [
          {
            "_id": "6874a9302f8db069ee2c09ba",
            "skill": "6868131dc44e8a46719af350",
            "level": 0,
            "name": "Active Listening"
          }
        ],
        contactCenter: []
      },
      experience: []
    },
    languageMatch: {
      details: {
        matchingLanguages: [],
        missingLanguages: [],
        insufficientLanguages: [
          {
            "language": "French",
            "requiredLevel": "C2",
            "agentLevel": "A2"
          }
        ],
        matchStatus: "no_match"
      }
    },
    skillsMatch: {
      details: {
        matchingSkills: [
          {
            "skill": "6868132ac44e8a46719af39e",
            "skillName": "CRM Systems Daily Use",
            "requiredLevel": 1,
            "agentLevel": 0,
            "type": "technical",
            "agentSkillName": "CRM Systems Daily Use"
          },
          {
            "skill": "68681321c44e8a46719af37c",
            "skillName": "Call Dispositioning",
            "requiredLevel": 1,
            "agentLevel": 0,
            "type": "professional",
            "agentSkillName": "Call Dispositioning"
          },
          {
            "skill": "6868131dc44e8a46719af350",
            "skillName": "Active Listening",
            "requiredLevel": 1,
            "agentLevel": 0,
            "type": "soft",
            "agentSkillName": "Active Listening"
          }
        ],
        missingSkills: [],
        insufficientSkills: [],
        matchStatus: "perfect_match"
      }
    },
    timezoneMatch: {
      score: 1,
      details: {
        gigTimezone: "Europe/Paris",
        agentTimezone: "Africa/Ceuta",
        gigGmtOffset: 7200,
        agentGmtOffset: 7200,
        gmtOffsetDifference: 0,
        reason: "Same timezone"
      },
      matchStatus: "perfect_match"
    },
    regionMatch: {
      score: 0,
      details: {
        gigDestinationZone: "FR",
        agentCountryCode: "ES",
        reason: "Different regions/countries"
      },
      matchStatus: "no_match"
    },
    scheduleMatch: {
      score: 0,
      details: {
        matchingDays: [],
        missingDays: [
          "Tuesday",
          "Thursday"
        ],
        insufficientHours: []
      },
      matchStatus: "no_match"
    },
    matchStatus: "partial_match"
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">PreferedMatches Test</h1>
        
        <button
          onClick={() => setMatches([testData])}
          className="mb-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Load Test Data
        </button>

        {matches.length > 0 && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Matches Found ({matches.length})
              </h2>
              
              {matches.map((match, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-6 mb-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {match.agentInfo.name}
                      </h3>
                      <p className="text-gray-600">{match.agentInfo.email}</p>
                      <p className="text-sm text-gray-500">Agent ID: {match.agentId}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      match.matchStatus === 'perfect_match' ? 'bg-green-100 text-green-800' :
                      match.matchStatus === 'partial_match' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {match.matchStatus}
                    </span>
                  </div>

                  {/* Languages */}
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-700 mb-2">Languages:</h4>
                    <div className="flex flex-wrap gap-2">
                      {match.agentInfo.languages.map((lang, i) => (
                        <span key={i} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                          {lang.language} ({lang.proficiency})
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-700 mb-2">Matching Skills:</h4>
                    <div className="flex flex-wrap gap-2">
                      {match.skillsMatch.details.matchingSkills.map((skill: any, i: number) => (
                        <span key={i} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                          {skill.skillName} (Level {skill.requiredLevel})
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Match Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="font-semibold text-gray-700 mb-2">Language Match</h5>
                      <p className="text-sm text-gray-600">
                        Status: {match.languageMatch.details.matchStatus}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="font-semibold text-gray-700 mb-2">Skills Match</h5>
                      <p className="text-sm text-gray-600">
                        Status: {match.skillsMatch.details.matchStatus}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="font-semibold text-gray-700 mb-2">Timezone Match</h5>
                      <p className="text-sm text-gray-600">
                        Status: {match.timezoneMatch.matchStatus}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="font-semibold text-gray-700 mb-2">Region Match</h5>
                      <p className="text-sm text-gray-600">
                        Status: {match.regionMatch.matchStatus}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Raw Data */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Raw Data</h2>
              <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">
                {JSON.stringify({ preferedmatches: matches }, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PreferedMatchesTest; 