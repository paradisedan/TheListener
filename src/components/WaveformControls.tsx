import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward } from 'lucide-react';
import { AudioController } from '@/lib/audio';
import { VolumeSlider } from './VolumeSlider';

interface WaveformControlsProps {
  audioController: AudioController;
  isVisible: boolean;
  isPlaying: boolean;
  isMuted: boolean;
  onTogglePlay: () => void;
  onToggleMute: () => void;
}

export function WaveformControls({ 
  audioController, 
  isVisible, 
  isPlaying,
  isMuted,
  onTogglePlay,
  onToggleMute
}: WaveformControlsProps) {
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hideSliderTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handlePlayPauseClick = () => {
    onTogglePlay();
  };

  const handleMuteMouseDown = () => {
    // Start long-press timer for volume slider
    longPressTimerRef.current = setTimeout(() => {
      setShowVolumeSlider(true);
      if (hideSliderTimerRef.current) clearTimeout(hideSliderTimerRef.current);
    }, 300);
  };

  const handleMuteMouseUp = () => {
    // Clear long-press timer
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    // If slider didn't show, it was a quick tap - toggle mute
    if (!showVolumeSlider) {
      onToggleMute();
    }
  };

  const handleMuteTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    handleMuteMouseDown();
  };

  const handleMuteTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    handleMuteMouseUp();
  };

  const handleVolumeSliderInteraction = () => {
    // Reset hide timer on interaction
    if (hideSliderTimerRef.current) clearTimeout(hideSliderTimerRef.current);
    hideSliderTimerRef.current = setTimeout(() => {
      setShowVolumeSlider(false);
    }, 1500);
  };

  const handleVolumeSliderHide = () => {
    setShowVolumeSlider(false);
    if (hideSliderTimerRef.current) {
      clearTimeout(hideSliderTimerRef.current);
      hideSliderTimerRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
      if (hideSliderTimerRef.current) clearTimeout(hideSliderTimerRef.current);
    };
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 25 }}>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="flex items-center gap-6 md:gap-8 pointer-events-auto"
          >
            {/* Skip Back Button */}
            <button
              onClick={() => audioController.skip(-5)}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-full p-2 transition-transform hover:scale-110"
              aria-label="Skip backward 5 seconds"
              tabIndex={0}
            >
              <SkipBack className="w-5 h-5 md:w-6 md:h-6 text-primary" />
            </button>

            {/* Play/Pause Button */}
            <button
              onClick={handlePlayPauseClick}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-full p-2 transition-transform hover:scale-110"
              aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
              aria-pressed={isPlaying}
              tabIndex={0}
            >
              {isPlaying ? (
                <Pause className="w-7 h-7 md:w-8 md:h-8 text-primary" />
              ) : (
                <Play className="w-7 h-7 md:w-8 md:h-8 text-primary" />
              )}
            </button>

            {/* Skip Forward Button */}
            <button
              onClick={() => audioController.skip(5)}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-full p-2 transition-transform hover:scale-110"
              aria-label="Skip forward 5 seconds"
              tabIndex={0}
            >
              <SkipForward className="w-5 h-5 md:w-6 md:h-6 text-primary" />
            </button>

            {/* Mute Button */}
            <div className="relative">
              <button
                onMouseDown={handleMuteMouseDown}
                onMouseUp={handleMuteMouseUp}
                onMouseLeave={handleMuteMouseUp}
                onTouchStart={handleMuteTouchStart}
                onTouchEnd={handleMuteTouchEnd}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-full p-2 transition-transform hover:scale-110"
                aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
                aria-pressed={isMuted}
                tabIndex={0}
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                ) : (
                  <Volume2 className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                )}
              </button>

              {/* Volume Slider */}
              <VolumeSlider
                audioController={audioController}
                isVisible={showVolumeSlider}
                onInteraction={handleVolumeSliderInteraction}
                onHide={handleVolumeSliderHide}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
