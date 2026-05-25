import crypto from 'crypto';
import mongoose from 'mongoose';
import { env } from '../../config/env';
import { eventEmitter } from '../../utils/eventEmitter';
import { reportRepository } from '../moderation/report.repository';
import { AuditAction, AuditSeverity } from '../moderation/auditLog.model';
import { Role } from '../users/user.model';
import { userRepository } from '../users/user.repository';
import { guideCapabilities } from '../users/userCapabilities';
import { taxonomyService } from '../taxonomy/taxonomy.service';
import { mentorApplicationRepository } from './mentorApplication.repository';
import { MentorApplicationStatus } from './mentorApplication.model';
import {
  CreateMentorApplicationInput,
  ListMentorApplicationsInput,
  ReviewMentorApplicationInput,
  UpdateMentorApplicationInput,
  UploadIntentInput,
} from './mentorApplication.validation';

const terminalStatuses = new Set<MentorApplicationStatus>([
  MentorApplicationStatus.APPROVED,
]);

const editableStatuses = new Set<MentorApplicationStatus>([
  MentorApplicationStatus.PENDING,
  MentorApplicationStatus.CHANGES_REQUESTED,
  MentorApplicationStatus.REJECTED,
]);

const allowedTransitions: Record<MentorApplicationStatus, MentorApplicationStatus[]> = {
  [MentorApplicationStatus.PENDING]: [
    MentorApplicationStatus.UNDER_REVIEW,
    MentorApplicationStatus.APPROVED,
    MentorApplicationStatus.REJECTED,
    MentorApplicationStatus.CHANGES_REQUESTED,
  ],
  [MentorApplicationStatus.UNDER_REVIEW]: [
    MentorApplicationStatus.APPROVED,
    MentorApplicationStatus.REJECTED,
    MentorApplicationStatus.CHANGES_REQUESTED,
  ],
  [MentorApplicationStatus.CHANGES_REQUESTED]: [
    MentorApplicationStatus.UNDER_REVIEW,
    MentorApplicationStatus.APPROVED,
    MentorApplicationStatus.REJECTED,
  ],
  [MentorApplicationStatus.REJECTED]: [
    MentorApplicationStatus.UNDER_REVIEW,
    MentorApplicationStatus.APPROVED,
  ],
  [MentorApplicationStatus.APPROVED]: [],
};

const statusAuditAction: Record<MentorApplicationStatus, AuditAction> = {
  [MentorApplicationStatus.PENDING]: AuditAction.MENTOR_APPLICATION_REVIEWED,
  [MentorApplicationStatus.UNDER_REVIEW]: AuditAction.MENTOR_APPLICATION_REVIEWED,
  [MentorApplicationStatus.APPROVED]: AuditAction.MENTOR_APPLICATION_APPROVED,
  [MentorApplicationStatus.REJECTED]: AuditAction.MENTOR_APPLICATION_REJECTED,
  [MentorApplicationStatus.CHANGES_REQUESTED]: AuditAction.MENTOR_APPLICATION_CHANGES_REQUESTED,
};

const blankToUndefined = <T extends Record<string, any>>(data: T) => {
  const next: Record<string, any> = { ...data };
  for (const key of Object.keys(next)) {
    if (next[key] === '') next[key] = undefined;
  }
  return next as T;
};

export const mentorApplicationService = {
  async create(userId: string, data: CreateMentorApplicationInput) {
    const user = await userRepository.findUserById(userId);
    if (!user) throw { statusCode: 404, message: 'User not found' };
    if (user.isBanned) throw { statusCode: 403, message: 'Banned users cannot apply to mentor' };

    const latest = await mentorApplicationRepository.findLatestByUserId(userId);
    if (latest && terminalStatuses.has(latest.status)) {
      throw { statusCode: 409, message: 'Your mentor profile is already approved' };
    }
    if (latest && [MentorApplicationStatus.PENDING, MentorApplicationStatus.UNDER_REVIEW].includes(latest.status)) {
      throw { statusCode: 409, message: 'You already have an active mentor application under review' };
    }

    const careerDomains = data.careerDomains?.length
      ? await taxonomyService.assertActiveDomains(data.careerDomains)
      : await taxonomyService.assertActiveDomains(await taxonomyService.normalizeDomainIds(data.domains));
    const mentorshipFocus = data.mentorshipFocus?.length
      ? await taxonomyService.assertActiveGoals(data.mentorshipFocus)
      : [];

    const application = await mentorApplicationRepository.create({
      ...blankToUndefined(data),
      careerDomains: careerDomains as any,
      mentorshipFocus: mentorshipFocus as any,
      userId: new mongoose.Types.ObjectId(userId) as any,
      status: MentorApplicationStatus.PENDING,
      rejectionReason: undefined,
      changeRequest: undefined,
      reviewedBy: undefined,
      reviewedAt: undefined,
    });

    await userRepository.updateUser(userId, { mentorProfileStatus: MentorApplicationStatus.PENDING });

    await reportRepository.createAuditLog({
      actorId: userId,
      action: AuditAction.MENTOR_APPLICATION_SUBMITTED,
      targetId: application._id.toString(),
      targetType: 'mentor_application',
      details: 'Submitted mentor application',
      metadata: { userId, domains: data.domains, skills: data.skills },
    });

    eventEmitter.emit('MENTOR_APPLICATION_SUBMITTED', {
      applicationId: application._id.toString(),
      userId,
      userName: user.name,
    });

    return application;
  },

  async getMine(userId: string) {
    return await mentorApplicationRepository.findLatestByUserId(userId);
  },

  async updateMine(userId: string, data: UpdateMentorApplicationInput) {
    const latest = await mentorApplicationRepository.findLatestByUserId(userId);
    if (!latest) throw { statusCode: 404, message: 'No mentor application found' };
    if (!editableStatuses.has(latest.status)) {
      throw { statusCode: 409, message: 'This application cannot be edited while it is under active review or approved' };
    }

    const nextStatus = latest.status === MentorApplicationStatus.CHANGES_REQUESTED || latest.status === MentorApplicationStatus.REJECTED
      ? MentorApplicationStatus.PENDING
      : latest.status;

    const updateData: any = { ...blankToUndefined(data) };
    if (data.careerDomains) {
      updateData.careerDomains = await taxonomyService.assertActiveDomains(data.careerDomains);
    } else if (data.domains) {
      updateData.careerDomains = await taxonomyService.assertActiveDomains(await taxonomyService.normalizeDomainIds(data.domains));
    }
    if (data.mentorshipFocus) {
      updateData.mentorshipFocus = await taxonomyService.assertActiveGoals(data.mentorshipFocus);
    }

    const updated = await mentorApplicationRepository.updateById(latest._id.toString(), {
      ...updateData,
      status: nextStatus,
      rejectionReason: undefined,
      changeRequest: undefined,
      reviewedBy: undefined,
      reviewedAt: undefined,
    });

    await userRepository.updateUser(userId, { mentorProfileStatus: nextStatus });
    return updated;
  },

  async listForAdmin(query: ListMentorApplicationsInput) {
    return await mentorApplicationRepository.list({ status: query.status, search: query.search }, query.page, query.limit);
  },

  async getForAdmin(applicationId: string) {
    const application = await mentorApplicationRepository.findById(applicationId);
    if (!application) throw { statusCode: 404, message: 'Mentor application not found' };
    return application;
  },

  async updateStatus(applicationId: string, reviewerId: string, data: ReviewMentorApplicationInput) {
    const application = await mentorApplicationRepository.findById(applicationId);
    if (!application) throw { statusCode: 404, message: 'Mentor application not found' };

    const currentStatus = application.status;
    if (!allowedTransitions[currentStatus].includes(data.status)) {
      throw { statusCode: 409, message: `Cannot transition mentor application from ${currentStatus} to ${data.status}` };
    }
    if (data.status === MentorApplicationStatus.REJECTED && !data.rejectionReason?.trim()) {
      throw { statusCode: 400, message: 'A rejection reason is required' };
    }
    if (data.status === MentorApplicationStatus.CHANGES_REQUESTED && !data.changeRequest?.trim()) {
      throw { statusCode: 400, message: 'A change request message is required' };
    }

    const updated = await mentorApplicationRepository.updateById(applicationId, {
      status: data.status,
      rejectionReason: data.status === MentorApplicationStatus.REJECTED ? data.rejectionReason : undefined,
      changeRequest: data.status === MentorApplicationStatus.CHANGES_REQUESTED ? data.changeRequest : undefined,
      internalNotes: data.internalNotes,
      reviewedBy: new mongoose.Types.ObjectId(reviewerId) as any,
      reviewedAt: new Date(),
    });
    if (!updated) throw { statusCode: 500, message: 'Failed to update application status' };

    const applicantId = updated.userId.toString();
    await userRepository.updateUser(applicantId, { mentorProfileStatus: data.status });

    if (data.status === MentorApplicationStatus.APPROVED) {
      await this.approveApplicant(applicantId, updated);
      eventEmitter.emit('MENTOR_APPLICATION_APPROVED', {
        applicationId,
        userId: applicantId,
        reviewerId,
      });
    } else if (data.status === MentorApplicationStatus.REJECTED) {
      eventEmitter.emit('MENTOR_APPLICATION_REJECTED', {
        applicationId,
        userId: applicantId,
        reviewerId,
        reason: data.rejectionReason,
      });
    } else if (data.status === MentorApplicationStatus.CHANGES_REQUESTED) {
      eventEmitter.emit('MENTOR_APPLICATION_CHANGES_REQUESTED', {
        applicationId,
        userId: applicantId,
        reviewerId,
        changeRequest: data.changeRequest,
      });
    }

    await reportRepository.createAuditLog({
      actorId: reviewerId,
      action: statusAuditAction[data.status],
      targetId: applicationId,
      targetType: 'mentor_application',
      details: `Mentor application transitioned from ${currentStatus} to ${data.status}`,
      metadata: {
        previousStatus: currentStatus,
        nextStatus: data.status,
        applicantId,
        internalNotes: data.internalNotes,
      },
      severity: data.status === MentorApplicationStatus.APPROVED ? AuditSeverity.WARNING : AuditSeverity.INFO,
    });

    return await mentorApplicationRepository.findById(applicationId);
  },

  async approveApplicant(userId: string, application: any) {
    const user = await userRepository.findUserById(userId);
    if (!user) throw { statusCode: 404, message: 'Applicant not found' };

    const roles = Array.from(new Set([...(user.roles || [user.role]), Role.USER, Role.GUIDE]));
    const capabilities = Array.from(new Set([...(user.capabilities || []), ...guideCapabilities]));
    const role = user.role === Role.USER || user.role === Role.EXPLORER || user.role === Role.PATHFINDER
      ? Role.GUIDE
      : user.role;

    await userRepository.updateUser(userId, {
      role,
      roles,
      capabilities,
      isVerified: true,
      bio: application.bio,
      domains: application.domains,
      careerDomains: application.careerDomains || [],
      preferredLanguages: application.languages || [],
      skills: application.skills.map((skill: string) => ({ name: skill })),
      mentorProfile: {
        specializations: application.specializations || [],
        industries: application.industries || [],
        languages: application.languages || [],
        experienceYears: application.experienceYears,
        educationBackground: application.educationBackground,
        certifications: application.certifications || [],
        mentorshipFocus: application.mentorshipFocus || [],
        examExpertise: application.examExpertise || [],
      },
      socialLinks: {
        ...user.socialLinks,
        github: application.githubUrl || user.socialLinks?.github,
        linkedin: application.linkedinUrl || user.socialLinks?.linkedin,
        website: application.portfolioUrl || user.socialLinks?.website,
      },
      availability: application.availability,
      profileVisibility: true,
      mentorProfileStatus: MentorApplicationStatus.APPROVED,
    });
  },

  async createUploadIntent(userId: string, input: UploadIntentInput) {
    const folder = `mentor-applications/${userId}/${input.assetType}`;
    const maxSizeByAsset = {
      resume: 5 * 1024 * 1024,
      certification: 10 * 1024 * 1024,
      portfolio_asset: 10 * 1024 * 1024,
    };

    if (input.sizeBytes > maxSizeByAsset[input.assetType]) {
      throw { statusCode: 400, message: 'File exceeds the upload limit for this asset type' };
    }

    if (env.CLOUDINARY_API_SECRET && env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY) {
      const timestamp = Math.round(Date.now() / 1000);
      const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;
      const signature = crypto
        .createHash('sha1')
        .update(paramsToSign + env.CLOUDINARY_API_SECRET)
        .digest('hex');

      return {
        provider: 'cloudinary',
        uploadUrl: `https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/auto/upload`,
        fields: {
          api_key: env.CLOUDINARY_API_KEY,
          folder,
          timestamp,
          signature,
        },
        constraints: {
          mimeType: input.mimeType,
          maxSizeBytes: maxSizeByAsset[input.assetType],
        },
      };
    }

    return {
      provider: 's3-compatible',
      uploadUrl: null,
      fields: {},
      constraints: {
        mimeType: input.mimeType,
        maxSizeBytes: maxSizeByAsset[input.assetType],
      },
      message: 'Configure Cloudinary or S3 credentials to enable direct signed uploads.',
    };
  },
};
