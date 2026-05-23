export type MentorApplicationStatus = 'pending' | 'under_review' | 'approved' | 'rejected' | 'changes_requested';

export interface MentorApplicationUpload {
  url: string;
  provider: 'cloudinary' | 's3' | 'external';
  publicId?: string;
  mimeType?: string;
  sizeBytes?: number;
  originalName?: string;
}

export interface MentorApplicationPayload {
  bio: string;
  domains: string[];
  skills: string[];
  experienceYears: number;
  currentRole?: string;
  company?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  resumeUrl?: string;
  uploads?: {
    resume?: MentorApplicationUpload;
    certifications: MentorApplicationUpload[];
    portfolioAssets: MentorApplicationUpload[];
  };
  motivation: string;
  expertiseSummary: string;
  availability: {
    text: string;
    hoursPerWeek?: number;
    timezone?: string;
    schedule: { day: string; slots: string[] }[];
  };
}

export interface MentorApplication extends MentorApplicationPayload {
  _id: string;
  userId: string | {
    _id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
    respectPoints?: number;
    fameScore?: number;
    isVerified?: boolean;
  };
  status: MentorApplicationStatus;
  rejectionReason?: string;
  changeRequest?: string;
  internalNotes?: string;
  reviewedBy?: { _id: string; name: string; email: string; role: string };
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}
