import { MentorApplication, MentorApplicationStatus, IMentorApplication } from './mentorApplication.model';
import { User } from '../users/user.model';

export const mentorApplicationRepository = {
  async create(data: Partial<IMentorApplication>) {
    return await new MentorApplication(data).save();
  },

  async findLatestByUserId(userId: string) {
    return await MentorApplication.findOne({ userId }).sort({ createdAt: -1 });
  },

  async findById(id: string) {
    return await MentorApplication.findById(id)
      .populate('userId', 'name email role roles capabilities avatar respectPoints fameScore isVerified')
      .populate('reviewedBy', 'name email role avatar');
  },

  async updateById(id: string, data: Partial<IMentorApplication>) {
    return await MentorApplication.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  },

  async updateLatestForUser(userId: string, data: Partial<IMentorApplication>) {
    const latest = await this.findLatestByUserId(userId);
    if (!latest) return null;
    return await MentorApplication.findByIdAndUpdate(latest._id, data, { new: true, runValidators: true });
  },

  async list(filters: { status?: MentorApplicationStatus; search?: string }, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const query: any = {};
    if (filters.status) query.status = filters.status;

    if (filters.search) {
      const matchingUsers = await User.find({
        $or: [
          { name: { $regex: filters.search, $options: 'i' } },
          { email: { $regex: filters.search, $options: 'i' } },
        ],
      }).select('_id');

      const userIds = matchingUsers.map((user) => user._id);
      query.$or = [
        { userId: { $in: userIds } },
        { domains: { $regex: filters.search, $options: 'i' } },
        { skills: { $regex: filters.search, $options: 'i' } },
        { currentRole: { $regex: filters.search, $options: 'i' } },
        { company: { $regex: filters.search, $options: 'i' } },
      ];
    }

    const [applications, total] = await Promise.all([
      MentorApplication.find(query)
        .populate('userId', 'name email role roles avatar respectPoints fameScore isVerified mentorProfileStatus')
        .populate('reviewedBy', 'name email role avatar')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit),
      MentorApplication.countDocuments(query),
    ]);

    return {
      applications,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalApplications: total,
    };
  },
};
