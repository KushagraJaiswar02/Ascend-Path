import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BookOpen, Flame, ArrowRight, Compass } from 'lucide-react';
import { useMyActiveRoadmaps } from '../../roadmaps/hooks/useRoadmapProgress';
import { RoadmapProgressBar } from '../../roadmaps/components/RoadmapProgressBar';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/layout/EmptyState';

export const RoadmapProgress: React.FC = () => {
  const navigate = useNavigate();
  const { data: activeRoadmaps, isLoading, isError } = useMyActiveRoadmaps();

  return (
    <Card className="flex flex-col h-full border border-border bg-card text-card-foreground shadow-subtle overflow-hidden transition-all duration-300 hover:border-border/80">
      <CardHeader className="flex flex-row items-center justify-between p-5 border-b border-border/50 bg-muted/10 select-none">
        <CardTitle className="text-card-title font-bold text-foreground flex items-center gap-2">
          <BookOpen className="h-4.5 w-4.5 text-primary shrink-0" />
          <span>My Learning Tracks</span>
        </CardTitle>
        {activeRoadmaps && activeRoadmaps.length > 0 && (
          <Button
            variant="ghost"
            onClick={() => navigate('/explore')}
            className="h-7 text-[10px] font-bold uppercase tracking-wider px-2.5 border border-border bg-card shadow-sm cursor-pointer select-none"
          >
            Explore More
          </Button>
        )}
      </CardHeader>

      <CardContent className="p-5 flex-grow flex flex-col justify-center">
        {isLoading && (
          <div className="space-y-4 animate-pulse">
            {[1, 2].map((n) => (
              <div key={n} className="space-y-2">
                <div className="flex justify-between h-4 w-1/3 bg-muted rounded" />
                <div className="h-2 w-full bg-muted rounded" />
              </div>
            ))}
          </div>
        )}

        {isError && (
          <div className="text-center py-6 text-destructive text-metadata font-bold select-none">
            Failed to load tracking data. Please try again.
          </div>
        )}

        {!isLoading && !isError && (!activeRoadmaps || activeRoadmaps.length === 0) && (
          <EmptyState
            icon={Compass}
            title="No active tracks"
            description="Enroll in a structured developer career roadmap to unlock milestones, write study logs, and monitor your progression."
            className="border-none bg-transparent min-h-[220px] p-0 shadow-none"
            action={{
              label: "Discover Roadmaps",
              onClick: () => navigate("/explore")
            }}
          />
        )}

        {!isLoading && !isError && activeRoadmaps && activeRoadmaps.length > 0 && (
          <div className="space-y-4">
            {activeRoadmaps.map((progress: any) => {
              const roadmap = progress.roadmapId;
              if (!roadmap) return null;

              return (
                <div
                  key={progress._id}
                  onClick={() => navigate(`/roadmaps/${roadmap.slug}`)}
                  className="p-4 bg-muted/15 border border-border/50 hover:border-primary/20 hover:bg-muted/30 rounded-xl transition duration-300 group cursor-pointer space-y-3"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1 min-w-0">
                      <h4 className="text-body-p font-semibold text-foreground group-hover:text-primary transition-colors leading-tight">
                        {roadmap.title}
                      </h4>
                      <p className="text-metadata text-muted-foreground truncate max-w-[280px] font-normal leading-normal">
                        {roadmap.description || 'Structured study map.'}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 text-orange-500 text-[10px] font-bold shrink-0 uppercase tracking-wide bg-orange-500/5 px-1.5 py-0.5 rounded border border-orange-500/10 select-none">
                      <Flame className="h-3.5 w-3.5 fill-orange-500/10 shrink-0" />
                      <span>{progress.streakCount || 0}d</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <RoadmapProgressBar progressPercentage={progress.progressPercentage || 0} height="sm" showLabel />
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-border/20 select-none">
                    <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">
                      {progress.progressPercentage === 100 ? '🎉 Certified Complete' : '📚 In Progress'}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary group-hover:underline flex items-center gap-1 select-none">
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

