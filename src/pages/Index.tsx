import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PlayerBar } from '@/components/PlayerBar';
import { PromptSection } from '@/components/PromptSection';
import { AIDirectionPanel } from '@/components/AIDirectionPanel';
import { DriftingContributors } from '@/components/DriftingContributors';
import { MixHistory } from '@/components/MixHistory';
import { VersionDrawer } from '@/components/VersionDrawer';
import { TheListener } from '@/components/TheListener';
import { Colophon } from '@/components/Colophon';
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
  const [waveformAmplitudes, setWaveformAmplitudes] = useState<number[]>(Array(40).fill(0.5));
  const countdown = useCountdown();
  const currentVersion = mockVersions.length;

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

  // Update waveform amplitudes
  useEffect(() => {
    let animationFrame: number;
    
    const updateAmplitudes = () => {
      setWaveformAmplitudes(prev => 
        prev.map(() => Math.random() * 0.6 + 0.2)
      );
      animationFrame = requestAnimationFrame(updateAmplitudes);
    };
    
    animationFrame = requestAnimationFrame(updateAmplitudes);
    return () => cancelAnimationFrame(animationFrame);
  }, []);

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
        className="fixed inset-0 glow-center breath pointer-events-none blend-screen"
        style={{ zIndex: 5 }}
        animate={{
          opacity: isIdle ? 0.8 : 0.4,
        }}
        transition={{ duration: 3 }}
      />
      
      {/* Ambient waveform visualization */}
      <motion.div 
        className="fixed inset-0 flex items-center justify-center pointer-events-none blend-screen"
        style={{ zIndex: 10 }}
        animate={{
          opacity: isIdle ? 0.1 : 0.05,
        }}
        transition={{ duration: 3 }}
      >
        <div className="flex gap-1 items-end">
          {waveformAmplitudes.map((amplitude, i) => (
            <motion.div
              key={i}
              className="w-1 bg-primary/30 rounded-full"
              animate={{
                height: `${amplitude * 60 + 20}px`,
              }}
              transition={{
                duration: 0.2,
                ease: 'easeOut',
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* The Listener - living presence */}
      <div className="fixed inset-0 pointer-events-none blend-lighten" style={{ zIndex: 20 }}>
        <TheListener 
          state={listenerState} 
          waveformAmplitudes={waveformAmplitudes}
          keystrokePulse={keystrokePulse}
        />
      </div>

      <PlayerBar version={currentVersion} countdown={countdown} />
      
      <motion.div
        style={{ zIndex: 40 }}
        animate={{
          opacity: isIdle ? 0.7 : 1,
        }}
        transition={{ duration: 2 }}
      >
        <PromptSection 
          onTyping={setIsTyping}
          onSubmit={handleSubmit}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeystroke={handleKeystroke}
        />
      </motion.div>

      <div style={{ zIndex: 40 }}>
        <AIDirectionPanel />
      </div>
      
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

      <Colophon />
    </div>
  );
};

export default Index;
