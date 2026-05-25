import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useCreateJournalEntry } from '../hooks/useCompanion';
import type { CompanionHome } from '../types';

export const JourneyReflectionJournal = ({ entries }: { entries: CompanionHome['journal'] }) => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const create = useCreateJournalEntry();

  return (
    <Card className="border border-border bg-card shadow-subtle">
      <CardHeader>
        <CardTitle className="text-base font-bold">Career Journal</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-2">
          <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="A win, setback, or realization" />
          <Textarea value={body} onChange={(event) => setBody(event.target.value)} placeholder="Capture the thought for your future self." />
          <Button
            size="sm"
            disabled={create.isPending || !title || !body}
            onClick={() => {
              create.mutate({ entryType: 'reflection', title, body, tags: [], relatedDomainIds: [], isPrivate: true });
              setTitle('');
              setBody('');
            }}
          >
            Add journal note
          </Button>
        </div>
        {entries.slice(0, 3).map((entry) => (
          <div key={entry._id} className="rounded-md border border-border p-3">
            <div className="text-sm font-semibold">{entry.title}</div>
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{entry.body}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
