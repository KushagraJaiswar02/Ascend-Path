import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, ShieldCheck, Trophy, Sparkles } from 'lucide-react';

interface GuideCardProps {
  guide: {
    _id: string;
    name: string;
    avatar?: string;
    bio?: string;
    domains: string[];
    skills: { name: string; level?: string; years?: number }[];
    fameScore: number;
    averageRating: number;
    totalSessions: number;
    isVerified: boolean;
    guideRank: string;
  };
}

export const GuideCard: React.FC<GuideCardProps> = ({ guide }) => {
  // Get trust level badge criteria
  const renderReputationIcon = () => {
    if (guide.fameScore >= 70 && guide.averageRating >= 4.5) {
      return (
        <span title="Verified Expert">
          <ShieldCheck className="h-4.5 w-4.5 text-amber-500 fill-amber-500/10 shrink-0" />
        </span>
      );
    }
    if (guide.fameScore >= 50) {
      return (
        <span title="Top Mentor">
          <Trophy className="h-4.5 w-4.5 text-indigo-500 shrink-0" />
        </span>
      );
    }
    return (
      <span title="Rising Guide">
        <Sparkles className="h-4.5 w-4.5 text-teal-500 shrink-0" />
      </span>
    );
  };

  return (
    <div className="bg-card border border-border/80 rounded-2xl p-md sm:p-lg flex flex-col justify-between hover:border-primary/40 hover:shadow-subtle hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 group select-none">
      
      <div>
        {/* 1. Header Details: Avatar, Name, Trust badge & Rank */}
        <div className="flex items-start justify-between gap-sm mb-md">
          <div className="flex items-center gap-sm">
            <Avatar className="h-14 w-14 border border-border bg-muted">
              <AvatarImage src={guide.avatar} alt={guide.name} className="object-cover" />
              <AvatarFallback className="bg-primary/5 text-primary text-heading-sm font-black uppercase">
                {guide.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <div className="flex items-center gap-xs flex-wrap">
                <h3 className="text-body-md font-black text-foreground group-hover:text-primary transition-colors leading-tight">
                  {guide.name}
                </h3>
                {renderReputationIcon()}
              </div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-xxs block leading-none">
                {guide.guideRank || 'Rising Guide'}
              </span>
            </div>
          </div>

          {/* Average Stars badge */}
          <div className="flex items-center gap-xxs px-sm py-[3px] bg-warning/5 border border-warning/25 text-warning font-extrabold text-[10px] rounded-full shrink-0">
            <Star className="h-3 w-3 fill-warning" />
            <span>{guide.averageRating > 0 ? guide.averageRating.toFixed(1) : 'New'}</span>
          </div>
        </div>

        {/* 2. Primary High-Level Domains */}
        {guide.domains && guide.domains.length > 0 && (
          <div className="flex flex-wrap gap-xxs mb-sm">
            {guide.domains.map((domain, idx) => (
              <Badge
                key={idx}
                variant="secondary"
                className="text-[9px] font-extrabold px-[7px] py-[2px] border border-border/60 bg-muted/40 text-muted-foreground hover:bg-muted/80 rounded-md select-none"
              >
                {domain}
              </Badge>
            ))}
          </div>
        )}

        {/* Short bio preview */}
        {guide.bio && (
          <p className="text-body-xs text-muted-foreground line-clamp-2 leading-relaxed mb-md select-text">
            {guide.bio}
          </p>
        )}

        {/* 3. Granular Skill badges (Top 4) */}
        {guide.skills && guide.skills.length > 0 && (
          <div className="mb-md">
            <span className="block text-[9px] font-extrabold text-muted-foreground uppercase tracking-wider mb-xs">
              Top Skills
            </span>
            <div className="flex flex-wrap gap-xxs">
              {guide.skills.slice(0, 4).map((skill, idx) => (
                <Badge
                  key={idx}
                  variant="outline"
                  className="text-[10px] font-bold px-sm py-[2px] border border-border/70 bg-background text-foreground hover:border-primary/30 transition-all cursor-default select-none shadow-sm"
                  title={`${skill.level || 'Intermediate'} level${skill.years ? `, ${skill.years} years` : ''}`}
                >
                  <span>{skill.name}</span>
                  {skill.years && (
                    <span className="text-[9px] font-normal text-muted-foreground ml-xxs">
                      ({skill.years}y)
                    </span>
                  )}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 4. Bottom Metrics and CTA Actions */}
      <div className="pt-md border-t border-border/40 mt-sm flex items-center justify-between gap-sm">
        
        {/* Core Stats Pills */}
        <div className="flex items-center gap-md select-none shrink-0">
          <div>
            <span className="block text-[8px] font-extrabold text-muted-foreground uppercase tracking-widest leading-none">
              Fame
            </span>
            <span className="text-body-sm font-black text-foreground">
              {guide.fameScore || 0}
            </span>
          </div>
          <div className="w-[1px] h-6 bg-border/50" />
          <div>
            <span className="block text-[8px] font-extrabold text-muted-foreground uppercase tracking-widest leading-none">
              Sessions
            </span>
            <span className="text-body-sm font-black text-foreground">
              {guide.totalSessions || 0}
            </span>
          </div>
        </div>

        {/* View Profile Action */}
        <Link
          to={`/profile/${guide._id}`}
          className="inline-flex items-center justify-center px-md py-xs bg-primary text-primary-foreground hover:bg-primary/95 text-body-xs font-black rounded-xl shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all font-bold"
        >
          View Profile
        </Link>
      </div>

    </div>
  );
};
