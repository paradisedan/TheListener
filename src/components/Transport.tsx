import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward } from 'lucide-react';
import { AudioController } from '@/lib/audio';

interface TransportProps {
  audioController: AudioController;
  className?: string;
}

export function Transport({ audioController, className = '' }: TransportProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [hideTimer, setHideTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsPlaying(audioController.isPlaying());
    setIsMuted(audioController.isMuted());
  }, [audioController]);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (hideTimer) clearTimeout(hideTimer);
  };

  const handleMouseLeave = () => {
    const timer = setTimeout(() => setIsHovered(false), 1500);
    setHideTimer(timer);
  };

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  const isVisible = isHovered || isFocused;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const prefersReducedTransparency = window.matchMedia('(prefers-reduced-transparency: reduce)').matches;

  return (
    <motion.div
      className={`fixed bottom-[20%] left-1/2 -translate-x-1/2 flex items-center gap-4 ${className}`}
      style={{ zIndex: 50 }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? (prefersReducedTransparency ? 1 : 0.6) : 0 }}
      transition={{ duration: prefersReducedMotion ? 0 : 1, ease: 'easeInOut' }}
    >
      {/* Skip Back */}
      <button
        onClick={() => audioController.skip(-5)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className="transport-button text-primary hover:text-primary/80 focus-visible:text-primary/80"
        aria-label="Skip backward 5 seconds"
        aria-keyshortcuts="ArrowLeft"
      >
        <SkipBack size={20} />
      </button>

      {/* Play/Pause */}
      <button
        onClick={() => {
          audioController.togglePlay();
          setIsPlaying(!isPlaying);
        }}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className="transport-button text-primary hover:text-primary/80 focus-visible:text-primary/80"
        aria-label={isPlaying ? 'Pause' : 'Play'}
        aria-pressed={isPlaying}
        aria-keyshortcuts="Space"
      >
        {isPlaying ? <Pause size={24} /> : <Play size={24} />}
      </button>

      {/* Skip Forward */}
      <button
        onClick={() => audioController.skip(5)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className="transport-button text-primary hover:text-primary/80 focus-visible:text-primary/80"
        aria-label="Skip forward 5 seconds"
        aria-keyshortcuts="ArrowRight"
      >
        <SkipForward size={20} />
      </button>

      {/* Mute */}
      <button
        onClick={() => {
          audioController.toggleMute();
          setIsMuted(!isMuted);
        }}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className="transport-button text-primary hover:text-primary/80 focus-visible:text-primary/80 ml-2"
        aria-label={isMuted ? 'Unmute' : 'Mute'}
        aria-pressed={isMuted}
        aria-keyshortcuts="m"
      >
        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
      </button>
    </motion.div>
  );
}
