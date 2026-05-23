import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RoadmapPreviewCard } from '../../roadmaps/components/RoadmapPreviewCard';

interface RoadmapCardProps {
  roadmap: any;
}

export const RoadmapCard: React.FC<RoadmapCardProps> = ({ roadmap }) => {
  const navigate = useNavigate();
  return (
    <RoadmapPreviewCard
      roadmap={roadmap}
      onExplore={(slug) => navigate(`/roadmaps/${slug}`)}
    />
  );
};
