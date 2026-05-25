import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { DashboardExperiencePayload } from '../../onboarding/types';

interface DashboardExperienceLevelEngineProps {
  experience: DashboardExperiencePayload;
}

const levels = ['Starter', 'Active Learner', 'Advanced Explorer', 'Career Builder'];

export const DashboardExperienceLevelEngine: React.FC<DashboardExperienceLevelEngineProps> = ({ experience }) => {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Dashboard level</p>
          <h2 className="text-lg font-bold text-foreground">{experience.label}</h2>
        </div>
        <Badge variant="secondary">Level {experience.level}</Badge>
      </div>
      <div className="grid gap-2 sm:grid-cols-4">
        {levels.map((level, index) => {
          const active = experience.level >= index + 1;
          return (
            <div key={level} className={`rounded-md border p-3 ${active ? 'border-primary/30 bg-primary/5' : 'border-border bg-muted/20'}`}>
              <div className="flex items-center gap-2">
                <CheckCircle2 className={`h-4 w-4 ${active ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className="text-xs font-bold text-foreground">{level}</span>
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{experience.reasoning[0]}</p>
    </div>
  );
};
