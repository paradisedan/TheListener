import { Brain } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface AIDirectionPanelProps {
  direction: string;
}

export function AIDirectionPanel({ direction }: AIDirectionPanelProps) {
  return (
    <Card className="p-6 bg-card border-border/50 glow-effect mb-8">
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
          <Brain className="h-6 w-6 text-primary animate-pulse-glow" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
            AI is Listening...
            <span className="text-xs text-muted-foreground font-normal">(analyzing community input)</span>
          </h3>
          <p className="text-muted-foreground leading-relaxed">{direction}</p>
        </div>
      </div>
    </Card>
  );
}
