import { User, IUser, Role } from './user.model';

export const userRepository = {
  async createUser(userData: Partial<IUser>): Promise<IUser> {
    const user = new User(userData);
    return await user.save();
  },

  async findUserByEmail(email: string): Promise<IUser | null> {
    return await User.findOne({ email });
  },

  async findUserById(id: string): Promise<IUser | null> {
    return await User.findById(id);
  },

  async updateUser(id: string, updateData: Partial<IUser>): Promise<IUser | null> {
    return await User.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  },

  async incrementRespectPoints(id: string, points: number): Promise<IUser | null> {
    return await User.findByIdAndUpdate(
      id,
      { $inc: { respectPoints: points } },
      { new: true }
    );
  },
  async getGuides(filters: any, page: number, limit: number): Promise<any> {
    const skip = (page - 1) * limit;
    
    // Force role filter to GUIDE
    const queryFilters = {
      ...filters,
      $or: [
        { role: Role.GUIDE },
        { roles: Role.GUIDE },
        { capabilities: 'discover:listed' },
      ],
      mentorProfileStatus: 'approved',
      profileVisibility: true,
      isBanned: false,
    };

    const guides = await User.find(queryFilters)
      .select('-passwordHash')
      .skip(skip)
      .limit(limit)
      .sort({ fameScore: -1 });

    const total = await User.countDocuments(queryFilters);

    return {
      guides,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalGuides: total,
    };
  },

  async countUsers(): Promise<number> {
    return await User.countDocuments();
  },
};
