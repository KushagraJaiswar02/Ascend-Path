import { Endorsement, IEndorsement } from './endorsement.model';

export const endorsementRepository = {
  async createEndorsement(data: Partial<IEndorsement>): Promise<IEndorsement> {
    const endorsement = new Endorsement(data);
    return await endorsement.save();
  },

  async findEndorsementsByRecipient(recipientId: string): Promise<IEndorsement[]> {
    return await Endorsement.find({ recipientId, moderationStatus: 'approved' })
      .populate('endorserId', 'name avatar headline role')
      .sort({ createdAt: -1 })
      .lean() as IEndorsement[];
  },

  async findEndorsementsByEndorser(endorserId: string): Promise<IEndorsement[]> {
    return await Endorsement.find({ endorserId })
      .populate('recipientId', 'name avatar headline')
      .sort({ createdAt: -1 })
      .lean() as IEndorsement[];
  },

  async findEndorsementById(id: string): Promise<IEndorsement | null> {
    return await Endorsement.findById(id)
      .populate('endorserId', 'name avatar headline role')
      .populate('recipientId', 'name avatar headline')
      .lean() as IEndorsement | null;
  },

  async updateModerationStatus(
    id: string,
    status: 'approved' | 'flagged' | 'hidden'
  ): Promise<IEndorsement | null> {
    return await Endorsement.findByIdAndUpdate(
      id,
      { moderationStatus: status },
      { new: true }
    ).lean() as IEndorsement | null;
  },

  async deleteEndorsement(id: string): Promise<void> {
    await Endorsement.findByIdAndDelete(id);
  },

  async existsEndorsement(endorserId: string, recipientId: string): Promise<boolean> {
    const doc = await Endorsement.findOne({ endorserId, recipientId }).lean();
    return !!doc;
  },
};
