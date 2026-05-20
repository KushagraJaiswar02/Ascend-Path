import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { userRepository } from '../users/user.repository';
import { authRepository } from './auth.repository';
import { RegisterInput, LoginInput } from './auth.validation';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_do_not_use_in_prod';
const ACCESS_TOKEN_EXPIRES_IN = '15m';
const REFRESH_TOKEN_EXPIRES_IN_DAYS = 7;

export const authService = {
  async register(data: RegisterInput) {
    const existingUser = await userRepository.findUserByEmail(data.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(data.password, saltRounds);

    const user = await userRepository.createUser({
      name: data.name,
      email: data.email,
      passwordHash,
    });

    const userObj = user.toObject();
    delete userObj.passwordHash;

    return userObj;
  },

  async login(data: LoginInput) {
    const user = await userRepository.findUserByEmail(data.email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    const { accessToken, refreshToken } = await this.generateTokens(user._id.toString(), user.role);

    const userObj = user.toObject();
    delete userObj.passwordHash;

    return {
      user: userObj,
      accessToken,
      refreshToken,
    };
  },

  async generateTokens(userId: string, role: string) {
    // Generate Access Token
    const accessToken = jwt.sign(
      { userId, role },
      JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRES_IN }
    );

    // Generate Refresh Token
    const refreshTokenString = crypto.randomBytes(40).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRES_IN_DAYS);

    // Save refresh token to DB
    await authRepository.createRefreshToken(userId, refreshTokenString, expiresAt);

    return {
      accessToken,
      refreshToken: refreshTokenString,
    };
  },

  async refreshTokens(oldRefreshToken: string) {
    const tokenDoc = await authRepository.findRefreshToken(oldRefreshToken);
    
    if (!tokenDoc) {
      throw new Error('Invalid refresh token');
    }

    if (tokenDoc.expiresAt < new Date()) {
      await authRepository.deleteRefreshToken(oldRefreshToken);
      throw new Error('Refresh token expired');
    }

    const userId = tokenDoc.user._id.toString();
    const role = (tokenDoc.user as any).role || 'explorer'; // populate might not resolve properly for types, handle safely

    // Delete the old refresh token (Token Rotation)
    await authRepository.deleteRefreshToken(oldRefreshToken);

    // Generate new tokens
    return await this.generateTokens(userId, role);
  },

  async logout(refreshToken: string) {
    if (refreshToken) {
      await authRepository.deleteRefreshToken(refreshToken);
    }
  },
};
