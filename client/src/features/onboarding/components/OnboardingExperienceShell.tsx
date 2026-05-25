import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OnboardingExperienceShellProps {
  step: number;
  totalSteps: number;
  canContinue: boolean;
  isSubmitting?: boolean;
  onBack: () => void;
  onNext: () => void;
  children: React.ReactNode;
}

export const OnboardingExperienceShell: React.FC<OnboardingExperienceShellProps> = ({
  step,
  totalSteps,
  canContinue,
  isSubmitting,
  onBack,
  onNext,
  children,
}) => {
  const progress = Math.round(((step + 1) / totalSteps) * 100);
  return (
    <div className="mx-auto max-w-5xl py-8 sm:py-12">
      <div className="mb-8 space-y-3">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground">
          <span>Step {Math.min(step + 1, totalSteps)} of {totalSteps}</span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-5 shadow-subtle sm:p-8">{children}</div>

      <div className="mt-6 flex items-center justify-between">
        <Button type="button" variant="outline" onClick={onBack} disabled={step === 0 || isSubmitting}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button type="button" onClick={onNext} disabled={!canContinue || isSubmitting}>
          {step === totalSteps - 1 ? (isSubmitting ? 'Building...' : 'Build my dashboard') : 'Continue'}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
