import React, { useState } from 'react';
import { SessionList } from '../features/sessions/components/SessionList';
import { CreateSessionForm } from '../features/sessions/components/CreateSessionForm';
import { useMySessions } from '../features/sessions/hooks/useMySessions';
import { SessionCard } from '../features/sessions/components/SessionCard';
import { useAuthStore } from '../store/useAuthStore';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/layout/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { CalendarOff } from 'lucide-react';
import { cn } from '@/lib/utils';

type SessionTab = 'browse' | 'my-sessions';

const TABS: { value: SessionTab; label: string }[] = [
  { value: 'browse', label: 'Browse Sessions' },
  { value: 'my-sessions', label: 'My Sessions' },
];

export const Sessions: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SessionTab>('browse');
  const { user } = useAuthStore();
  const isGuide = user?.role === 'guide';

  const { data: mySessions, isLoading: isLoadingMy } = useMySessions();

  return (
    <PageContainer size="default">
      <PageHeader
        title="Mentorship Sessions"
        description="Browse open sessions led by experienced guides, or manage the slots you've created."
      />

      {/* Tab Navigation */}
      <div className="flex border-b border-border mb-lg">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            id={`tab-${tab.value}`}
            onClick={() => setActiveTab(tab.value)}
            className={cn(
              'px-5 py-3 text-sm font-medium border-b-2 transition-colors duration-150 cursor-pointer select-none -mb-px',
              activeTab === tab.value
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'browse' ? (
        <SessionList />
      ) : (
        <div className="space-y-xl">
          {/* Guide slot creator */}
          {isGuide && (
            <section>
              <CreateSessionForm />
            </section>
          )}

          {/* My Sessions list */}
          <section>
            <h2 className="text-heading-xs font-semibold text-foreground mb-md">
              {isGuide ? 'Sessions You Are Hosting' : 'Sessions You Have Booked'}
            </h2>

            {/* Loading skeletons */}
            {isLoadingMy && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex flex-col gap-sm p-5 rounded-lg border border-border bg-card"
                  >
                    <div className="flex justify-between">
                      <Skeleton className="h-5 w-16 rounded-full" />
                      <Skeleton className="h-5 w-10 rounded-md" />
                    </div>
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-10 w-full mt-2 rounded-md" />
                  </div>
                ))}
              </div>
            )}

            {/* Empty state */}
            {!isLoadingMy && mySessions?.length === 0 && (
              <EmptyState
                icon={CalendarOff}
                title={isGuide ? 'No slots created yet' : 'No sessions booked yet'}
                description={
                  isGuide
                    ? 'Create your first session slot above to open it for bookings.'
                    : 'Browse available sessions and reserve a spot with a guide.'
                }
              />
            )}

            {/* Sessions grid */}
            {!isLoadingMy && mySessions && mySessions.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
                {mySessions.map((session) => (
                  <SessionCard key={session._id} session={session} />
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </PageContainer>
  );
};
