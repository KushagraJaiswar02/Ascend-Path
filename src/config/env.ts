import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load .env file (no-op in production where env vars are injected by the platform)
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// ── ENV Schema ────────────────────────────────────────────────────────────────
// If any required variable is missing or malformed, the process throws immediately
// at startup — not 10 minutes later on first DB query.
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(5000),

  // MongoDB — must be a proper connection string
  MONGODB_URI: z
    .string()
    .min(1, 'MONGODB_URI is required')
    .refine(
      (v) => v.startsWith('mongodb://') || v.startsWith('mongodb+srv://'),
      { message: 'MONGODB_URI must start with mongodb:// or mongodb+srv://' }
    ),

  // Auth — warn loudly if the fallback is used in production
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),

  // CORS / Client
  CLIENT_URL: z.string().url('CLIENT_URL must be a valid URL').default('http://localhost:5173'),

  // Session & Integrations
  JITSI_DOMAIN: z.string().default('meet.jit.si'),
  SESSION_MINIMUM_DURATION_MINUTES: z.coerce.number().default(10),

  // Cloudinary (optional — only required when media uploads are enabled)
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
});

const _parsed = envSchema.safeParse(process.env);

if (!_parsed.success) {
  console.error('❌ Invalid environment variables:\n');
  _parsed.error.issues.forEach((issue) => {
    console.error(`  [${issue.path.join('.')}] ${issue.message}`);
  });
  console.error('\nFix the above variables and restart the server.');
  process.exit(1);
}

export const env = _parsed.data;
