import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface PlayerBarProps {
  version: number;
  countdown: string;
  onForceEmergence?: () => void;
}

export function PlayerBar({ version, countdown, onForceEmergence }: PlayerBarProps) {
  const [prevMinute, setPrevMinute] = useState('');
  const [isMinuteChange, setIsMinuteChange] = useState(false);

  useEffect(() => {
    const currentMinute = countdown.slice(0, 5); // Get HH:MM part
    
    if (prevMinute && currentMinute !== prevMinute) {
      setIsMinuteChange(true);
      setTimeout(() => setIsMinuteChange(false), 2000);
    }
    
    setPrevMinute(currentMinute);
  }, [countdown, prevMinute]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2 }}
      className="fixed top-0 left-0 right-0 z-50 pt-4 px-4 md:pt-8 md:px-8"
    >
      <div className="container mx-auto flex items-center justify-between">
        <motion.div 
          className="font-mono text-[10px] md:text-xs opacity-30 tracking-wider"
          animate={{ opacity: [0.3, 0.4, 0.3] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          v{version}
        </motion.div>
        
        <div className="flex flex-col items-end gap-1 md:gap-2">
          <motion.div 
            className="font-mono text-xs md:text-sm tracking-wider md:tracking-widest flicker"
            animate={{
              opacity: isMinuteChange ? [0.4, 0.1, 0.4] : 0.4,
            }}
            transition={{
              duration: isMinuteChange ? 2 : 0,
              ease: 'easeInOut',
            }}
          >
            next emergence in {countdown}
          </motion.div>

          {onForceEmergence && (
            <motion.button
              onClick={onForceEmergence}
              className="font-mono text-xs tracking-wider opacity-20 hover:opacity-40 transition-opacity duration-300 border-b border-white/10 hover:border-white/30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.2 }}
              transition={{ delay: 1, duration: 2 }}
            >
              force emergence
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
