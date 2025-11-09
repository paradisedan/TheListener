import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface PromptSectionProps {
  onTyping?: (isTyping: boolean) => void;
  onSubmit?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onKeystroke?: () => void;
}

export function PromptSection({ onTyping, onSubmit, onFocus, onBlur, onKeystroke }: PromptSectionProps) {
  const [prompt, setPrompt] = useState('');
  const [isDissolving, setIsDissolving] = useState(false);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

  const handleSubmit = () => {
    if (prompt.trim()) {
      setIsDissolving(true);
      onSubmit?.();
      
      setTimeout(() => {
        toast.success('we hear you', {
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
        onTyping?.(false);
      }, 1500);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isDissolving) {
      handleSubmit();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isDissolving && e.key.length === 1) {
      // Create ripple effect at center of input for keystrokes
      const rect = e.currentTarget.getBoundingClientRect();
      const newRipple = {
        id: Date.now(),
        x: rect.width / 2,
        y: rect.height / 2,
      };
      setRipples((prev) => [...prev, newRipple]);
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
      }, 800);
      
      // Notify parent of keystroke
      onKeystroke?.();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 2, delay: 0.5 }}
        className="text-6xl md:text-7xl lg:text-8xl font-serif font-light text-center mb-16 leading-tight glow-text"
        style={{ letterSpacing: '0.1em', textShadow: '0 0 40px hsl(168 95% 82% / 0.2)' }}
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
              className="absolute inset-0 pointer-events-none flex items-center justify-center"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, y: -60, filter: 'blur(12px)' }}
              transition={{ duration: 1.5 }}
            >
              {prompt.split('').map((char, i) => (
                <motion.span
                  key={i}
                  className="text-2xl font-light"
                  initial={{ opacity: 1, y: 0 }}
                  exit={{ 
                    opacity: 0, 
                    y: -40 - Math.random() * 20,
                    x: (Math.random() - 0.5) * 30,
                    scale: 0.8,
                    filter: 'blur(4px)'
                  }}
                  transition={{ duration: 1.5, delay: i * 0.02 }}
                >
                  {char}
                </motion.span>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Keystroke ripples */}
        <AnimatePresence>
          {ripples.map((ripple) => (
            <motion.div
              key={ripple.id}
              className="absolute pointer-events-none rounded-full border border-primary/20"
              style={{
                left: ripple.x,
                top: ripple.y,
              }}
              initial={{ width: 0, height: 0, opacity: 0.6 }}
              animate={{ width: 100, height: 100, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          ))}
        </AnimatePresence>
        
        <input
          type="text"
          value={isDissolving ? '' : prompt}
          onChange={(e) => {
            if (!isDissolving) {
              setPrompt(e.target.value);
              onTyping?.(e.target.value.length > 0);
            }
          }}
          onFocus={() => onFocus?.()}
          onBlur={() => onBlur?.()}
          onKeyPress={handleKeyPress}
          onKeyDown={handleKeyDown}
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
