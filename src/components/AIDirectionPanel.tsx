import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import { Comment } from '@/data/mockData';

const NEUTRAL_PHRASES = [
  'the air holds its shape.',
  'something stirs beneath.',
  'patterns emerge, patient.',
  'the collective listens.',
  'threads weave together.',
  'momentum builds, quiet.',
];

interface AIDirectionPanelProps {
  comments: Comment[];
  countdownMs: number;
}

const DEBUG = true;

export function AIDirectionPanel({ comments, countdownMs }: AIDirectionPanelProps) {
  const [currentSummary, setCurrentSummary] = useState('');
  const [isRemix, setIsRemix] = useState(false);
  const [showPostRemix, setShowPostRemix] = useState(false);
  const wasRemixRef = useRef(false);
  const updateTimerRef = useRef<NodeJS.Timeout>();
  const hasInitializedRef = useRef(false);
  const commentsRef = useRef(comments);

  // Keep comments ref up to date
  useEffect(() => {
    commentsRef.current = comments;
  }, [comments]);

  // Analyze comments and generate summary
  const generateSummary = (recentComments: Comment[]): string => {
    if (recentComments.length === 0) {
      return NEUTRAL_PHRASES[Math.floor(Math.random() * NEUTRAL_PHRASES.length)];
    }

    const recent = recentComments.slice(-10); // Last 10 comments
    const allText = recent.map(c => c.message.toLowerCase()).join(' ');

    // Simple heuristics
    if (allText.includes('drum') || allText.includes('beat') || allText.includes('kick')) {
      return 'the pulse wants more weight.';
    }
    if (allText.includes('energy') || allText.includes('faster') || allText.includes('upbeat') || allText.includes('tempo')) {
      return 'the tempo strains to rise.';
    }
    if (allText.includes('sad') || allText.includes('minor') || allText.includes('dark') || allText.includes('melancholy')) {
      return 'shadows gather in the mix.';
    }
    if (allText.includes('vocal') || allText.includes('voice') || allText.includes('lyric') || allText.includes('sing')) {
      return 'something unsaid wants to be heard.';
    }
    if (allText.includes('drop') || allText.includes('break') || allText.includes('release')) {
      return 'the room craves release.';
    }

    return NEUTRAL_PHRASES[Math.floor(Math.random() * NEUTRAL_PHRASES.length)];
  };

  // Schedule next update with random interval
  const scheduleNextUpdate = () => {
    if (updateTimerRef.current) {
      clearTimeout(updateTimerRef.current);
    }

    const randomInterval = 30000 + Math.random() * 30000; // 30-60 seconds
    if (DEBUG) console.log(`[AIDirection] Next update in ${Math.round(randomInterval / 1000)}s`);
    
    updateTimerRef.current = setTimeout(() => {
      const newSummary = generateSummary(commentsRef.current);
      if (DEBUG) console.log(`[AIDirection] Updating summary:`, newSummary);
      setCurrentSummary(newSummary);
      scheduleNextUpdate();
    }, randomInterval);
  };

  // Handle remix ceremony
  useEffect(() => {
    const inRemix = countdownMs > 0;
    
    if (inRemix && !wasRemixRef.current) {
      // Entering remix - freeze updates
      setIsRemix(true);
      if (updateTimerRef.current) {
        clearTimeout(updateTimerRef.current);
      }
      wasRemixRef.current = true;
    } else if (!inRemix && wasRemixRef.current) {
      // Exiting remix - show post-remix message
      setIsRemix(false);
      setShowPostRemix(true);
      setCurrentSummary('a new pattern forms.');
      
      // Resume normal cycle after 10-15 seconds
      const resumeDelay = 10000 + Math.random() * 5000;
      setTimeout(() => {
        setShowPostRemix(false);
        setCurrentSummary(generateSummary(commentsRef.current));
        scheduleNextUpdate();
      }, resumeDelay);
      
      wasRemixRef.current = false;
    }
  }, [countdownMs, comments]);

  // Initial summary generation
  useEffect(() => {
    if (!hasInitializedRef.current && comments.length > 0) {
      const initialSummary = generateSummary(comments);
      if (DEBUG) console.log('[AIDirection] Component mounted, initial summary:', initialSummary);
      setCurrentSummary(initialSummary);
      hasInitializedRef.current = true;
      scheduleNextUpdate();
    }
  }, [comments]);

  // Debug: Log component mount
  useEffect(() => {
    console.log('[AIDirection] Component mounted with', comments.length, 'comments');
  }, []);

  // Update cycle management
  useEffect(() => {
    if (!isRemix && !showPostRemix && hasInitializedRef.current) {
      scheduleNextUpdate();
    }

    return () => {
      if (updateTimerRef.current) {
        clearTimeout(updateTimerRef.current);
      }
    };
  }, [isRemix, showPostRemix]);
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 3, delay: 2 }}
      className="fixed bottom-16 md:bottom-24 left-0 right-0 px-4 md:px-8"
    >
      <div className="container mx-auto max-w-4xl">
        <div className="flex flex-col items-center gap-2 text-center">
          <p className="text-xs font-mono tracking-wide opacity-50">
            direction:
          </p>
          <AnimatePresence mode="wait">
            <motion.p 
              key={currentSummary}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="text-sm md:text-base font-mono tracking-wider leading-relaxed max-w-2xl px-4"
              style={{ 
                letterSpacing: '0.1em',
                color: 'rgba(255, 255, 255, 0.7)'
              }}
            >
              {currentSummary}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
