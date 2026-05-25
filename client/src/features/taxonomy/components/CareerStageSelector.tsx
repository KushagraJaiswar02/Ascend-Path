import { cn } from '../../../lib/utils';
import type { CareerStage } from '../../onboarding/types';

const stages: Array<{ value: CareerStage; label: string }> = [
  { value: 'school_student', label: 'School student' },
  { value: 'college_student', label: 'College student' },
  { value: 'graduate', label: 'Graduate' },
  { value: 'working_professional', label: 'Working professional' },
  { value: 'career_switcher', label: 'Career switcher' },
  { value: 'exam_aspirant', label: 'Exam aspirant' },
  { value: 'freelancer', label: 'Freelancer' },
  { value: 'vocational_learner', label: 'Vocational learner' },
];

export const CareerStageSelector = ({
  value,
  onChange,
}: {
  value?: CareerStage;
  onChange: (value: CareerStage) => void;
}) => {
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
      {stages.map((stage) => (
        <button
          key={stage.value}
          type="button"
          onClick={() => onChange(stage.value)}
          className={cn(
            'min-h-14 rounded-md border px-3 py-2 text-left text-sm font-semibold transition-colors',
            value === stage.value ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card hover:bg-muted'
          )}
        >
          {stage.label}
        </button>
      ))}
    </div>
  );
};
