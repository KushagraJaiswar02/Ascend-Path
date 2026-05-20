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
    return await Session.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
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
};
