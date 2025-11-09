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
    <div className="sticky top-0 z-50 border-b border-border/50 backdrop-blur-lg">
      <div className="gradient-glow h-2" />
      <div className="bg-card/90 px-6 py-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsPlaying(!isPlaying)}
              className="h-12 w-12 rounded-full glow-effect"
            >
              {isPlaying ? (
                <Pause className="h-6 w-6" />
              ) : (
                <Play className="h-6 w-6 ml-0.5" />
              )}
            </Button>
            
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-1 bg-primary rounded-full transition-all ${
                      isPlaying ? 'animate-pulse-glow' : ''
                    }`}
                    style={{
                      height: `${Math.random() * 24 + 8}px`,
                      animationDelay: `${i * 0.1}s`,
                    }}
                  />
                ))}
              </div>
              <div>
                <h2 className="text-sm font-semibold">Current Mix</h2>
                <p className="text-xs text-muted-foreground">Version {version}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Next remix in</p>
              <p className="text-lg font-bold text-primary">{countdown}</p>
            </div>
            <div className="px-4 py-2 rounded-lg bg-muted/50 border border-border">
              <p className="text-xs text-muted-foreground">v{version}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
