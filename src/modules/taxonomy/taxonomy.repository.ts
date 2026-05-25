import { CareerCluster } from './careerCluster.model';
import { CareerDomain, ICareerDomain } from './careerDomain.model';
import { CareerGoal } from './careerGoal.model';

export const taxonomyRepository = {
  async listClusters(includeInactive = false) {
    return await CareerCluster.find(includeInactive ? {} : { isActive: true }).sort({ order: 1, name: 1 });
  },

  async listDomains(filters: { clusterId?: string; includeInactive?: boolean; q?: string }) {
    const query: any = {};
    if (!filters.includeInactive) query.isActive = true;
    if (filters.clusterId) query.clusterId = filters.clusterId;
    if (filters.q) {
      const regex = new RegExp(filters.q.trim(), 'i');
      query.$or = [{ name: regex }, { aliases: regex }, { description: regex }];
    }
    return await CareerDomain.find(query)
      .populate('clusterId', 'name slug icon color')
      .sort({ trendingScore: -1, name: 1 });
  },

  async listGoals(includeInactive = false) {
    return await CareerGoal.find(includeInactive ? {} : { isActive: true }).sort({ order: 1, name: 1 });
  },

  async findDomainById(id: string) {
    return await CareerDomain.findById(id);
  },

  async findDomainsByIds(ids: string[]) {
    return await CareerDomain.find({ _id: { $in: ids }, isActive: true });
  },

  async findGoalsByIds(ids: string[]) {
    return await CareerGoal.find({ _id: { $in: ids }, isActive: true });
  },

  async findDomainByNormalizedAlias(normalized: string): Promise<ICareerDomain | null> {
    return await CareerDomain.findOne({
      isActive: true,
      $or: [{ slug: normalized }, { normalizedAliases: normalized }],
    });
  },

  async createCluster(data: any) {
    return await CareerCluster.create(data);
  },

  async updateCluster(id: string, data: any) {
    return await CareerCluster.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  },

  async createDomain(data: any) {
    return await CareerDomain.create(data);
  },

  async updateDomain(id: string, data: any) {
    return await CareerDomain.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  },

  async createGoal(data: any) {
    return await CareerGoal.create(data);
  },

  async updateGoal(id: string, data: any) {
    return await CareerGoal.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  },
};
