import React from 'react';
import { TrendingUp, Users, Star, CheckCircle2 } from 'lucide-react';

interface MentorTrustPanelProps {
  mentorProfile: {
    specializations: string[];
    completionRate?: number;
    roadmapImpact?: number;
    sessionQuality?: number;
    menteeOutcomes?: string[];
  };
  totalSessions: number;
  averageRating: number;
}

export const MentorTrustPanel: React.FC<MentorTrustPanelProps> = ({
  mentorProfile,
  totalSessions,
  averageRating,
}) => {
  const metrics = [
    {
      icon: <CheckCircle2 className="h-4 w-4 text-emerald-400" />,
      label: 'Completion Rate',
      value: `${mentorProfile.completionRate ?? 100}%`,
    },
    {
      icon: <Star className="h-4 w-4 text-amber-400" />,
      label: 'Session Quality',
      value: `${(mentorProfile.sessionQuality ?? averageRating).toFixed(1)}/5`,
    },
    {
      icon: <Users className="h-4 w-4 text-blue-400" />,
      label: 'Sessions Given',
      value: totalSessions.toString(),
    },
    {
      icon: <TrendingUp className="h-4 w-4 text-violet-400" />,
      label: 'Roadmap Impact',
      value: `${mentorProfile.roadmapImpact ?? 0} learners`,
    },
  ];

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Mentor Trust Signals</h3>

      <div className="grid grid-cols-2 gap-3 mb-4">
        {metrics.map((m) => (
          <div key={m.label} className="flex flex-col gap-1 p-3 rounded-xl bg-muted/30 border border-border/50">
            <div className="flex items-center gap-1.5">
              {m.icon}
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{m.label}</span>
            </div>
            <span className="text-lg font-black text-foreground">{m.value}</span>
          </div>
        ))}
      </div>

      {/* Specializations */}
      {mentorProfile.specializations.length > 0 && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Specializations</p>
          <div className="flex flex-wrap gap-1.5">
            {mentorProfile.specializations.map((s) => (
              <span
                key={s}
                className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-primary/10 text-primary/80 border border-primary/25 rounded-md"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Mentee Outcomes */}
      {mentorProfile.menteeOutcomes && mentorProfile.menteeOutcomes.length > 0 && (
        <div className="mt-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Mentee Outcomes</p>
          <ul className="space-y-1">
            {mentorProfile.menteeOutcomes.slice(0, 3).map((outcome, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-xs text-muted-foreground">{outcome}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
