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
    <Card className="border border-border bg-card">
      <CardContent className="p-md space-y-md">
        <div className="flex items-start justify-between gap-sm">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Recommended by mentor</p>
            <h3 className="text-body-sm font-bold text-foreground">{mentorName}</h3>
          </div>
          <Badge variant="secondary" className="text-[10px]">Follow-up</Badge>
        </div>

        {followup.mentorNotes && (
          <p className="text-body-xs text-foreground leading-relaxed whitespace-pre-wrap">{followup.mentorNotes}</p>
        )}

        {followup.recommendedRoadmapSteps?.length > 0 && (
          <div className="space-y-xs">
            {followup.recommendedRoadmapSteps.map((step, index) => (
              <div key={`${step.title}-${index}`} className="flex items-start justify-between gap-sm rounded-md border border-border/70 bg-muted/20 p-sm">
                <div className="min-w-0">
                  <p className="text-body-xs font-bold text-foreground flex items-center gap-xs">
                    <MapPinned className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="truncate">{step.title}</span>
                  </p>
                  {step.reason && <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{step.reason}</p>}
                </div>
                <ContinueLearningCTA roadmapId={getObjectId(step.roadmapId)} label="Open" />
              </div>
            ))}
          </div>
        )}

        {followup.recommendedProjects?.length > 0 && (
          <div className="space-y-xs">
            {followup.recommendedProjects.map((project, index) => (
              <div key={`${project.title}-${index}`} className="rounded-md border border-border/70 bg-muted/20 p-sm">
                <p className="text-body-xs font-bold text-foreground flex items-center gap-xs">
                  <FolderKanban className="h-3.5 w-3.5 text-primary shrink-0" />
                  {project.title}
                </p>
                {project.description && <p className="text-[11px] text-muted-foreground mt-0.5">{project.description}</p>}
              </div>
            ))}
          </div>
        )}

        {followup.recommendedResources?.length > 0 && (
          <div className="flex flex-wrap gap-xs">
            {followup.recommendedResources.map((resource, index) => (
              <a
                key={`${resource.url}-${index}`}
                href={resource.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-xs rounded-md border border-border px-2 py-1 text-[11px] font-semibold text-foreground hover:bg-muted"
              >
                {resource.title}
                <ExternalLink className="h-3 w-3" />
              </a>
            ))}
          </div>
        )}

        {followup.nextSessionSuggestion && (
          <p className="text-[11px] text-muted-foreground border-t border-border/50 pt-sm">
            Next focus: {followup.nextSessionSuggestion}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
