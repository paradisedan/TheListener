type AudioEventCallback = () => void;
type AudioSeekCallback = (time: number) => void;
type AudioMuteCallback = (muted: boolean) => void;
type AudioVolumeCallback = (volume: number) => void;

interface AudioEvents {
  onPlay?: AudioEventCallback;
  onPause?: AudioEventCallback;
  onSeek?: AudioSeekCallback;
  onMute?: AudioMuteCallback;
  onVolumeChange?: AudioVolumeCallback;
}

export interface AudioController {
  play(): Promise<void>;
  pause(): void;
  togglePlay(): void;
  seek(timeSeconds: number): void;
  skip(seconds: number): void;
  setVolume(volume: number): void;
  adjustVolume(delta: number): void;
  mute(muted: boolean): void;
  toggleMute(): void;
  getCurrentTime(): number;
  getDuration(): number;
  getAnalyserData(): Uint8Array;
  isPlaying(): boolean;
  isMuted(): boolean;
  getVolume(): number;
  setSource(src: string): Promise<void>;
  cleanup(): void;
}

interface AudioControllerConfig extends AudioEvents {
  src?: string;
  loop?: boolean;
  startMuted?: boolean;
}

export function createAudioController(config: AudioControllerConfig = {}): AudioController {
  const {
    src,
    loop = true,
    startMuted = true,
    onPlay,
    onPause,
    onSeek,
    onMute,
    onVolumeChange,
  } = config;

  let audioContext: AudioContext | null = null;
  let audioElement: HTMLAudioElement | null = null;
  let gainNode: GainNode | null = null;
  let analyserNode: AnalyserNode | null = null;
  let sourceNode: MediaElementAudioSourceNode | null = null;
  let analyserData = new Uint8Array(64);
  
  let currentVolume = 0.7;
  let currentMuted = startMuted;
  let playing = false;

  // Initialize audio context and nodes
  const initAudio = async () => {
    if (audioContext) return;

    audioContext = new AudioContext();
    audioElement = new Audio();
    
    if (src) {
      audioElement.src = src;
    } else {
      // Mock silent audio for testing
      audioElement.src = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAAABkYXRhAAAAAA==';
    }

    audioElement.loop = loop;
    audioElement.muted = startMuted;
    audioElement.volume = currentVolume;

    // Create audio graph: source -> gain -> analyser -> destination
    sourceNode = audioContext.createMediaElementSource(audioElement);
    gainNode = audioContext.createGain();
    analyserNode = audioContext.createAnalyser();
    
    analyserNode.fftSize = 128;
    analyserData = new Uint8Array(analyserNode.frequencyBinCount);

    sourceNode.connect(gainNode);
    gainNode.connect(analyserNode);
    analyserNode.connect(audioContext.destination);

    gainNode.gain.value = startMuted ? 0 : currentVolume;
  };

  const controller: AudioController = {
    async play() {
      await initAudio();
      
      if (!audioContext || !audioElement || !gainNode) return;

      // Resume audio context if suspended (autoplay policy)
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      // Sync audio element muted state
      audioElement.muted = currentMuted;

      const targetGain = currentMuted ? 0 : currentVolume;
      gainNode.gain.setTargetAtTime(targetGain, audioContext.currentTime, 0.1);

      await audioElement.play();
      playing = true;
      onPlay?.();
    },

    pause() {
      if (!audioElement || !gainNode || !audioContext) return;

      // Smooth ramp down (200ms)
      gainNode.gain.setTargetAtTime(0, audioContext.currentTime, 0.07);

      setTimeout(() => {
        audioElement?.pause();
        playing = false;
        onPause?.();
      }, 200);
    },

    togglePlay() {
      if (playing) {
        controller.pause();
      } else {
        controller.play();
      }
    },

    seek(timeSeconds: number) {
      if (!audioElement) return;
      
      const duration = audioElement.duration;
      if (isNaN(duration)) return;

      audioElement.currentTime = Math.max(0, Math.min(timeSeconds, duration));
      onSeek?.(audioElement.currentTime);
    },

    skip(seconds: number) {
      if (!audioElement) return;
      controller.seek(audioElement.currentTime + seconds);
    },

    setVolume(volume: number) {
      currentVolume = Math.max(0, Math.min(1, volume));
      
      if (!gainNode || !audioContext || currentMuted) return;
      
      // Smooth volume ramp over 100-150ms
      const now = audioContext.currentTime;
      gainNode.gain.cancelScheduledValues(now);
      gainNode.gain.linearRampToValueAtTime(currentVolume, now + 0.1);
      onVolumeChange?.(currentVolume);
    },

    adjustVolume(delta: number) {
      controller.setVolume(currentVolume + delta);
    },

    mute(muted: boolean) {
      currentMuted = muted;
      
      if (audioElement) {
        audioElement.muted = muted;
      }
      
      if (!gainNode || !audioContext) return;

      const targetGain = muted ? 0 : currentVolume;
      gainNode.gain.setTargetAtTime(targetGain, audioContext.currentTime, 0.05);
      
      onMute?.(muted);
    },

    toggleMute() {
      controller.mute(!currentMuted);
    },

    getCurrentTime() {
      return audioElement?.currentTime || 0;
    },

    getDuration() {
      return audioElement?.duration || 0;
    },

    getAnalyserData() {
      if (analyserNode) {
        analyserNode.getByteFrequencyData(analyserData);
      }
      return analyserData;
    },

    isPlaying() {
      return playing;
    },

    isMuted() {
      return currentMuted;
    },

    getVolume() {
      return currentVolume;
    },

    async setSource(newSrc: string) {
      await initAudio();
      
      if (!audioElement || !audioContext || !gainNode) return;
      
      const wasPlaying = playing;
      const currentTime = audioElement.currentTime;
      
      // Fade out
      gainNode.gain.setTargetAtTime(0, audioContext.currentTime, 0.05);
      
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // Change source
      audioElement.src = newSrc;
      audioElement.load();
      
      // Wait for audio to be ready
      await new Promise<void>((resolve) => {
        const onCanPlay = () => {
          audioElement?.removeEventListener('canplay', onCanPlay);
          resolve();
        };
        audioElement?.addEventListener('canplay', onCanPlay);
      });
      
      // Resume if was playing
      if (wasPlaying) {
        audioElement.muted = currentMuted;
        await audioElement.play();
        playing = true;
        const targetGain = currentMuted ? 0 : currentVolume;
        gainNode.gain.setTargetAtTime(targetGain, audioContext.currentTime, 0.1);
      }
    },

    cleanup() {
      if (audioElement) {
        audioElement.pause();
        audioElement.src = '';
      }
      if (sourceNode) {
        sourceNode.disconnect();
      }
      if (gainNode) {
        gainNode.disconnect();
      }
      if (analyserNode) {
        analyserNode.disconnect();
      }
      if (audioContext) {
        audioContext.close();
      }
    },
  };

  return controller;
}
