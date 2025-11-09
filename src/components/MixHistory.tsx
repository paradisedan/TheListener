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
    <div className="border-t border-border/10 bg-background/90 backdrop-blur-sm py-6 px-6">
      <div className="container mx-auto">
        <div className="flex items-center gap-4 mb-4">
          <GitBranch className="h-3 w-3 opacity-20" />
          <h3 className="text-xs tracking-widest uppercase opacity-30 font-sans">Evolution</h3>
        </div>
        
        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          {versions.map((version) => (
            <button
              key={version.number}
              onClick={() => onVersionClick(version)}
              className={`px-3 py-1.5 text-xs font-light transition-opacity ${
                version.number === currentVersion
                  ? 'opacity-100 border-b border-foreground/30'
                  : 'opacity-30 hover:opacity-60'
              }`}
            >
              v{version.number}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
