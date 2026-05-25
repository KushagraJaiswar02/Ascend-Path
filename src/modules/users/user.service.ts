import { userRepository } from './user.repository';
import { RegisterUserInput } from './user.validation';
import { User, IUser, Role } from './user.model';
import { logger } from '../../utils/logger';

export const userService = {
  async registerUser(data: RegisterUserInput) {
    // 1. Check if user already exists
    const existingUser = await userRepository.findUserByEmail(data.email);
    if (existingUser) {
      throw { statusCode: 400, message: 'User with this email already exists' };
    }

    // 2. Hash password (placeholder for actual bcrypt logic in later phase)
    const passwordHash = `hashed_${data.password}`;

    const parsedSkills = data.skills
      ? data.skills.map((skill: any) =>
          typeof skill === 'string' ? { name: skill } : skill
        )
      : [];

    // 3. Create user with defaults
    const newUser = await userRepository.createUser({
      name: data.name,
      email: data.email,
      passwordHash,
      role: Role.USER,
      educationLevel: data.educationLevel,
      bio: data.bio,
      domains: data.domains || [],
      skills: parsedSkills,
      interests: data.interests || [],
    });

    // 4. Return sanitized user (exclude passwordHash)
    const userObj = newUser.toObject();
    const { passwordHash: _, ...sanitizedUser } = userObj;

    return sanitizedUser;
  },

  async getUserById(userId: string) {
    const user = await userRepository.findUserById(userId);
    if (!user) {
      throw { statusCode: 404, message: 'User not found' };
    }

    const userObj = user.toObject();
    const { passwordHash: _, ...sanitizedUser } = userObj;

    return sanitizedUser;
  },

  async evaluateUserRole(userId: string) {
    const user = await userRepository.findUserById(userId);
    if (!user) return;

    // PATHFINDER auto-unlock threshold
    if (user.respectPoints >= 500 && [Role.USER, Role.EXPLORER].includes(user.role)) {
      await userRepository.updateUser(userId, { role: Role.GUIDE });
      this.onRoleUpgrade(userId, Role.GUIDE);
    }
  },

  onRoleUpgrade(userId: string, newRole: Role) {
    // Basic event-like logger for role upgrades
    logger.info(`[EVENT] RoleUpgrade: User ${userId} unlocked ${newRole}`);
    // Future implementation: eventEmitter.emit('roleUpgrade', { userId, newRole })
  },

  async updateProfessionalProfile(
    userId: string,
    data: {
      username?: string;
      headline?: string;
      specialization?: string;
      portfolioLinks?: { label: string; url: string }[];
    }
  ): Promise<IUser> {
    // If username is being set, ensure it's unique
    if (data.username) {
      const existing = await User.findOne({ username: data.username, _id: { $ne: userId } }).lean();
      if (existing) throw { statusCode: 409, message: 'Username is already taken. Please choose another.' };
    }

    const updated = await User.findByIdAndUpdate(
      userId,
      { $set: data },
      { new: true, runValidators: true }
    ).select('-passwordHash').lean();

    if (!updated) throw { statusCode: 404, message: 'User not found' };
    return updated as IUser;
  },

  async getPublicProfileByUsername(username: string) {
    const user = await User.findOne({ username, profileVisibility: true })
      .select('-passwordHash -email -falseReportStrikes -moderatorNotes -suspensionReason')
      .lean();
    if (!user) throw { statusCode: 404, message: 'Profile not found or not public' };
    return user;
  },

  async getPublicProfileById(userId: string) {
    const user = await User.findById(userId)
      .select('-passwordHash -email -falseReportStrikes -moderatorNotes -suspensionReason')
      .lean();
    if (!user) throw { statusCode: 404, message: 'User not found' };
    return user;
  },
};
