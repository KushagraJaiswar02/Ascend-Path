import { Pin } from 'lucide-react';

export const PinnedAdvicePanel = ({ advice }: { advice?: string }) => {
  if (!advice) return null;
  return (
    <div className="rounded-lg border border-border bg-muted/20 p-4">
      <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
        <Pin className="h-4 w-4" />
        Pinned mentor advice
      </div>
      <p className="text-sm leading-relaxed text-foreground">{advice}</p>
    </div>
  );
};
