import { RecommendationRail } from './RecommendationRail';
import type { RecommendationItem } from '../types';

export const PersonalizedMentorStrip = ({ items, contextLabel }: { items: RecommendationItem[]; contextLabel?: string }) => (
  <RecommendationRail title="Mentors Matched To You" subtitle={contextLabel} items={items} context="dashboard-mentors" />
);
