import React from 'react';
import { ExternalLink, FolderKanban, MapPinned } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { SessionReflection } from '../types';
import { ContinueLearningCTA } from './ContinueLearningCTA';

const getObjectId = (value: any) => (typeof value === 'string' ? value : value?._id);

interface MentorRecommendationCardProps {
  reflection: SessionReflection;
}

export const MentorRecommendationCard: React.FC<MentorRecommendationCardProps> = ({ reflection }) => {
  const followup = reflection.mentorFollowup;
  const mentorName = typeof reflection.mentorId === 'string' ? 'Your mentor' : reflection.mentorId.name;

  if (!followup?.submittedAt) return null;

  return (
    <Card className="border border-border bg-card shadow-subtle hover:border-border/80 transition-all duration-300 rounded-xl overflow-hidden relative group">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-transparent group-hover:bg-primary/20 transition-colors" />
      <CardContent className="p-5 space-y-4 mt-[2px]">
        <div className="flex items-start justify-between gap-3 select-none">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Recommended by mentor</p>
            <h3 className="text-metadata font-bold text-foreground">{mentorName}</h3>
          </div>
          <Badge variant="secondary" className="text-[10px] bg-muted/60 border border-border/80">Follow-up</Badge>
        </div>

        {followup.mentorNotes && (
          <p className="text-metadata text-foreground/90 leading-relaxed whitespace-pre-wrap">{followup.mentorNotes}</p>
        )}

        {followup.recommendedRoadmapSteps?.length > 0 && (
          <div className="space-y-2">
            {followup.recommendedRoadmapSteps.map((step, index) => (
              <div key={`${step.title}-${index}`} className="flex items-start justify-between gap-3 rounded-xl border border-border/50 bg-muted/20 hover:bg-muted/30 p-3 transition-colors">
                <div className="min-w-0">
                  <p className="text-metadata font-bold text-foreground flex items-center gap-1.5">
                    <MapPinned className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="truncate">{step.title}</span>
                  </p>
                  {step.reason && <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">{step.reason}</p>}
                </div>
                <ContinueLearningCTA roadmapId={getObjectId(step.roadmapId)} label="Open" />
              </div>
            ))}
          </div>
        )}

        {followup.recommendedProjects?.length > 0 && (
          <div className="space-y-2">
            {followup.recommendedProjects.map((project, index) => (
              <div key={`${project.title}-${index}`} className="rounded-xl border border-border/50 bg-muted/20 p-3 space-y-0.5">
                <p className="text-metadata font-bold text-foreground flex items-center gap-1.5 select-none">
                  <FolderKanban className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>{project.title}</span>
                </p>
                {project.description && <p className="text-[11px] text-muted-foreground leading-relaxed">{project.description}</p>}
              </div>
            ))}
          </div>
        )}

        {followup.recommendedResources?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 select-none">
            {followup.recommendedResources.map((resource, index) => (
              <a
                key={`${resource.url}-${index}`}
                href={resource.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1 text-[11px] font-bold text-foreground hover:bg-muted transition-colors duration-200"
              >
                <span>{resource.title}</span>
                <ExternalLink className="h-3 w-3 text-muted-foreground" />
              </a>
            ))}
          </div>
        )}

        {followup.nextSessionSuggestion && (
          <p className="text-[11px] text-muted-foreground border-t border-border/40 pt-2 select-none leading-relaxed">
            <span className="font-bold text-foreground/80">Next focus:</span> {followup.nextSessionSuggestion}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

