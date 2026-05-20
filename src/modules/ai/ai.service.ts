import NodeCache from 'node-cache';
import { logger } from '../../utils/logger';
import { aiUtils } from './ai.utils';
import { tagsSchema, roadmapSkeletonSchema } from './ai.validation';

// Cache for 24 hours to prevent duplicate identical requests
const aiCache = new NodeCache({ stdTTL: 86400, checkperiod: 3600 });

// Hard limit: never process more than 2000 tokens per request to save costs
const MAX_TOKENS = 2000;

export const aiService = {
  /**
   * Core abstraction wrapper. All AI requests must go through here.
   */
  async callProvider(prompt: string, cacheKey: string): Promise<string> {
    const tokens = aiUtils.estimateTokens(prompt);
    
    // Token Guard
    if (tokens > MAX_TOKENS) {
      logger.warn(`AI Token Guard triggered. Tokens: ${tokens}. Prompt truncated.`);
      // Truncate to safe limit (approx 4 chars per token)
      prompt = prompt.slice(0, MAX_TOKENS * 4);
    }

    // Check Cache
    const cachedResponse = aiCache.get<string>(cacheKey);
    if (cachedResponse) {
      logger.info(`AI Cache Hit [Tokens: ~${tokens}]`);
      return cachedResponse;
    }

    logger.info(`AI Provider Call [Tokens: ~${tokens}]`);
    const startTime = Date.now();

    try {
      // MOCK PROVIDER LOGIC
      // In production, you would check process.env.AI_PROVIDER and call OpenAI/Anthropic
      // For now, we simulate an API call
      
      const mockDelay = Math.floor(Math.random() * 500) + 200;
      await new Promise((resolve) => setTimeout(resolve, mockDelay));
      
      let mockResponse = '';
      if (prompt.includes('Generate 5 short relevant tags')) {
        mockResponse = JSON.stringify(["guidance", "career", "tech", "growth", "mentor"]);
      } else if (prompt.includes('Generate a roadmap skeleton')) {
        mockResponse = JSON.stringify({
          title: "Senior Backend Developer Roadmap",
          description: "A structured path to master scalable systems.",
          estimatedWeeks: 12,
          steps: [
            { title: "Database Optimization", description: "Learn indexing and caching." },
            { title: "System Design", description: "Microservices and distributed systems." }
          ]
        });
      } else {
        mockResponse = 'Mock generic response';
      }

      const latency = Date.now() - startTime;
      logger.info(`AI Response Success [Latency: ${latency}ms]`);

      // Store in cache
      aiCache.set(cacheKey, mockResponse);

      return mockResponse;
    } catch (error) {
      const latency = Date.now() - startTime;
      logger.error(`AI Provider Failed [Latency: ${latency}ms]`, error);
      throw new Error('AI Provider Failed');
    }
  },

  /**
   * Use Case: Tagging
   */
  async generateTags(title: string, content: string): Promise<string[]> {
    const cleanTitle = aiUtils.preparePrompt(title, 100);
    const cleanContent = aiUtils.preparePrompt(content, 500); // Strict context!

    const prompt = `Generate 5 short relevant tags as a JSON array of strings.\nTitle: ${cleanTitle}\nContent: ${cleanContent}`;
    const hash = aiUtils.generateHash(prompt);

    try {
      const response = await this.callProvider(prompt, hash);
      const parsed = JSON.parse(response);
      
      // Zod Validation
      const validated = tagsSchema.parse(parsed);
      return validated;
    } catch (error) {
      logger.error('Failed to generate tags, returning safe default []', error);
      return []; // Fallback Strategy
    }
  },

  /**
   * Use Case: Roadmap Generation
   */
  async generateRoadmapSkeleton(targetRole: string, currentLevel: string, timeframeWeeks: number) {
    const cleanRole = aiUtils.preparePrompt(targetRole, 50);
    const cleanLevel = aiUtils.preparePrompt(currentLevel, 50);

    const prompt = `Generate a roadmap skeleton as JSON. targetRole: ${cleanRole}, currentLevel: ${cleanLevel}, timeframeWeeks: ${timeframeWeeks}`;
    const hash = aiUtils.generateHash(prompt);

    try {
      const response = await this.callProvider(prompt, hash);
      const parsed = JSON.parse(response);

      // Zod Validation
      const validated = roadmapSkeletonSchema.parse(parsed);
      return validated;
    } catch (error) {
      logger.error('Failed to generate roadmap, returning safe default skeleton', error);
      
      // Fallback Strategy
      return {
        title: `Path to ${cleanRole}`,
        description: "A generic roadmap skeleton because AI failed.",
        estimatedWeeks: timeframeWeeks,
        steps: [
          { title: "Foundation", description: "Master the basics." },
          { title: "Advanced Topics", description: "Deep dive into complex areas." }
        ]
      };
    }
  }
};
