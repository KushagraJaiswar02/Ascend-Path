import { RefreshToken, IRefreshToken } from './refresh-token.model';

export const authRepository = {
  async createRefreshToken(userId: string, token: string, expiresAt: Date): Promise<IRefreshToken> {
    const refreshToken = new RefreshToken({
      user: userId,
      token,
      expiresAt,
    });
    return await refreshToken.save();
  },

  async findRefreshToken(token: string): Promise<IRefreshToken | null> {
    return await RefreshToken.findOne({ token }).populate('user');
  },

  async deleteRefreshToken(token: string): Promise<void> {
    await RefreshToken.deleteOne({ token });
  },

  async deleteAllUserRefreshTokens(userId: string): Promise<void> {
    await RefreshToken.deleteMany({ user: userId });
  },
};
