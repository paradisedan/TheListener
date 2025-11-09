import { GitBranch } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Version } from '@/data/mockData';

interface MixHistoryProps {
  versions: Version[];
  currentVersion: number;
  onVersionClick: (version: Version) => void;
}

export function MixHistory({ versions, currentVersion, onVersionClick }: MixHistoryProps) {
  return (
    <div className="border-t border-border/50 bg-card/50 backdrop-blur-lg py-4 px-6">
      <div className="container mx-auto">
        <div className="flex items-center gap-3 mb-3">
          <GitBranch className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-muted-foreground">Mix History</h3>
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {versions.map((version) => (
            <button
              key={version.number}
              onClick={() => onVersionClick(version)}
              className="group"
            >
              <Badge
                variant={version.number === currentVersion ? 'default' : 'outline'}
                className={`px-4 py-2 cursor-pointer transition-all ${
                  version.number === currentVersion
                    ? 'glow-effect bg-primary text-primary-foreground'
                    : 'hover:bg-muted hover:border-primary/50'
                }`}
              >
                v{version.number}
              </Badge>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
