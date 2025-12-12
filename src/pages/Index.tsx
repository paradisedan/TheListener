import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayerBar, TrackVersion } from '@/components/PlayerBar';
import { PromptSection } from '@/components/PromptSection';
import { AIDirectionPanel } from '@/components/AIDirectionPanel';
import { Whispers } from '@/components/Whispers';
import { MixHistory } from '@/components/MixHistory';
import { VersionDrawer } from '@/components/VersionDrawer';
import { TheListener } from '@/components/TheListener';
import { Colophon } from '@/components/Colophon';
import { AudioStartOverlay } from '@/components/AudioStartOverlay';
import { WaveformScrubber } from '@/components/WaveformScrubber';
import { WaveformControls } from '@/components/WaveformControls';
import { useKeyboardControls } from '@/hooks/useKeyboardControls';
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

// Track versions with audio sources
const TRACK_VERSIONS: TrackVersion[] = [
  { version: 1, name: 'Suspended State', src: '/audio/v1.mp3' },
  { version: 2, name: 'More Weight', src: '/audio/v2.mp3' },
  { version: 3, name: 'More Space', src: '/audio/v3.mp3' },
  { version: 4, name: 'Emergence', src: '/audio/v4.mp3' },
];

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
  const [isMuted, setIsMuted] = useState(false);
  const [audioEventGlow, setAudioEventGlow] = useState(0);
  const [rebirthTrigger, setRebirthTrigger] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(() => 
    typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('hasInteracted') === 'true' : false
  );
  const [controlsVisible, setControlsVisible] = useState(false);
  const [currentTrackVersion, setCurrentTrackVersion] = useState<TrackVersion>(TRACK_VERSIONS[3]); // v4 default
  const [versionFlash, setVersionFlash] = useState(0);
  const countdownData = useCountdown();
  const countdown = countdownData.display;
  const countdownMs = countdownData.remainingMs;
  const currentVersion = mockVersions.length;

  // Handle idle state and listener state
  useEffect(() => {
    let idleTimer: NodeJS.Timeout;
    let controlsTimer: NodeJS.Timeout;

    const resetIdle = () => {
      setIsIdle(false);
      setControlsVisible(true);
      
      if (!isTyping) {
        setListenerState(prev => prev === 'rebirth' || prev === 'submitting' ? prev : 'idle');
      }
      
      clearTimeout(idleTimer);
      clearTimeout(controlsTimer);
      
      idleTimer = setTimeout(() => {
        setIsIdle(true);
        setListenerState(prev => prev === 'rebirth' || prev === 'submitting' ? prev : 'dormant');
      }, 60000); // 60s for dormant

      // Hide controls after 3s of inactivity
      controlsTimer = setTimeout(() => {
        setControlsVisible(false);
      }, 3000);
    };

    window.addEventListener('mousemove', resetIdle);
    window.addEventListener('keydown', resetIdle);
    window.addEventListener('click', resetIdle);
    window.addEventListener('touchstart', resetIdle);

    idleTimer = setTimeout(() => {
      setIsIdle(true);
      setListenerState(prev => prev === 'rebirth' || prev === 'submitting' ? prev : 'dormant');
    }, 60000);

    controlsTimer = setTimeout(() => {
      setControlsVisible(false);
    }, 3000);

    return () => {
      clearTimeout(idleTimer);
      clearTimeout(controlsTimer);
      window.removeEventListener('mousemove', resetIdle);
      window.removeEventListener('keydown', resetIdle);
      window.removeEventListener('click', resetIdle);
      window.removeEventListener('touchstart', resetIdle);
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

  const handleAudioStart = async () => {
    setAudioNeedsStart(false);
    setHasInteracted(true);
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('hasInteracted', 'true');
    }
    await audioController?.play();
    setIsPlaying(true);
  };

  const handlePlayToggle = () => {
    if (!audioController) return;
    audioController.togglePlay();
  };

  const handleMuteToggle = () => {
    if (!audioController) return;
    audioController.toggleMute();
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

  // Handle track version change
  const handleVersionChange = async (trackVersion: TrackVersion) => {
    if (!audioController) return;
    setCurrentTrackVersion(trackVersion);
    setVersionFlash(prev => prev + 1);
    await audioController.setSource(trackVersion.src);
  };

  // Initialize audio controller
  useEffect(() => {
    const controller = createAudioController({
      src: currentTrackVersion.src,
      startMuted: false,
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

  // Keyboard controls
  useKeyboardControls({
    audioController,
    onTogglePlay: handlePlayToggle,
    onVolumeChange: () => {
      // Volume changes handled by audioController
    },
    onMuteChange: (muted) => {
      setIsMuted(muted);
    },
  });

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Audio start overlay */}
      <AnimatePresence>
        {audioNeedsStart && !hasInteracted && <AudioStartOverlay onStart={handleAudioStart} />}
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
        versionFlash={versionFlash}
        onSeek={handleSeek}
        onPlayToggle={handlePlayToggle}
      />

      {/* Waveform controls (play/pause, mute, volume) */}
      {audioController && (
        <WaveformControls
          audioController={audioController}
          isVisible={controlsVisible}
          isPlaying={isPlaying}
          isMuted={isMuted}
          onTogglePlay={handlePlayToggle}
          onToggleMute={handleMuteToggle}
        />
      )}

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

      <PlayerBar 
        version={currentVersion} 
        countdown={countdown} 
        onForceEmergence={handleForceEmergence}
        versions={TRACK_VERSIONS}
        currentVersion={currentTrackVersion.version}
        onVersionChange={handleVersionChange}
      />
      
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
