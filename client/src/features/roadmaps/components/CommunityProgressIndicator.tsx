import React from 'react';
import { Activity, Award, UsersRound } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { RoadmapCommunity } from '../types';
import { RoadmapPresenceStrip } from './RoadmapPresenceStrip';

interface CommunityProgressIndicatorProps {
  community?: RoadmapCommunity;
}

export const CommunityProgressIndicator: React.FC<CommunityProgressIndicatorProps> = ({ community }) => {
  if (!community) return null;

  return (
    <Card className="border border-border shadow-subtle rounded-2xl overflow-hidden">
      <div className="p-md bg-muted/15 border-b border-border/40">
        <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground flex items-center gap-xxs">
          <Activity className="h-4 w-4 text-primary" />
          Community momentum
        </h4>
      </div>
      <CardContent className="p-5 space-y-md">
        <RoadmapPresenceStrip community={community} compact />
        <div className="grid grid-cols-2 gap-sm">
          <div className="rounded-md border border-border bg-muted/20 p-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-xs">
              <UsersRound className="h-3.5 w-3.5" />
              Active window
            </p>
            <p className="text-body-sm font-black text-foreground mt-1">
              {community.activeLearnerCount} learners
            </p>
          </div>
          <div className="rounded-md border border-border bg-muted/20 p-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-xs">
              <Award className="h-3.5 w-3.5" />
              Completed
            </p>
            <p className="text-body-sm font-black text-foreground mt-1">
              {community.completionCount} total
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
