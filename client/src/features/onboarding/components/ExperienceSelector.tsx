import { cn } from '../../../lib/utils';
import type { ExperienceLevel } from '../types';

const options: ExperienceLevel[] = ['beginner', 'intermediate', 'advanced'];

export const ExperienceSelector = ({
  value,
  onChange,
}: {
  value?: ExperienceLevel;
  onChange: (value: ExperienceLevel) => void;
}) => {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={cn(
            'rounded-md border p-4 text-left capitalize transition-colors',
            value === option ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card hover:bg-muted'
          )}
        >
          <span className="text-sm font-semibold">{option}</span>
        </button>
      ))}
    </div>
  );
};
