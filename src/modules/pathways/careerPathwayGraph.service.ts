import mongoose from 'mongoose';
import { userRepository } from '../users/user.repository';
import { pathwayRepository } from './pathway.repository';
import { buildDecisionGuidance, toPathwayConnectionDto } from './pathway.dto';

const getId = (value: any) => value?._id?.toString?.() || value?.toString?.() || '';

export const careerPathwayGraphService = {
  async createConnection(input: any) {
    return toPathwayConnectionDto(await pathwayRepository.upsertConnection({
      ...input,
      sourceDomain: new mongoose.Types.ObjectId(input.sourceDomain),
      targetDomain: new mongoose.Types.ObjectId(input.targetDomain),
      suggestedRoadmaps: (input.suggestedRoadmaps || []).map((id: string) => new mongoose.Types.ObjectId(id)),
    }));
  },

  async updateConnection(id: string, input: any) {
    const payload = { ...input };
    if (payload.sourceDomain) payload.sourceDomain = new mongoose.Types.ObjectId(payload.sourceDomain);
    if (payload.targetDomain) payload.targetDomain = new mongoose.Types.ObjectId(payload.targetDomain);
    if (payload.suggestedRoadmaps) payload.suggestedRoadmaps = payload.suggestedRoadmaps.map((item: string) => new mongoose.Types.ObjectId(item));
    const updated = await pathwayRepository.updateConnection(id, payload);
    if (!updated) throw { statusCode: 404, message: 'Pathway connection not found' };
    return toPathwayConnectionDto(updated);
  },

  async domainHub(slug: string) {
    const domain = await pathwayRepository.domainBySlug(slug);
    if (!domain) throw { statusCode: 404, message: 'Career domain not found' };

    const domainId = getId(domain);
    const [outgoing, incoming, roadmaps, mentors, sessions, goals] = await Promise.all([
      pathwayRepository.connectionsForDomain(domainId),
      pathwayRepository.incomingConnections(domainId),
      pathwayRepository.roadmapsForDomain(domainId),
      pathwayRepository.mentorsForDomain(domainId),
      pathwayRepository.sessionsForDomain(domainId),
      pathwayRepository.goalsForDomain(domainId),
    ]);

    return {
      domain,
      overview: {
        title: domain.name,
        description: domain.description,
        cluster: domain.clusterId,
      },
      graph: {
        current: domain,
        outgoing: outgoing.map(toPathwayConnectionDto),
        incoming: incoming.map(toPathwayConnectionDto),
      },
      decisionGuidance: buildDecisionGuidance(domain, outgoing),
      ecosystem: {
        roadmaps,
        mentors,
        sessions,
        goals,
      },
    };
  },

  async userJourney(userId: string) {
    const user = await userRepository.findUserById(userId);
    if (!user) throw { statusCode: 404, message: 'User not found' };

    const domainIds = [...new Set([...(user.careerDomains || []), ...(user.onboarding?.careerDomains || [])].map(getId))].filter(Boolean);
    const [progress, connectionGroups] = await Promise.all([
      pathwayRepository.activeUserProgress(userId),
      Promise.all(domainIds.slice(0, 4).map((domainId) => pathwayRepository.connectionsForDomain(domainId, 5))),
    ]);

    const activeRoadmaps = progress.map((item: any) => item.roadmapId).filter(Boolean);
    const sequenceIds = activeRoadmaps.flatMap((roadmap: any) => [
      ...(roadmap.nextRoadmaps || []),
      ...(roadmap.recommendedSequence || []),
    ]);
    const sequenceRoadmaps = sequenceIds.length ? await pathwayRepository.roadmapsByIds(sequenceIds) : [];
    const connections = connectionGroups.flat().sort((a, b) => b.overlapStrength - a.overlapStrength);

    return {
      currentPosition: {
        careerStage: user.careerStage || user.onboarding?.careerStage,
        targetRole: user.onboarding?.targetRole,
        domains: domainIds,
        activeRoadmaps,
      },
      possiblePaths: connections.slice(0, 10).map(toPathwayConnectionDto),
      nextRoadmaps: sequenceRoadmaps,
      nextStepNarrative: this.nextStepNarrative(user, activeRoadmaps, connections),
    };
  },

  nextStepNarrative(user: any, activeRoadmaps: any[], connections: any[]) {
    if (activeRoadmaps.length) {
      return 'Continue your active roadmap, then use the next-path options to specialize or move into an adjacent opportunity.';
    }
    if (connections.length) {
      return `Start with a foundation path, then consider ${connections[0].targetDomain?.name || 'a related specialization'} as your next branch.`;
    }
    return 'Choose one domain hub to explore possible outcomes, mentors, and realistic first milestones.';
  },
};
