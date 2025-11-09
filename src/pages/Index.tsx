import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PlayerBar } from '@/components/PlayerBar';
import { PromptSection } from '@/components/PromptSection';
import { AIDirectionPanel } from '@/components/AIDirectionPanel';
import { DriftingContributors } from '@/components/DriftingContributors';
import { MixHistory } from '@/components/MixHistory';
import { VersionDrawer } from '@/components/VersionDrawer';
import { TheListener } from '@/components/TheListener';
import { useCountdown } from '@/hooks/useCountdown';
import {
  mockUsers,
  mockComments,
  mockVersions,
  getRandomComment,
  Comment,
  Version,
} from '@/data/mockData';

const Index = () => {
  const [comments, setComments] = useState<Comment[]>(mockComments);
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
  const [isIdle, setIsIdle] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [keystrokePulse, setKeystrokePulse] = useState(0);
  const [listenerState, setListenerState] = useState<'idle' | 'focused' | 'typing' | 'submitting' | 'rebirth' | 'dormant'>('idle');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const countdown = useCountdown();
  const currentVersion = mockVersions.length;

  // Track mouse position for parallax
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2; // -1 to 1
      const y = (e.clientY / window.innerHeight - 0.5) * 2; // -1 to 1
      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Handle idle state and listener state
  useEffect(() => {
    let idleTimer: NodeJS.Timeout;

    const resetIdle = () => {
      setIsIdle(false);
      if (!isTyping) {
        setListenerState('idle');
      }
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        setIsIdle(true);
        setListenerState('dormant');
      }, 60000); // 60s for dormant
    };

    window.addEventListener('mousemove', resetIdle);
    window.addEventListener('keydown', resetIdle);
    window.addEventListener('click', resetIdle);

    idleTimer = setTimeout(() => {
      setIsIdle(true);
      setListenerState('dormant');
    }, 60000);

    return () => {
      clearTimeout(idleTimer);
      window.removeEventListener('mousemove', resetIdle);
      window.removeEventListener('keydown', resetIdle);
      window.removeEventListener('click', resetIdle);
    };
  }, [isTyping]);

  // Update listener state based on focus and typing
  useEffect(() => {
    if (isTyping) {
      setListenerState('typing');
    } else if (isFocused && !isIdle) {
      setListenerState('focused');
    } else if (!isIdle) {
      setListenerState('idle');
    }
  }, [isTyping, isFocused, isIdle]);

  const handleSubmit = () => {
    setListenerState('submitting');
    setTimeout(() => {
      setListenerState('idle');
    }, 1400);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const handleKeystroke = () => {
    setKeystrokePulse(1);
    setTimeout(() => setKeystrokePulse(0), 500);
  };

  // Calculate parallax offsets for different layers
  const waveformParallax = {
    x: mousePosition.x * 8,
    y: mousePosition.y * 8,
  };

  const listenerParallax = {
    x: mousePosition.x * 15,
    y: mousePosition.y * 15,
  };

  const textParallax = {
    x: mousePosition.x * 25,
    y: mousePosition.y * 25,
  };

  // Add new comments periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const newComment = getRandomComment();
      setComments((prev) => [newComment, ...prev.slice(0, 19)]);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const handleVersionClick = (version: Version) => {
    setSelectedVersion(version);
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Idle darken overlay */}
      <motion.div 
        className="fixed inset-0 bg-black pointer-events-none"
        style={{ zIndex: 15 }}
        animate={{
          opacity: isIdle ? 0.5 : 0,
        }}
        transition={{ duration: 4 }}
      />
      
      {/* Central glow */}
      <motion.div 
        className="fixed inset-0 glow-center breath pointer-events-none"
        animate={{
          opacity: isIdle ? 0.8 : 0.4,
        }}
        transition={{ duration: 3 }}
      />
      
      {/* Ambient waveform visualization */}
      <motion.div 
        className="fixed inset-0 flex items-center justify-center pointer-events-none"
        animate={{
          opacity: isIdle ? 0.1 : 0.05,
          x: waveformParallax.x,
          y: waveformParallax.y,
        }}
        transition={{ 
          duration: 3,
          x: { duration: 0.8, ease: 'easeOut' },
          y: { duration: 0.8, ease: 'easeOut' },
        }}
      >
        <div className="flex gap-1 items-end">
          {[...Array(40)].map((_, i) => (
            <motion.div
              key={i}
              className="w-1 bg-primary/30 rounded-full"
              animate={{
                height: [`${Math.random() * 40 + 20}px`, `${Math.random() * 60 + 30}px`, `${Math.random() * 40 + 20}px`],
              }}
              transition={{
                duration: Math.random() * 2 + 2,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.05,
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* The Listener - living presence */}
      <motion.div
        animate={{
          x: listenerParallax.x,
          y: listenerParallax.y,
        }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <TheListener 
          state={listenerState} 
          waveformAmplitude={0.3}
          keystrokePulse={keystrokePulse}
        />
      </motion.div>

      <PlayerBar version={currentVersion} countdown={countdown} />
      
      <motion.div
        animate={{
          opacity: isIdle ? 0.7 : 1,
          x: textParallax.x,
          y: textParallax.y,
        }}
        transition={{ 
          duration: 2,
          x: { duration: 0.5, ease: 'easeOut' },
          y: { duration: 0.5, ease: 'easeOut' },
        }}
      >
        <PromptSection 
          onTyping={setIsTyping}
          onSubmit={handleSubmit}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeystroke={handleKeystroke}
        />
      </motion.div>

      <motion.div
        animate={{
          x: textParallax.x * 0.8,
          y: textParallax.y * 0.8,
        }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <AIDirectionPanel />
      </motion.div>
      
      <DriftingContributors users={mockUsers} comments={comments} />
      
      <MixHistory
        versions={mockVersions}
        onVersionClick={handleVersionClick}
      />
      
      <VersionDrawer
        version={selectedVersion}
        isOpen={selectedVersion !== null}
        onClose={() => setSelectedVersion(null)}
      />
    </div>
  );
};

export default Index;
