import { RecommendationRail } from './RecommendationRail';
import type { RecommendationItem } from '../types';

export const ContextualWorkshopRecommendations = ({ items, contextLabel }: { items: RecommendationItem[]; contextLabel?: string }) => (
  <RecommendationRail title="Upcoming Guidance Sessions" subtitle={contextLabel} items={items} context="dashboard-sessions" />
);
