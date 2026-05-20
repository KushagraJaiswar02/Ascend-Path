import crypto from 'crypto';

export const aiUtils = {
  /**
   * Cleans input by trimming, removing multiple spaces,
   * and brutally slicing it to minimize context.
   */
  preparePrompt(input: string, maxLength: number = 1000): string {
    if (!input) return '';
    let cleaned = input.trim();
    
    // Remove excessive whitespace/newlines
    cleaned = cleaned.replace(/\s+/g, ' ');
    
    // Brutal slicing to save tokens
    if (cleaned.length > maxLength) {
      cleaned = cleaned.slice(0, maxLength);
    }
    
    return cleaned;
  },

  /**
   * Approximates token count (1 token ≈ 4 chars)
   */
  estimateTokens(input: string): number {
    if (!input) return 0;
    return Math.ceil(input.length / 4);
  },

  /**
   * Generates a predictable hash for caching
   */
  generateHash(input: string): string {
    return crypto.createHash('sha256').update(input).digest('hex');
  }
};
