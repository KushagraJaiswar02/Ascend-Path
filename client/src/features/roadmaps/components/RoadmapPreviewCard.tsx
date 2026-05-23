import React from 'react';
import { Star, Users, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { RoadmapProgressBar } from './RoadmapProgressBar';

interface RoadmapPreviewCardProps {
  roadmap: any;
  progress?: any; // User progress record if enrolled
  onExplore: (slug: string) => void;
}

export const RoadmapPreviewCard: React.FC<RoadmapPreviewCardProps> = ({
  roadmap,
  progress,
  onExplore,
}) => {
  const isEnrolled = !!progress;
  const progressPercentage = progress?.progressPercentage || 0;

  return (
    <div
      onClick={() => onExplore(roadmap.slug)}
      className="bg-card rounded-2xl border border-border/80 overflow-hidden shadow-subtle hover:shadow-hover hover:border-border transition-all duration-300 group cursor-pointer flex flex-col justify-between h-[360px]"
    >
      <div className="p-5 flex-grow space-y-md">
        {/* Banner with Domain Badge and Difficulty */}
        <div className="flex justify-between items-center select-none">
          <div className="flex flex-wrap gap-xs">
            {roadmap.domains?.slice(0, 1).map((dom: string) => (
              <Badge key={dom} variant="secondary" className="px-xs py-xxs text-[9px] font-extrabold uppercase tracking-wider bg-indigo-500/5 text-indigo-600 border border-indigo-500/10">
                {dom}
              </Badge>
            ))}
          </div>
          <Badge variant="outline" className={`px-xs py-xxs text-[9px] font-extrabold uppercase tracking-wider select-none ${
            roadmap.difficulty === 'beginner' 
              ? 'text-emerald-600 border-emerald-500/20 bg-emerald-500/5'
              : roadmap.difficulty === 'intermediate'
              ? 'text-amber-600 border-amber-500/20 bg-amber-500/5'
              : 'text-rose-600 border-rose-500/20 bg-rose-500/5'
          }`}>
            {roadmap.difficulty}
          </Badge>
        </div>

        {/* Roadmap Title and Short Description */}
        <div className="space-y-xxs">
          <h3 className="text-body-md font-black text-foreground group-hover:text-primary transition-colors leading-tight line-clamp-1">
            {roadmap.title}
          </h3>
          <p className="text-muted-foreground text-body-xs leading-relaxed line-clamp-2 h-10">
            {roadmap.description}
          </p>
        </div>

        {/* Quick Stats: Rating, Enrollments, Estimated Weeks */}
        <div className="grid grid-cols-3 gap-xs pt-xs select-none text-muted-foreground text-[11px] font-bold">
          <div className="flex items-center gap-xxs">
            <Star className="h-3.5 w-3.5 text-amber-500 shrink-0 fill-amber-500" />
            <span className="text-foreground">{roadmap.averageRating || '4.8'}</span>
          </div>
          <div className="flex items-center gap-xxs">
            <Users className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
            <span>{roadmap.enrollmentCount || 0} enrolled</span>
          </div>
          <div className="flex items-center gap-xxs">
            <Calendar className="h-3.5 w-3.5 text-purple-500 shrink-0" />
            <span>{roadmap.estimatedWeeks || 8} weeks</span>
          </div>
        </div>

        {/* Tags Metadata */}
        <div className="flex flex-wrap gap-xs pt-xs select-none">
          {roadmap.tags?.slice(0, 3).map((tag: string) => (
            <Badge key={tag} variant="outline" className="px-xs py-[2px] text-[9px] font-bold text-muted-foreground border-border/80 bg-muted/20">
              #{tag}
            </Badge>
          ))}
        </div>
      </div>

      {/* Progress Bar (if enrolled) or Action CTA Footer */}
      <div className="px-5 py-4 bg-muted/20 border-t border-border/60">
        {isEnrolled ? (
          <div className="space-y-xxs">
            <RoadmapProgressBar progressPercentage={progressPercentage} height="sm" showLabel />
            <p className="text-[9px] font-extrabold text-muted-foreground uppercase tracking-widest pt-xxs">
              Currently Pursuing • {progress.streakCount || 0}d streak
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-xs">
              {roadmap.createdBy?.avatar ? (
                <img
                  src={roadmap.createdBy.avatar}
                  alt={roadmap.createdBy.name}
                  className="w-6 h-6 rounded-full object-cover shrink-0 border border-border"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-indigo-500/10 text-indigo-600 flex items-center justify-center text-[10px] font-black shrink-0 border border-indigo-500/20">
                  {roadmap.createdBy?.name?.[0] || 'C'}
                </div>
              )}
              <span className="text-body-xs font-bold text-muted-foreground truncate max-w-[120px]">
                By {roadmap.createdBy?.name || 'Curator'}
              </span>
            </div>
            <span className="text-body-xs font-black text-primary uppercase tracking-widest flex items-center gap-xxs">
              <span>View Maps</span>
              <span>&rarr;</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
