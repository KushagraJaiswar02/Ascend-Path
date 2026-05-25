import mongoose from 'mongoose';
import { connectDb } from './helper';

export const resetDatabase = async () => {
  const env = process.env.NODE_ENV || 'development';
  if (env === 'production') {
    console.error('💥 ERROR: Database reset is BLOCKED in production mode!');
    process.exit(1);
  }

  console.log(`⚠️  Wiping collections in [${env}] mode...`);
  await connectDb();

  const collections = mongoose.connection.collections;
  for (const key of Object.keys(collections)) {
    try {
      await collections[key].deleteMany({});
      console.log(`🧹 Wiped collection: ${key}`);
    } catch (err: any) {
      console.error(`❌ Failed to wipe collection ${key}:`, err.message);
    }
  }

  console.log('✅ Database reset completed successfully!');
};

if (require.main === module) {
  resetDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('💥 Reset failed:', err);
      process.exit(1);
    });
}
