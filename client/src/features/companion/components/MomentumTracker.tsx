import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { CompanionProfile } from '../types';

export const MomentumTracker = ({ profile }: { profile?: CompanionProfile }) => (
  <Card className="border border-border bg-card shadow-subtle">
    <CardHeader>
      <CardTitle className="text-base font-bold">Momentum</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-black">{profile?.momentum?.score || 0}</div>
      <p className="mt-1 text-sm capitalize text-muted-foreground">{profile?.momentum?.status || 'unknown'} rhythm</p>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full bg-primary" style={{ width: `${profile?.momentum?.score || 0}%` }} />
      </div>
    </CardContent>
  </Card>
);
