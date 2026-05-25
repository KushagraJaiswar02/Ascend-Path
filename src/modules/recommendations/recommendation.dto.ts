export const toRecommendationDto = (item: any) => ({
  targetType: item.targetType,
  score: Math.round(item.score),
  reasons: item.reasons,
  contextLabel: item.contextLabel,
  item: item.item,
});

export const buildContextLabel = (profile: any) => {
  const domainCount = profile?.careerDomains?.length || 0;
  const stage = profile?.careerStage?.replace(/_/g, ' ');
  if (domainCount && stage) return `Because you are exploring ${domainCount} field${domainCount > 1 ? 's' : ''} as a ${stage}`;
  if (domainCount) return `Because you are exploring your selected fields`;
  if (stage) return `Recommended for your ${stage} stage`;
  return 'Recommended for your career context';
};
