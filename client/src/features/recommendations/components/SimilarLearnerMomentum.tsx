import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const SimilarLearnerMomentum = ({ journey }: { journey?: Array<{ title: string; description: string }> }) => (
  <Card className="border border-border bg-card shadow-subtle">
    <CardHeader>
      <CardTitle className="text-base font-bold">Starter Journey</CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      {(journey || []).slice(0, 3).map((step, index) => (
        <div key={step.title} className="rounded-md border border-border p-3">
          <div className="text-xs font-bold text-primary">Step {index + 1}</div>
          <div className="mt-1 text-sm font-semibold">{step.title}</div>
          <p className="mt-1 text-xs text-muted-foreground">{step.description}</p>
        </div>
      ))}
    </CardContent>
  </Card>
);
