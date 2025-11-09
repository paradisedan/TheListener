import { X, Clock, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-card border-l border-border z-50 animate-slide-in-right">
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Version {version.number}</h2>
              <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                <Clock className="h-3 w-3" />
                {formatDate(version.timestamp)}
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6">
            <h3 className="text-lg font-semibold mb-4">What Changed</h3>
            <div className="space-y-3">
              {version.changes.map((change, index) => (
                <Card
                  key={index}
                  className="p-4 bg-muted/30 border-border/50 hover:border-primary/30 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 p-1 rounded bg-primary/20">
                      <ChevronRight className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-sm flex-1">{change}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
