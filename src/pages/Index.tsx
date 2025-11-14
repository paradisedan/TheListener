import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayerBar } from '@/components/PlayerBar';
import { PromptSection } from '@/components/PromptSection';
import { AIDirectionPanel } from '@/components/AIDirectionPanel';
import { Whispers } from '@/components/Whispers';
import { MixHistory } from '@/components/MixHistory';
import { VersionDrawer } from '@/components/VersionDrawer';
import { TheListener } from '@/components/TheListener';
import { Colophon } from '@/components/Colophon';
import { Transport } from '@/components/Transport';
import { AudioStartOverlay } from '@/components/AudioStartOverlay';
import { WaveformScrubber } from '@/components/WaveformScrubber';
import { useCountdown } from '@/hooks/useCountdown';
import { createAudioController, AudioController } from '@/lib/audio';
import {
  mockUsers,
  mockComments,
  mockVersions,
  getRandomComment,
  Comment,
  Version,
} from '@/data/mockData';

const Index = () => {
  const [comments, setComments] = useState<Comment[]>(mockComments);
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
  const [isIdle, setIsIdle] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [keystrokePulse, setKeystrokePulse] = useState(0);
  const [listenerState, setListenerState] = useState<'idle' | 'focused' | 'typing' | 'submitting' | 'rebirth' | 'dormant'>('idle');
  const [waveformAmplitudes, setWaveformAmplitudes] = useState<number[]>(Array(40).fill(0.5));
  const [whisperTrigger, setWhisperTrigger] = useState(0);
  const [audioNeedsStart, setAudioNeedsStart] = useState(true);
  const [audioController, setAudioController] = useState<AudioController | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [audioEventGlow, setAudioEventGlow] = useState(0);
  const [rebirthTrigger, setRebirthTrigger] = useState(0);
  const countdownData = useCountdown();
  const countdown = countdownData.display;
  const countdownMs = countdownData.remainingMs;
  const currentVersion = mockVersions.length;

  // Handle idle state and listener state
  useEffect(() => {
    let idleTimer: NodeJS.Timeout;

    const resetIdle = () => {
      setIsIdle(false);
      if (!isTyping) {
        setListenerState(prev => prev === 'rebirth' || prev === 'submitting' ? prev : 'idle');
      }
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        setIsIdle(true);
        setListenerState(prev => prev === 'rebirth' || prev === 'submitting' ? prev : 'dormant');
      }, 60000); // 60s for dormant
    };

    window.addEventListener('mousemove', resetIdle);
    window.addEventListener('keydown', resetIdle);
    window.addEventListener('click', resetIdle);

    idleTimer = setTimeout(() => {
      setIsIdle(true);
      setListenerState(prev => prev === 'rebirth' || prev === 'submitting' ? prev : 'dormant');
    }, 60000);

    return () => {
      clearTimeout(idleTimer);
      window.removeEventListener('mousemove', resetIdle);
      window.removeEventListener('keydown', resetIdle);
      window.removeEventListener('click', resetIdle);
    };
  }, [isTyping]);

  // Update listener state based on focus and typing
  useEffect(() => {
    if (isTyping) {
      setListenerState(prev => prev === 'rebirth' || prev === 'submitting' ? prev : 'typing');
    } else if (isFocused && !isIdle) {
      setListenerState(prev => prev === 'rebirth' || prev === 'submitting' ? prev : 'focused');
    } else if (!isIdle) {
      setListenerState(prev => prev === 'rebirth' || prev === 'submitting' ? prev : 'idle');
    }
  }, [isTyping, isFocused, isIdle]);

  const handleSubmit = () => {
    setListenerState('submitting');
    setTimeout(() => {
      setListenerState('idle');
    }, 1400);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const handleKeystroke = () => {
    setKeystrokePulse(1);
    setTimeout(() => setKeystrokePulse(0), 500);
  };

  // Update waveform amplitudes
  useEffect(() => {
    let animationFrame: number;
    
    const updateAmplitudes = () => {
      setWaveformAmplitudes(prev => 
        prev.map(() => Math.random() * 0.6 + 0.2)
      );
      animationFrame = requestAnimationFrame(updateAmplitudes);
    };
    
    animationFrame = requestAnimationFrame(updateAmplitudes);
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  // Add new comments periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const newComment = getRandomComment();
      setComments((prev) => [newComment, ...prev.slice(0, 19)]);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const handleVersionClick = (version: Version) => {
    setSelectedVersion(version);
  };

  const handleWhisperAppear = () => {
    setWhisperTrigger(prev => prev + 1);
  };

  const handleAudioStart = () => {
    setAudioNeedsStart(false);
    audioController?.play();
    setIsPlaying(true);
  };

  const handlePlayToggle = () => {
    if (!audioController) return;
    audioController.togglePlay();
    setIsPlaying(audioController.isPlaying());
  };

  const handleSeek = () => {
    // Brief ear pulse on seek
    setAudioEventGlow(prev => prev + 1);
  };

  const handleForceEmergence = () => {
    console.log('🌟 Forcing emergence sequence...');
    setListenerState('rebirth');
    
    // Trigger rebirth whisper message
    setRebirthTrigger(prev => prev + 1);
    
    // Reset to idle after rebirth animation completes (4s duration from TheListener)
    setTimeout(() => {
      setListenerState('idle');
    }, 4000);
  };

  // Initialize audio controller
  useEffect(() => {
    const controller = createAudioController({
      startMuted: true,
      loop: true,
      onPlay: () => {
        setIsPlaying(true);
        // Ears glow +8% for 500ms
        setAudioEventGlow(prev => prev + 1);
      },
      onPause: () => {
        setIsPlaying(false);
        setListenerState(prev => prev === 'typing' || prev === 'focused' || prev === 'rebirth' || prev === 'submitting' ? prev : 'idle');
      },
      onSeek: () => {
        // Brief 300ms ear pulse
        setAudioEventGlow(prev => prev + 1);
      },
      onMute: (muted) => {
        setIsMuted(muted);
      },
    });

    setAudioController(controller);
    return () => controller.cleanup();
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          audioController?.togglePlay();
          setIsPlaying(audioController?.isPlaying() || false);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          audioController?.skip(-5);
          break;
        case 'ArrowRight':
          e.preventDefault();
          audioController?.skip(5);
          break;
        case 'ArrowUp':
          e.preventDefault();
          audioController?.adjustVolume(0.1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          audioController?.adjustVolume(-0.1);
          break;
        case 'm':
        case 'M':
          audioController?.toggleMute();
          setIsMuted(audioController?.isMuted() || false);
          break;
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [audioController]);

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Audio start overlay */}
      <AnimatePresence>
        {audioNeedsStart && <AudioStartOverlay onStart={handleAudioStart} />}
      </AnimatePresence>

      {/* Idle darken overlay */}
      <motion.div 
        className="fixed inset-0 bg-black pointer-events-none"
        style={{ zIndex: 15 }}
        animate={{
          opacity: listenerState === 'rebirth' ? 0 : (isIdle ? 0.5 : 0),
        }}
        transition={{ duration: listenerState === 'rebirth' ? 0.3 : 4 }}
      />
      
      {/* Central glow */}
      <motion.div 
        className="fixed inset-0 glow-center breath pointer-events-none blend-screen"
        style={{ zIndex: 5 }}
        animate={{
          opacity: isIdle ? 0.8 : 0.4,
        }}
        transition={{ duration: 3 }}
      />

      {/* Subtle radial vignette */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{ 
          zIndex: 8,
          background: 'radial-gradient(circle at center, transparent 30%, rgba(0,0,0,0.12) 100%)',
          opacity: 0.15
        }}
      />
      
      {/* Interactive waveform visualization with scrubbing */}
      <WaveformScrubber
        audioController={audioController}
        waveformAmplitudes={waveformAmplitudes}
        isIdle={isIdle}
        onSeek={handleSeek}
        onPlayToggle={handlePlayToggle}
      />

      {/* The Listener - living presence */}
      <div className="fixed inset-0 pointer-events-none blend-lighten" style={{ zIndex: 20 }}>
        <TheListener 
          state={listenerState} 
          waveformAmplitudes={waveformAmplitudes}
          keystrokePulse={keystrokePulse}
          whisperGlow={whisperTrigger}
          audioPlaying={isPlaying}
          audioMuted={isMuted}
          audioEventGlow={audioEventGlow}
        />
      </div>

      {/* Ambient Whispers Layer */}
      <Whispers
        comments={comments}
        countdownMs={countdownMs}
        isIdle={isIdle}
        onWhisperAppear={handleWhisperAppear}
        forceRebirthMessage={rebirthTrigger}
      />

      <PlayerBar version={currentVersion} countdown={countdown} onForceEmergence={handleForceEmergence} />

      {/* Transport controls */}
      {audioController && !audioNeedsStart && (
        <Transport audioController={audioController} />
      )}
      
      <motion.div
        className="pointer-events-auto"
        style={{ zIndex: 40 }}
        animate={{
          opacity: isIdle ? 0.7 : 1,
        }}
        transition={{ duration: 2 }}
      >
        <PromptSection 
          onTyping={setIsTyping}
          onSubmit={handleSubmit}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeystroke={handleKeystroke}
        />
      </motion.div>

      <div style={{ zIndex: 40 }}>
        <AIDirectionPanel comments={comments} countdownMs={countdownMs} />
      </div>
      
      <MixHistory
        versions={mockVersions}
        onVersionClick={handleVersionClick}
      />
      
      <VersionDrawer
        version={selectedVersion}
        isOpen={selectedVersion !== null}
        onClose={() => setSelectedVersion(null)}
      />

      <Colophon />
    </div>
  );
};

export default Index;
