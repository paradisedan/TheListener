import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock } from 'lucide-react';
import { Version } from '@/data/mockData';

interface VersionDrawerProps {
  version: Version | null;
  isOpen: boolean;
  onClose: () => void;
}

export function VersionDrawer({ version, isOpen, onClose }: VersionDrawerProps) {
  if (!version) return null;

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 bg-background/95 backdrop-blur-md z-50"
            onClick={onClose}
          />
          
          {/* Drawer */}
          <motion.div 
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-background border-l border-foreground/5 z-50"
          >
            <div className="h-full flex flex-col p-12">
              <div className="flex items-start justify-between mb-12">
                <div>
                  <h2 className="text-3xl font-serif font-light mb-3">
                    version {version.number}
                  </h2>
                  <p className="text-xs font-mono opacity-20 tracking-wider uppercase flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    {formatDate(version.timestamp)}
                  </p>
                </div>
                <button 
                  onClick={onClose}
                  className="text-foreground/30 hover:text-foreground/60 transition-colors duration-500"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                <h3 className="text-xs font-mono tracking-widest opacity-20 mb-8 uppercase">
                  transformations
                </h3>
                <div className="space-y-6">
                  {version.changes.map((change, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: index * 0.1 }}
                      className="pb-6 border-b border-foreground/5 last:border-0"
                    >
                      <p className="text-sm font-light leading-relaxed opacity-60">
                        {change}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
