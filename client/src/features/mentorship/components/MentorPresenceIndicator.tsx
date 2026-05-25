import { Circle } from 'lucide-react';

export const MentorPresenceIndicator = ({ online }: { online?: boolean }) => (
  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
    <Circle className={`h-2.5 w-2.5 ${online ? 'fill-success text-success' : 'fill-muted text-muted'}`} />
    {online ? 'Available now' : 'Async guidance'}
  </span>
);
