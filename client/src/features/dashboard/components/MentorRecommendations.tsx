import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lightbulb } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { SessionReflection } from '@/features/sessions/types';
import { MentorRecommendationCard } from '@/features/sessions/components/MentorRecommendationCard';
import { EmptyState } from '@/components/layout/EmptyState';

interface MentorRecommendationsProps {
  reflections: SessionReflection[];
}

export const MentorRecommendations: React.FC<MentorRecommendationsProps> = ({ reflections }) => {
  const navigate = useNavigate();
  const recommendations = reflections
    .filter((reflection) => reflection.mentorFollowup?.submittedAt)
    .slice(0, 3);

  return (
    <Card className="flex flex-col h-full border border-border bg-card text-card-foreground shadow-subtle overflow-hidden transition-all duration-300 hover:border-border/80">
      <CardHeader className="flex flex-row items-center justify-between p-5 border-b border-border/50 bg-muted/10">
        <CardTitle className="text-card-title font-bold text-foreground flex items-center gap-2">
          <Lightbulb className="h-4.5 w-4.5 text-primary shrink-0" />
          <span>Recommended By Mentor</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-5 flex-grow">
        {recommendations.length === 0 ? (
          <EmptyState
            icon={Lightbulb}
            title="No recommendations yet"
            description="Complete a verified session and submit a reflection to unlock personalized next steps and learning paths suggested by your guide."
            className="border-none bg-transparent min-h-[220px] p-0 shadow-none"
            action={{
              label: "Book a Session",
              onClick: () => navigate("/sessions")
            }}
          />
        ) : (
          <div className="space-y-3">
            {recommendations.map((reflection) => (
              <MentorRecommendationCard key={reflection._id} reflection={reflection} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

