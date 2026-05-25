import React from 'react';
import { Quote, Shield, Star, Code2, Layers } from 'lucide-react';
import type { Endorsement } from '../api/credibility.api';

const TYPE_CONFIG: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  skill: { icon: <Code2 className="h-3 w-3" />, label: 'Skill', color: 'text-blue-400 border-blue-500/30 bg-blue-500/10' },
  roadmap: { icon: <Layers className="h-3 w-3" />, label: 'Roadmap', color: 'text-violet-400 border-violet-500/30 bg-violet-500/10' },
  project: { icon: <Star className="h-3 w-3" />, label: 'Project', color: 'text-amber-400 border-amber-500/30 bg-amber-500/10' },
  general: { icon: <Shield className="h-3 w-3" />, label: 'General', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' },
};

interface EndorsementCardProps {
  endorsement: Endorsement;
}

export const EndorsementCard: React.FC<EndorsementCardProps> = ({ endorsement }) => {
  const config = TYPE_CONFIG[endorsement.type] || TYPE_CONFIG.general;
  const endorser = endorsement.endorserId;

  return (
    <div className="relative rounded-2xl border border-border bg-card p-5 flex flex-col gap-3 hover:shadow-md transition-all hover:-translate-y-0.5">
      {/* Type Badge */}
      <div className="flex items-center justify-between">
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${config.color}`}>
          {config.icon}
          {config.label} Endorsement
        </div>
        <time className="text-[10px] text-muted-foreground">
          {new Date(endorsement.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </time>
      </div>

      {/* Message */}
      <div className="relative">
        <Quote className="absolute -top-1 -left-1 h-4 w-4 text-muted-foreground/20" />
        <p className="text-sm text-foreground leading-relaxed pl-4 italic">
          &ldquo;{endorsement.message}&rdquo;
        </p>
      </div>

      {/* Optional skill/context */}
      {endorsement.skillName && (
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-muted-foreground">For:</span>
          <span className="text-[10px] font-bold text-primary bg-primary/10 border border-primary/25 px-2 py-0.5 rounded">
            {endorsement.skillName}
          </span>
        </div>
      )}

      {/* Endorser */}
      <div className="flex items-center gap-2 pt-2 border-t border-border/40">
        <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
          {endorser.avatar ? (
            <img src={endorser.avatar} alt={endorser.name} className="h-full w-full object-cover" />
          ) : (
            <span className="text-xs font-bold text-primary">{endorser.name?.[0]?.toUpperCase()}</span>
          )}
        </div>
        <div>
          <p className="text-xs font-bold text-foreground leading-none">{endorser.name}</p>
          {endorser.headline && (
            <p className="text-[10px] text-muted-foreground mt-0.5">{endorser.headline}</p>
          )}
        </div>
        <div className="ml-auto">
          <span className="text-[10px] font-bold capitalize text-muted-foreground bg-muted/50 border border-border/40 px-2 py-0.5 rounded">
            {endorser.role}
          </span>
        </div>
      </div>
    </div>
  );
};
