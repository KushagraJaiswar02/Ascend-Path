import React from 'react';
import { TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { RoadmapCommunity } from '../types';

interface TrendingRoadmapBadgeProps {
  community?: RoadmapCommunity;
  currentGrowth?: number;
}

export const TrendingRoadmapBadge: React.FC<TrendingRoadmapBadgeProps> = ({ community, currentGrowth }) => {
  const growth = currentGrowth ?? community?.weeklyParticipationGrowth ?? 0;
  const direction = community?.momentum.direction;

  if (growth <= 0 && direction !== 'up') return null;

  return (
    <Badge variant="success" className="gap-1 text-[10px] font-bold">
      <TrendingUp className="h-3 w-3" />
      Trending
    </Badge>
  );
};
