import { cn } from '../../../lib/utils';
import { goalLabels } from '../options';
import type { PrimaryGoal } from '../types';

export const GoalSelectionCard = ({
  goal,
  selected,
  onSelect,
}: {
  goal: PrimaryGoal;
  selected: boolean;
  onSelect: (goal: PrimaryGoal) => void;
}) => {
  return (
    <button
      type="button"
      onClick={() => onSelect(goal)}
      className={cn(
        'min-h-20 rounded-md border p-4 text-left text-sm font-semibold transition-colors',
        selected ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card hover:bg-muted'
      )}
    >
      {goalLabels[goal]}
    </button>
  );
};
