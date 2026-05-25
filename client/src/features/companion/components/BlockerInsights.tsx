import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { CompanionProfile } from '../types';

export const BlockerInsights = ({ blockers }: { blockers?: CompanionProfile['blockers'] }) => {
  const active = (blockers || []).filter((blocker) => !blocker.resolvedAt);
  return (
    <Card className="border border-border bg-card shadow-subtle">
      <CardHeader>
        <CardTitle className="text-base font-bold">Friction Signals</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {active.slice(0, 3).map((blocker) => (
          <div key={`${blocker.type}-${blocker.label}`} className="rounded-md border border-border p-3">
            <div className="text-sm font-semibold">{blocker.label}</div>
            <p className="mt-1 text-xs text-muted-foreground">{blocker.evidence?.[0]}</p>
          </div>
        ))}
        {active.length === 0 && <p className="text-sm text-muted-foreground">No major blockers detected. Keep listening to your pace.</p>}
      </CardContent>
    </Card>
  );
};
