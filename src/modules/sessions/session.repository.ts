import { Session, ISession, SessionStatus } from './session.model';

export const sessionRepository = {
  async createSession(data: Partial<ISession>): Promise<ISession> {
    const session = new Session(data);
    return await session.save();
  },

  async getSessionById(id: string): Promise<ISession | null> {
    return await Session.findById(id).populate('guideId clientId', 'name role respectPoints');
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
    
    const sessions = await Session.find({ status: SessionStatus.OPEN, scheduledAt: { $gt: new Date() } })
      .populate('guideId', 'name role respectPoints bio')
      .skip(skip)
      .limit(limit)
      .sort({ scheduledAt: 1 });
      
    const total = await Session.countDocuments({ status: SessionStatus.OPEN, scheduledAt: { $gt: new Date() } });
    
    return {
      sessions,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalSessions: total,
    };
  },

  async getUserSessions(userId: string, page: number, limit: number): Promise<any> {
    const skip = (page - 1) * limit;
    
    const sessions = await Session.find({ $or: [{ guideId: userId }, { clientId: userId }] })
      .populate('guideId clientId', 'name role respectPoints')
      .skip(skip)
      .limit(limit)
      .sort({ scheduledAt: 1 });
      
    const total = await Session.countDocuments({ $or: [{ guideId: userId }, { clientId: userId }] });
    
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
};
