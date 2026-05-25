export interface CareerCluster {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  color?: string;
  description?: string;
  order: number;
  isActive: boolean;
  domains?: CareerDomain[];
}

export interface CareerDomain {
  id: string;
  clusterId: string;
  cluster?: CareerCluster;
  name: string;
  slug: string;
  aliases: string[];
  description?: string;
  trendingScore: number;
  isActive: boolean;
}

export interface CareerGoal {
  id: string;
  name: string;
  slug: string;
  description?: string;
  order: number;
  applicableStages: string[];
  isActive: boolean;
}

export interface TaxonomyExplorerResponse {
  clusters: CareerCluster[];
  goals: CareerGoal[];
}
