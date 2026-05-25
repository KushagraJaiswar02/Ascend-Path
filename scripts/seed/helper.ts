import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export class SeededRandom {
  private seed: number;

  constructor(seed: number = 12345) {
    this.seed = seed;
  }

  // Returns number between 0 and 1
  next(): number {
    const x = Math.sin(this.seed++) * 10000;
    return x - Math.floor(x);
  }

  // Returns integer between min and max inclusive
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  // Select random item from array
  pick<T>(arr: T[]): T {
    if (!arr.length) throw new Error('Cannot pick from empty array');
    return arr[Math.floor(this.next() * arr.length)];
  }

  // Select multiple random items
  pickMultiple<T>(arr: T[], count: number): T[] {
    if (!arr.length) return [];
    const shuffled = [...arr].sort(() => this.next() - 0.5);
    return shuffled.slice(0, Math.min(count, arr.length));
  }

  // Probability check (returns true with 'probability' chance)
  chance(probability: number): boolean {
    return this.next() < probability;
  }
}

export const connectDb = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI is not set in environment variables');
    process.exit(1);
  }

  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(uri);
    console.log('✅ MongoDB connected successfully for seeding');
  }
};

export const disconnectDb = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
    console.log('✅ MongoDB disconnected after seeding');
  }
};
