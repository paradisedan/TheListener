import { Comment } from '@/data/mockData';

export interface WhisperFragment {
  id: string;
  text: string;
  originalComment: Comment;
  timestamp: number;
}

/**
 * Converts a comment message to a whisper fragment
 * - Truncates to ≤8 words
 * - Lowercase
 * - Strips URLs, mentions, punctuation
 * - Adds ellipsis
 */
export function toFragment(text: string): string | null {
  const clean = text
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, '') // Remove URLs
    .replace(/[@#]\S+/g, '') // Remove mentions/hashtags
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .trim();
  
  const words = clean.split(/\s+/).slice(0, 8).join(' ');
  return words ? `${words}…` : null;
}

/**
 * Picks a comment from the pool with weighted selection
 * 60% from recent (last 30), 40% from rest
 */
export function pickWeighted(pool: Comment[], recentCount: number = 30): Comment | null {
  if (pool.length === 0) return null;
  
  const recent = pool.slice(0, Math.min(recentCount, pool.length));
  const rest = pool.slice(Math.min(recentCount, pool.length));
  
  const fromRecent = Math.random() < 0.6;
  const bucket = fromRecent && recent.length > 0 ? recent : rest.length > 0 ? rest : pool;
  
  return bucket[Math.floor(Math.random() * bucket.length)];
}

/**
 * Checks if a whisper should be shown based on deduplication window
 * @param recentWhisperIds - Array of recent whisper IDs (within 45s window)
 * @param candidateId - ID of the candidate whisper
 */
export function shouldShowWhisper(recentWhisperIds: string[], candidateId: string): boolean {
  return !recentWhisperIds.includes(candidateId);
}

/**
 * Sanitizes text by removing profanity and unwanted content
 */
export function sanitizeText(text: string): string {
  // Basic profanity filter (expand as needed)
  const profanityList = ['fuck', 'shit', 'damn', 'ass', 'bitch'];
  let cleaned = text;
  
  profanityList.forEach(word => {
    const regex = new RegExp(word, 'gi');
    cleaned = cleaned.replace(regex, '***');
  });
  
  return cleaned;
}
