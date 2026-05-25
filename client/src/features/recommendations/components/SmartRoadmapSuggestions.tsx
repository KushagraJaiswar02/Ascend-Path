import { RecommendationRail } from './RecommendationRail';
import type { RecommendationItem } from '../types';

export const SmartRoadmapSuggestions = ({ items, contextLabel }: { items: RecommendationItem[]; contextLabel?: string }) => (
  <RecommendationRail title="Roadmaps That Fit Your Context" subtitle={contextLabel} items={items} context="dashboard-roadmaps" />
);
