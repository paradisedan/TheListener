import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PlayerBar } from '@/components/PlayerBar';
import { PromptSection } from '@/components/PromptSection';
import { AIDirectionPanel } from '@/components/AIDirectionPanel';
import { DriftingContributors } from '@/components/DriftingContributors';
import { MixHistory } from '@/components/MixHistory';
import { VersionDrawer } from '@/components/VersionDrawer';
import { useCountdown } from '@/hooks/useCountdown';
import {
  mockUsers,
  mockComments,
  mockVersions,
  aiDirection,
  getRandomComment,
  Comment,
  Version,
} from '@/data/mockData';

const Index = () => {
  const [comments, setComments] = useState<Comment[]>(mockComments);
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
  const [isIdle, setIsIdle] = useState(false);
  const countdown = useCountdown();
  const currentVersion = mockVersions.length;

  // Handle idle state
  useEffect(() => {
    let idleTimer: NodeJS.Timeout;

    const resetIdle = () => {
      setIsIdle(false);
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => setIsIdle(true), 30000); // 30s
    };

    window.addEventListener('mousemove', resetIdle);
    window.addEventListener('keydown', resetIdle);
    window.addEventListener('click', resetIdle);

    idleTimer = setTimeout(() => setIsIdle(true), 30000);

    return () => {
      clearTimeout(idleTimer);
      window.removeEventListener('mousemove', resetIdle);
      window.removeEventListener('keydown', resetIdle);
      window.removeEventListener('click', resetIdle);
    };
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
        }}
        transition={{ duration: 3 }}
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

      <PlayerBar version={currentVersion} countdown={countdown} />
      
      <motion.div
        animate={{
          opacity: isIdle ? 0 : 1,
        }}
        transition={{ duration: 2 }}
      >
        <PromptSection />
      </motion.div>

      <AIDirectionPanel direction={aiDirection} />
      
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
