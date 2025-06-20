import React, { useState } from "react";
import {
  AlertCircle,
  Brain,
  Save,
  Briefcase,
  FileText,
  Globe2,
  DollarSign,
  Users,
  Target,
  ArrowRight,
} from "lucide-react";
import { GigReview } from "./GigReview";
import { ValidationMessage } from "./ValidationMessage";
import { SectionContent } from "./SectionContent";
import { analyzeTitleAndGenerateDescription } from "../lib/ai";
import { validateGigData } from "../lib/validation";
import { GigData } from "../types";
import { predefinedOptions } from "../lib/guidance";
import { AIDialog } from "./AIDialog";
import { supabase } from "../lib/supabase";

const sections = [
  { id: "basic", label: "Basic Info", icon: Briefcase },
  { id: "schedule", label: "Schedule", icon: Globe2 },
  { id: "commission", label: "Commission", icon: DollarSign },
  { id: "leads", label: "Leads", icon: Target },
  { id: "skills", label: "Skills", icon: Brain },
  { id: "team", label: "Team", icon: Users },
  { id: "docs", label: "Documentation", icon: FileText },
];

const initialGigData: GigData = {
  userId: "",
  companyId: "",
  title: "",
  description: "",
  category: "",
  destination_zone: [],
  callTypes: [],
  highlights: [],
  requirements: {
    essential: [],
    preferred: [],
  },
  benefits: [],
  schedule: {
    days: [],
    hours: "",
    timeZones: [],
    flexibility: [],
    minimumHours: {
      daily: undefined,
      weekly: undefined,
      monthly: undefined,
    },
  },
  commission: {
    base: "",
    baseAmount: "",
    bonus: "",
    bonusAmount: "",
    structure: "",
    currency: "",
    minimumVolume: {
      amount: "",
      period: "",
      unit: "",
    },
    transactionCommission: {
      type: "",
      amount: "",
    },
    kpis: [],
  },
  leads: {
    types: [
      { type: "hot", percentage: 0, description: "" },
      { type: "warm", percentage: 0, description: "" },
      { type: "cold", percentage: 0, description: "" },
    ],
    sources: [],
    distribution: {
      method: "",
      rules: [],
    },
    qualificationCriteria: [],
  },
  skills: {
    languages: [],
    soft: [],
    professional: [],
    technical: [],
    certifications: [],
  },
  seniority: {
    level: "",
    yearsExperience: "",
  },
  team: {
    size: "",
    structure: [],
    territories: [],
    reporting: {
      to: "",
      frequency: "",
    },
    collaboration: [],
  },
  tools: {
    provided: [],
    required: [],
  },
  training: {
    initial: {
      duration: "",
      format: "",
      topics: [],
    },
    ongoing: {
      frequency: "",
      format: "",
      topics: [],
    },
    support: [],
  },
  metrics: {
    kpis: [],
    targets: {},
    reporting: {
      frequency: "",
      metrics: [],
    },
  },
  documentation: {
    product: [],
    process: [],
    training: [],
  },
  compliance: {
    requirements: [],
    certifications: [],
    policies: [],
  },
  equipment: {
    required: [],
    provided: [],
  },
};

export function GigCreator() {
  const [currentSection, setCurrentSection] = useState("basic");
  const [gigData, setGigData] = useState<GigData>(initialGigData);
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string[];
  }>({});
  const [isSaving, setIsSaving] = useState(false);

  const validation = validateGigData(gigData);
  const currentSectionHasErrors = Object.keys(validation.errors).some(
    (key) => key === currentSection
  );
  const currentSectionHasWarnings = Object.keys(validation.warnings).some(
    (key) => key === currentSection
  );
  const isLastSection = currentSection === sections[sections.length - 1].id;

  const handleAISuggest = async () => {
    if (!gigData.title) {
      setValidationErrors({ title: ["Please enter a title first"] });
      return;
    }

    setAnalyzing(true);
    try {
      const suggestions = await analyzeTitleAndGenerateDescription(
        gigData.title
      );
      setGigData((prev) => ({
        ...prev,
        ...suggestions,
      }));
      setShowAIDialog(false);
    } catch (error: any) {
      setValidationErrors({ ai: [error.message] });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const { data, error } = await supabase
        .from("gigs")
        .insert({
          title: gigData.title,
          description: gigData.description,
          category: gigData.category,
          seniority_level: gigData.seniority.level,
          years_experience: gigData.seniority.yearsExperience,
          schedule_days: gigData.schedule.days,
          schedule_hours: gigData.schedule.hours,
          schedule_timezone: gigData.schedule.timeZones,
          schedule_flexibility: gigData.schedule.flexibility.join(", "),
          commission_base: gigData.commission.base,
          commission_base_amount: gigData.commission.baseAmount,
          commission_bonus: gigData.commission.bonus,
          commission_bonus_amount: gigData.commission.bonusAmount,
          commission_currency: gigData.commission.currency,
          commission_structure: gigData.commission.structure,
          team_size: gigData.team.size,
          team_structure: gigData.team.structure,
          team_territories: gigData.team.territories,
          prerequisites: [],
          call_types: gigData.callTypes,
          destination_zone: gigData.destination_zone || [],
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        // Insert skills
        if (
          gigData.skills.languages.length > 0 ||
          gigData.skills.professional.length > 0 ||
          gigData.skills.technical.length > 0 ||
          gigData.skills.soft.length > 0
        ) {
          const skillsToInsert = [
            ...gigData.skills.languages.map((lang) => ({
              gig_id: data.id,
              category: "language",
              name: lang.name,
              level: lang.level,
            })),
            ...gigData.skills.professional.map((skill) => ({
              gig_id: data.id,
              category: "professional",
              name: skill,
            })),
            ...gigData.skills.technical.map((skill) => ({
              gig_id: data.id,
              category: "technical",
              name: skill,
            })),
            ...gigData.skills.soft.map((skill) => ({
              gig_id: data.id,
              category: "soft",
              name: skill,
            })),
          ];

          const { error: skillsError } = await supabase
            .from("gig_skills")
            .insert(skillsToInsert);

          if (skillsError) throw skillsError;
        }

        // Insert leads
        if (gigData.leads.types.some((lead) => lead.percentage > 0)) {
          const { error: leadsError } = await supabase.from("gig_leads").insert(
            gigData.leads.types.map((lead) => ({
              gig_id: data.id,
              lead_type: lead.type,
              percentage: lead.percentage,
              description: lead.description,
              sources: gigData.leads.sources,
            }))
          );

          if (leadsError) throw leadsError;
        }

        // Insert documentation
        const docsToInsert = [
          ...gigData.documentation.product.map((doc) => ({
            gig_id: data.id,
            doc_type: "product",
            name: doc.name,
            url: doc.url,
          })),
          ...gigData.documentation.process.map((doc) => ({
            gig_id: data.id,
            doc_type: "process",
            name: doc.name,
            url: doc.url,
          })),
          ...gigData.documentation.training.map((doc) => ({
            gig_id: data.id,
            doc_type: "training",
            name: doc.name,
            url: doc.url,
          })),
        ];

        if (docsToInsert.length > 0) {
          const { error: docsError } = await supabase
            .from("gig_documentation")
            .insert(docsToInsert);

          if (docsError) throw docsError;
        }

        // Reset form
        setGigData(initialGigData);
        setCurrentSection("basic");
        setIsReviewing(false);
      }
    } catch (error: any) {
      console.error("Error creating gig:", error);
      setSubmitError("Failed to create gig. Please try again.");
    } finally {
      setIsSubmitting(false);
      window.location.href="/gigs";
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Save current progress to local storage
      localStorage.setItem("gigDraft", JSON.stringify(gigData));
      // Show success message
      alert("Progress saved successfully!");
    } catch (error) {
      console.error("Error saving progress:", error);
      alert("Failed to save progress. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = () => {
    const currentIndex = sections.findIndex((s) => s.id === currentSection);
    if (currentIndex < sections.length - 1) {
      const validation = validateGigData(gigData);
      const sectionErrors = validation.errors[currentSection];
      if (sectionErrors) {
        setValidationErrors({ [currentSection]: sectionErrors });
        return;
      }
      setCurrentSection(sections[currentIndex + 1].id);
    } else {
      const validation = validateGigData(gigData);
      setValidationErrors(validation.errors);
      if (validation.isValid) {
        setIsReviewing(true);
      }
    }
  };

  if (isReviewing) {
    return (
      <GigReview
        data={gigData}
        onEdit={(section) => {
          setCurrentSection(section);
          setIsReviewing(false);
        }}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        onBack={() => setIsReviewing(false)}
        
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Create New Gig</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-300 hover:bg-gray-50"
          >
            <Save className="w-5 h-5 text-gray-600" />
            <span className="text-gray-700">
              {isSaving ? "Saving..." : "Save Progress"}
            </span>
          </button>
          <button
            onClick={() => (window.location.href="/gigsai")}
            className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-300 hover:bg-gray-50"
          >
            <Brain className="w-5 h-5 text-blue-600" />
            {/* A comment */}
            <span className="text-gray-700">AI assist</span>
          </button>
        </div>
      </div>

      {submitError && (
        <div className="mb-6">
          <ValidationMessage type="error" message={submitError} />
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-4 px-6" aria-label="Sections">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setCurrentSection(section.id)}
                className={`flex items-center gap-2 py-4 px-3 border-b-2 font-medium text-sm ${
                  currentSection === section.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <section.icon className="w-5 h-5" />
                {section.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          <SectionContent
            section={currentSection}
            data={gigData}
            onChange={setGigData}
            errors={validationErrors}
            constants={predefinedOptions}
          />

          <div className="mt-6 flex justify-between">
            <button
              onClick={() => {
                const currentIndex = sections.findIndex(
                  (s) => s.id === currentSection
                );
                if (currentIndex > 0) {
                  setCurrentSection(sections[currentIndex - 1].id);
                }
              }}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              disabled={currentSection === sections[0].id}
            >
              Previous
            </button>
            <button
              onClick={handleNext}
              className={`px-4 py-2 rounded-md flex items-center gap-2 ${
                currentSectionHasErrors
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
              disabled={currentSectionHasErrors}
            >
              <span>{isLastSection ? "Review Gig Details" : "Next"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <AIDialog
        isOpen={showAIDialog}
        onClose={() => setShowAIDialog(false)}
        onProceed={handleAISuggest}
        analyzing={analyzing}
      />
    </div>
  );
}
