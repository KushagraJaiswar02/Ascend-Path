import React from 'react';
import { Award, BookMarked, Zap, Star, GraduationCap, Trophy } from 'lucide-react';
import type { VerifiedAchievement } from '../api/credibility.api';

const CATEGORY_CONFIG: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  roadmap_completion: {
    icon: <GraduationCap className="h-4 w-4" />,
    color: 'text-violet-400 bg-violet-500/15 border-violet-500/30',
    label: 'Roadmap Complete',
  },
  workshop_participation: {
    icon: <BookMarked className="h-4 w-4" />,
    color: 'text-blue-400 bg-blue-500/15 border-blue-500/30',
    label: 'Workshop',
  },
  mentorship_milestone: {
    icon: <Star className="h-4 w-4" />,
    color: 'text-amber-400 bg-amber-500/15 border-amber-500/30',
    label: 'Mentorship',
  },
  learning_streak: {
    icon: <Zap className="h-4 w-4" />,
    color: 'text-orange-400 bg-orange-500/15 border-orange-500/30',
    label: 'Learning Streak',
  },
  specialization: {
    icon: <Trophy className="h-4 w-4" />,
    color: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30',
    label: 'Specialization',
  },
};

interface AchievementTimelineProps {
  achievements: VerifiedAchievement[];
}

export const AchievementTimeline: React.FC<AchievementTimelineProps> = ({ achievements }) => {
  if (achievements.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center mb-3">
          <Award className="h-6 w-6 text-muted-foreground/50" />
        </div>
        <p className="text-sm font-bold text-foreground mb-1">No Credentials Yet</p>
        <p className="text-xs text-muted-foreground max-w-xs">
          Complete roadmaps, attend workshops, and reach mentorship milestones to earn verified credentials.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {achievements.map((achievement, idx) => {
        const config = CATEGORY_CONFIG[achievement.category] || {
          icon: <Award className="h-4 w-4" />,
          color: 'text-primary bg-primary/15 border-primary/30',
          label: achievement.category,
        };
        const isLast = idx === achievements.length - 1;

        return (
          <div key={achievement._id} className="relative flex gap-4 pb-6">
            {/* Timeline line */}
            {!isLast && (
              <div className="absolute left-5 top-10 bottom-0 w-px bg-border/40" />
            )}

            {/* Icon Badge */}
            <div className={`relative z-10 flex-shrink-0 h-10 w-10 rounded-2xl border flex items-center justify-center ${config.color}`}>
              {config.icon}
            </div>

            {/* Content */}
            <div className="flex-1 pt-1">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{config.label}</span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md border ${
                      achievement.type === 'certificate'
                        ? 'text-violet-400 bg-violet-500/10 border-violet-500/25'
                        : 'text-amber-400 bg-amber-500/10 border-amber-500/25'
                    }`}>
                      {achievement.type}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-foreground leading-snug">{achievement.title}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{achievement.description}</p>
                </div>
                <time className="text-[10px] text-muted-foreground shrink-0 pt-1">
                  {new Date(achievement.issuedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </time>
              </div>

              {/* Credential ID */}
              <div className="mt-2 flex items-center gap-1.5">
                <span className="text-[10px] text-muted-foreground">ID:</span>
                <code className="text-[10px] font-mono bg-muted/50 border border-border/50 rounded px-1.5 py-0.5 text-muted-foreground tracking-widest">
                  {achievement.credentialId}
                </code>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
