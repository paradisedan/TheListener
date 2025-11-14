import { useEffect } from 'react';
import { AudioController } from '@/lib/audio';

interface UseKeyboardControlsProps {
  audioController: AudioController | null;
  onTogglePlay: () => void;
  onVolumeChange?: (volume: number) => void;
  onMuteChange?: (muted: boolean) => void;
}

export function useKeyboardControls({
  audioController,
  onTogglePlay,
  onVolumeChange,
  onMuteChange,
}: UseKeyboardControlsProps) {
  useEffect(() => {
    if (!audioController) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (e.key) {
        case ' ':
          e.preventDefault();
          onTogglePlay();
          break;

        case 'ArrowLeft':
          e.preventDefault();
          audioController.skip(-5);
          break;

        case 'ArrowRight':
          e.preventDefault();
          audioController.skip(5);
          break;

        case 'ArrowUp':
          e.preventDefault();
          audioController.adjustVolume(0.1);
          onVolumeChange?.(audioController.getVolume());
          break;

        case 'ArrowDown':
          e.preventDefault();
          audioController.adjustVolume(-0.1);
          onVolumeChange?.(audioController.getVolume());
          break;

        case 'm':
        case 'M':
          e.preventDefault();
          audioController.toggleMute();
          onMuteChange?.(audioController.isMuted());
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [audioController, onTogglePlay, onVolumeChange, onMuteChange]);
}
