export const toClusterDto = (cluster: any) => ({
  id: cluster._id.toString(),
  name: cluster.name,
  slug: cluster.slug,
  icon: cluster.icon,
  color: cluster.color,
  description: cluster.description,
  order: cluster.order,
  isActive: cluster.isActive,
});

export const toDomainDto = (domain: any) => ({
  id: domain._id.toString(),
  clusterId: domain.clusterId?._id?.toString?.() || domain.clusterId?.toString?.(),
  cluster: domain.clusterId?.name ? toClusterDto(domain.clusterId) : undefined,
  name: domain.name,
  slug: domain.slug,
  aliases: domain.aliases || [],
  description: domain.description,
  trendingScore: domain.trendingScore,
  isActive: domain.isActive,
});

export const toGoalDto = (goal: any) => ({
  id: goal._id.toString(),
  name: goal.name,
  slug: goal.slug,
  description: goal.description,
  order: goal.order,
  applicableStages: goal.applicableStages || [],
  isActive: goal.isActive,
});
