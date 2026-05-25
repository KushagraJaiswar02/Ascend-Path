import { Badge } from '../../../components/ui/badge';
import type { CareerDomain } from '../types';

export const DomainBadge = ({ domain }: { domain: CareerDomain }) => {
  return (
    <Badge variant="outline" className="rounded-md border-border bg-background text-foreground">
      {domain.name}
    </Badge>
  );
};
