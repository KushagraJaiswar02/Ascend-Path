import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Option {
  value: string;
  label: string;
  description?: string;
}

interface ConversationalQuestionStepProps {
  eyebrow: string;
  title: string;
  description: string;
  options?: Option[];
  value?: string | string[];
  multi?: boolean;
  onChange?: (value: string | string[]) => void;
  children?: React.ReactNode;
}

export const ConversationalQuestionStep: React.FC<ConversationalQuestionStepProps> = ({
  eyebrow,
  title,
  description,
  options = [],
  value,
  multi,
  onChange,
  children,
}) => {
  const selected = Array.isArray(value) ? value : value ? [value] : [];

  const toggle = (next: string) => {
    if (!onChange) return;
    if (!multi) {
      onChange(next);
      return;
    }
    onChange(selected.includes(next) ? selected.filter((item) => item !== next) : [...selected, next]);
  };

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <p className="text-xs font-bold uppercase tracking-widest text-primary">{eyebrow}</p>
        <h2 className="text-3xl font-bold leading-tight text-foreground sm:text-4xl">{title}</h2>
        <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">{description}</p>
      </div>

      {options.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {options.map((option) => {
            const isSelected = selected.includes(option.value);
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => toggle(option.value)}
                className={cn(
                  'min-h-[88px] rounded-lg border bg-card p-4 text-left shadow-subtle transition-all hover:border-primary/40 hover:bg-primary/5',
                  isSelected ? 'border-primary bg-primary/8' : 'border-border'
                )}
              >
                <span className="flex items-start justify-between gap-3">
                  <span>
                    <span className="block text-sm font-bold text-foreground">{option.label}</span>
                    {option.description && (
                      <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">{option.description}</span>
                    )}
                  </span>
                  <span
                    className={cn(
                      'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border',
                      isSelected ? 'border-primary bg-primary text-primary-foreground' : 'border-border'
                    )}
                  >
                    {isSelected && <Check className="h-3.5 w-3.5" />}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      )}

      {children}
    </div>
  );
};
