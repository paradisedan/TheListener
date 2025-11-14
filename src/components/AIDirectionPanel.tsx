import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

const POETIC_PHRASES = [
  'we are awake.',
  'we breathe.',
  'we wait.',
  'we are listening.',
  'the silence grows heavy.',
  'we hear you.',
];

export function AIDirectionPanel() {
  const [currentPhrase, setCurrentPhrase] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPhrase((prev) => (prev + 1) % POETIC_PHRASES.length);
    }, 75000); // 75 seconds

    return () => clearInterval(interval);
  }, []);
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 3, delay: 2 }}
      className="fixed bottom-16 md:bottom-24 left-0 right-0 px-4 md:px-8"
    >
      <div className="container mx-auto max-w-4xl">
        <div className="flex flex-col items-center gap-4 text-center">
          <AnimatePresence mode="wait">
            <motion.p 
              key={currentPhrase}
              initial={{ opacity: 0, filter: 'blur(4px)' }}
              animate={{ opacity: 0.4, filter: 'blur(0px)' }}
              exit={{ opacity: 0, filter: 'blur(4px)' }}
              transition={{ duration: 3 }}
              className="text-sm md:text-base font-mono tracking-wider leading-relaxed max-w-2xl px-4"
              style={{ letterSpacing: '0.15em' }}
            >
              {POETIC_PHRASES[currentPhrase]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
