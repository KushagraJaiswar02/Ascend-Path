import React from 'react';
import { CheckCircle2, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface AcceptedAnswerBadgeProps {
  compact?: boolean;
}

export const AcceptedAnswerBadge: React.FC<AcceptedAnswerBadgeProps> = ({ compact = false }) => (
  <Badge variant="success" className="text-[10px] px-2 py-0.5 font-extrabold flex items-center gap-0.5 shadow-subtle">
    {compact ? <CheckCircle2 className="h-3 w-3 shrink-0" /> : <ShieldCheck className="h-3 w-3 shrink-0" />}
    {compact ? 'Accepted' : 'Accepted Answer'}
  </Badge>
);
