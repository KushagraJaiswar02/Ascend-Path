import { ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { PathwayConnection } from '../types';

export const DomainPathwayGraph = ({ current, connections }: { current: any; connections: PathwayConnection[] }) => (
  <Card className="border border-border bg-card shadow-subtle">
    <CardHeader>
      <CardTitle className="text-base font-bold">Pathway Map</CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      <div className="rounded-md border border-primary/30 bg-primary/5 p-3 text-sm font-bold text-primary">{current?.name}</div>
      {connections.length === 0 && <p className="text-sm text-muted-foreground">Adjacent pathways will appear as the graph grows.</p>}
      {connections.slice(0, 6).map((connection) => (
        <div key={connection.id} className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <div className="rounded-md border border-border p-3 text-xs font-semibold">{current?.name}</div>
          <div className="flex flex-col items-center gap-1 text-muted-foreground">
            <ArrowRight className="h-4 w-4" />
            <span className="text-[10px] font-bold">{connection.overlapStrength}%</span>
          </div>
          <div className="rounded-md border border-border bg-muted/20 p-3 text-xs font-semibold">{connection.targetDomain?.name}</div>
        </div>
      ))}
    </CardContent>
  </Card>
);
