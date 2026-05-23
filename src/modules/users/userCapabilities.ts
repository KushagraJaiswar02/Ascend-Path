import { IUser, Role } from './user.model';

export enum UserCapability {
  GUIDE_PROFILE = 'guide:profile',
  DISCOVER_LISTED = 'discover:listed',
  ROADMAPS_CREATE = 'roadmaps:create',
  SESSIONS_HOST = 'sessions:host',
  MENTOR_ANALYTICS = 'mentor:analytics',
}

export const guideCapabilities = [
  UserCapability.GUIDE_PROFILE,
  UserCapability.DISCOVER_LISTED,
  UserCapability.ROADMAPS_CREATE,
  UserCapability.SESSIONS_HOST,
  UserCapability.MENTOR_ANALYTICS,
];

export const hasCapability = (user: Pick<IUser, 'role'> & { roles?: Role[]; capabilities?: string[] }, capability: UserCapability) => {
  if (user.capabilities?.includes(capability)) return true;
  if (capability === UserCapability.GUIDE_PROFILE && (user.role === Role.GUIDE || user.roles?.includes(Role.GUIDE))) {
    return true;
  }
  return false;
};

export const canActAsGuide = (user: Pick<IUser, 'role'> & { roles?: Role[]; capabilities?: string[] }) => {
  return user.role === Role.GUIDE || user.roles?.includes(Role.GUIDE) || hasCapability(user, UserCapability.GUIDE_PROFILE);
};
