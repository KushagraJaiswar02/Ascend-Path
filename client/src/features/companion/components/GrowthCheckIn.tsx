import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useSubmitGrowthCheckIn } from '../hooks/useCompanion';

export const GrowthCheckIn = () => {
  const [confidenceLevel, setConfidenceLevel] = useState(3);
  const [hardestThing, setHardestThing] = useState('');
  const submit = useSubmitGrowthCheckIn();

  return (
    <Card className="border border-border bg-card shadow-subtle">
      <CardHeader>
        <CardTitle className="text-base font-bold">Growth Check-In</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <label className="text-sm font-semibold">Confidence: {confidenceLevel}/5</label>
        <input className="w-full accent-primary" type="range" min={1} max={5} value={confidenceLevel} onChange={(event) => setConfidenceLevel(Number(event.target.value))} />
        <Textarea value={hardestThing} onChange={(event) => setHardestThing(event.target.value)} placeholder="What has felt hardest recently?" />
        <Button
          onClick={() => submit.mutate({ confidenceLevel, hardestThing, supportNeeded: [] })}
          disabled={submit.isPending}
          size="sm"
        >
          Save check-in
        </Button>
      </CardContent>
    </Card>
  );
};
