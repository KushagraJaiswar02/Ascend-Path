import React, { useState, useCallback } from 'react';
import { Search } from 'lucide-react';
import { useSessions } from '../hooks/useSessions';
import { SessionCard } from './SessionCard';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/layout/EmptyState';
import { CalendarX } from 'lucide-react';
import { cn } from '@/lib/utils';

type FilterType = 'all' | 'free' | 'paid';

const FILTER_OPTIONS: { value: FilterType; label: string }[] = [
  { value: 'all', label: 'All Sessions' },
  { value: 'free', label: 'Free' },
  { value: 'paid', label: 'Paid' },
];

export const SessionList: React.FC = () => {
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [topicFilter, setTopicFilter] = useState('');

  const isFreeParam =
    filterType === 'free' ? true : filterType === 'paid' ? false : undefined;

  const { data: sessions, isLoading, isError } = useSessions(
    topicFilter || undefined,
    isFreeParam
  );

  const handleTopicChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setTopicFilter(e.target.value),
    []
  );

  const handleClearFilters = useCallback(() => {
    setTopicFilter('');
    setFilterType('all');
  }, []);

  return (
    <div className="space-y-lg">
      {/* Filter toolbar */}
      <div className="flex flex-col sm:flex-row gap-sm items-start sm:items-center justify-between">
        {/* Type filter pills */}
        <div className="flex items-center gap-xs p-1 rounded-md bg-muted border border-border">
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              id={`filter-${opt.value}`}
              onClick={() => setFilterType(opt.value)}
              className={cn(
                'px-3 py-1.5 rounded-sm text-sm font-medium transition-colors duration-150 cursor-pointer select-none',
                filterType === opt.value
                  ? 'bg-card text-foreground shadow-subtle border border-border'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            id="session-search"
            type="text"
            placeholder="Search topics…"
            value={topicFilter}
            onChange={handleTopicChange}
            className="pl-9"
          />
        </div>
      </div>

      {/* Loading skeletons */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-sm p-5 rounded-lg border border-border bg-card">
              <div className="flex justify-between">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-10 rounded-md" />
              </div>
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <div className="flex gap-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-10 w-full mt-auto rounded-md" />
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {isError && (
        <EmptyState
          icon={CalendarX}
          title="Couldn't load sessions"
          description="There was a problem fetching available sessions. Please try refreshing the page."
          action={{ label: 'Retry', onClick: () => window.location.reload() }}
        />
      )}

      {/* Empty results */}
      {!isLoading && !isError && sessions?.length === 0 && (
        <EmptyState
          icon={CalendarX}
          title="No sessions found"
          description="No open sessions match your current filters. Try adjusting your search or check back later."
          action={{ label: 'Clear filters', onClick: handleClearFilters }}
        />
      )}

      {/* Session grid */}
      {!isLoading && !isError && sessions && sessions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
          {sessions.map((session) => (
            <SessionCard key={session._id} session={session} />
          ))}
        </div>
      )}
    </div>
  );
};
