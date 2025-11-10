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
const DEBUG = true; // Set to false to disable logging

export function Whispers({ comments, countdownMs, isIdle, onWhisperAppear, forceRebirthMessage = 0 }: WhispersProps) {
  const [activeWhispers, setActiveWhispers] = useState<ActiveWhisper[]>([]);
  const [recentWhisperIds, setRecentWhisperIds] = useState<string[]>([]);
  const [isRemixSilence, setIsRemixSilence] = useState(false);
  const [isRebirthPause, setIsRebirthPause] = useState(false);
  const [hasShownRemixMessage, setHasShownRemixMessage] = useState(false);

  // Refs to avoid dependency restarts
  const activeWhispersRef = useRef(activeWhispers);
  const recentWhisperIdsRef = useRef(recentWhisperIds);
  const countdownMsRef = useRef(countdownMs);
  const isIdleRef = useRef(isIdle);
  const justExitedSilenceRef = useRef(false);

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
      setHasShownRemixMessage(false);
      
      // Resume after 10s with forced message
      setTimeout(() => {
        if (DEBUG) console.log('[Whispers] Exiting rebirth pause');
        setIsRebirthPause(false);
        justExitedSilenceRef.current = true;
      }, 10000);
    }
  }, [forceRebirthMessage]);

  // Handle remix silence at T=0
  useEffect(() => {
    if (countdownMs === 0 && !isRemixSilence) {
      if (DEBUG) console.log('[Whispers] T=0: Entering remix silence');
      setIsRemixSilence(true);
      setActiveWhispers([]);
      setHasShownRemixMessage(false);
      
      // Resume after 2s with forced message
      setTimeout(() => {
        if (DEBUG) console.log('[Whispers] Exiting remix silence');
        setIsRemixSilence(false);
        justExitedSilenceRef.current = true;
      }, 2000);
    }
  }, [countdownMs, isRemixSilence]);

  // Self-scheduling whisper generator
  useEffect(() => {
    if (isRemixSilence || isRebirthPause) return;

    let cancelled = false;

    const computeCadence = () => {
      const cms = countdownMsRef.current;
      const idle = isIdleRef.current;
      
      if (cms < 1800000) return 5000; // <30min: 5s (calm buildup)
      if (idle) return 18000; // Idle: 18s (barely noticeable)
      return 10000; // Normal: 10s (truly ambient)
    };

    const generateWhisper = () => {
      // Force "we begin again..." as first whisper after remix
      if (justExitedSilenceRef.current && !hasShownRemixMessage) {
        if (DEBUG) console.log('[Whispers] Adding forced remix message');
        const forcedWhisper: ActiveWhisper = {
          id: `remix-${Date.now()}`,
          text: FORCED_REMIX_TEXT,
          x: 50,
          y: 65,
          opacity: 0.75,
          drift: 30,
          duration: 8,
        };
        setActiveWhispers(prev => [...prev.slice(-3), forcedWhisper]);
        setHasShownRemixMessage(true);
        justExitedSilenceRef.current = false;
        onWhisperAppear?.();
        return;
      }

      if (whisperPool.length === 0) {
        if (DEBUG) console.log('[Whispers] Pool empty, skipping');
        return;
      }
      
      // Remove oldest if at max capacity
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
        x = 35 + Math.random() * 30;
        y = 60 + Math.random() * 12;
      } else {
        x = 12 + Math.random() * 76;
        y = 58 + Math.random() * 18;
      }

      const idle = isIdleRef.current;
      const baseOpacity = idle ? 0.25 : isNearRemix ? 0.5 : 0.35;
      const opacity = baseOpacity + Math.random() * 0.08 - 0.04;

      const newWhisper: ActiveWhisper = {
        id: whisperData.id,
        text: whisperData.text,
        x,
        y,
        opacity: Math.max(0.25, Math.min(0.5, opacity)),
        drift: 15 + Math.random() * 10,
        duration: 12 + Math.random() * 2,
      };

      if (DEBUG) console.log('[Whispers] Adding:', newWhisper.id, newWhisper.text);
      setActiveWhispers(prev => [...prev, newWhisper]);
      
      // Update recent IDs for deduplication
      setRecentWhisperIds(prev => [...prev, whisperData.id].slice(-10));
      setTimeout(() => {
        setRecentWhisperIds(prev => prev.filter(id => id !== whisperData.id));
      }, 45000);

      // Remove this whisper after its lifetime
      const lifetime = newWhisper.duration * 1000 + 800;
      setTimeout(() => {
        setActiveWhispers(prev => prev.filter(w => w.id !== newWhisper.id));
      }, lifetime);

      onWhisperAppear?.();
    };

    const tick = () => {
      const cadence = computeCadence();
      if (DEBUG) console.log('[Whispers] Tick, cadence:', cadence, 'pool:', whisperPool.length, 'active:', activeWhispersRef.current.length);
      
      generateWhisper();
      
      setTimeout(() => {
        if (!cancelled) tick();
      }, cadence);
    };

    tick();

    return () => {
      cancelled = true;
    };
  }, [whisperPool, isRemixSilence, isRebirthPause, hasShownRemixMessage, onWhisperAppear]);

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
              opacity: whisper.opacity,
              y: -whisper.drift,
              filter: 'blur(0px)',
            }}
            exit={{ opacity: 0, filter: 'blur(2px)' }}
            transition={{ 
              opacity: { duration: 1.8, ease: 'easeOut' },
              y: { duration: 1.8, ease: 'easeOut' },
              filter: { duration: 1.8, ease: 'easeOut' },
            }}
            style={{
              position: 'absolute',
              left: `${whisper.x}vw`,
              top: `${whisper.y}vh`,
            }}
          >
            <motion.div
              animate={{
                x: [0, Math.random() * 8 - 4, 0],
              }}
              transition={{
                duration: whisper.duration,
                ease: 'easeInOut',
                repeat: Infinity,
              }}
              className={`font-mono text-[15px] tracking-[0.06em] ${
                isRemixImminent ? 'text-white' : 'text-white/60'
              }`}
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
