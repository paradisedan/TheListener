import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface TheListenerProps {
  state: 'idle' | 'typing' | 'submitting' | 'rebirth' | 'dormant';
  waveformAmplitude?: number;
}

export function TheListener({ state, waveformAmplitude = 0 }: TheListenerProps) {
  const [breathPhase, setBreathPhase] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setBreathPhase((prev) => (prev + 0.1) % (Math.PI * 2));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const baseOpacity = state === 'dormant' ? 0.05 : 0.12;
  const breathAmount = Math.sin(breathPhase) * 0.05;
  const earTilt = state === 'typing' ? -5 : 0;
  const earFlicker = waveformAmplitude * 0.5;

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center pointer-events-none"
      style={{ zIndex: 5 }}
      animate={
        state === 'idle' || state === 'dormant'
          ? {
              opacity: [baseOpacity, baseOpacity + 0.08, baseOpacity],
              scale: [1, 1.03, 1],
            }
          : state === 'typing'
          ? {
              opacity: baseOpacity + 0.08,
              scale: 1.02,
            }
          : state === 'submitting'
          ? {
              opacity: [baseOpacity, 0.5, baseOpacity],
              scale: [1, 1.08, 1],
              filter: ['blur(22px)', 'blur(35px)', 'blur(22px)'],
            }
          : state === 'rebirth'
          ? {
              opacity: [0, 1, 0, baseOpacity],
              scale: [1, 1.15, 1.15, 1],
              filter: ['blur(22px)', 'blur(0px)', 'blur(50px)', 'blur(22px)'],
            }
          : {}
      }
      transition={
        state === 'submitting'
          ? { duration: 0.6, ease: 'easeInOut' }
          : state === 'rebirth'
          ? { duration: 4, ease: 'easeInOut', times: [0, 0.2, 0.6, 1] }
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
          filter: 'blur(22px)',
        }}
      >
        {/* Left ear - waveform reactive */}
        <motion.path
          d="M 200 400 Q 150 200 180 50 Q 190 20 200 50 Q 220 180 220 350"
          stroke="hsl(168 95% 82%)"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          animate={{
            d: [
              "M 200 400 Q 150 200 180 50 Q 190 20 200 50 Q 220 180 220 350",
              `M 200 400 Q ${150 + earTilt} 200 ${180 + earTilt} ${50 + earFlicker * 20} Q ${190 + earTilt} 20 200 50 Q 220 180 220 350`,
              "M 200 400 Q 150 200 180 50 Q 190 20 200 50 Q 220 180 220 350",
            ],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{ duration: 2, ease: 'easeInOut', repeat: Infinity }}
        />

        {/* Right ear - waveform reactive */}
        <motion.path
          d="M 400 400 Q 450 200 420 50 Q 410 20 400 50 Q 380 180 380 350"
          stroke="hsl(168 95% 82%)"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          animate={{
            d: [
              "M 400 400 Q 450 200 420 50 Q 410 20 400 50 Q 380 180 380 350",
              `M 400 400 Q ${450 - earTilt} 200 ${420 - earTilt} ${50 + earFlicker * 20} Q ${410 - earTilt} 20 400 50 Q 380 180 380 350`,
              "M 400 400 Q 450 200 420 50 Q 410 20 400 50 Q 380 180 380 350",
            ],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{ duration: 2, ease: 'easeInOut', repeat: Infinity }}
        />

        {/* Head outline */}
        <motion.ellipse
          cx="300"
          cy="450"
          rx="120"
          ry="140"
          stroke="hsl(168 95% 82%)"
          strokeWidth="3"
          fill="none"
          animate={{
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, ease: 'easeInOut', repeat: Infinity }}
        />

        {/* Inner glow */}
        <motion.ellipse
          cx="300"
          cy="450"
          rx="100"
          ry="120"
          fill="hsl(168 95% 82%)"
          animate={{
            opacity: [0.05, 0.12, 0.05],
          }}
          transition={{ duration: 6, ease: 'easeInOut', repeat: Infinity }}
        />

        {/* Outer glow */}
        <ellipse
          cx="300"
          cy="450"
          rx="160"
          ry="180"
          fill="hsl(168 95% 82%)"
          opacity="0.03"
        />
      </svg>
    </motion.div>
  );
}
