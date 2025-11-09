import { useState } from 'react';
import { Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PlayerBarProps {
  version: number;
  countdown: string;
}

export function PlayerBar({ version, countdown }: PlayerBarProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="sticky top-0 z-50">
      <div className="absolute inset-0 gradient-ambient heartbeat-line pointer-events-none" />
      <div className="relative bg-background/80 backdrop-blur-sm px-6 py-8">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsPlaying(!isPlaying)}
              className="h-10 w-10 rounded-none border-0 hover:bg-transparent transition-opacity hover:opacity-70"
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </Button>
            
            <div className="flex items-center gap-6">
              <div className="flex gap-0.5 h-8 items-end">
                {[...Array(16)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-px bg-foreground/20 transition-all duration-1000 ${
                      isPlaying ? 'opacity-100' : 'opacity-30'
                    }`}
                    style={{
                      height: `${Math.random() * 100}%`,
                      transitionDelay: `${i * 0.05}s`,
                    }}
                  />
                ))}
              </div>
              <div>
                <p className="text-xs tracking-wider uppercase opacity-40 font-sans">Current Mix</p>
                <p className="text-sm font-light mt-0.5">Version {version}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="text-right">
              <p className="text-xs tracking-wider uppercase opacity-40 font-sans">Next evolution</p>
              <p className="text-2xl font-serif font-light mt-1 animate-digit-drift">{countdown}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
