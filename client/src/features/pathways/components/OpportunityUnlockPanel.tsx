import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const OpportunityUnlockPanel = ({ skills, outcomes }: { skills: string[]; outcomes: string[] }) => (
  <Card className="border border-border bg-card shadow-subtle">
    <CardHeader>
      <CardTitle className="text-base font-bold">Skills Unlock Opportunities</CardTitle>
    </CardHeader>
    <CardContent className="grid gap-4 md:grid-cols-2">
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Build these skills</div>
        <div className="mt-2 flex flex-wrap gap-2">
          {skills.map((skill) => <span key={skill} className="rounded-md border border-border px-2 py-1 text-xs font-semibold">{skill}</span>)}
        </div>
      </div>
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">They can lead to</div>
        <div className="mt-2 space-y-2">
          {outcomes.map((outcome) => <div key={outcome} className="rounded-md bg-muted/30 px-2 py-1 text-xs font-semibold">{outcome}</div>)}
        </div>
      </div>
    </CardContent>
  </Card>
);
