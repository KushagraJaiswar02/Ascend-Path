import mongoose from 'mongoose';
import { userRepository } from '../users/user.repository';
import { recommendationRepository } from './recommendation.repository';
import { toRecommendationDto, buildContextLabel } from './recommendation.dto';
import { RecommendationInteractionInput } from './recommendation.validation';
import { pathwayRepository } from '../pathways/pathway.repository';
import { companionRepository } from '../companion/companion.repository';

const idString = (value: any) => value?._id?.toString?.() || value?.toString?.() || '';
const asObjectIds = (ids: any[] = []) => ids.map((id) => new mongoose.Types.ObjectId(idString(id))).filter(Boolean);

const overlapCount = (left: any[] = [], right: any[] = []) => {
  const rightSet = new Set(right.map(idString));
  return left.map(idString).filter((item) => rightSet.has(item)).length;
};

const intersectsText = (left: string[] = [], right: string[] = []) => {
  const normalized = new Set(right.map((item) => item.toLowerCase()));
  return left.some((item) => normalized.has(item.toLowerCase()));
};

const commitmentDifficultyFit = (weeklyCommitment?: string, difficulty?: string) => {
  if (!weeklyCommitment || !difficulty) return 0;
  if (weeklyCommitment === '0_3_hours' && difficulty === 'beginner') return 8;
  if (weeklyCommitment === '4_7_hours' && ['beginner', 'intermediate'].includes(difficulty)) return 7;
  if (weeklyCommitment === '8_15_hours') return 6;
  if (weeklyCommitment === '16_plus_hours') return 7;
  return 2;
};

const budgetFit = (budgetRange?: string, price?: number) => {
  if (!budgetRange || price === undefined) return 0;
  if (price === 0) return 8;
  if (budgetRange === 'free_only') return -12;
  if (budgetRange === 'low_cost' && price <= 500) return 7;
  if (budgetRange === 'moderate' && price <= 2000) return 7;
  if (budgetRange === 'premium' || budgetRange === 'flexible') return 5;
  return 0;
};

export const recommendationEngineService = {
  async buildProfile(userId: string) {
    const user = await userRepository.findUserById(userId);
    if (!user) throw { statusCode: 404, message: 'User not found' };

    const [progress, interactions] = await Promise.all([
      recommendationRepository.activeProgress(userId),
      recommendationRepository.interactionCounts(userId),
    ]);

    const progressDomains = progress.flatMap((item: any) => item.roadmapId?.careerDomains || []);
    const progressGoals = progress.flatMap((item: any) => item.roadmapId?.careerGoals || []);
    const domainIds = [...new Set([...(user.careerDomains || []), ...(user.onboarding?.careerDomains || []), ...progressDomains].map(idString))];
    const goalIds = [...new Set([...(user.careerGoals || []), ...(user.onboarding?.careerGoals || []), ...progressGoals].map(idString))];

    const count = (type: string) => interactions.find((item: any) => item._id === type)?.count || 0;
    const completed = progress.filter((item: any) => Boolean(item.completedAt)).length;
    const inferredInterests = [
      ...(user.domains || []),
      ...(user.interests || []),
      ...(user.onboarding?.interestedDomains || []),
      ...progress.flatMap((item: any) => item.roadmapId?.domains || []),
    ].filter(Boolean);

    const profile = await recommendationRepository.upsertProfile(userId, {
      careerDomains: asObjectIds(domainIds),
      careerGoals: asObjectIds(goalIds),
      careerStage: user.careerStage || user.onboarding?.careerStage,
      preferredLanguages: user.preferredLanguages?.length ? user.preferredLanguages : user.onboarding?.preferredLanguages || [],
      budgetRange: user.budgetRange || user.onboarding?.budgetRange,
      weeklyCommitment: user.weeklyCommitment || user.onboarding?.weeklyCommitment,
      learningStyle: user.onboarding?.preferredLearningStyle,
      targetRole: user.onboarding?.targetRole,
      inferredInterests: [...new Set(inferredInterests)].slice(0, 30),
      engagementPatterns: {
        roadmapEnrollments: progress.length,
        roadmapCompletions: completed,
        sessionBookings: count('booked'),
        sessionAttendance: count('completed'),
        recommendationClicks: count('clicked'),
        recommendationIgnores: count('ignored'),
      },
      recommendationWeights: this.weightsForUser(user, progress.length, completed),
    });

    return profile;
  },

  weightsForUser(user: any, enrollments: number, completions: number) {
    const stage = user.careerStage || user.onboarding?.careerStage;
    const isBeginner = ['school_student', 'college_student', 'graduate', 'career_switcher', 'vocational_learner'].includes(stage);
    return {
      domain: isBeginner ? 28 : 32,
      goal: isBeginner ? 20 : 16,
      stage: isBeginner ? 14 : 8,
      language: 10,
      budget: 8,
      quality: completions > 0 || enrollments > 1 ? 16 : 10,
      freshness: 5,
      behavior: 5,
    };
  },

  scoreMentor(mentor: any, profile: any) {
    const weights = profile.recommendationWeights;
    const domainOverlap = overlapCount(profile.careerDomains, mentor.careerDomains);
    const goalOverlap = overlapCount(profile.careerGoals, mentor.mentorProfile?.mentorshipFocus || mentor.careerGoals || []);
    const languages = mentor.mentorProfile?.languages || mentor.preferredLanguages || [];
    const reasons: string[] = [];
    let score = 0;

    if (domainOverlap) {
      score += weights.domain + domainOverlap * 6;
      reasons.push('matches your career domain');
    }
    if (goalOverlap) {
      score += weights.goal + goalOverlap * 4;
      reasons.push('aligned with your current goal');
    }
    if (intersectsText(profile.preferredLanguages, languages)) {
      score += weights.language;
      reasons.push('supports your preferred language');
    }
    if (mentor.averageRating) score += Math.min(12, mentor.averageRating * 2);
    if (mentor.fameScore) score += Math.min(12, mentor.fameScore / 10);
    if (mentor.totalSessions) score += Math.min(8, mentor.totalSessions / 5);
    if (mentor.availability?.schedule?.length) {
      score += 4;
      reasons.push('has visible availability');
    }

    return { targetType: 'mentor', targetId: mentor._id, item: mentor, score, reasons: reasons.length ? reasons : ['recommended from mentor quality signals'] };
  },

  scoreRoadmap(roadmap: any, profile: any) {
    const weights = profile.recommendationWeights;
    const domainOverlap = overlapCount(profile.careerDomains, roadmap.careerDomains);
    const goalOverlap = overlapCount(profile.careerGoals, roadmap.careerGoals);
    const reasons: string[] = [];
    let score = 0;

    if (domainOverlap) {
      score += weights.domain + domainOverlap * 5;
      reasons.push('fits your selected field');
    }
    if (goalOverlap) {
      score += weights.goal + goalOverlap * 4;
      reasons.push('supports your active goal');
    }
    if (roadmap.targetStages?.includes(profile.careerStage)) {
      score += weights.stage;
      reasons.push('built for your career stage');
    }
    if (intersectsText(profile.preferredLanguages, roadmap.languages || [])) {
      score += weights.language;
      reasons.push('available in your preferred language');
    }
    score += commitmentDifficultyFit(profile.weeklyCommitment, roadmap.difficulty);
    score += roadmap.averageRating ? Math.min(10, roadmap.averageRating * 2) : 0;
    score += roadmap.enrollmentCount ? Math.min(10, roadmap.enrollmentCount / 20) : 0;

    return { targetType: 'roadmap', targetId: roadmap._id, item: roadmap, score, reasons: reasons.length ? reasons : ['ranked by learner momentum and fit'] };
  },

  scoreSession(session: any, profile: any) {
    const weights = profile.recommendationWeights;
    const domainOverlap = overlapCount(profile.careerDomains, session.careerDomains);
    const goalOverlap = overlapCount(profile.careerGoals, session.careerGoals);
    const reasons: string[] = [];
    let score = 0;

    if (domainOverlap) {
      score += weights.domain;
      reasons.push('topic matches your field');
    }
    if (goalOverlap) {
      score += weights.goal;
      reasons.push('matches your goal');
    }
    if (session.audienceStages?.includes(profile.careerStage)) {
      score += weights.stage;
      reasons.push('designed for your stage');
    }
    if (intersectsText(profile.preferredLanguages, session.languages || [])) {
      score += weights.language;
      reasons.push('matches your language preference');
    }
    score += budgetFit(profile.budgetRange, session.price);
    score += session.guideId?.averageRating ? Math.min(10, session.guideId.averageRating * 2) : 0;
    score += session.attendeeCount ? Math.min(8, session.attendeeCount / 10) : 0;

    const hoursUntil = (new Date(session.scheduledAt).getTime() - Date.now()) / (1000 * 60 * 60);
    if (hoursUntil > 0 && hoursUntil < 168) {
      score += weights.freshness;
      reasons.push('coming up soon');
    }

    return { targetType: 'session', targetId: session._id, item: session, score, reasons: reasons.length ? reasons : ['upcoming workshop with useful momentum'] };
  },

  scoreForum(post: any, profile: any) {
    const interests = profile.inferredInterests || [];
    const tagMatches = (post.tags || []).filter((tag: string) => interests.some((interest: string) => interest.toLowerCase() === tag.toLowerCase())).length;
    const reasons: string[] = [];
    let score = 0;
    if (tagMatches) {
      score += 28 + tagMatches * 5;
      reasons.push('connected to your current interests');
    }
    if (post.isPinned) score += 8;
    if (post.isResolved || post.isSolved) {
      score += 6;
      reasons.push('has useful answers');
    }
    score += Math.min(15, (post.upvotes || 0) / 2);
    score += Math.min(8, (post.viewCount || 0) / 50);
    return { targetType: 'forum', targetId: post._id, item: post, score, reasons: reasons.length ? reasons : ['active discussion in career community'] };
  },

  async getRecommendations(userId: string, context = 'dashboard', limit = 6, refresh = false) {
    if (!refresh) {
      const snapshot = await recommendationRepository.findSnapshot(userId, context);
      if (snapshot?.items?.length) {
        const profile = await recommendationRepository.findProfile(userId);
        const rails = this.groupSnapshotItems(snapshot.items, limit);
        return {
          profile,
          contextLabel: snapshot.items[0]?.contextLabel || buildContextLabel(profile),
          rails,
          starterJourney: this.starterJourney(profile),
        };
      }
    }

    const profile = await this.buildProfile(userId);
    const companion = await companionRepository.getProfile(userId);
    const domainIds = asObjectIds(profile.careerDomains || []);
    const goalIds = asObjectIds(profile.careerGoals || []);
    const tags = profile.inferredInterests || [];
    const adjacentConnections = (await Promise.all(domainIds.slice(0, 4).map((domainId) => pathwayRepository.connectionsForDomain(idString(domainId), 4)))).flat();
    const adjacentDomainIds = adjacentConnections.map((connection: any) => connection.targetDomain?._id || connection.targetDomain).filter(Boolean);

    const [mentors, roadmaps, sessions, posts] = await Promise.all([
      recommendationRepository.candidateMentors([...domainIds, ...adjacentDomainIds]),
      recommendationRepository.candidateRoadmaps([...domainIds, ...adjacentDomainIds], goalIds),
      recommendationRepository.candidateSessions([...domainIds, ...adjacentDomainIds], goalIds),
      recommendationRepository.candidatePosts(tags),
    ]);

    const contextLabel = buildContextLabel(profile);
    const scored = {
      mentors: mentors.map((item) => ({ ...this.scoreMentor(item, profile), contextLabel })).sort((a, b) => b.score - a.score).slice(0, limit).map(toRecommendationDto),
      roadmaps: roadmaps.map((item) => this.applyCompanionAdjustment({ ...this.scoreRoadmap(item, profile), contextLabel }, companion)).sort((a, b) => b.score - a.score).slice(0, limit).map(toRecommendationDto),
      sessions: sessions.map((item) => this.applyCompanionAdjustment({ ...this.scoreSession(item, profile), contextLabel }, companion)).sort((a, b) => b.score - a.score).slice(0, limit).map(toRecommendationDto),
      forum: posts.map((item) => ({ ...this.scoreForum(item, profile), contextLabel })).sort((a, b) => b.score - a.score).slice(0, limit).map(toRecommendationDto),
    };

    const snapshotItems = [...scored.mentors, ...scored.roadmaps, ...scored.sessions, ...scored.forum].map((item: any) => ({
      targetType: item.targetType,
      targetId: item.item?._id,
      score: item.score,
      reasons: item.reasons,
      contextLabel: item.contextLabel,
      item: item.item?.toObject?.() || item.item,
    })).filter((item) => item.targetId);
    await recommendationRepository.saveSnapshot(userId, context, snapshotItems);

    return {
      profile,
      contextLabel,
      rails: scored,
      starterJourney: this.starterJourney(profile),
    };
  },

  applyCompanionAdjustment(scored: any, companion: any) {
    if (!companion) return scored;
    const activeBlockers = (companion.blockers || []).filter((blocker: any) => !blocker.resolvedAt);
    const lowConfidence = companion.confidenceTrend?.current && companion.confidenceTrend.current <= 2;
    const stalled = companion.momentum?.status === 'stalled' || companion.momentum?.status === 'recovering';

    if ((lowConfidence || stalled || activeBlockers.length) && scored.item?.difficulty === 'beginner') {
      scored.score += 10;
      scored.reasons = [...scored.reasons, 'fits a confidence-friendly restart'];
    }
    if (companion.momentum?.status === 'building' && scored.item?.difficulty === 'advanced') {
      scored.score += 8;
      scored.reasons = [...scored.reasons, 'matches your recent momentum'];
    }
    return scored;
  },

  groupSnapshotItems(items: any[], limit: number) {
    const toClient = (targetType: string) => items
      .filter((item) => item.targetType === targetType)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((item) => ({
        targetType: item.targetType,
        score: item.score,
        reasons: item.reasons || [],
        contextLabel: item.contextLabel,
        item: item.item,
      }));

    return {
      mentors: toClient('mentor'),
      roadmaps: toClient('roadmap'),
      sessions: toClient('session'),
      forum: toClient('forum'),
    };
  },

  starterJourney(profile: any) {
    const stage = profile.careerStage?.replace(/_/g, ' ') || 'career learner';
    const commitment = profile.weeklyCommitment?.replace(/_/g, ' ') || 'your available time';
    return [
      { title: 'Clarify direction', description: `Use your ${stage} context to choose one primary path for the next month.` },
      { title: 'Pick a realistic path', description: `Start with a roadmap that fits ${commitment} and your budget preference.` },
      { title: 'Add human guidance', description: 'Book or follow a mentor who understands your domain and goal.' },
    ];
  },

  async recordInteraction(userId: string, input: RecommendationInteractionInput) {
    const interaction = await recommendationRepository.createInteraction({
      ...input,
      userId: new mongoose.Types.ObjectId(userId),
      targetId: new mongoose.Types.ObjectId(input.targetId),
    });

    await this.buildProfile(userId);
    return interaction;
  },

  async analytics() {
    return await recommendationRepository.analytics();
  },
};
