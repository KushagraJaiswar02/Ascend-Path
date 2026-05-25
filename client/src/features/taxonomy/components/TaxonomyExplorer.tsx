import { ClusterAccordion } from './ClusterAccordion';
import { GoalSelector } from './GoalSelector';
import type { TaxonomyExplorerResponse } from '../types';

export const TaxonomyExplorer = ({
  taxonomy,
  selectedDomains,
  selectedGoals,
  onDomainsChange,
  onGoalsChange,
}: {
  taxonomy: TaxonomyExplorerResponse;
  selectedDomains: string[];
  selectedGoals: string[];
  onDomainsChange: (value: string[]) => void;
  onGoalsChange: (value: string[]) => void;
}) => {
  return (
    <div className="grid gap-4 lg:grid-cols-[1.25fr_1fr]">
      <ClusterAccordion clusters={taxonomy.clusters} value={selectedDomains} onChange={onDomainsChange} />
      <GoalSelector goals={taxonomy.goals} value={selectedGoals} onChange={onGoalsChange} />
    </div>
  );
};
