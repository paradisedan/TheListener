import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';

interface AIDirectionPanelProps {
  direction: string;
}

export function AIDirectionPanel({ direction }: AIDirectionPanelProps) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 3, delay: 2 }}
      className="fixed bottom-24 left-0 right-0 px-8"
    >
      <div className="container mx-auto max-w-4xl">
        <div className="flex flex-col items-center gap-4 text-center">
          <motion.div 
            animate={{ opacity: [0.2, 0.3, 0.2] }}
            transition={{ duration: 6, repeat: Infinity }}
            className="flex items-center gap-2"
          >
            <Brain className="h-3 w-3 opacity-20" />
            <span className="text-xs font-mono tracking-widest opacity-20">
              system reflection
            </span>
          </motion.div>
          
          <motion.p 
            key={direction}
            initial={{ opacity: 0, filter: 'blur(4px)' }}
            animate={{ opacity: 0.5, filter: 'blur(0px)' }}
            exit={{ opacity: 0, filter: 'blur(4px)' }}
            transition={{ duration: 2 }}
            className="text-lg md:text-xl font-light leading-relaxed max-w-2xl"
          >
            {direction}
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
}
