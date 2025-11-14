import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';
import { AudioController } from '@/lib/audio';

interface VolumeSliderProps {
  audioController: AudioController;
  isVisible: boolean;
  onInteraction: () => void;
  onHide: () => void;
}

export function VolumeSlider({ audioController, isVisible, onInteraction, onHide }: VolumeSliderProps) {
  const [volume, setVolume] = useState(70);

  useEffect(() => {
    setVolume(Math.round(audioController.getVolume() * 100));
  }, [audioController]);

  const handleVolumeChange = (values: number[]) => {
    const newVolume = values[0];
    setVolume(newVolume);
    audioController.setVolume(newVolume / 100);
    onInteraction();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
          className="absolute bottom-full right-0 mb-4 bg-background/95 backdrop-blur-sm border border-border/50 rounded-lg p-4 shadow-lg pointer-events-auto"
          style={{ width: '60px' }}
          onMouseMove={onInteraction}
          onTouchMove={onInteraction}
        >
          <div className="flex flex-col items-center gap-3">
            <span className="text-xs font-mono text-muted-foreground">
              {volume}
            </span>
            <Slider
              orientation="vertical"
              value={[volume]}
              onValueChange={handleVolumeChange}
              max={100}
              min={0}
              step={1}
              className="h-24"
              aria-label="Volume"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
