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
  duration: number;
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
      
      if (cms < 1800000) return 12000; // <30min: 12s (patient buildup)
      if (idle) return 30000; // Idle: 30s (barely there)
      return 18000; // Normal: 18s (truly ambient)
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
          opacity: 0.4,
          drift: 30,
          duration: 8,
        };
        setActiveWhispers(prev => [...prev.slice(-4), forcedWhisper]);
        hasShownRemixMessageRef.current = true;
        justExitedSilenceRef.current = false;
        
        // Schedule removal
        const lifetime = forcedWhisper.duration * 1000 + 800;
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
        opacity: Math.max(0.8, Math.min(1.0, opacity)), // 80-100% opacity for readability
        drift: 8 + Math.random() * 7,
        duration: 20 + Math.random() * 8,
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

      // Schedule removal of this whisper after its lifetime
      const lifetime = newWhisper.duration * 1000 + 800;
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

  // Determine if remix is imminent for visual styling
  const isRemixImminent = countdownMs < 10000;

  return (
    <div 
      className="fixed inset-0 pointer-events-none" 
      style={{ zIndex: 30 }}
      aria-hidden="true"
    >
      <AnimatePresence mode="popLayout">
        {activeWhispers.map((whisper) => (
          <motion.div
            key={whisper.id}
            initial={{ opacity: 0, y: 5, filter: 'blur(3px)' }}
            animate={{ 
              opacity: [0, whisper.opacity, whisper.opacity, 0], // Fade in, hold, fade out
              y: -whisper.drift,
              filter: ['blur(3px)', 'blur(0px)', 'blur(0px)', 'blur(2px)'],
            }}
            transition={{ 
              opacity: { 
                duration: whisper.duration, 
                times: [0, 0.1, 0.85, 1], // 10% fade in, 75% hold, 15% fade out
                ease: 'easeOut' 
              },
              y: { duration: whisper.duration, ease: 'linear' },
              filter: { 
                duration: whisper.duration, 
                times: [0, 0.1, 0.85, 1],
                ease: 'easeOut' 
              },
            }}
            style={{
              position: 'absolute',
              left: `${whisper.x}vw`,
              top: `${whisper.y}vh`,
            }}
          >
            <motion.div
              animate={{
                x: [0, Math.random() * 6 - 3, 0],
              }}
              transition={{
                duration: whisper.duration * 1.5,
                ease: 'easeInOut',
                repeat: Infinity,
              }}
              className="font-mono text-[14px] md:text-[15px] tracking-[0.08em] text-white"
              style={isRemixImminent ? { mixBlendMode: 'screen' } : {}}
            >
              {whisper.text}
            </motion.div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
