import { PingRequest, IPingRequest, PingStatus } from './ping.model';

export const pingRepository = {
  async createPing(data: Partial<IPingRequest>): Promise<IPingRequest> {
    const ping = new PingRequest(data);
    return await ping.save();
  },

  async getPingById(id: string): Promise<IPingRequest | null> {
    return await PingRequest.findById(id).populate('fromUserId toUserId', 'name role respectPoints');
  },

  async getPingsSentByUser(userId: string): Promise<IPingRequest[]> {
    return await PingRequest.find({ fromUserId: userId })
      .populate('toUserId', 'name role')
      .sort({ createdAt: -1 });
  },

  async getPingsReceivedByUser(userId: string): Promise<IPingRequest[]> {
    return await PingRequest.find({ toUserId: userId })
      .populate('fromUserId', 'name role respectPoints')
      .sort({ createdAt: -1 });
  },

  async updatePing(id: string, updateData: Partial<IPingRequest>): Promise<IPingRequest | null> {
    return await PingRequest.findByIdAndUpdate(id, updateData, { new: true });
  },

  async autoExpireStalePings(): Promise<void> {
    await PingRequest.updateMany(
      { status: PingStatus.PENDING, expiresAt: { $lt: new Date() } },
      { $set: { status: PingStatus.EXPIRED } }
    );
  },
};
