import { Check } from 'lucide-react';
import { cn } from '../../../lib/utils';

const steps = ['Profile', 'Expertise', 'Trust', 'Availability'];

export const MentorApplicationProgress = ({ currentStep }: { currentStep: number }) => {
  return (
    <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
      {steps.map((step, index) => {
        const active = index === currentStep;
        const complete = index < currentStep;
        return (
          <div
            key={step}
            className={cn(
              'flex min-h-12 items-center gap-2 rounded-md border px-3 py-2 text-sm',
              active && 'border-primary bg-primary/10 text-primary',
              complete && 'border-success/30 bg-success/10 text-success',
              !active && !complete && 'border-border bg-card text-muted-foreground'
            )}
          >
            <span className={cn('flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold', complete && 'border-success bg-success text-success-foreground')}>
              {complete ? <Check className="h-3.5 w-3.5" /> : index + 1}
            </span>
            <span className="font-medium">{step}</span>
          </div>
        );
      })}
    </div>
  );
};
