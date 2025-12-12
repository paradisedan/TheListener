import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useMemo, useRef } from 'react';
import { Comment } from '@/data/mockData';
import { toFragment, pickWeighted, shouldShowWhisper } from '@/lib/whispers';

interface WhispersProps {
  comments: Comment[];
  countdownMs: number;
  isIdle: boolean;
  onWhisperAppear?: () => void;
  forceRebirthMessage?: number; // Trigger counter for forced rebirth message
}

interface ActiveWhisper {
  id: string;
  text: string;
  x: number;
  y: number;
  opacity: number;
  drift: number;
  fadeInDuration: number;
  holdDuration: number;
  fadeOutDuration: number;
}

const FORCED_REMIX_TEXT = 'we begin again…';
const DEBUG = false; // Set to true to enable logging

export function Whispers({ comments, countdownMs, isIdle, onWhisperAppear, forceRebirthMessage = 0 }: WhispersProps) {
  const [activeWhispers, setActiveWhispers] = useState<ActiveWhisper[]>([]);
  const [recentWhisperIds, setRecentWhisperIds] = useState<string[]>([]);
  const [isRemixSilence, setIsRemixSilence] = useState(false);
  const [isRebirthPause, setIsRebirthPause] = useState(false);

  // Refs to avoid dependency restarts
  const activeWhispersRef = useRef(activeWhispers);
  const recentWhisperIdsRef = useRef(recentWhisperIds);
  const countdownMsRef = useRef(countdownMs);
  const isIdleRef = useRef(isIdle);
  const justExitedSilenceRef = useRef(false);
  const hasShownRemixMessageRef = useRef(false);
  
  // Timeout tracking for proper cleanup
  const tickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const removalTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const dedupeTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Create pool of valid whisper fragments
  const whisperPool = useMemo(() => {
    return comments
      .map(comment => ({
        id: comment.id,
        text: toFragment(comment.message),
        comment,
      }))
      .filter(w => w.text !== null) as { id: string; text: string; comment: Comment }[];
  }, [comments]);

  // Keep refs in sync
  useEffect(() => {
    activeWhispersRef.current = activeWhispers;
    recentWhisperIdsRef.current = recentWhisperIds;
    countdownMsRef.current = countdownMs;
    isIdleRef.current = isIdle;
  });

  // Handle forced rebirth message trigger
  useEffect(() => {
    if (forceRebirthMessage > 0) {
      if (DEBUG) console.log('[Whispers] 🌟 Force rebirth message triggered - entering 10s pause');
      setIsRebirthPause(true);
      setActiveWhispers([]);
      hasShownRemixMessageRef.current = false;
      
      // Resume after 10s with forced message
      const timeout = setTimeout(() => {
        if (DEBUG) console.log('[Whispers] Exiting rebirth pause');
        setIsRebirthPause(false);
        justExitedSilenceRef.current = true;
      }, 10000);
      
      return () => clearTimeout(timeout);
    }
  }, [forceRebirthMessage]);

  // Handle remix silence at T=0
  useEffect(() => {
    if (countdownMs === 0 && !isRemixSilence) {
      if (DEBUG) console.log('[Whispers] T=0: Entering remix silence');
      setIsRemixSilence(true);
      setActiveWhispers([]);
      hasShownRemixMessageRef.current = false;
      
      // Resume after 10s with forced message
      const timeout = setTimeout(() => {
        if (DEBUG) console.log('[Whispers] Exiting remix silence');
        setIsRemixSilence(false);
        justExitedSilenceRef.current = true;
      }, 10000);
      
      return () => clearTimeout(timeout);
    }
  }, [countdownMs, isRemixSilence]);

  // Self-scheduling whisper generator
  useEffect(() => {
    if (isRemixSilence || isRebirthPause) return;

    let cancelled = false;

    const computeCadence = () => {
      const cms = countdownMsRef.current;
      const idle = isIdleRef.current;
      
      if (cms < 1800000) return 25000; // <30min: 25s between whispers
      if (idle) return 60000; // Idle: 60s (very rare)
      return 40000; // Normal: 40s (meditative pace)
    };

    const generateWhisper = () => {
      // Force "we begin again..." as first whisper after remix
      if (justExitedSilenceRef.current && !hasShownRemixMessageRef.current) {
        if (DEBUG) console.log('[Whispers] Adding forced remix message');
        const whisperId = `remix-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
        const forcedWhisper: ActiveWhisper = {
          id: whisperId,
          text: FORCED_REMIX_TEXT,
          x: 50,
          y: 70,
          opacity: 0.5,
          drift: 15,
          fadeInDuration: 4,
          holdDuration: 6,
          fadeOutDuration: 16,
        };
        setActiveWhispers(prev => [...prev.slice(-4), forcedWhisper]);
        hasShownRemixMessageRef.current = true;
        justExitedSilenceRef.current = false;
        
        // Schedule removal after fade-in + hold (exit animation handles fade-out)
        const lifetime = (forcedWhisper.fadeInDuration + forcedWhisper.holdDuration) * 1000;
        const removalTimeout = setTimeout(() => {
          setActiveWhispers(prev => prev.filter(w => w.id !== whisperId));
          removalTimeoutsRef.current.delete(whisperId);
        }, lifetime);
        removalTimeoutsRef.current.set(whisperId, removalTimeout);
        
        onWhisperAppear?.();
        return;
      }

      if (whisperPool.length === 0) {
        if (DEBUG) console.log('[Whispers] Pool empty, skipping');
        return;
      }
      
      // Remove oldest if at max capacity (max 3 whispers for less clutter)
      if (activeWhispersRef.current.length >= 3) {
        setActiveWhispers(prev => prev.slice(1));
      }

      // Pick a weighted comment
      const picked = pickWeighted(whisperPool.map(w => w.comment));
      if (!picked) return;

      const whisperData = whisperPool.find(w => w.comment.id === picked.id);
      if (!whisperData) return;

      // Check deduplication
      if (!shouldShowWhisper(recentWhisperIdsRef.current, whisperData.id)) {
        if (DEBUG) console.log('[Whispers] Skipping duplicate:', whisperData.id);
        return;
      }

      // Calculate position based on remix proximity
      const cms = countdownMsRef.current;
      const isNearRemix = cms < 1800000;
      let x: number, y: number;
      if (isNearRemix) {
        x = 25 + Math.random() * 50;   // Wider horizontal spread
        y = 55 + Math.random() * 25;   // More vertical spread
      } else {
        x = 10 + Math.random() * 80;   // Full width usage
        y = 50 + Math.random() * 30;   // More vertical range
      }

      const idle = isIdleRef.current;
      const baseOpacity = idle ? 0.85 : isNearRemix ? 1.0 : 0.9;
      const opacity = baseOpacity + Math.random() * 0.1 - 0.05;

      // Generate truly unique ID for this whisper instance
      const whisperId = `${whisperData.id}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      
      const newWhisper: ActiveWhisper = {
        id: whisperId,
        text: whisperData.text,
        x,
        y,
        opacity: Math.max(0.8, Math.min(1.0, opacity)),
        drift: 15 + Math.random() * 10, // Slow drift 15-25px
        fadeInDuration: 6,
        holdDuration: 35 + Math.random() * 15, // 35-50s visible
        fadeOutDuration: 24, // Long 24s fade out
      };

      if (DEBUG) console.log('[Whispers] Adding:', whisperId, newWhisper.text);
      setActiveWhispers(prev => [...prev, newWhisper]);
      
      // Update recent IDs for deduplication (using original comment ID)
      setRecentWhisperIds(prev => [...prev, whisperData.id].slice(-10));
      
      // Clear existing dedupe timeout for this comment ID if any
      const existingDedupeTimeout = dedupeTimeoutsRef.current.get(whisperData.id);
      if (existingDedupeTimeout) {
        clearTimeout(existingDedupeTimeout);
      }
      
      const dedupeTimeout = setTimeout(() => {
        setRecentWhisperIds(prev => prev.filter(id => id !== whisperData.id));
        dedupeTimeoutsRef.current.delete(whisperData.id);
      }, 45000);
      dedupeTimeoutsRef.current.set(whisperData.id, dedupeTimeout);

      // Schedule removal after fade-in + hold (exit animation handles fade-out)
      const lifetime = (newWhisper.fadeInDuration + newWhisper.holdDuration) * 1000;
      const removalTimeout = setTimeout(() => {
        setActiveWhispers(prev => prev.filter(w => w.id !== whisperId));
        removalTimeoutsRef.current.delete(whisperId);
      }, lifetime);
      removalTimeoutsRef.current.set(whisperId, removalTimeout);

      onWhisperAppear?.();
    };

    const tick = () => {
      if (cancelled) return;
      
      const cadence = computeCadence();
      if (DEBUG) console.log('[Whispers] Tick, cadence:', cadence, 'pool:', whisperPool.length, 'active:', activeWhispersRef.current.length);
      
      generateWhisper();
      
      tickTimeoutRef.current = setTimeout(() => {
        if (!cancelled) tick();
      }, cadence);
    };

    tick();

    return () => {
      cancelled = true;
      
      // Clear tick timeout
      if (tickTimeoutRef.current) {
        clearTimeout(tickTimeoutRef.current);
        tickTimeoutRef.current = null;
      }
      
      // Clear all pending removal timeouts
      removalTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      removalTimeoutsRef.current.clear();
      
      // Clear all pending dedupe timeouts
      dedupeTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      dedupeTimeoutsRef.current.clear();
    };
  }, [whisperPool, isRemixSilence, isRebirthPause, onWhisperAppear]);

  return (
    <div 
      className="fixed inset-0 pointer-events-none" 
      style={{ zIndex: 30 }}
      aria-hidden="true"
    >
      <AnimatePresence>
        {activeWhispers.map((whisper) => (
          <motion.div
            key={whisper.id}
            initial={{ opacity: 0, y: 0, filter: 'blur(2px)' }}
            animate={{ 
              opacity: whisper.opacity,
              y: -whisper.drift,
              filter: 'blur(0px)',
            }}
            exit={{ 
              opacity: 0, 
              y: -whisper.drift - 15,
              filter: 'blur(2px)',
              transition: {
                duration: whisper.fadeOutDuration,
                ease: 'easeInOut',
              }
            }}
            transition={{ 
              opacity: { duration: whisper.fadeInDuration, ease: 'easeOut' },
              y: { duration: whisper.fadeInDuration + whisper.holdDuration, ease: 'linear' },
              filter: { duration: 2, ease: 'easeOut' },
            }}
            style={{
              position: 'absolute',
              left: `${whisper.x}vw`,
              top: `${whisper.y}vh`,
              textShadow: '1px 1px 2px rgba(0,0,0,1), 0 0 8px rgba(0,0,0,0.9), 0 0 30px rgba(0,0,0,0.5)',
            }}
            className="font-mono font-medium text-[16px] md:text-[18px] tracking-[0.04em] text-white"
          >
            {whisper.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
