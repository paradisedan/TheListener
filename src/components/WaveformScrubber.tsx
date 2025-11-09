import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { AudioController } from '@/lib/audio';

interface WaveformScrubberProps {
  audioController: AudioController | null;
  waveformAmplitudes: number[];
  isIdle: boolean;
  onSeek?: () => void;
  onPlayToggle?: () => void;
}

export function WaveformScrubber({
  audioController,
  waveformAmplitudes,
  isIdle,
  onSeek,
  onPlayToggle,
}: WaveformScrubberProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [playheadPosition, setPlayheadPosition] = useState(0);
  const [hoverPosition, setHoverPosition] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!audioController || isDragging) return;

    const updatePlayhead = () => {
      const currentTime = audioController.getCurrentTime();
      const duration = audioController.getDuration();
      if (duration > 0) {
        setPlayheadPosition((currentTime / duration) * 100);
      }
    };

    const interval = setInterval(updatePlayhead, 100);
    return () => clearInterval(interval);
  }, [audioController, isDragging]);

  const handleScrub = (clientX: number) => {
    if (!containerRef.current || !audioController) return;

    const rect = containerRef.current.getBoundingClientRect();
    const percentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const duration = audioController.getDuration();
    
    if (duration > 0) {
      audioController.seek(percentage * duration);
      setPlayheadPosition(percentage * 100);
      onSeek?.();
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    handleScrub(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const percentage = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setHoverPosition(percentage * 100);

    if (isDragging) {
      handleScrub(e.clientX);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setHoverPosition(null);
    if (isDragging) {
      setIsDragging(false);
    }
  };

  const handleClick = () => {
    onPlayToggle?.();
  };

  useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseMove = (e: MouseEvent) => {
        handleScrub(e.clientX);
      };
      const handleGlobalMouseUp = () => {
        setIsDragging(false);
      };

      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);

      return () => {
        window.removeEventListener('mousemove', handleGlobalMouseMove);
        window.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [isDragging]);

  return (
    <motion.div
      ref={containerRef}
      className="fixed inset-0 flex items-center justify-center cursor-pointer"
      style={{ zIndex: 10 }}
      animate={{
        opacity: isIdle ? 0.1 : 0.05,
      }}
      transition={{ duration: 3 }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      <div className="relative flex gap-1 items-end">
        {waveformAmplitudes.map((amplitude, i) => (
          <motion.div
            key={i}
            className="w-1 bg-primary/30 rounded-full"
            animate={{
              height: `${amplitude * 60 + 20}px`,
              opacity: isDragging ? 0.4 : 1,
            }}
            transition={{
              duration: isDragging ? 0 : 0.2,
              ease: 'easeOut',
            }}
          />
        ))}

        {/* Playhead */}
        {audioController && (
          <div
            className="playhead bg-primary opacity-80"
            style={{
              position: 'absolute',
              left: `${playheadPosition}%`,
              top: 0,
              bottom: 0,
              width: '2px',
              pointerEvents: 'none',
              opacity: isDragging ? 1 : 0.8,
            }}
          />
        )}

        {/* Hover indicator */}
        {hoverPosition !== null && (
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-primary/40"
            style={{
              left: `${hoverPosition}%`,
              pointerEvents: 'none',
            }}
          />
        )}
      </div>
    </motion.div>
  );
}
