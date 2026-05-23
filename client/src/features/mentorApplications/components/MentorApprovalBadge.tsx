import { CheckCircle2, Clock, FileWarning, ShieldCheck, XCircle } from 'lucide-react';
import { Badge } from '../../../components/ui/badge';
import type { MentorApplicationStatus } from '../types';

const statusConfig = {
  pending: { label: 'Pending review', icon: Clock, className: 'bg-muted text-muted-foreground' },
  under_review: { label: 'Under review', icon: ShieldCheck, className: 'bg-primary/10 text-primary border-primary/20' },
  approved: { label: 'Approved mentor', icon: CheckCircle2, className: 'bg-success/10 text-success border-success/20' },
  rejected: { label: 'Not approved', icon: XCircle, className: 'bg-destructive/10 text-destructive border-destructive/20' },
  changes_requested: { label: 'Changes requested', icon: FileWarning, className: 'bg-warning/10 text-warning-foreground border-warning/20' },
};

export const MentorApprovalBadge = ({ status }: { status?: MentorApplicationStatus | 'none' }) => {
  if (!status || status === 'none') return null;
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={config.className}>
      <Icon className="mr-1 h-3.5 w-3.5" />
      {config.label}
    </Badge>
  );
};
