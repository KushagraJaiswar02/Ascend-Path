import React from 'react';
import { CheckCircle2, UsersRound } from 'lucide-react';
import type { RoadmapCommunity } from '../types';
import { ActiveLearnerAvatars } from './ActiveLearnerAvatars';
import { TrendingRoadmapBadge } from './TrendingRoadmapBadge';

interface RoadmapPresenceStripProps {
  community?: RoadmapCommunity;
  compact?: boolean;
}

export const RoadmapPresenceStrip: React.FC<RoadmapPresenceStripProps> = ({ community, compact = false }) => {
  if (!community) return null;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-sm rounded-md border border-border bg-muted/20 px-3 py-2">
      <div className="flex flex-wrap items-center gap-sm text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5 font-semibold text-foreground">
          <UsersRound className="h-3.5 w-3.5 text-primary" />
          {community.activeLearnerCount} currently progressing
        </span>
        {!compact && (
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-success" />
            {community.completionsThisWeek} completed this week
          </span>
        )}
        <TrendingRoadmapBadge community={community} />
      </div>
      <ActiveLearnerAvatars learners={community.activeLearners} totalCount={community.activeLearnerCount} />
    </div>
  );
};
