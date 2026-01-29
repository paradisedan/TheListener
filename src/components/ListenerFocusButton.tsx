import { motion } from 'framer-motion';

interface ListenerFocusButtonProps {
  onClick: () => void;
  isVisible: boolean;
}

export function ListenerFocusButton({ onClick, isVisible }: ListenerFocusButtonProps) {
  if (!isVisible) return null;

  return (
    <motion.button
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.4 }}
      whileHover={{ opacity: 0.8 }}
      transition={{ duration: 0.5 }}
      onClick={onClick}
      className="fixed bottom-6 right-6 z-50 px-3 py-1.5 text-xs font-mono tracking-widest text-primary/60 border border-primary/20 rounded-full backdrop-blur-sm bg-black/20 hover:border-primary/40 hover:text-primary transition-all duration-300 cursor-pointer"
    >
      the listener
    </motion.button>
  );
}
