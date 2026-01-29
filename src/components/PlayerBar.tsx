import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import { Play, Pause } from 'lucide-react';

export interface TrackVersion {
  version: number;
  name: string;
  src: string;
}

interface PlayerBarProps {
  version: number;
  countdown: string;
  onForceEmergence?: () => void;
  versions?: TrackVersion[];
  currentVersion?: number;
  onVersionChange?: (version: TrackVersion) => void;
  isPlaying?: boolean;
  onTogglePlay?: () => void;
}

export function PlayerBar({ 
  version, 
  countdown, 
  onForceEmergence,
  versions = [],
  currentVersion,
  onVersionChange,
  isPlaying = false,
  onTogglePlay
}: PlayerBarProps) {
  const [prevMinute, setPrevMinute] = useState('');
  const [isMinuteChange, setIsMinuteChange] = useState(false);
  const [isVersionOpen, setIsVersionOpen] = useState(false);
  const versionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentMinute = countdown.slice(0, 5); // Get HH:MM part
    
    if (prevMinute && currentMinute !== prevMinute) {
      setIsMinuteChange(true);
      setTimeout(() => setIsMinuteChange(false), 2000);
    }
    
    setPrevMinute(currentMinute);
  }, [countdown, prevMinute]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (versionRef.current && !versionRef.current.contains(e.target as Node)) {
        setIsVersionOpen(false);
      }
    };

    if (isVersionOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isVersionOpen]);

  const hasVersions = versions.length > 0;
  const activeVersion = currentVersion ?? version;
  const activeTrack = versions.find(v => v.version === activeVersion);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2 }}
      className="fixed top-0 left-0 right-0 z-50 pt-4 px-4 md:pt-8 md:px-8"
    >
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Play/Pause button */}
          {onTogglePlay && (
            <motion.button
              onClick={onTogglePlay}
              className="text-white/40 hover:text-white/70 transition-colors duration-300 p-1"
              aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 md:w-5 md:h-5" />
              ) : (
                <Play className="w-4 h-4 md:w-5 md:h-5" />
              )}
            </motion.button>
          )}

          <div ref={versionRef} className="relative">
            <motion.button
              onClick={() => hasVersions && setIsVersionOpen(!isVersionOpen)}
              className={`font-mono text-[10px] md:text-xs tracking-wider flex items-center gap-2 ${hasVersions ? 'cursor-pointer hover:opacity-70' : ''}`}
              animate={{ opacity: [0.3, 0.4, 0.3] }}
              transition={{ duration: 4, repeat: Infinity }}
              disabled={!hasVersions}
            >
              <span>v{activeVersion}</span>
              {activeTrack && (
                <span className="opacity-50 italic">{activeTrack.name}</span>
              )}
            </motion.button>

          <AnimatePresence>
            {isVersionOpen && hasVersions && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full left-0 mt-2 bg-black/90 border border-white/10 rounded-sm backdrop-blur-sm"
              >
                <div className="py-1">
                  {versions.map((v) => (
                    <button
                      key={v.version}
                      onClick={() => {
                        onVersionChange?.(v);
                        setIsVersionOpen(false);
                      }}
                      className={`w-full px-4 py-2 text-left font-mono text-[10px] md:text-xs tracking-wider transition-all duration-200 whitespace-nowrap ${
                        v.version === activeVersion
                          ? 'text-white/80 bg-white/5'
                          : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                      }`}
                    >
                      <span className="mr-3">v{v.version}</span>
                      <span className="opacity-60">{v.name}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-1 md:gap-2">
          <motion.div 
            className="font-mono text-xs md:text-sm tracking-wider md:tracking-widest flicker"
          animate={{
            opacity: isMinuteChange ? [0.6, 0.3, 0.6] : 0.6,
          }}
            transition={{
              duration: isMinuteChange ? 2 : 0,
              ease: 'easeInOut',
            }}
          >
            next emergence in {countdown}
          </motion.div>

          {onForceEmergence && (
            <motion.button
              onClick={onForceEmergence}
              className="font-mono text-xs tracking-wider opacity-30 hover:opacity-60 transition-opacity duration-300 border-b border-white/10 hover:border-white/30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.2 }}
              transition={{ delay: 1, duration: 2 }}
            >
              force emergence
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
