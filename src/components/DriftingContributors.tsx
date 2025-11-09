import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Comment } from '@/data/mockData';

interface DriftingContributorsProps {
  users: User[];
  comments: Comment[];
}

interface DriftingName {
  id: string;
  username: string;
  avatar: string;
  x: number;
  y: number;
  duration: number;
}

export function DriftingContributors({ users, comments }: DriftingContributorsProps) {
  const [visibleNames, setVisibleNames] = useState<DriftingName[]>([]);

  useEffect(() => {
    const addDriftingName = () => {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      
      const newName: DriftingName = {
        id: `${randomUser.id}-${Date.now()}`,
        username: randomUser.username,
        avatar: randomUser.avatar,
        x: Math.random() * 80 + 10, // 10-90%
        y: Math.random() * 60 + 20, // 20-80%
        duration: Math.random() * 3 + 4, // 4-7s
      };

      setVisibleNames(prev => [...prev, newName]);

      // Remove after duration
      setTimeout(() => {
        setVisibleNames(prev => prev.filter(n => n.id !== newName.id));
      }, newName.duration * 1000);
    };

    // Add new name every 8-15 seconds
    const interval = setInterval(() => {
      addDriftingName();
    }, Math.random() * 7000 + 8000);

    // Add initial names
    for (let i = 0; i < 3; i++) {
      setTimeout(() => addDriftingName(), i * 2000);
    }

    return () => clearInterval(interval);
  }, [users]);

  return (
    <div className="fixed inset-0 pointer-events-none z-10">
      <AnimatePresence>
        {visibleNames.map((name) => (
          <motion.div
            key={name.id}
            initial={{ opacity: 0, scale: 0.9, filter: 'blur(4px)' }}
            animate={{ 
              opacity: [0, 0.3, 0.3, 0],
              scale: 1,
              filter: 'blur(0px)',
              x: [0, Math.random() * 20 - 10],
              y: [0, Math.random() * 20 - 10],
            }}
            exit={{ opacity: 0, filter: 'blur(4px)' }}
            transition={{ 
              duration: name.duration,
              ease: 'easeInOut',
            }}
            className="absolute flex items-center gap-2"
            style={{
              left: `${name.x}%`,
              top: `${name.y}%`,
            }}
          >
            <span className="text-base">{name.avatar}</span>
            <span className="text-xs font-light">{name.username}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
