import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useMemo } from 'react';
import { Comment } from '@/data/mockData';
import { toFragment, pickWeighted, shouldShowWhisper } from '@/lib/whispers';

interface WhispersProps {
  comments: Comment[];
  countdownMs: number;
  isIdle: boolean;
  onWhisperAppear?: () => void;
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

export function Whispers({ comments, countdownMs, isIdle, onWhisperAppear }: WhispersProps) {
  const [activeWhispers, setActiveWhispers] = useState<ActiveWhisper[]>([]);
  const [recentWhisperIds, setRecentWhisperIds] = useState<string[]>([]);
  const [isRemixSilence, setIsRemixSilence] = useState(false);
  const [hasShownRemixMessage, setHasShownRemixMessage] = useState(false);

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

  // Calculate cadence based on state
  const getCadence = () => {
    if (isRemixSilence) return Infinity;
    if (countdownMs < 1800000) return 1500; // <30min: 1.5s
    if (isIdle) return 6000; // Idle: 6s
    return 2500; // Normal: 2.5s
  };

  // Determine if we're in remix proximity
  const isRemixProximity = countdownMs < 1800000; // <30min
  const isRemixImminent = countdownMs < 10000; // <10s

  // Handle remix silence at T=0
  useEffect(() => {
    if (countdownMs === 0 && !isRemixSilence) {
      setIsRemixSilence(true);
      setActiveWhispers([]);
      setHasShownRemixMessage(false);
      
      // Resume after 2s with forced message
      setTimeout(() => {
        setIsRemixSilence(false);
      }, 2000);
    }
  }, [countdownMs, isRemixSilence]);

  // Add new whispers on interval
  useEffect(() => {
    const cadence = getCadence();
    if (cadence === Infinity) return;

    const interval = setInterval(() => {
      // Force "we begin again..." as first whisper after remix
      if (!isRemixSilence && countdownMs < 100 && !hasShownRemixMessage) {
        const forcedWhisper: ActiveWhisper = {
          id: `remix-${Date.now()}`,
          text: FORCED_REMIX_TEXT,
          x: 50, // Center
          y: 65,
          opacity: 0.4 + Math.random() * 0.2,
          drift: 15 + Math.random() * 10,
          duration: 5 + Math.random() * 3,
        };
        setActiveWhispers(prev => [...prev.slice(-3), forcedWhisper]);
        setHasShownRemixMessage(true);
        onWhisperAppear?.();
        return;
      }

      if (whisperPool.length === 0) return;
      
      // Remove oldest if at max capacity
      if (activeWhispers.length >= 5) {
        setActiveWhispers(prev => prev.slice(1));
      }

      // Pick a weighted comment
      const picked = pickWeighted(whisperPool.map(w => w.comment));
      if (!picked) return;

      const whisperData = whisperPool.find(w => w.comment.id === picked.id);
      if (!whisperData) return;

      // Check deduplication
      if (!shouldShowWhisper(recentWhisperIds, whisperData.id)) return;

      // Calculate position based on remix proximity
      let x: number, y: number;
      if (isRemixProximity) {
        // Cluster closer to center
        x = 35 + Math.random() * 30; // 35-65vw
        y = 60 + Math.random() * 12; // 60-72vh
      } else {
        // Normal spread
        x = 12 + Math.random() * 76; // 12-88vw
        y = 58 + Math.random() * 18; // 58-76vh
      }

      const baseOpacity = isIdle ? 0.4 : isRemixProximity ? 0.7 : 0.5;
      const opacity = baseOpacity + Math.random() * 0.1 - 0.05;

      const newWhisper: ActiveWhisper = {
        id: whisperData.id,
        text: whisperData.text,
        x,
        y,
        opacity: Math.max(0.4, Math.min(0.7, opacity)),
        drift: 15 + Math.random() * 10,
        duration: 5 + Math.random() * 3,
      };

      setActiveWhispers(prev => [...prev, newWhisper]);
      
      // Update recent IDs for deduplication (45s window)
      setRecentWhisperIds(prev => [...prev, whisperData.id].slice(-10));
      setTimeout(() => {
        setRecentWhisperIds(prev => prev.filter(id => id !== whisperData.id));
      }, 45000);

      // Trigger ear glow
      onWhisperAppear?.();
    }, cadence);

    return () => clearInterval(interval);
  }, [whisperPool, activeWhispers.length, recentWhisperIds, isIdle, countdownMs, isRemixSilence, hasShownRemixMessage, onWhisperAppear, isRemixProximity]);

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
            initial={{ opacity: 0, y: 10, filter: 'blur(3px)' }}
            animate={{ 
              opacity: whisper.opacity,
              y: -whisper.drift,
              filter: 'blur(0px)',
            }}
            exit={{ opacity: 0, filter: 'blur(2px)' }}
            transition={{ 
              duration: 0.6,
              ease: 'easeInOut',
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
