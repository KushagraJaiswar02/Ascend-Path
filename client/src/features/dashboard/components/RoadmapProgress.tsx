import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BookOpen, Flame, ArrowRight, Compass } from 'lucide-react';
import { useMyActiveRoadmaps } from '../../roadmaps/hooks/useRoadmapProgress';
import { RoadmapProgressBar } from '../../roadmaps/components/RoadmapProgressBar';
import { Button } from '@/components/ui/button';

export const RoadmapProgress: React.FC = () => {
  const navigate = useNavigate();
  const { data: activeRoadmaps, isLoading, isError } = useMyActiveRoadmaps();

  return (
    <Card className="flex flex-col h-full border border-border bg-card text-card-foreground shadow-subtle overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between p-md border-b border-border/50 bg-muted/20 select-none">
        <CardTitle className="text-body-lg font-bold text-foreground flex items-center gap-xs">
          <BookOpen className="h-5 w-5 text-primary shrink-0" />
          <span>My Learning Tracks</span>
        </CardTitle>
        {activeRoadmaps && activeRoadmaps.length > 0 && (
          <Button
            variant="ghost"
            onClick={() => navigate('/explore')}
            className="h-7 text-[9px] font-black uppercase tracking-wider gap-xxs px-xs border border-border bg-card shadow-sm cursor-pointer select-none"
          >
            <span>Explore More</span>
          </Button>
        )}
      </CardHeader>

      <CardContent className="p-5 flex-grow flex flex-col justify-center">
        {isLoading && (
          <div className="space-y-md animate-pulse">
            {[1, 2].map((n) => (
              <div key={n} className="space-y-xs">
                <div className="flex justify-between h-4 w-1/3 bg-muted rounded" />
                <div className="h-2.5 w-full bg-muted rounded" />
              </div>
            ))}
          </div>
        )}

        {isError && (
          <div className="text-center py-6 text-destructive text-body-xs font-bold select-none">
            Failed to load tracking data. Please try again.
          </div>
        )}

        {!isLoading && !isError && (!activeRoadmaps || activeRoadmaps.length === 0) && (
          <div className="text-center space-y-md select-none py-6 flex flex-col items-center">
            <div className="p-3 bg-indigo-500/10 text-indigo-600 rounded-2xl border border-indigo-500/10">
              <Compass className="h-6 w-6" />
            </div>
            <div className="space-y-xxs max-w-[280px]">
              <h4 className="text-body-xs font-black text-foreground">No active learning paths</h4>
              <p className="text-muted-foreground text-[11px] leading-relaxed font-semibold">
                Enroll in a structured career roadmap to unlock step completions, write study notes, and track progression.
              </p>
            </div>
            <Button
              onClick={() => navigate('/explore')}
              className="h-8.5 px-sm text-body-xs font-black uppercase tracking-wider rounded-xl bg-primary hover:bg-primary/95 text-white cursor-pointer select-none"
            >
              Discover Roadmaps
            </Button>
          </div>
        )}

        {!isLoading && !isError && activeRoadmaps && activeRoadmaps.length > 0 && (
          <div className="space-y-5">
            {activeRoadmaps.map((progress: any) => {
              const roadmap = progress.roadmapId;
              if (!roadmap) return null;

              return (
                <div
                  key={progress._id}
                  onClick={() => navigate(`/roadmaps/${roadmap.slug}`)}
                  className="p-4 bg-muted/15 border border-border/40 hover:border-primary/20 rounded-2xl transition duration-300 group cursor-pointer space-y-sm"
                >
                  <div className="flex justify-between items-start gap-sm">
                    <div className="space-y-xxs">
                      <h4 className="text-body-xs font-black text-foreground group-hover:text-primary transition-colors leading-tight">
                        {roadmap.title}
                      </h4>
                      <p className="text-[10px] text-muted-foreground truncate max-w-[240px] font-semibold">
                        {roadmap.description || 'Structured study map.'}
                      </p>
                    </div>

                    <div className="flex items-center gap-xxs text-orange-500 text-[10px] font-black shrink-0 uppercase tracking-wide bg-orange-500/5 px-xs py-xxs rounded border border-orange-500/10">
                      <Flame className="h-3.5 w-3.5 fill-orange-500/10 shrink-0" />
                      <span>{progress.streakCount || 0}d</span>
                    </div>
                  </div>

                  <div className="space-y-xxs">
                    <RoadmapProgressBar progressPercentage={progress.progressPercentage || 0} height="sm" showLabel />
                  </div>

                  <div className="flex justify-between items-center pt-xxs border-t border-border/20">
                    <span className="text-[9px] font-extrabold uppercase text-muted-foreground tracking-wider">
                      {progress.progressPercentage === 100 ? '🎉 Certified Complete' : '📚 In Progress'}
                    </span>
                    <span className="text-[9px] font-black uppercase tracking-widest text-primary group-hover:underline flex items-center gap-xxs select-none">
                      <span>Resume Path</span>
                      <ArrowRight className="h-3 w-3 stroke-[2.5]" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
