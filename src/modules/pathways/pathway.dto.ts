const id = (value: any) => value?._id?.toString?.() || value?.toString?.();

export const toPathwayConnectionDto = (connection: any) => ({
  id: id(connection),
  sourceDomain: connection.sourceDomain,
  targetDomain: connection.targetDomain,
  relationshipType: connection.relationshipType,
  overlapStrength: connection.overlapStrength,
  requiredSkills: connection.requiredSkills || [],
  opportunityOutcomes: connection.opportunityOutcomes || [],
  decisionSignals: connection.decisionSignals || [],
  estimatedTimelineWeeks: connection.estimatedTimelineWeeks,
  suggestedRoadmaps: connection.suggestedRoadmaps || [],
});

export const buildDecisionGuidance = (domain: any, connections: any[]) => {
  const skills = [...new Set(connections.flatMap((item) => item.requiredSkills || []))].slice(0, 8);
  const outcomes = [...new Set(connections.flatMap((item) => item.opportunityOutcomes || []))].slice(0, 8);
  const signals = [...new Set(connections.flatMap((item) => item.decisionSignals || []))].slice(0, 5);

  return {
    headline: `${domain.name} can lead into ${connections.length || 'multiple'} adjacent pathways`,
    fitSignals: signals.length ? signals : [`People who enjoy structured practice and gradual specialization often explore ${domain.name}.`],
    difficultyExpectation: skills.length > 5 ? 'moderate_to_high' : 'moderate',
    timeInvestment: connections[0]?.estimatedTimelineWeeks ? `${connections[0].estimatedTimelineWeeks}+ weeks for an adjacent transition` : 'varies by goal and weekly commitment',
    skills,
    outcomes,
  };
};
