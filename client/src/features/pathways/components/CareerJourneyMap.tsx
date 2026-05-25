import { Link } from 'react-router-dom';
import { ArrowRight, Map } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { UserJourney } from '../types';

export const CareerJourneyMap = ({ journey }: { journey?: UserJourney }) => {
  if (!journey) return null;

  return (
    <Card className="border border-border bg-card shadow-subtle">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-bold">
          <Map className="h-4 w-4 text-primary" />
          Your Career Journey
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{journey.nextStepNarrative}</p>
        <div className="grid gap-3 md:grid-cols-3">
          <JourneyNode title="Now" detail={journey.currentPosition.targetRole || journey.currentPosition.careerStage || 'Exploring'} />
          <JourneyConnector />
          <JourneyNode title="Next Branch" detail={journey.possiblePaths[0]?.targetDomain?.name || journey.nextRoadmaps[0]?.title || 'Choose a path'} />
        </div>
        {journey.nextRoadmaps.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Roadmaps that continue your path</div>
            {journey.nextRoadmaps.slice(0, 3).map((roadmap) => (
              <Link key={roadmap._id} to={`/roadmaps/${roadmap.slug || roadmap._id}`} className="block rounded-md border border-border p-3 text-sm font-semibold hover:bg-muted">
                {roadmap.title}
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const JourneyNode = ({ title, detail }: { title: string; detail: string }) => (
  <div className="rounded-md border border-border p-3">
    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{title}</div>
    <div className="mt-1 text-sm font-bold">{detail}</div>
  </div>
);

const JourneyConnector = () => (
  <div className="hidden items-center justify-center text-muted-foreground md:flex">
    <ArrowRight className="h-5 w-5" />
  </div>
);
