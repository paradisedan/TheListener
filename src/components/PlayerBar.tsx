import { motion } from 'framer-motion';

interface PlayerBarProps {
  version: number;
  countdown: string;
}

export function PlayerBar({ version, countdown }: PlayerBarProps) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2 }}
      className="fixed top-0 left-0 right-0 z-50 pt-8 px-8"
    >
      <div className="container mx-auto flex items-center justify-between">
        <motion.div 
          className="font-mono text-xs opacity-30 tracking-wider"
          animate={{ opacity: [0.3, 0.4, 0.3] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          v{version}
        </motion.div>
        
        <motion.div 
          className="font-mono text-sm opacity-40 tracking-widest flicker"
        >
          next emergence in {countdown}
        </motion.div>
      </div>
    </motion.div>
  );
}
