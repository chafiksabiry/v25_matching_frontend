import React from 'react';
import { GigData } from '../types';
import { SectionGuidance } from './SectionGuidance';
import { BasicSection } from './BasicSection';
import { ScheduleSection } from './ScheduleSection';
import { CommissionSection } from './CommissionSection';
import { LeadsSection } from './LeadsSection';
import { SkillsSection } from './SkillsSection';
import { TeamStructure } from './TeamStructure';
import { DocumentationSection } from './DocumentationSection';
import { validateGigData } from '../lib/validation';

interface SectionContentProps {
  section: string;
  data: GigData;
  onChange: (data: GigData) => void;
  errors: { [key: string]: string[] };
  constants: any;
}

export function SectionContent({ section, data, onChange, errors, constants }: SectionContentProps) {
  const validation = validateGigData(data);

  const renderContent = () => {
    switch (section) {
      case 'basic':
        return (
          <BasicSection
            data={data}
            onChange={onChange}
            errors={errors}
          />
        );

      case 'schedule':
        return (
          <ScheduleSection
            data={data.schedule}
            onChange={(schedule) => onChange({ ...data, schedule })}
            errors={errors}
            hasBaseCommission={!!data.commission.base}
          />
        );

      case 'commission':
        return (
          <CommissionSection
            data={data.commission}
            onChange={(commission) => onChange({ ...data, commission })}
            errors={errors}
            warnings={validation.warnings}
          />
        );

      case 'leads':
        return (
          <LeadsSection
            data={data.leads}
            onChange={(leads) => onChange({ ...data, leads })}
            errors={errors}
          />
        );

      case 'skills':
        return (
          <SkillsSection
            data={data.skills}
            onChange={(skills) => onChange({ ...data, skills })}
            errors={errors}
          />
        );

      case 'team':
        return (
          <TeamStructure
            team={data.team}
            onChange={(team) => onChange({ ...data, team: { ...data.team, ...team } })}
          />
        );

      case 'docs':
        return (
          <DocumentationSection
            data={data.documentation}
            onChange={(documentation) => onChange({ ...data, documentation })}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <SectionGuidance section={section} />
      {renderContent()}
    </div>
  );
}