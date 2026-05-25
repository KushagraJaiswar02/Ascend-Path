import mongoose from 'mongoose';
import { Session, ISession, SessionStatus, SessionType } from './session.model';

export const sessionRepository = {
  async createSession(data: Partial<ISession>): Promise<ISession> {
    const session = new Session(data);
    return await session.save();
  },

  async getSessionById(id: string): Promise<ISession | null> {
    return await Session.findById(id)
      .populate('guideId clientId attendees.userId waitlist.userId', 'name role respectPoints avatar');
  },

  async updateSession(id: string, updateData: Partial<ISession>): Promise<ISession | null> {
    return await Session.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
      .populate('guideId clientId', 'name role respectPoints avatar');
  },

  async deleteSession(id: string): Promise<void> {
    await Session.findByIdAndDelete(id);
  },

  async getOpenSessions(page: number, limit: number): Promise<any> {
    const skip = (page - 1) * limit;
    
    const query = { sessionType: SessionType.PRIVATE_MENTORSHIP, status: SessionStatus.OPEN, scheduledAt: { $gt: new Date() } };

    const sessions = await Session.find(query)
      .populate('guideId', 'name role respectPoints bio')
      .skip(skip)
      .limit(limit)
      .sort({ scheduledAt: 1 });
      
    const total = await Session.countDocuments(query);
    
    return {
      sessions,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalSessions: total,
    };
  },

  async getUserSessions(userId: string, page: number, limit: number): Promise<any> {
    const skip = (page - 1) * limit;
    
    const query = { $or: [{ guideId: userId }, { clientId: userId }, { 'attendees.userId': userId }] };

    const sessions = await Session.find(query)
      .populate('guideId clientId attendees.userId', 'name role respectPoints avatar')
      .skip(skip)
      .limit(limit)
      .sort({ scheduledAt: 1 });
      
    const total = await Session.countDocuments(query);
    
    return {
      sessions,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalSessions: total,
    };
  },

  async getSessionExecutionAnalytics(): Promise<any> {
    const [totals] = await Session.aggregate([
      {
        $group: {
          _id: null,
          totalSessions: { $sum: 1 },
          completedSessions: {
            $sum: { $cond: [{ $eq: ['$attendanceStatus', 'completed'] }, 1, 0] },
          },
          missedSessions: {
            $sum: { $cond: [{ $eq: ['$attendanceStatus', 'missed'] }, 1, 0] },
          },
          reflectionsUnlocked: {
            $sum: { $cond: [{ $eq: ['$sessionExecutionState', 'reflection_unlocked'] }, 1, 0] },
          },
          averageDurationMinutes: { $avg: '$actualDurationMinutes' },
          mentorJoinCount: {
            $sum: { $cond: [{ $ifNull: ['$mentorJoinedAt', false] }, 1, 0] },
          },
          menteeJoinCount: {
            $sum: { $cond: [{ $ifNull: ['$menteeJoinedAt', false] }, 1, 0] },
          },
        },
      },
    ]);

    const total = totals?.totalSessions || 0;
    return {
      totalSessions: total,
      completedSessions: totals?.completedSessions || 0,
      missedSessions: totals?.missedSessions || 0,
      attendanceRate: total ? Math.round(((totals?.completedSessions || 0) / total) * 100) : 0,
      noShowRate: total ? Math.round(((totals?.missedSessions || 0) / total) * 100) : 0,
      averageDurationMinutes: Math.round(totals?.averageDurationMinutes || 0),
      mentorResponsivenessRate: total ? Math.round(((totals?.mentorJoinCount || 0) / total) * 100) : 0,
      menteeAttendanceRate: total ? Math.round(((totals?.menteeJoinCount || 0) / total) * 100) : 0,
      reflectionUnlockRate: total ? Math.round(((totals?.reflectionsUnlocked || 0) / total) * 100) : 0,
    };
  },

  async getPublicWorkshops(
    filters: { domain?: string; difficulty?: string; guideId?: string },
    page: number,
    limit: number
  ): Promise<any> {
    const skip = (page - 1) * limit;
    const query: any = {
      sessionType: SessionType.PUBLIC_WORKSHOP,
      isPublic: true,
      status: { $in: [SessionStatus.SCHEDULED, SessionStatus.REGISTRATION_OPEN, SessionStatus.LIVE] },
      scheduledAt: { $gt: new Date(Date.now() - 2 * 60 * 60 * 1000) },
    };

    if (filters.domain) {
      query.$or = mongoose.Types.ObjectId.isValid(filters.domain)
        ? [
            { careerDomains: new mongoose.Types.ObjectId(filters.domain) },
            { domains: { $regex: new RegExp(filters.domain, 'i') } },
          ]
        : [{ domains: { $regex: new RegExp(filters.domain, 'i') } }];
    }
    if (filters.difficulty) query.difficulty = filters.difficulty;
    if (filters.guideId) query.guideId = filters.guideId;

    const [sessions, total] = await Promise.all([
      Session.find(query)
        .populate('guideId', 'name role respectPoints bio avatar')
        .skip(skip)
        .limit(limit)
        .sort({ status: -1, attendeeCount: -1, scheduledAt: 1 }),
      Session.countDocuments(query),
    ]);

    return {
      sessions,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalSessions: total,
    };
  },
};
