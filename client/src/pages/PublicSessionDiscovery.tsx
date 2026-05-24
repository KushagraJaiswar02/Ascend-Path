import React, { useState } from 'react';
import { CalendarX } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { EmptyState } from '@/components/layout/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PublicWorkshopCard } from '../features/sessions/components/PublicWorkshopCard';
import { WorkshopHeroBanner } from '../features/sessions/components/WorkshopHeroBanner';
import { usePublicSessions } from '../features/sessions/hooks/usePublicSessions';

const difficulties = ['all', 'beginner', 'intermediate', 'advanced'] as const;

export const PublicSessionDiscovery: React.FC = () => {
  const [difficulty, setDifficulty] = useState<(typeof difficulties)[number]>('all');
  const { data: sessions, isLoading, isError } = usePublicSessions({
    difficulty: difficulty === 'all' ? undefined : difficulty,
    limit: 24,
  });

  return (
    <PageContainer size="default" className="py-lg space-y-lg">
      <WorkshopHeroBanner />

      <div className="flex flex-col gap-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-heading-xs font-black text-foreground">Upcoming community sessions</h2>
          <p className="text-body-xs text-muted-foreground">Group learning, AMAs, roadmap walkthroughs, and study events.</p>
        </div>
        <div className="flex items-center gap-xs rounded-lg border border-border bg-muted p-1">
          {difficulties.map((value) => (
            <Button
              key={value}
              type="button"
              variant={difficulty === value ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setDifficulty(value)}
              className={cn('h-7 px-2 text-[10px] capitalize', difficulty === value && 'bg-card')}
            >
              {value}
            </Button>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="rounded-2xl border border-border bg-card overflow-hidden">
              <Skeleton className="h-28 w-full" />
              <div className="p-5 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          ))}
        </div>
      )}

      {isError && (
        <EmptyState
          icon={CalendarX}
          title="Couldn't load workshops"
          description="There was a problem loading public sessions. Please refresh and try again."
        />
      )}

      {!isLoading && !isError && (!sessions || sessions.length === 0) && (
        <EmptyState
          icon={CalendarX}
          title="No workshops found"
          description="No public sessions match the selected filters yet."
        />
      )}

      {!isLoading && !isError && sessions && sessions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
          {sessions.map((session) => (
            <PublicWorkshopCard key={session._id} session={session} />
          ))}
        </div>
      )}
    </PageContainer>
  );
};
