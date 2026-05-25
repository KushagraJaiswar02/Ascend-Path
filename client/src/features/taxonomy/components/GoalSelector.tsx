import { cn } from '../../../lib/utils';
import type { CareerGoal } from '../types';

export const GoalSelector = ({
  goals,
  value,
  onChange,
}: {
  goals: CareerGoal[];
  value: string[];
  onChange: (value: string[]) => void;
}) => {
  const toggle = (goalId: string) => {
    onChange(value.includes(goalId) ? value.filter((item) => item !== goalId) : [...value, goalId]);
  };

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {goals.map((goal) => {
        const selected = value.includes(goal.id);
        return (
          <button
            key={goal.id}
            type="button"
            onClick={() => toggle(goal.id)}
            className={cn(
              'min-h-20 rounded-md border p-4 text-left transition-colors',
              selected ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card hover:bg-muted'
            )}
          >
            <span className="block text-sm font-bold">{goal.name}</span>
            {goal.description && <span className="mt-1 block text-xs font-medium text-muted-foreground">{goal.description}</span>}
          </button>
        );
      })}
    </div>
  );
};
