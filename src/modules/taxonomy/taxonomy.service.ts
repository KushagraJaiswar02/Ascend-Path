import mongoose from 'mongoose';
import { taxonomyRepository } from './taxonomy.repository';
import { normalizeTaxonomyText, slugify } from './taxonomy.utils';
import { toClusterDto, toDomainDto, toGoalDto } from './taxonomy.dto';
import { UpsertClusterInput, UpsertDomainInput, UpsertGoalInput } from './taxonomy.validation';

const asObjectIds = (ids: string[]) => ids.map((id) => new mongoose.Types.ObjectId(id));

export const taxonomyService = {
  async listClusters(includeInactive = false) {
    const clusters = await taxonomyRepository.listClusters(includeInactive);
    return clusters.map(toClusterDto);
  },

  async listDomains(filters: { clusterId?: string; includeInactive?: boolean; q?: string }) {
    const domains = await taxonomyRepository.listDomains(filters);
    return domains.map(toDomainDto);
  },

  async listGoals(includeInactive = false) {
    const goals = await taxonomyRepository.listGoals(includeInactive);
    return goals.map(toGoalDto);
  },

  async explorer() {
    const [clusters, domains, goals] = await Promise.all([
      taxonomyRepository.listClusters(false),
      taxonomyRepository.listDomains({ includeInactive: false }),
      taxonomyRepository.listGoals(false),
    ]);

    return {
      clusters: clusters.map((cluster) => ({
        ...toClusterDto(cluster),
        domains: domains
          .filter((domain: any) => domain.clusterId?._id?.toString?.() === cluster._id.toString() || domain.clusterId?.toString?.() === cluster._id.toString())
          .map(toDomainDto),
      })),
      goals: goals.map(toGoalDto),
    };
  },

  async resolveDomain(query: string) {
    const normalized = normalizeTaxonomyText(query);
    if (!normalized) return null;

    const slug = slugify(query);
    const exact = await taxonomyRepository.findDomainByNormalizedAlias(normalized)
      || await taxonomyRepository.findDomainByNormalizedAlias(slug);
    if (exact) return toDomainDto(exact);

    const [candidate] = await taxonomyRepository.listDomains({ q: query, includeInactive: false });
    return candidate ? toDomainDto(candidate) : null;
  },

  async normalizeDomainIds(inputs: string[] = []) {
    const resolved = await Promise.all(inputs.map((input) => this.resolveDomain(input)));
    const ids = resolved.filter(Boolean).map((domain: any) => domain.id);
    return [...new Set(ids)];
  },

  async assertActiveDomains(ids: string[] = []) {
    if (!ids.length) return [];
    const domains = await taxonomyRepository.findDomainsByIds(ids);
    if (domains.length !== ids.length) throw { statusCode: 400, message: 'One or more career domains are invalid or inactive' };
    return asObjectIds(ids);
  },

  async assertActiveGoals(ids: string[] = []) {
    if (!ids.length) return [];
    const goals = await taxonomyRepository.findGoalsByIds(ids);
    if (goals.length !== ids.length) throw { statusCode: 400, message: 'One or more career goals are invalid or inactive' };
    return asObjectIds(ids);
  },

  async createCluster(input: UpsertClusterInput) {
    const cluster = await taxonomyRepository.createCluster({
      ...input,
      slug: input.slug || slugify(input.name),
    });
    return toClusterDto(cluster);
  },

  async updateCluster(id: string, input: Partial<UpsertClusterInput>) {
    const cluster = await taxonomyRepository.updateCluster(id, {
      ...input,
      ...(input.name && !input.slug ? { slug: slugify(input.name) } : {}),
    });
    if (!cluster) throw { statusCode: 404, message: 'Career cluster not found' };
    return toClusterDto(cluster);
  },

  async createDomain(input: UpsertDomainInput) {
    const aliases = [...new Set([input.name, ...(input.aliases || [])])];
    const domain = await taxonomyRepository.createDomain({
      ...input,
      slug: input.slug || slugify(input.name),
      aliases,
      normalizedAliases: aliases.map(normalizeTaxonomyText),
    });
    return toDomainDto(domain);
  },

  async updateDomain(id: string, input: Partial<UpsertDomainInput>) {
    const existing = await taxonomyRepository.findDomainById(id);
    if (!existing) throw { statusCode: 404, message: 'Career domain not found' };

    const name = input.name || existing.name;
    const aliases = [...new Set([name, ...((input.aliases || existing.aliases || []) as string[])])];
    const domain = await taxonomyRepository.updateDomain(id, {
      ...input,
      ...(input.name && !input.slug ? { slug: slugify(input.name) } : {}),
      aliases,
      normalizedAliases: aliases.map(normalizeTaxonomyText),
    });
    return toDomainDto(domain);
  },

  async createGoal(input: UpsertGoalInput) {
    const goal = await taxonomyRepository.createGoal({
      ...input,
      slug: input.slug || slugify(input.name),
    });
    return toGoalDto(goal);
  },

  async updateGoal(id: string, input: Partial<UpsertGoalInput>) {
    const goal = await taxonomyRepository.updateGoal(id, {
      ...input,
      ...(input.name && !input.slug ? { slug: slugify(input.name) } : {}),
    });
    if (!goal) throw { statusCode: 404, message: 'Career goal not found' };
    return toGoalDto(goal);
  },
};
