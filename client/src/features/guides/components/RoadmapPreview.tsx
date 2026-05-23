import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Compass, Users, Clock, Milestone } from 'lucide-react';

interface RoadmapPreviewProps {
  roadmaps: any[];
}

export const RoadmapPreview: React.FC<RoadmapPreviewProps> = ({ roadmaps }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
      {roadmaps.length === 0 ? (
        <Card className="col-span-full border border-border bg-card border-dashed p-xl text-center select-none shadow-subtle">
          <CardContent className="flex flex-col items-center gap-sm">
            <Compass className="h-10 w-10 text-muted-foreground/55 shrink-0" />
            <div>
              <h3 className="text-body-md font-bold text-foreground mb-xxs">No roadmaps owned yet</h3>
              <p className="text-muted-sm text-muted-foreground max-w-xs mx-auto">
                Structured learning paths published by this Guide will appear here.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        roadmaps.map((roadmap) => (
          <Link
            key={roadmap._id}
            to={`/roadmaps/${roadmap.slug || roadmap._id}`}
            className="border border-border bg-card hover:border-primary/40 hover:shadow-md transition-all duration-300 flex flex-col justify-between rounded-2xl group cursor-pointer"
          >
            <CardContent className="p-md sm:p-lg flex flex-col justify-between h-full gap-md">
              {/* Header Info */}
              <div className="space-y-xs">
                <div className="flex items-center justify-between gap-sm select-none">
                  <span className="text-[10px] font-black px-sm py-[2px] bg-primary/5 border border-primary/10 text-primary rounded-full uppercase tracking-wider group-hover:bg-primary/10">
                    {roadmap.domains?.[0] || roadmap.targetRole || 'Mentorship Path'}
                  </span>
                  <span className="inline-flex items-center gap-xxs text-muted-foreground text-[11px] font-bold">
                    <Users className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>{roadmap.enrollmentCount || 0} enrolled</span>
                  </span>
                </div>

                <h4 className="text-body-md font-extrabold text-foreground group-hover:text-primary transition-colors leading-snug tracking-tight">
                  {roadmap.title}
                </h4>
                
                <p className="text-muted-sm text-muted-foreground leading-relaxed line-clamp-3 select-text">
                  {roadmap.description || 'No detailed path summary provided.'}
                </p>
              </div>

              {/* Stats Footer */}
              <div className="flex items-center justify-between border-t border-border/50 pt-sm mt-auto text-body-xs font-semibold text-muted-foreground select-none">
                <span className="inline-flex items-center gap-xxs">
                  <Milestone className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>{roadmap.stepsCount || 8} milestones</span>
                </span>
                
                {roadmap.estimatedWeeks && (
                  <span className="inline-flex items-center gap-xxs">
                    <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>{roadmap.estimatedWeeks} weeks</span>
                  </span>
                )}
              </div>
            </CardContent>
          </Link>
        ))
      )}
    </div>
  );
};
