import { motion } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';

interface TheListenerProps {
  state: 'idle' | 'focused' | 'typing' | 'submitting' | 'rebirth' | 'dormant';
  waveformAmplitudes?: number[];
  bassAmplitude?: number;
  keystrokePulse?: number;
  whisperGlow?: number;
  audioPlaying?: boolean;
  audioMuted?: boolean;
  audioEventGlow?: number;
}

export function TheListener({ 
  state, 
  waveformAmplitudes = [], 
  bassAmplitude = 0,
  keystrokePulse = 0, 
  whisperGlow = 0,
  audioPlaying = false,
  audioMuted = false,
  audioEventGlow = 0,
}: TheListenerProps) {
  const [whisperGlowActive, setWhisperGlowActive] = useState(0);
  const [audioGlowActive, setAudioGlowActive] = useState(0);
  const [isWakingUp, setIsWakingUp] = useState(false);
  const [isFallingAsleep, setIsFallingAsleep] = useState(false);
  const prevStateRef = useRef(state);

  // Handle wake-up and falling asleep transitions
  useEffect(() => {
    // Waking up: dormant → any active state
    if (prevStateRef.current === 'dormant' && state !== 'dormant') {
      setIsFallingAsleep(false);
      setIsWakingUp(true);
      const timer = setTimeout(() => setIsWakingUp(false), 800);
      prevStateRef.current = state;
      return () => clearTimeout(timer);
    }
    
    // Falling asleep: any active state → dormant
    if (prevStateRef.current !== 'dormant' && state === 'dormant') {
      setIsWakingUp(false);
      setIsFallingAsleep(true);
      const timer = setTimeout(() => setIsFallingAsleep(false), 1200);
      prevStateRef.current = state;
      return () => clearTimeout(timer);
    }
    
    prevStateRef.current = state;
  }, [state]);

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

  // Bass-reactive ear animation values - dramatically amplified for visibility
  const bassScale = 1 + bassAmplitude * 3; // Ears scale up to 30% with bass
  const bassTilt = bassAmplitude * 150; // Ears tilt up to 15° outward with bass hits
  const bassGlow = bassAmplitude * 4; // Strong glow boost on bass

  const baseOpacity = state === 'dormant' ? 0.15 : 0.50;
  // Dormant: ears droop inward, typing/focused: ears perk outward, otherwise bass-reactive
  const dormantDroop = state === 'dormant' ? 8 : 0; // Ears tilt inward when dormant
  const earTilt = (state === 'typing' || state === 'focused' ? -3 : dormantDroop) + (state === 'dormant' ? 0 : bassTilt);
  const keystrokeBoost = keystrokePulse * 0.15;
  const audioBoost = audioPlaying && state !== 'dormant' ? 0.20 : 0;
  const muteOpacity = audioMuted ? 0.4 : 1;
  const dormantScale = state === 'dormant' ? 0.95 : 1; // Slightly shrink when dormant

  return (
    <>
      {/* Main Listener Container */}
      <motion.div
        className="fixed inset-0 flex items-center justify-center pointer-events-none"
        style={{ zIndex: 5, transform: 'translateY(12vh)' }}
        animate={
          isWakingUp
            ? {
                opacity: [0.15, 0.7, 0.5],
                scale: [0.95, 1.08, 1],
                filter: ['blur(20px)', 'blur(10px)', 'blur(14px)'],
              }
            : isFallingAsleep
            ? {
                opacity: [baseOpacity + audioBoost, baseOpacity * 0.5, baseOpacity * muteOpacity],
                scale: [1, 0.98, dormantScale],
                filter: ['blur(14px)', 'blur(18px)', 'blur(20px)'],
              }
            : state === 'dormant'
            ? {
                opacity: [baseOpacity * muteOpacity, (baseOpacity + 0.03) * muteOpacity, baseOpacity * muteOpacity],
                scale: [dormantScale, dormantScale * 1.01, dormantScale],
                filter: 'blur(20px)',
              }
            : state === 'idle'
            ? {
                opacity: [(baseOpacity + audioBoost + audioGlowActive) * muteOpacity, (baseOpacity + 0.08 + audioBoost + audioGlowActive) * muteOpacity, (baseOpacity + audioBoost + audioGlowActive) * muteOpacity],
                scale: [1, 1.03, 1],
              }
            : state === 'focused'
            ? {
                opacity: (baseOpacity + 0.1 + audioBoost + audioGlowActive) * muteOpacity,
                scale: 1.04,
                filter: 'blur(15px)',
              }
            : state === 'typing'
            ? {
                opacity: (baseOpacity + 0.12 + keystrokeBoost + audioBoost + audioGlowActive) * muteOpacity,
                scale: 1.05 + keystrokeBoost * 0.3,
                filter: 'blur(14px)',
              }
            : state === 'submitting'
            ? {
                opacity: [baseOpacity * muteOpacity, 0.85 * muteOpacity, 0.75 * muteOpacity, baseOpacity * muteOpacity],
                scale: [1, 1.3, 1.25, 1],
                filter: ['blur(14px)', 'blur(5px)', 'blur(7px)', 'blur(14px)'],
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
          isWakingUp
            ? { duration: 0.8, ease: 'easeOut', times: [0, 0.4, 1] }
            : isFallingAsleep
            ? { duration: 1.2, ease: [0.4, 0, 0.2, 1], times: [0, 0.4, 1] }
            : state === 'submitting'
            ? { duration: 1.4, ease: 'easeInOut', times: [0, 0.3, 0.6, 1] }
            : state === 'rebirth'
            ? { duration: 4, ease: 'easeInOut', times: [0, 0.28, 0.55, 0.85, 1] }
            : state === 'dormant'
            ? { duration: 20, ease: 'easeInOut', repeat: Infinity }
            : state === 'focused'
            ? { duration: 0.4, ease: 'easeOut' }
            : state === 'typing'
            ? { duration: 0.5, ease: 'easeInOut' }
            : { duration: 10, ease: 'easeInOut', repeat: Infinity }
        }
      >
        <svg
          viewBox="0 0 600 800"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-[280px] h-[373px] md:w-[350px] md:h-[467px] lg:w-[420px] lg:h-[560px]"
          style={{
            filter: state === 'rebirth' ? 'none' : 'blur(14px)',
          }}
        >
          {/* Left ear - bass reactive */}
          {/* Left ear - bass reactive */}
          <motion.path
            d="M 200 400 Q 150 200 180 50 Q 190 20 200 50 Q 220 180 220 350"
            stroke={state === 'rebirth' ? "hsl(168 100% 90%)" : "hsl(168 95% 82%)"}
            strokeWidth={state === 'rebirth' ? "8" : `${6 + bassAmplitude * 8}`}
            fill="none"
            strokeLinecap="round"
            initial={{ opacity: 0.85 }}
            style={{
              filter: `drop-shadow(0 0 ${8 + bassGlow * 20}px hsl(168 95% 82% / ${0.3 + bassGlow}))`,
            }}
            animate={
              state === 'rebirth'
                ? {
                    opacity: [0, 0.95, 0.9, 0, 0.4],
                    scale: 1,
                  }
                : {
                    d: `M 200 400 Q ${150 - earTilt} 200 ${180 - earTilt} 50 Q ${190 - earTilt} 20 200 50 Q 220 180 220 350`,
                    opacity: 0.85 + bassGlow * 0.15,
                    scale: bassScale,
                  }
            }
            transition={
              state === 'rebirth'
                ? { duration: 4, ease: 'easeInOut', times: [0, 0.25, 0.5, 0.8, 1] }
                : { duration: 0.06, ease: 'easeOut' }
            }
          />

          {/* Right ear - bass reactive */}
          {/* Right ear - bass reactive */}
          <motion.path
            d="M 400 400 Q 450 200 420 50 Q 410 20 400 50 Q 380 180 380 350"
            stroke={state === 'rebirth' ? "hsl(168 100% 90%)" : "hsl(168 95% 82%)"}
            strokeWidth={state === 'rebirth' ? "8" : `${6 + bassAmplitude * 8}`}
            fill="none"
            strokeLinecap="round"
            initial={{ opacity: 0.85 }}
            style={{
              filter: `drop-shadow(0 0 ${8 + bassGlow * 20}px hsl(168 95% 82% / ${0.3 + bassGlow}))`,
            }}
            animate={
              state === 'rebirth'
                ? {
                    opacity: [0, 0.95, 0.9, 0, 0.4],
                    scale: 1,
                  }
                : {
                    d: `M 400 400 Q ${450 + earTilt} 200 ${420 + earTilt} 50 Q ${410 + earTilt} 20 400 50 Q 380 180 380 350`,
                    opacity: 0.85 + bassGlow * 0.15,
                    scale: bassScale,
                  }
            }
            transition={
              state === 'rebirth'
                ? { duration: 4, ease: 'easeInOut', times: [0, 0.25, 0.5, 0.8, 1] }
                : { duration: 0.06, ease: 'easeOut' }
            }
          />

          {/* Head outline - bass reactive */}
          <motion.ellipse
            cx="300"
            cy="450"
            rx="120"
            ry="140"
            stroke={state === 'rebirth' ? "hsl(168 100% 90%)" : "hsl(168 95% 82%)"}
            strokeWidth={state === 'rebirth' ? "6" : `${5 + bassAmplitude * 3}`}
            fill="none"
            initial={{ opacity: 0.6 }}
            style={{
              filter: state === 'rebirth' ? 'none' : `drop-shadow(0 0 ${4 + bassGlow * 10}px hsl(168 95% 82% / ${0.2 + bassGlow * 0.5}))`,
            }}
            animate={
              state === 'rebirth'
                ? {
                    opacity: [0, 0.8, 0.75, 0, 0.3],
                    scale: 1,
                  }
                : {
                    opacity: 0.6 + bassAmplitude * 0.3,
                    scale: 1 + bassAmplitude * 0.08,
                  }
            }
            transition={
              state === 'rebirth'
                ? { duration: 4, ease: 'easeInOut', times: [0, 0.25, 0.5, 0.8, 1] }
                : { duration: 0.08, ease: 'easeOut' }
            }
          />

          {/* Inner glow - bass reactive */}
          <motion.ellipse
            cx="300"
            cy="450"
            rx="100"
            ry="120"
            fill={state === 'rebirth' ? "hsl(168 100% 90%)" : "hsl(168 95% 82%)"}
            initial={{ opacity: 0.05 }}
            animate={
              state === 'rebirth'
                ? {
                    opacity: [0, 0.5, 0.45, 0, 0.05],
                  }
                : {
                    opacity: 0.05 + whisperGlowActive + bassAmplitude * 0.1,
                    scale: 1 + bassAmplitude * 0.05,
                  }
            }
            transition={
              state === 'rebirth'
                ? { duration: 4, ease: 'easeInOut', times: [0, 0.25, 0.5, 0.8, 1] }
                : { duration: 0.08, ease: 'easeOut' }
            }
          />

          {/* Outer glow */}
          <motion.ellipse
            cx="300"
            cy="450"
            rx="160"
            ry="180"
            fill={state === 'rebirth' ? "hsl(168 100% 90%)" : "hsl(168 95% 82%)"}
            initial={{ opacity: 0.03 }}
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
