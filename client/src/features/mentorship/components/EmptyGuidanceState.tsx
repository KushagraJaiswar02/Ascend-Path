import { MessageCircleHeart } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const EmptyGuidanceState = ({ onExplore }: { onExplore: () => void }) => (
  <div className="flex min-h-[420px] flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card p-8 text-center">
    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
      <MessageCircleHeart className="h-7 w-7" />
    </div>
    <h2 className="text-2xl font-bold text-foreground">Start with a simple question</h2>
    <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
      Mentorship does not have to begin with a formal booking. Ask a mentor for one small piece of guidance, then escalate to a live session when the context is ready.
    </p>
    <Button className="mt-6" onClick={onExplore}>Find a mentor</Button>
  </div>
);
