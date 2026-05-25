import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { CompanionHome } from '../types';

export const AdaptiveNextStepPanel = ({ guidance }: { guidance?: CompanionHome['adaptiveGuidance'] }) => {
  if (!guidance) return null;
  return (
    <Card className="border border-border bg-card shadow-subtle">
      <CardHeader>
        <CardTitle className="text-base font-bold">{guidance.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{guidance.message}</p>
        <div className="grid gap-2 md:grid-cols-3">
          {guidance.nextActions.map((action) => (
            <div key={action} className="rounded-md border border-border bg-muted/20 p-3 text-xs font-semibold">{action}</div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
