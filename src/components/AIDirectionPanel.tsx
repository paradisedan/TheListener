import { Brain } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface AIDirectionPanelProps {
  direction: string;
}

export function AIDirectionPanel({ direction }: AIDirectionPanelProps) {
  return (
    <div className="py-12 mb-16 border-y border-border/20 max-w-2xl mx-auto">
      <div className="flex items-start gap-6">
        <Brain className="h-4 w-4 text-foreground/30 mt-1 heartbeat-line" />
        <div className="flex-1">
          <h3 className="text-xs tracking-widest uppercase opacity-30 mb-4 font-sans">
            System reflection
          </h3>
          <p className="text-lg font-serif font-light leading-relaxed opacity-70">{direction}</p>
        </div>
      </div>
    </div>
  );
}
