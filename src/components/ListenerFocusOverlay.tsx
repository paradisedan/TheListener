import { motion, AnimatePresence } from 'framer-motion';
import { TheListener } from './TheListener';

interface ListenerFocusOverlayProps {
  isActive: boolean;
  onClose: () => void;
  listenerState: 'idle' | 'focused' | 'typing' | 'submitting' | 'rebirth' | 'dormant';
  waveformAmplitudes: number[];
  bassAmplitude: number;
  audioPlaying: boolean;
  audioMuted: boolean;
}

export function ListenerFocusOverlay({
  isActive,
  onClose,
  listenerState,
  waveformAmplitudes,
  bassAmplitude,
  audioPlaying,
  audioMuted,
}: ListenerFocusOverlayProps) {
  return (
    <AnimatePresence>
      {isActive && (
        <>
          {/* Trippy fractal background */}
          <motion.div
            className="fixed inset-0 z-[100] cursor-pointer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            onClick={onClose}
          >
            {/* Base dark layer */}
            <div className="absolute inset-0 bg-black" />
            
            {/* Animated fractal-like gradient layers */}
            <motion.div
              className="absolute inset-0"
              animate={{
                background: [
                  'radial-gradient(ellipse 80% 60% at 50% 50%, hsl(168 95% 82% / 0.08) 0%, transparent 60%)',
                  'radial-gradient(ellipse 100% 80% at 45% 55%, hsl(168 95% 82% / 0.12) 0%, transparent 70%)',
                  'radial-gradient(ellipse 70% 90% at 55% 45%, hsl(168 95% 82% / 0.1) 0%, transparent 65%)',
                  'radial-gradient(ellipse 80% 60% at 50% 50%, hsl(168 95% 82% / 0.08) 0%, transparent 60%)',
                ],
              }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* Secondary pulsing layer */}
            <motion.div
              className="absolute inset-0"
              animate={{
                background: [
                  'radial-gradient(circle at 30% 70%, hsl(168 80% 70% / 0.05) 0%, transparent 40%)',
                  'radial-gradient(circle at 70% 30%, hsl(168 80% 70% / 0.08) 0%, transparent 45%)',
                  'radial-gradient(circle at 40% 40%, hsl(168 80% 70% / 0.06) 0%, transparent 50%)',
                  'radial-gradient(circle at 30% 70%, hsl(168 80% 70% / 0.05) 0%, transparent 40%)',
                ],
              }}
              transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* Fractal-like rings - bass reactive */}
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute inset-0 flex items-center justify-center"
                style={{ transform: 'translateY(12vh)' }}
              >
                <motion.div
                  className="rounded-full border border-primary/10"
                  animate={{
                    width: [
                      `${200 + i * 120 + bassAmplitude * 100}px`,
                      `${220 + i * 120 + bassAmplitude * 120}px`,
                      `${200 + i * 120 + bassAmplitude * 100}px`,
                    ],
                    height: [
                      `${200 + i * 120 + bassAmplitude * 100}px`,
                      `${220 + i * 120 + bassAmplitude * 120}px`,
                      `${200 + i * 120 + bassAmplitude * 100}px`,
                    ],
                    opacity: [0.05 - i * 0.008, 0.1 - i * 0.015, 0.05 - i * 0.008],
                    rotate: [0, i % 2 === 0 ? 15 : -15, 0],
                  }}
                  transition={{
                    duration: 4 + i * 0.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: i * 0.2,
                  }}
                  style={{
                    boxShadow: `0 0 ${30 + bassAmplitude * 50}px hsl(168 95% 82% / ${0.03 + bassAmplitude * 0.05})`,
                  }}
                />
              </motion.div>
            ))}

            {/* Noise/grain texture overlay */}
            <motion.div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
              }}
              animate={{ opacity: [0.02, 0.04, 0.02] }}
              transition={{ duration: 3, repeat: Infinity }}
            />

            {/* Blur vignette edges */}
            <div 
              className="absolute inset-0"
              style={{
                background: 'radial-gradient(ellipse 70% 60% at 50% 50%, transparent 0%, rgba(0,0,0,0.4) 100%)',
              }}
            />
          </motion.div>

          {/* Enlarged Listener */}
          <motion.div
            className="fixed inset-0 z-[101] flex items-center justify-center pointer-events-none"
            style={{ transform: 'translateY(5vh)' }}
            initial={{ scale: 1, opacity: 0 }}
            animate={{ scale: 1.8, opacity: 1 }}
            exit={{ scale: 1, opacity: 0 }}
            transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
          >
            <TheListener
              state={audioPlaying ? 'idle' : 'dormant'}
              waveformAmplitudes={waveformAmplitudes}
              bassAmplitude={bassAmplitude}
              keystrokePulse={0}
              whisperGlow={0}
              audioPlaying={audioPlaying}
              audioMuted={audioMuted}
              audioEventGlow={0}
            />
          </motion.div>

          {/* Exit hint */}
          <motion.p
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[102] text-xs font-mono tracking-widest text-primary/30"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 1.5, duration: 0.8 }}
          >
            click anywhere to return
          </motion.p>
        </>
      )}
    </AnimatePresence>
  );
}
