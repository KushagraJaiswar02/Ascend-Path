import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { CompanionHome } from '../types';

export const CareerGrowthTimeline = ({ events }: { events: CompanionHome['timeline'] }) => (
  <Card className="border border-border bg-card shadow-subtle">
    <CardHeader>
      <CardTitle className="text-base font-bold">Growth Timeline</CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      {events.slice(0, 6).map((event) => (
        <div key={event._id} className="border-l-2 border-primary/30 pl-3">
          <div className="text-sm font-semibold">{event.title}</div>
          {event.summary && <p className="text-xs text-muted-foreground">{event.summary}</p>}
          <div className="mt-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            {new Date(event.occurredAt).toLocaleDateString()}
          </div>
        </div>
      ))}
      {events.length === 0 && <p className="text-sm text-muted-foreground">Your timeline will grow as you learn, reflect, and complete milestones.</p>}
    </CardContent>
  </Card>
);
