import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { AudioController } from '@/lib/audio';

interface WaveformScrubberProps {
  audioController: AudioController | null;
  waveformAmplitudes: number[];
  isIdle: boolean;
  versionFlash?: number;
  onSeek?: () => void;
  onPlayToggle?: () => void;
}

export function WaveformScrubber({
  audioController,
  waveformAmplitudes,
  isIdle,
  versionFlash = 0,
  onSeek,
  onPlayToggle,
}: WaveformScrubberProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [playheadPosition, setPlayheadPosition] = useState(0);
  const [hoverPosition, setHoverPosition] = useState<number | null>(null);
  const [dragStartX, setDragStartX] = useState<number | null>(null);
  const [dragPosition, setDragPosition] = useState<number | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const DRAG_THRESHOLD = 5; // pixels

  // Handle version flash
  useEffect(() => {
    if (versionFlash > 0) {
      setIsFlashing(true);
      const timer = setTimeout(() => setIsFlashing(false), 600);
      return () => clearTimeout(timer);
    }
  }, [versionFlash]);


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
    e.preventDefault(); // Prevent text selection
    setDragStartX(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const percentage = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setHoverPosition(percentage * 100);

    // Check if we've moved enough to start dragging
    if (dragStartX !== null && !isDragging) {
      const distance = Math.abs(e.clientX - dragStartX);
      if (distance > DRAG_THRESHOLD) {
        setIsDragging(true);
      }
    }

    if (isDragging) {
      setDragPosition(percentage * 100);
      handleScrub(e.clientX);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragStartX(null);
    setDragPosition(null);
  };

  const handleMouseLeave = () => {
    setHoverPosition(null);
    if (isDragging) {
      setIsDragging(false);
      setDragPosition(null);
    }
    setDragStartX(null);
  };

  const handleClick = (e: React.MouseEvent) => {
    // Only toggle play if it was a click, not a drag
    if (dragStartX !== null) {
      const distance = Math.abs(e.clientX - dragStartX);
      if (distance <= DRAG_THRESHOLD) {
        onPlayToggle?.();
      }
    }
    setDragStartX(null);
  };

  const handleInteractionStart = () => {
    setIsHovered(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
  };

  const handleInteractionEnd = () => {
    const timer = setTimeout(() => setIsHovered(false), 1500);
    hideTimerRef.current = timer;
  };

  useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseMove = (e: MouseEvent) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const percentage = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        setDragPosition(percentage * 100);
        handleScrub(e.clientX);
      };
      const handleGlobalMouseUp = () => {
        setIsDragging(false);
        setDragPosition(null);
      };

      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);

      return () => {
        window.removeEventListener('mousemove', handleGlobalMouseMove);
        window.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [isDragging]);

  useEffect(() => {
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  const isActive = isHovered || isDragging;

  return (
    <div className="relative py-4 md:py-5">
      {/* Subtle glow backdrop */}
      <motion.div 
        className="absolute inset-0 -z-10 blur-xl pointer-events-none"
        animate={{
          opacity: isFlashing ? 1 : 1,
          scale: isFlashing ? 1.2 : 1,
        }}
        transition={{ duration: isFlashing ? 0.15 : 0.4 }}
        style={{
          background: isFlashing 
            ? 'radial-gradient(ellipse at center, rgba(255,255,255,0.25) 0%, transparent 70%)'
            : 'radial-gradient(ellipse at center, rgba(255,255,255,0.06) 0%, transparent 70%)',
        }}
      />
      
      <motion.div
        className="fixed inset-0 flex items-center justify-center pointer-events-none"
        style={{ zIndex: 10 }}
        animate={{
          opacity: isIdle ? 0.25 : 0.15,
        }}
        transition={{ duration: 2 }}
      >
        <div
          ref={containerRef}
          className={`relative flex gap-0.5 md:gap-1 items-end select-none pointer-events-auto min-h-[44px] max-w-xl md:max-w-2xl ${
            isDragging ? 'cursor-grabbing' : isActive ? 'cursor-grab' : 'cursor-pointer'
          }`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onMouseEnter={handleInteractionStart}
          onTouchStart={handleInteractionStart}
          onTouchEnd={handleInteractionEnd}
          onClick={handleClick}
        >
          {waveformAmplitudes.map((amplitude, i) => {
            const baseOpacity = isFlashing ? 0.95 : (isActive || isDragging ? 0.7 : 0.25);
            const barOpacity = Math.max(0.05, amplitude * baseOpacity);
            
            return (
              <motion.div
                key={i}
                className="w-0.5 md:w-1 bg-primary rounded-full"
                animate={{
                  height: `${amplitude * 50 + 16}px`,
                  opacity: barOpacity,
                  scaleY: isFlashing ? 1.15 : 1,
                }}
                transition={{
                  duration: isFlashing ? 0.1 : (isDragging ? 0 : (isActive ? 0.25 : 0.3)),
                  ease: 'easeOut',
                }}
              />
            );
          })}

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
          {hoverPosition !== null && !isDragging && (
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-primary/40"
              style={{
                left: `${hoverPosition}%`,
                pointerEvents: 'none',
              }}
            />
          )}

          {/* Drag caret */}
          {dragPosition !== null && isDragging && (
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-white/80 pointer-events-none"
              style={{
                left: `${dragPosition}%`,
              }}
            />
          )}
        </div>
      </motion.div>
    </div>
  );
}
