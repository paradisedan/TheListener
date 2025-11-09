import { X, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Version } from '@/data/mockData';

interface VersionDrawerProps {
  version: Version | null;
  isOpen: boolean;
  onClose: () => void;
}

export function VersionDrawer({ version, isOpen, onClose }: VersionDrawerProps) {
  if (!isOpen || !version) return null;

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/95 backdrop-blur-md z-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-background border-l border-border/20 z-50 drift-up">
        <div className="h-full flex flex-col">
          <div className="p-8 border-b border-border/10 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-serif font-light">Version {version.number}</h2>
              <p className="text-xs opacity-30 font-sans mt-2 tracking-wider uppercase flex items-center gap-2">
                <Clock className="h-3 w-3" />
                {formatDate(version.timestamp)}
              </p>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              className="rounded-none border-0 hover:bg-transparent hover:opacity-60"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-8">
            <h3 className="text-xs tracking-widest uppercase opacity-30 mb-6 font-sans">Changes</h3>
            <div className="space-y-4">
              {version.changes.map((change, index) => (
                <div
                  key={index}
                  className="py-3 border-b border-border/10 last:border-0"
                >
                  <p className="text-sm font-light leading-relaxed opacity-70">{change}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
