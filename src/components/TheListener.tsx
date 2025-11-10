import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface TheListenerProps {
  state: 'idle' | 'focused' | 'typing' | 'submitting' | 'rebirth' | 'dormant';
  waveformAmplitudes?: number[];
  keystrokePulse?: number;
  whisperGlow?: number;
  audioPlaying?: boolean;
  audioMuted?: boolean;
  audioEventGlow?: number;
}

export function TheListener({ 
  state, 
  waveformAmplitudes = [], 
  keystrokePulse = 0, 
  whisperGlow = 0,
  audioPlaying = false,
  audioMuted = false,
  audioEventGlow = 0,
}: TheListenerProps) {
  const [breathPhase, setBreathPhase] = useState(0);
  const [whisperGlowActive, setWhisperGlowActive] = useState(0);
  const [audioGlowActive, setAudioGlowActive] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setBreathPhase((prev) => (prev + 0.1) % (Math.PI * 2));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Handle whisper glow trigger
  useEffect(() => {
    if (whisperGlow > 0) {
      setWhisperGlowActive(0.1); // +10% boost
      setTimeout(() => setWhisperGlowActive(0), 300);
    }
  }, [whisperGlow]);

  // Handle audio event glow trigger
  useEffect(() => {
    if (audioEventGlow > 0) {
      setAudioGlowActive(0.08); // +8% boost for play
      setTimeout(() => setAudioGlowActive(0), 500);
    }
  }, [audioEventGlow]);

  // Calculate ear flicker from outer waveform bars
  const getEarFlicker = () => {
    if (waveformAmplitudes.length === 0) return 0;
    const leftBars = waveformAmplitudes.slice(0, 5);
    const rightBars = waveformAmplitudes.slice(35, 40);
    const avgAmplitude = [...leftBars, ...rightBars].reduce((a, b) => a + b, 0) / 10;
    return avgAmplitude * 1.2;
  };

  const baseOpacity = state === 'dormant' ? 0.05 : 0.12;
  const breathAmount = Math.sin(breathPhase) * 0.05;
  const earTilt = state === 'typing' || state === 'focused' ? -3 : 0;
  const earFlicker = getEarFlicker();
  const keystrokeBoost = keystrokePulse * 0.15;
  const audioBoost = audioPlaying ? 0.08 : 0;
  const muteOpacity = audioMuted ? 0.4 : 1;

  // Generate particles for rebirth burst
  const particles = Array.from({ length: 14 }, (_, i) => ({
    id: i,
    angle: (i * 360) / 14,
    distance: 280 + Math.random() * 60,
    delay: i * 0.04,
    size: 14 + Math.random() * 8,
  }));

  return (
    <>
      {/* Main Listener Container */}
      <motion.div
        className="fixed inset-0 flex items-center justify-center pointer-events-none"
        style={{ zIndex: 5 }}
        animate={
          state === 'idle' || state === 'dormant'
            ? {
                opacity: [(baseOpacity + audioBoost + audioGlowActive) * muteOpacity, (baseOpacity + 0.08 + audioBoost + audioGlowActive) * muteOpacity, (baseOpacity + audioBoost + audioGlowActive) * muteOpacity],
                scale: [1, 1.03, 1],
              }
            : state === 'focused'
            ? {
                opacity: (baseOpacity + 0.1 + audioBoost + audioGlowActive) * muteOpacity,
                scale: 1.04,
                filter: 'blur(20px)',
              }
            : state === 'typing'
            ? {
                opacity: (baseOpacity + 0.12 + keystrokeBoost + audioBoost + audioGlowActive) * muteOpacity,
                scale: 1.05 + keystrokeBoost * 0.3,
                filter: 'blur(19px)',
              }
            : state === 'submitting'
            ? {
                opacity: [baseOpacity * muteOpacity, 0.7 * muteOpacity, 0.6 * muteOpacity, baseOpacity * muteOpacity],
                scale: [1, 1.12, 1.1, 1],
                filter: ['blur(22px)', 'blur(8px)', 'blur(10px)', 'blur(22px)'],
              }
            : state === 'rebirth'
            ? {
                opacity: [0, 0.95, 0.85, 0, baseOpacity * muteOpacity],
                scale: [0.95, 1.6, 1.65, 1.3, 1],
                filter: [
                  'blur(28px) hue-rotate(0deg) drop-shadow(0 0 0px hsl(168 95% 82%))', 
                  'blur(20px) hue-rotate(30deg) brightness(1.9) drop-shadow(0 0 80px hsl(168 95% 82%))', 
                  'blur(22px) hue-rotate(60deg) brightness(1.7) drop-shadow(0 0 60px hsl(168 95% 82%))',
                  'blur(36px) hue-rotate(0deg) drop-shadow(0 0 20px hsl(168 95% 82%))',
                  'blur(22px)'
                ],
              }
            : {}
        }
        transition={
          state === 'submitting'
            ? { duration: 1.4, ease: 'easeInOut', times: [0, 0.3, 0.6, 1] }
            : state === 'rebirth'
            ? { duration: 4, ease: 'easeInOut', times: [0, 0.28, 0.55, 0.85, 1] }
            : state === 'focused'
            ? { duration: 0.4, ease: 'easeOut' }
            : state === 'typing'
            ? { duration: 0.5, ease: 'easeInOut' }
            : { duration: 10, ease: 'easeInOut', repeat: Infinity }
        }
      >
        <svg
          width="600"
          height="800"
          viewBox="0 0 600 800"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            filter: state === 'rebirth' ? 'none' : 'blur(22px)',
          }}
        >
          {/* Left ear - waveform reactive */}
          <motion.path
            d="M 200 400 Q 150 200 180 50 Q 190 20 200 50 Q 220 180 220 350"
            stroke={state === 'rebirth' ? "hsl(168 100% 90%)" : "hsl(168 95% 82%)"}
            strokeWidth={state === 'rebirth' ? "6" : "4"}
            fill="none"
            strokeLinecap="round"
            animate={
              state === 'rebirth'
                ? {
                    opacity: [0, 0.95, 0.9, 0, 0.4],
                  }
                : whisperGlowActive > 0
                ? {
                    d: `M 200 400 Q ${150 + earTilt} 200 ${180 + earTilt} ${50 + earFlicker * 20} Q ${190 + earTilt} 20 200 50 Q 220 180 220 350`,
                    opacity: 0.7,
                  }
                : {
                    d: [
                      "M 200 400 Q 150 200 180 50 Q 190 20 200 50 Q 220 180 220 350",
                      `M 200 400 Q ${150 + earTilt} 200 ${180 + earTilt} ${50 + earFlicker * 20} Q ${190 + earTilt} 20 200 50 Q 220 180 220 350`,
                      "M 200 400 Q 150 200 180 50 Q 190 20 200 50 Q 220 180 220 350",
                    ],
                    opacity: [0.4, 0.6, 0.4],
                  }
            }
            transition={
              state === 'rebirth'
                ? { duration: 4, ease: 'easeInOut', times: [0, 0.25, 0.5, 0.8, 1] }
                : whisperGlowActive > 0
                ? { duration: 0.15, ease: 'easeOut' }
                : { duration: 2, ease: 'easeInOut', repeat: Infinity }
            }
          />

          {/* Right ear - waveform reactive */}
          <motion.path
            d="M 400 400 Q 450 200 420 50 Q 410 20 400 50 Q 380 180 380 350"
            stroke={state === 'rebirth' ? "hsl(168 100% 90%)" : "hsl(168 95% 82%)"}
            strokeWidth={state === 'rebirth' ? "6" : "4"}
            fill="none"
            strokeLinecap="round"
            animate={
              state === 'rebirth'
                ? {
                    opacity: [0, 0.95, 0.9, 0, 0.4],
                  }
                : whisperGlowActive > 0
                ? {
                    d: `M 400 400 Q ${450 - earTilt} 200 ${420 - earTilt} ${50 + earFlicker * 20} Q ${410 - earTilt} 20 400 50 Q 380 180 380 350`,
                    opacity: 0.7,
                  }
                : {
                    d: [
                      "M 400 400 Q 450 200 420 50 Q 410 20 400 50 Q 380 180 380 350",
                      `M 400 400 Q ${450 - earTilt} 200 ${420 - earTilt} ${50 + earFlicker * 20} Q ${410 - earTilt} 20 400 50 Q 380 180 380 350`,
                      "M 400 400 Q 450 200 420 50 Q 410 20 400 50 Q 380 180 380 350",
                    ],
                    opacity: [0.4, 0.6, 0.4],
                  }
            }
            transition={
              state === 'rebirth'
                ? { duration: 4, ease: 'easeInOut', times: [0, 0.25, 0.5, 0.8, 1] }
                : whisperGlowActive > 0
                ? { duration: 0.15, ease: 'easeOut' }
                : { duration: 2, ease: 'easeInOut', repeat: Infinity }
            }
          />

          {/* Head outline */}
          <motion.ellipse
            cx="300"
            cy="450"
            rx="120"
            ry="140"
            stroke={state === 'rebirth' ? "hsl(168 100% 90%)" : "hsl(168 95% 82%)"}
            strokeWidth={state === 'rebirth' ? "5" : "3"}
            fill="none"
            animate={
              state === 'rebirth'
                ? {
                    opacity: [0, 0.8, 0.75, 0, 0.3],
                  }
                : {
                    opacity: [0.3, 0.5, 0.3],
                  }
            }
            transition={
              state === 'rebirth'
                ? { duration: 4, ease: 'easeInOut', times: [0, 0.25, 0.5, 0.8, 1] }
                : { duration: 8, ease: 'easeInOut', repeat: Infinity }
            }
          />

          {/* Inner glow */}
          <motion.ellipse
            cx="300"
            cy="450"
            rx="100"
            ry="120"
            fill={state === 'rebirth' ? "hsl(168 100% 90%)" : "hsl(168 95% 82%)"}
            animate={
              state === 'rebirth'
                ? {
                    opacity: [0, 0.5, 0.45, 0, 0.05],
                  }
                : {
                    opacity: [0.05 + whisperGlowActive, 0.12 + whisperGlowActive, 0.05 + whisperGlowActive],
                  }
            }
            transition={
              state === 'rebirth'
                ? { duration: 4, ease: 'easeInOut', times: [0, 0.25, 0.5, 0.8, 1] }
                : { duration: 6, ease: 'easeInOut', repeat: Infinity }
            }
          />

          {/* Outer glow */}
          <motion.ellipse
            cx="300"
            cy="450"
            rx="160"
            ry="180"
            fill={state === 'rebirth' ? "hsl(168 100% 90%)" : "hsl(168 95% 82%)"}
            animate={
              state === 'rebirth'
                ? {
                    opacity: [0, 0.25, 0.2, 0, 0.03],
                  }
                : {
                    opacity: 0.03,
                  }
            }
            transition={
              state === 'rebirth'
                ? { duration: 4, ease: 'easeInOut', times: [0, 0.25, 0.5, 0.8, 1] }
                : {}
            }
          />
        </svg>
      </motion.div>
    </>
  );
}
