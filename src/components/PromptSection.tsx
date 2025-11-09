import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export function PromptSection() {
  const [prompt, setPrompt] = useState('');
  const [isDissolving, setIsDissolving] = useState(false);

  const handleSubmit = () => {
    if (prompt.trim()) {
      setIsDissolving(true);
      
      setTimeout(() => {
        toast.success('your words dissolve into the waveform', {
          style: {
            background: 'transparent',
            border: 'none',
            color: 'hsl(168 95% 82%)',
            fontFamily: 'Space Mono, monospace',
            fontSize: '12px',
          }
        });
        setPrompt('');
        setIsDissolving(false);
      }, 1500);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 2, delay: 0.5 }}
        className="text-6xl md:text-7xl lg:text-8xl font-serif font-light text-center mb-16 leading-tight glow-text"
        style={{ letterSpacing: '0.02em' }}
      >
        what should the song do next?
      </motion.h1>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, delay: 1 }}
        className="relative w-full max-w-3xl"
      >
        <AnimatePresence>
          {isDissolving && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, y: -40, filter: 'blur(8px)' }}
              transition={{ duration: 1.5 }}
            >
              <div className="text-2xl font-light opacity-50 text-center">
                {prompt}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <input
          type="text"
          value={isDissolving ? '' : prompt}
          onChange={(e) => !isDissolving && setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !isDissolving) {
              handleSubmit();
            }
          }}
          placeholder="introduce a subtle bassline... shift to minor key..."
          className="w-full bg-transparent border-0 border-b border-foreground/10 focus:border-foreground/30 outline-none text-2xl font-light text-center py-4 px-0 transition-all duration-1000 placeholder:text-muted-foreground/20 placeholder:font-light"
          style={{ caretColor: 'hsl(168 95% 82%)' }}
          disabled={isDissolving}
        />
      </motion.div>
      
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.2 }}
        transition={{ duration: 2, delay: 1.5 }}
        className="text-xs font-mono tracking-widest mt-8"
      >
        press enter to contribute
      </motion.p>
    </div>
  );
}
