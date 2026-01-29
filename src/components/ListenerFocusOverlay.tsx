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
  bassAmplitude: rawBassAmplitude,
  audioPlaying,
  audioMuted,
}: ListenerFocusOverlayProps) {
  // Guard against undefined/NaN values
  const bassAmplitude = Number.isFinite(rawBassAmplitude) ? rawBassAmplitude : 0;
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

            {/* KICK DRUM PULSE - central explosive glow */}
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ transform: 'translateY(12vh)' }}
            >
              <div
                className="rounded-full"
                style={{
                  width: `${350 + bassAmplitude * 800}px`,
                  height: `${350 + bassAmplitude * 800}px`,
                  background: `radial-gradient(circle, hsl(168 95% 82% / ${0.2 + bassAmplitude * 0.5}) 0%, hsl(168 95% 82% / ${0.08 + bassAmplitude * 0.2}) 35%, transparent 65%)`,
                  boxShadow: `
                    0 0 ${80 + bassAmplitude * 300}px ${40 + bassAmplitude * 150}px hsl(168 95% 82% / ${0.15 + bassAmplitude * 0.4}),
                    0 0 ${160 + bassAmplitude * 400}px ${80 + bassAmplitude * 200}px hsl(168 80% 70% / ${0.08 + bassAmplitude * 0.2}),
                    inset 0 0 ${60 + bassAmplitude * 120}px hsl(168 95% 82% / ${0.15 + bassAmplitude * 0.25})
                  `,
                  transition: 'all 0.04s ease-out',
                }}
              />
            </div>

            {/* Secondary kick pulse ring - expands outward */}
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ transform: 'translateY(12vh)' }}
            >
              <div
                className="rounded-full"
                style={{
                  width: `${150 + bassAmplitude * 1000}px`,
                  height: `${150 + bassAmplitude * 1000}px`,
                  border: `3px solid hsl(168 95% 82% / ${0.1 + bassAmplitude * 0.4})`,
                  boxShadow: `
                    0 0 ${20 + bassAmplitude * 80}px hsl(168 95% 82% / ${0.1 + bassAmplitude * 0.3}),
                    inset 0 0 ${10 + bassAmplitude * 40}px hsl(168 95% 82% / ${0.05 + bassAmplitude * 0.15})
                  `,
                  transition: 'all 0.03s ease-out',
                }}
              />
            </div>

            {/* Tertiary outer ring - even more dramatic expansion */}
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ transform: 'translateY(12vh)' }}
            >
              <div
                className="rounded-full"
                style={{
                  width: `${80 + bassAmplitude * 1200}px`,
                  height: `${80 + bassAmplitude * 1200}px`,
                  border: `2px solid hsl(168 95% 82% / ${bassAmplitude * 0.25})`,
                  boxShadow: `0 0 ${bassAmplitude * 100}px hsl(168 95% 82% / ${bassAmplitude * 0.15})`,
                  transition: 'all 0.025s ease-out',
                }}
              />
            </div>
            
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
              <div
                key={i}
                className="absolute inset-0 flex items-center justify-center"
                style={{ transform: 'translateY(12vh)' }}
              >
                <div
                  className="rounded-full border border-primary/10"
                  style={{
                    width: `${200 + i * 120 + bassAmplitude * 250}px`,
                    height: `${200 + i * 120 + bassAmplitude * 250}px`,
                    opacity: 0.04 + bassAmplitude * 0.2 - i * 0.006,
                    boxShadow: `0 0 ${30 + bassAmplitude * 100}px hsl(168 95% 82% / ${0.04 + bassAmplitude * 0.15})`,
                    transition: 'all 0.06s ease-out',
                  }}
                />
              </div>
            ))}

            {/* Noise/grain texture overlay - intensifies with bass */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                opacity: 0.02 + bassAmplitude * 0.06,
                transition: 'opacity 0.1s ease-out',
              }}
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
