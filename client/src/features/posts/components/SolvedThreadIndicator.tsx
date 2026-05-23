import React from 'react';
import { CheckCircle2, CircleHelp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SolvedThreadIndicatorProps {
  solved?: boolean;
}

export const SolvedThreadIndicator: React.FC<SolvedThreadIndicatorProps> = ({ solved }) => (
  <Badge
    variant={solved ? 'success' : 'outline'}
    className="text-[10px] px-2 py-0.5 font-bold flex items-center gap-0.5"
  >
    {solved ? <CheckCircle2 className="h-3 w-3 shrink-0" /> : <CircleHelp className="h-3 w-3 shrink-0" />}
    {solved ? 'Solved' : 'Open'}
  </Badge>
);
