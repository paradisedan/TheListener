import { motion } from 'framer-motion';

interface AudioStartOverlayProps {
  onStart: () => void;
}

export function AudioStartOverlay({ onStart }: AudioStartOverlayProps) {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 bg-black/80 flex items-center justify-center cursor-pointer"
      style={{ zIndex: 100 }}
      onClick={(e) => {
        e.currentTarget.style.pointerEvents = 'none';
        onStart();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.currentTarget.style.pointerEvents = 'none';
          onStart();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label="Start audio playback"
    >
      <motion.div
        animate={{
          opacity: [0.6, 0.8, 0.6],
        }}
        transition={{
          duration: 2,
          ease: 'easeInOut',
          repeat: Infinity,
        }}
        className="font-mono text-xs tracking-widest opacity-60 text-center"
      >
        tap anywhere to begin listening
      </motion.div>
    </motion.div>
  );
}
