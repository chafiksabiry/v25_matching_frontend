import React, { useEffect, useState } from 'react';
import {
    ArrowLeft,
    Mail,
    Phone,
    MapPin,
    Clock,
    Globe,
    Award,
    BookOpen,
    Briefcase,
    Star,
    CheckCircle2,
    Share2,
    Linkedin,
    Twitter,
    Instagram,
    Download
} from 'lucide-react';
import { Match } from '../types/matching'; // Adjust path if needed
import { getAgentById } from '../api/matching'; // Need to implement this in api/matching.ts

interface AgentDetailsPageProps {
    agentId: string;
    onBack: () => void;
}

export default function AgentDetailsPage({ agentId, onBack }: AgentDetailsPageProps) {
    const [agent, setAgent] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAgent = async () => {
            try {
                setLoading(true);
                // We'll use a new API function or fetch directly if not available yet
                const response = await fetch(`${import.meta.env.VITE_MATCHING_API_URL || 'http://localhost:5011/api'}/agents/${agentId}`);
                if (!response.ok) throw new Error('Failed to fetch agent details');
                const data = await response.json();
                setAgent(data);
            } catch (err) {
                console.error("Error fetching agent:", err);
                setError("Failed to load agent details. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        if (agentId) {
            fetchAgent();
        }
    }, [agentId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
            </div>
        );
    }

    if (error || !agent) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="bg-red-50 text-red-600 p-6 rounded-xl shadow-lg max-w-md w-full text-center">
                    <h2 className="text-2xl font-bold mb-2">Error</h2>
                    <p>{error || "Agent not found"}</p>
                    <button
                        onClick={onBack}
                        className="mt-6 px-6 py-2 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    // Helper for safe access
    const info = agent.personalInfo || {};
    const prof = agent.professionalSummary || {};
    const skills = agent.skills || {};

    return (
        <div className="min-h-screen bg-[#f8fafc]">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-[#1e293b] to-[#0f172a] text-white pt-12 pb-24 px-4 sm:px-6 lg:px-8 shadow-xl relative overflow-hidden">
                {/* Background Patterns */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <button
                        onClick={onBack}
                        className="group flex items-center text-indigo-300 hover:text-white mb-8 transition-colors duration-200"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                        Back to Dashboard
                    </button>

                    <div className="flex flex-col md:flex-row items-start gap-8">
                        {/* Avatar */}
                        <div className="relative">
                            <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 p-1 shadow-2xl">
                                <div className="w-full h-full rounded-xl bg-white flex items-center justify-center overflow-hidden">
                                    {info.avatar ? (
                                        <img src={info.avatar} alt={info.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-4xl font-bold text-indigo-600">
                                            {(info.name || agent.name || '?').charAt(0)}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="absolute -bottom-3 -right-3 bg-green-500 text-white p-2 rounded-full shadow-lg border-4 border-[#0f172a]">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                        </div>

                        {/* Basic Info */}
                        <div className="flex-1">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-200 mb-2">
                                        {info.name || agent.name}
                                    </h1>
                                    <p className="text-xl text-indigo-200 mb-4">{prof.currentRole || 'Professional Agent'}</p>
                                </div>
                                <div className="flex gap-3">
                                    <button className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors shadow-lg shadow-indigo-500/30 font-medium">
                                        <Mail className="w-4 h-4 mr-2" />
                                        Contact
                                    </button>
                                    <button className="p-2 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-sm transition-colors text-white">
                                        <Share2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Status Pills */}
                            <div className="flex flex-wrap gap-3 mt-4">
                                {info.location || agent.location ? (
                                    <div className="flex items-center px-3 py-1 bg-white/10 rounded-full text-sm backdrop-blur-sm border border-white/10">
                                        <MapPin className="w-4 h-4 mr-1.5 text-indigo-400" />
                                        {info.location || agent.location}
                                    </div>
                                ) : null}
                                {prof.yearsOfExperience ? (
                                    <div className="flex items-center px-3 py-1 bg-white/10 rounded-full text-sm backdrop-blur-sm border border-white/10">
                                        <Briefcase className="w-4 h-4 mr-1.5 text-indigo-400" />
                                        {prof.yearsOfExperience} Years Exp.
                                    </div>
                                ) : null}
                                {agent.availability?.schedule?.length ? (
                                    <div className="flex items-center px-3 py-1 bg-white/10 rounded-full text-sm backdrop-blur-sm border border-white/10">
                                        <Clock className="w-4 h-4 mr-1.5 text-indigo-400" />
                                        Available ({agent.availability.schedule.length} days/wk)
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20 pb-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column */}
                    <div className="space-y-8">

                        {/* Contact Card */}
                        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                                <Globe className="w-5 h-5 mr-2 text-indigo-600" />
                                Contact & Socials
                            </h3>
                            <div className="space-y-4">
                                {info.email && (
                                    <div className="flex items-center p-3 rounded-lg bg-gray-50 hover:bg-indigo-50 transition-colors group">
                                        <div className="p-2 bg-white rounded-md shadow-sm text-gray-400 group-hover:text-indigo-600 mr-3">
                                            <Mail className="w-5 h-5" />
                                        </div>
                                        <div className="truncate text-sm text-gray-600 font-medium">{info.email}</div>
                                    </div>
                                )}
                                {info.phone && (
                                    <div className="flex items-center p-3 rounded-lg bg-gray-50 hover:bg-indigo-50 transition-colors group">
                                        <div className="p-2 bg-white rounded-md shadow-sm text-gray-400 group-hover:text-indigo-600 mr-3">
                                            <Phone className="w-5 h-5" />
                                        </div>
                                        <div className="truncate text-sm text-gray-600 font-medium">{info.phone}</div>
                                    </div>
                                )}
                                <div className="flex gap-2 pt-2">
                                    {/* Social Placeholders */}
                                    <button className="flex-1 py-2 bg-[#0077b5]/10 text-[#0077b5] rounded-lg hover:bg-[#0077b5]/20 flex justify-center">
                                        <Linkedin className="w-5 h-5" />
                                    </button>
                                    <button className="flex-1 py-2 bg-[#1DA1F2]/10 text-[#1DA1F2] rounded-lg hover:bg-[#1DA1F2]/20 flex justify-center">
                                        <Twitter className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Skills Card */}
                        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                                <Award className="w-5 h-5 mr-2 text-indigo-600" />
                                Top Skills
                            </h3>

                            {skills.professional && (
                                <div className="mb-4">
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Professional</p>
                                    <div className="flex flex-wrap gap-2">
                                        {skills.professional.map((s: any, i: number) => (
                                            <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-md text-sm font-medium border border-blue-100">
                                                {s.name || s.skill?.name || 'Skill'}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {skills.technical && (
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Technical</p>
                                    <div className="flex flex-wrap gap-2">
                                        {skills.technical.map((s: any, i: number) => (
                                            <span key={i} className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-md text-sm font-medium border border-emerald-100">
                                                {s.name || s.skill?.name || 'Tech'}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Languages */}
                        {info.languages && info.languages.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                                    <BookOpen className="w-5 h-5 mr-2 text-indigo-600" />
                                    Languages
                                </h3>
                                <div className="space-y-3">
                                    {info.languages.map((l: any, i: number) => (
                                        <div key={i} className="flex justify-between items-center">
                                            <span className="text-gray-700 font-medium">{l.languageName || l.language?.name || 'Language'}</span>
                                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                                {l.proficiency || 'Native'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column (Content) */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* About / Summary */}
                        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">About</h2>
                            <div className="prose prose-indigo max-w-none text-gray-600">
                                <p>{prof.profileDescription || 'No description provided.'}</p>
                            </div>
                        </div>

                        {/* Experience Timeline */}
                        {agent.experience && agent.experience.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Experience</h2>
                                <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                                    {agent.experience.map((exp: any, i: number) => (
                                        <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                            {/* Icon */}
                                            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-indigo-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                                                <Briefcase className="w-5 h-5 text-indigo-600" />
                                            </div>

                                            {/* Card */}
                                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                                <div className="flex items-center justify-between space-x-2 mb-1">
                                                    <div className="font-bold text-slate-900">{exp.title}</div>
                                                    <time className="font-caveat font-medium text-indigo-500 text-xs">
                                                        {exp.startDate} - {exp.endDate || 'Present'}
                                                    </time>
                                                </div>
                                                <div className="text-slate-500 text-sm font-medium mb-2">{exp.company}</div>
                                                {exp.responsibilities && (
                                                    <ul className="text-slate-500 text-sm list-disc pl-4 space-y-1">
                                                        {exp.responsibilities.slice(0, 3).map((r: string, j: number) => (
                                                            <li key={j}>{r}</li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Industries */}
                        {prof.industries && prof.industries.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Industry Expertise</h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {prof.industries.map((ind: any, i: number) => (
                                        <div key={i} className="flex items-center p-4 bg-gray-50 rounded-xl hover:bg-white hover:shadow-md transition-all border border-gray-100 group">
                                            <div className="p-2 bg-white rounded-lg shadow-sm mr-3 group-hover:text-indigo-600 text-gray-400 transition-colors">
                                                <Star className="w-5 h-5 " />
                                            </div>
                                            <span className="font-medium text-gray-700">{ind.name || ind}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* CV Download / Documents */}
                        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-lg p-8 text-white flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-bold mb-1">Download Resume</h3>
                                <p className="text-indigo-100 text-sm">Get the full detailed profile and work history.</p>
                            </div>
                            <button className="flex items-center px-6 py-3 bg-white text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 transition-colors shadow-lg">
                                <Download className="w-5 h-5 mr-2" />
                                Download PDF
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
