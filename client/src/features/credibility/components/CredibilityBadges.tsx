import React from 'react';
import { Award, CheckCircle2, Users, Star } from 'lucide-react';
import type { VerifiedAchievement, PortfolioProject, Endorsement } from '../api/credibility.api';

interface CredibilityBadgesProps {
  achievements: VerifiedAchievement[];
  projects: PortfolioProject[];
  endorsements: Endorsement[];
  totalSessions?: number;
  averageRating?: number;
}

export const CredibilityBadges: React.FC<CredibilityBadgesProps> = ({
  achievements,
  projects,
  endorsements,
}) => {
  const mentorVerifiedProjects = projects.filter((p) => p.isMentorReviewed).length;
  const certificates = achievements.filter((a) => a.type === 'certificate').length;
  const badges = achievements.filter((a) => a.type === 'badge').length;

  const stats = [
    {
      icon: <Award className="h-4 w-4" />,
      value: certificates,
      label: 'Certificates',
      color: 'text-violet-400',
      bg: 'bg-violet-500/10 border-violet-500/25',
    },
    {
      icon: <CheckCircle2 className="h-4 w-4" />,
      value: mentorVerifiedProjects,
      label: 'Verified Projects',
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/25',
    },
    {
      icon: <Users className="h-4 w-4" />,
      value: endorsements.length,
      label: 'Endorsements',
      color: 'text-blue-400',
      bg: 'bg-blue-500/10 border-blue-500/25',
    },
    {
      icon: <Star className="h-4 w-4" />,
      value: badges,
      label: 'Badges',
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/25',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`flex flex-col items-center justify-center gap-1.5 p-4 rounded-2xl border ${stat.bg} transition-transform hover:scale-105`}
        >
          <div className={stat.color}>{stat.icon}</div>
          <span className={`text-xl font-black tabular-nums ${stat.color}`}>{stat.value}</span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-center">{stat.label}</span>
        </div>
      ))}
    </div>
  );
};
