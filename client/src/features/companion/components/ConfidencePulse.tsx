import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { CompanionProfile } from '../types';

export const ConfidencePulse = ({ profile }: { profile?: CompanionProfile }) => (
  <Card className="border border-border bg-card shadow-subtle">
    <CardHeader>
      <CardTitle className="text-base font-bold">Confidence Pulse</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-black">{profile?.confidenceTrend?.current || '-'}/5</div>
      <p className="mt-1 text-sm capitalize text-muted-foreground">{profile?.confidenceTrend?.direction || 'unknown'} trend</p>
    </CardContent>
  </Card>
);
