import React from 'react';
import { Lightbulb } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { SessionReflection } from '@/features/sessions/types';
import { MentorRecommendationCard } from '@/features/sessions/components/MentorRecommendationCard';

interface MentorRecommendationsProps {
  reflections: SessionReflection[];
}

export const MentorRecommendations: React.FC<MentorRecommendationsProps> = ({ reflections }) => {
  const recommendations = reflections
    .filter((reflection) => reflection.mentorFollowup?.submittedAt)
    .slice(0, 3);

  return (
    <Card className="flex flex-col h-full border border-border bg-card text-card-foreground shadow-subtle overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between p-md border-b border-border/50 bg-muted/20">
        <CardTitle className="text-body-lg font-bold text-foreground flex items-center gap-xs">
          <Lightbulb className="h-4 w-4 text-primary" />
          Recommended By Mentor
        </CardTitle>
      </CardHeader>
      <CardContent className="p-md sm:p-lg flex-grow">
        {recommendations.length === 0 ? (
          <div className="flex h-full min-h-[180px] flex-col items-center justify-center text-center">
            <p className="text-body-sm font-bold text-foreground">No follow-ups yet</p>
            <p className="text-muted-xs text-muted-foreground max-w-[260px] mt-xs">
              Complete a session and submit a reflection to unlock personalized next steps.
            </p>
          </div>
        ) : (
          <div className="space-y-sm">
            {recommendations.map((reflection) => (
              <MentorRecommendationCard key={reflection._id} reflection={reflection} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
