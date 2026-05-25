import { Card, CardContent } from '@/components/ui/card';
import type { CompanionHome } from '../types';

export const ProgressRecoveryCard = ({ guidance }: { guidance?: CompanionHome['adaptiveGuidance'] }) => {
  if (!guidance || guidance.tone !== 'recovery') return null;
  return (
    <Card className="border border-amber-500/20 bg-amber-500/5">
      <CardContent className="p-4">
        <div className="text-sm font-bold">A gentler restart may help</div>
        <p className="mt-1 text-xs text-muted-foreground">{guidance.message}</p>
      </CardContent>
    </Card>
  );
};
