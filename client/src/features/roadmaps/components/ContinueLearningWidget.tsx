import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, ArrowRight, BookOpen, AlertCircle } from 'lucide-react';
import { RoadmapProgressBar } from './RoadmapProgressBar';
import { Button } from '@/components/ui/button';

interface ContinueLearningWidgetProps {
  activeProgressList: any[];
  isLoading: boolean;
  isError: boolean;
}

export const ContinueLearningWidget: React.FC<ContinueLearningWidgetProps> = ({
  activeProgressList,
  isLoading,
  isError,
}) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="bg-card border border-border/80 p-6 rounded-2xl shadow-subtle animate-pulse space-y-md">
        <div className="flex justify-between items-center">
          <div className="h-4.5 w-1/3 bg-muted rounded" />
          <div className="h-6 w-12 bg-muted rounded" />
        </div>
        <div className="space-y-xs">
          <div className="h-4 w-2/3 bg-muted rounded" />
          <div className="h-2.5 w-full bg-muted rounded" />
        </div>
        <div className="h-9 w-1/4 bg-muted rounded" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-destructive/5 border border-destructive/20 p-6 rounded-2xl shadow-subtle flex items-center gap-sm select-none">
        <AlertCircle className="h-6 w-6 text-destructive shrink-0" />
        <div>
          <h4 className="text-body-xs font-black text-foreground">Failed to load progress</h4>
          <p className="text-muted-foreground text-[10px] mt-xxs">Check your connection and reload.</p>
        </div>
      </div>
    );
  }

  const active = activeProgressList?.[0]; // Get the most recently active progress record

  if (!active || !active.roadmapId) {
    return (
      <div className="bg-card border border-border/80 p-6 sm:p-8 rounded-2xl shadow-subtle text-center space-y-md select-none flex flex-col items-center">
        <div className="p-3 bg-indigo-500/10 text-indigo-600 rounded-2xl border border-indigo-500/10">
          <BookOpen className="h-6 w-6" />
        </div>
        <div className="space-y-xxs max-w-sm mx-auto">
          <h4 className="text-body-sm font-black text-foreground">Accelerate Your Learning</h4>
          <p className="text-muted-foreground text-body-xs leading-relaxed font-medium">
            You are not enrolled in any study path yet. Unlock curriculum modules, check marks, and build daily streaks!
          </p>
        </div>
        <Button
          onClick={() => navigate('/explore')}
          className="h-9.5 px-sm text-body-xs font-black uppercase tracking-wider rounded-xl bg-primary hover:bg-primary/95 text-white cursor-pointer select-none"
        >
          Discover Roadmaps
        </Button>
      </div>
    );
  }

  const roadmap = active.roadmapId;
  const progressPercentage = active.progressPercentage || 0;

  return (
    <div className="bg-card border border-border/80 p-5 sm:p-6 rounded-2xl shadow-subtle flex flex-col md:flex-row gap-5 items-start md:items-center justify-between select-none relative overflow-hidden group">
      {/* Glow elements */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-2xl pointer-events-none group-hover:bg-primary/10 transition duration-300" />

      <div className="space-y-md w-full md:max-w-2xl relative z-10">
        {/* Widget Title Header */}
        <div className="flex justify-between items-center gap-sm">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary bg-primary/5 border border-primary/10 px-xs py-xxs rounded select-none">
            Active Study Map
          </span>
          <div className="flex items-center gap-xxs text-orange-500 font-extrabold text-xs">
            <Flame className="h-4 w-4 fill-orange-500/10 shrink-0" />
            <span>{active.streakCount || 0}d streak</span>
          </div>
        </div>

        {/* Roadmap Title */}
        <div className="space-y-xxs">
          <h3 className="text-body-sm font-black text-foreground group-hover:text-primary transition-colors leading-tight">
            {roadmap.title}
          </h3>
          <p className="text-muted-foreground text-body-xs font-medium truncate max-w-lg">
            {roadmap.description || 'Continue your learning progression.'}
          </p>
        </div>

        {/* Progressive tracking */}
        <div className="w-full">
          <RoadmapProgressBar progressPercentage={progressPercentage} height="sm" showLabel />
        </div>
      </div>

      {/* Button CTA Link */}
      <div className="shrink-0 w-full md:w-auto relative z-10 pt-xs md:pt-0">
        <Button
          onClick={() => navigate(`/roadmaps/${roadmap.slug}`)}
          className="w-full md:w-auto h-11 px-6 bg-primary hover:bg-primary/95 text-white font-black rounded-xl uppercase tracking-wider text-body-xs shadow-sm hover:shadow transition duration-300 flex items-center justify-center gap-xs cursor-pointer select-none"
        >
          <span>Resume Path</span>
          <ArrowRight className="h-4 w-4 stroke-[2.5]" />
        </Button>
      </div>
    </div>
  );
};
