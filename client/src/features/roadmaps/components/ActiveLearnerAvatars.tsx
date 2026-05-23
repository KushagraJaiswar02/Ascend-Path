import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { RoadmapCommunityLearner } from '../types';

interface ActiveLearnerAvatarsProps {
  learners?: RoadmapCommunityLearner[];
  totalCount?: number;
  max?: number;
}

const initials = (name?: string) =>
  (name || '?')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

export const ActiveLearnerAvatars: React.FC<ActiveLearnerAvatarsProps> = ({ learners = [], totalCount = 0, max = 5 }) => {
  const visible = learners.slice(0, max);
  const overflow = Math.max(totalCount - visible.length, 0);

  if (!totalCount) return null;

  return (
    <div className="flex items-center">
      {visible.map((learner, index) => (
        <Avatar
          key={`${learner.userId}-${index}`}
          className="h-7 w-7 border-2 border-card -ml-2 first:ml-0"
          title={learner.name}
        >
          {learner.avatar && <AvatarImage src={learner.avatar} alt={learner.name} />}
          <AvatarFallback className="text-[10px] font-bold">{initials(learner.name)}</AvatarFallback>
        </Avatar>
      ))}
      {overflow > 0 && (
        <div className="h-7 min-w-7 -ml-2 rounded-full border-2 border-card bg-muted px-2 flex items-center justify-center text-[10px] font-bold text-muted-foreground">
          +{overflow}
        </div>
      )}
    </div>
  );
};
