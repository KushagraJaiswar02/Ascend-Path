import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Route } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ContinueLearningCTAProps {
  roadmapId?: string;
  stepId?: string;
  label?: string;
}

export const ContinueLearningCTA: React.FC<ContinueLearningCTAProps> = ({ roadmapId, label = 'Continue learning' }) => {
  const to = roadmapId ? `/roadmaps/${roadmapId}` : '/explore';

  return (
    <Button asChild variant="outline" size="sm" className="h-8 gap-xs">
      <Link to={to}>
        <Route className="h-3.5 w-3.5" />
        <span>{label}</span>
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </Button>
  );
};
