import mongoose from 'mongoose';
import { opportunityRepository } from './opportunity.repository';
import { IOpportunity } from './opportunity.model';
import { IApplication, ApplicationStatus } from './application.model';
import { User } from '../users/user.model';
import { UserProgress } from '../roadmaps/userProgress.model';
import { careerCompanionService } from '../companion/careerCompanion.service';
import { notificationService } from '../notifications/notification.service';
import { NotificationType } from '../notifications/notification.model';
import { slugify } from '../taxonomy/taxonomy.utils';
import { PortfolioProject } from '../portfolio/portfolioProject.model';
import { Endorsement } from '../endorsements/endorsement.model';

export const opportunityService = {
  async createOpportunity(data: any, creatorId: string, isAdmin = false): Promise<IOpportunity> {
    const slug = `${slugify(data.title)}-${Date.now().toString().slice(-4)}`;
    return await opportunityRepository.createOpportunity({
      ...data,
      slug,
      creatorId: new mongoose.Types.ObjectId(creatorId),
      verificationStatus: isAdmin ? 'approved' : 'pending',
    });
  },

  async verifyOpportunity(id: string, verificationStatus: 'approved' | 'rejected', isFeatured?: boolean): Promise<IOpportunity> {
    const update: any = { verificationStatus };
    if (isFeatured !== undefined) {
      update.isFeatured = isFeatured;
    }
    const opp = await opportunityRepository.updateOpportunity(id, update);
    if (!opp) throw { statusCode: 404, message: 'Opportunity not found' };
    return opp;
  },

  async listOpportunities(
    userId: string,
    filters: {
      q?: string;
      opportunityType?: string;
      difficulty?: string;
      remoteStatus?: string;
      domainId?: string;
      goalId?: string;
      featured?: boolean;
      sortByReady?: boolean;
      page: number;
      limit: number;
    }
  ) {
    const skip = (filters.page - 1) * filters.limit;
    
    // Default queries only return approved/verified opportunities
    const repoFilters: any = {
      q: filters.q,
      opportunityType: filters.opportunityType,
      difficulty: filters.difficulty,
      remoteStatus: filters.remoteStatus,
      isFeatured: filters.featured,
      verificationStatus: 'approved',
      skip,
      limit: filters.limit,
    };

    if (filters.domainId) repoFilters.careerDomains = [filters.domainId];
    if (filters.goalId) repoFilters.careerGoals = [filters.goalId];

    const { opportunities, total } = await opportunityRepository.listOpportunities(repoFilters);

    // Compute readiness score for each opportunity
    const computedOpportunities = await Promise.all(
      opportunities.map(async (opp) => {
        const readiness = await this.computeReadiness(userId, opp);
        return {
          ...opp.toObject(),
          readinessScore: readiness.score,
          readinessGaps: readiness.gaps,
        };
      })
    );

    // Sort by readiness score descending if requested
    if (filters.sortByReady) {
      computedOpportunities.sort((a, b) => b.readinessScore - a.readinessScore);
    }

    return {
      opportunities: computedOpportunities,
      total,
      page: filters.page,
      limit: filters.limit,
    };
  },

  async getOpportunity(userId: string, id: string) {
    const opp = await opportunityRepository.findOpportunityById(id);
    if (!opp) throw { statusCode: 404, message: 'Opportunity not found' };
    
    const readiness = await this.computeReadiness(userId, opp);
    const existingApplication = await opportunityRepository.findApplicationByUserAndOpportunity(userId, id);

    return {
      opportunity: opp,
      readinessScore: readiness.score,
      readinessGaps: readiness.gaps,
      application: existingApplication,
    };
  },

  // Calculate Readiness Score & Identify Gaps
  async computeReadiness(userId: string, opp: IOpportunity): Promise<{ score: number; gaps: string[] }> {
    const [user, progress, companionProfile, app, endorsements] = await Promise.all([
      User.findById(userId),
      UserProgress.find({ userId: new mongoose.Types.ObjectId(userId) }),
      careerCompanionService.getOrBuildProfile(userId).catch(() => null),
      opportunityRepository.findApplicationByUserAndOpportunity(userId, opp._id.toString()).catch(() => null),
      Endorsement.find({
        recipientId: new mongoose.Types.ObjectId(userId),
        type: 'skill',
        moderationStatus: 'approved',
      }).lean().catch(() => []),
    ]);

    if (!user) return { score: 0, gaps: ['User profile not found.'] };

    const gaps: string[] = [];

    // 1. Recommended Roadmaps (40% Weight)
    let roadmapScore = 100;
    if (opp.recommendedRoadmaps && opp.recommendedRoadmaps.length > 0) {
      let totalProgress = 0;
      opp.recommendedRoadmaps.forEach((recRmId) => {
        const userProgress = progress.find((p) => p.roadmapId.toString() === recRmId.toString());
        const percent = userProgress ? userProgress.progressPercentage : 0;
        totalProgress += percent;

        if (percent < 100) {
          gaps.push(`Incomplete Roadmap: Progress is ${percent}% (Needs 100% completion)`);
        }
      });
      roadmapScore = totalProgress / opp.recommendedRoadmaps.length;
    }

    // 2. Required Skills (30% Weight)
    // Build set of verified skills from endorsements and linked mentor-verified projects
    const userSkills = new Set((user.skills || []).map((s) => s.name.toLowerCase().trim()));
    const endorsedSkills = new Set(endorsements.map((e) => e.skillName?.toLowerCase().trim()).filter(Boolean));
    const linkedVerifiedTechs = new Set<string>();

    if (app && app.connectedProjects && app.connectedProjects.length > 0) {
      app.connectedProjects.forEach((proj: any) => {
        if (proj.isMentorReviewed) {
          proj.technologies?.forEach((tech: string) => {
            linkedVerifiedTechs.add(tech.toLowerCase().trim());
          });
        }
      });
    }

    let skillsScore = 100;
    if (opp.requiredSkills && opp.requiredSkills.length > 0) {
      let matchedCount = 0;
      opp.requiredSkills.forEach((skill) => {
        const skillLower = skill.toLowerCase().trim();
        if (userSkills.has(skillLower) || endorsedSkills.has(skillLower) || linkedVerifiedTechs.has(skillLower)) {
          matchedCount++;
        } else {
          gaps.push(`Missing Skill: "${skill}"`);
        }
      });
      skillsScore = (matchedCount / opp.requiredSkills.length) * 100;
    }

    // 3. Confidence level (10% Weight)
    let confidenceScore = 60; // default (3 out of 5)
    if (companionProfile?.confidenceTrend?.current) {
      confidenceScore = (companionProfile.confidenceTrend.current / 5) * 100;
      if (companionProfile.confidenceTrend.current < 3) {
        gaps.push(`Low Confidence Signal: Reflect and review path concepts`);
      }
    }

    // 4. Learning Momentum (10% Weight)
    let momentumScore = 50; // default
    if (companionProfile?.momentum?.score !== undefined) {
      momentumScore = companionProfile.momentum.score;
      if (companionProfile.momentum.score < 30) {
        gaps.push(`Stalled Momentum: Resume daily roadmap activity to build consistency`);
      }
    }

    // 5. Mentorship Prep (10% Weight)
    const sessionsCompleted = user.totalSessions || 0;
    const mentorshipScore = sessionsCompleted >= 2 ? 100 : sessionsCompleted === 1 ? 50 : 0;
    if (sessionsCompleted < 2) {
      gaps.push(`Insufficient Activity: Book placement preparation or resume review session with a mentor`);
    }

    let finalScore = Math.round(
      roadmapScore * 0.4 +
      skillsScore * 0.3 +
      confidenceScore * 0.1 +
      momentumScore * 0.1 +
      mentorshipScore * 0.1
    );

    // Credibility Boost: +5 for each linked, mentor-reviewed project (max +15)
    let boost = 0;
    if (app && app.connectedProjects && app.connectedProjects.length > 0) {
      app.connectedProjects.forEach((proj: any) => {
        if (proj.isMentorReviewed) {
          boost += 5;
        }
      });
    }

    // Fallback: if no app is created yet but user has verified projects in general, give a flat +5 boost
    if (boost === 0) {
      const generalVerifiedCount = await PortfolioProject.countDocuments({
        userId: new mongoose.Types.ObjectId(userId),
        isMentorReviewed: true,
      });
      if (generalVerifiedCount > 0) {
        boost = 5;
      }
    }

    finalScore = Math.min(finalScore + Math.min(boost, 15), 100);

    return {
      score: Math.min(100, Math.max(0, finalScore)),
      gaps,
    };
  },

  // Applications logic
  async getMyApplicationsBoard(userId: string) {
    const list = await opportunityRepository.listApplicationsForUser(userId);
    return list;
  },

  async applyToOpportunity(userId: string, opportunityId: string): Promise<IApplication> {
    const opp = await opportunityRepository.findOpportunityById(opportunityId);
    if (!opp) throw { statusCode: 404, message: 'Opportunity not found' };

    const existing = await opportunityRepository.findApplicationByUserAndOpportunity(userId, opportunityId);
    if (existing) throw { statusCode: 400, message: 'Already applied to this opportunity' };

    const application = await opportunityRepository.createApplication({
      userId: new mongoose.Types.ObjectId(userId),
      opportunityId: new mongoose.Types.ObjectId(opportunityId),
      status: 'applied',
    });

    // Record Career Companion Timeline Event
    await careerCompanionService.recordTimelineEvent(userId, {
      type: 'application_submitted',
      title: `Applied to ${opp.title}`,
      summary: `Submitted application to ${opp.organizationName}.`,
      entityId: application._id.toString(),
      entityType: 'Application',
      visibility: 'mentor_summary',
    }).catch(() => null);

    // Contextual Notification
    await notificationService.createNotification({
      recipientId: userId,
      type: NotificationType.SESSION_REFLECTION_SUBMITTED, // Fallback notification type or we can map contextually
      title: 'Application Tracked',
      message: `You successfully logged your application for "${opp.title}" at ${opp.organizationName}.`,
      entityId: application._id.toString(),
      entityType: 'Application',
    }).catch(() => null);

    return application;
  },

  async updateApplication(userId: string, appId: string, updateData: any): Promise<IApplication> {
    const application = await opportunityRepository.findApplicationById(appId);
    if (!application) throw { statusCode: 404, message: 'Application tracker not found' };

    if (application.userId.toString() !== userId) {
      throw { statusCode: 403, message: 'Unauthorized to modify this application tracker' };
    }

    const previousStatus = application.status;
    const updated = await opportunityRepository.updateApplication(appId, updateData);
    if (!updated) throw { statusCode: 404, message: 'Update failed' };

    // If status has changed, log timeline milestones and trigger notification alerts
    if (updateData.status && updateData.status !== previousStatus) {
      const opp = updated.opportunityId as any;
      const statusTimelineMap: Record<string, string> = {
        shortlisted: 'application_shortlisted',
        interviewing: 'application_interviewing',
        rejected: 'application_rejected',
        accepted: 'application_accepted',
        archived: 'application_archived',
      };

      const eventType = statusTimelineMap[updateData.status] || 'application_submitted';

      await careerCompanionService.recordTimelineEvent(userId, {
        type: eventType,
        title: `Application ${updateData.status.toUpperCase()}`,
        summary: `Status updated for ${opp?.title || 'opportunity'} application.`,
        entityId: updated._id.toString(),
        entityType: 'Application',
        visibility: 'mentor_summary',
      }).catch(() => null);

      // Contextual notification
      let message = `Your application status for "${opp?.title}" was updated to ${updateData.status.toUpperCase()}.`;
      if (updateData.status === 'interviewing') {
        message = `Congratulations! You are interviewing for "${opp?.title}". Practice with a mentor recommended.`;
      } else if (updateData.status === 'accepted') {
        message = `🎉 Milestone unlocked! You were accepted for "${opp?.title}"!`;
      }

      await notificationService.createNotification({
        recipientId: userId,
        type: NotificationType.SESSION_ACCEPTED,
        title: `Application Status: ${updateData.status}`,
        message,
        entityId: updated._id.toString(),
        entityType: 'Application',
      }).catch(() => null);
    }

    return updated;
  },

  async addReminder(userId: string, appId: string, reminderDate: Date, note: string): Promise<IApplication> {
    const application = await opportunityRepository.findApplicationById(appId);
    if (!application) throw { statusCode: 404, message: 'Application not found' };
    if (application.userId.toString() !== userId) throw { statusCode: 403, message: 'Unauthorized' };

    const reminders = [...(application.reminders || []), { date: reminderDate, note, sent: false }];
    const updated = await opportunityRepository.updateApplication(appId, { reminders });
    if (!updated) throw { statusCode: 404, message: 'Update failed' };
    return updated;
  },
};
