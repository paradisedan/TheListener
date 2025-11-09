import { motion } from 'framer-motion';
import { Version } from '@/data/mockData';

interface MixHistoryProps {
  versions: Version[];
  onVersionClick: (version: Version) => void;
}

export function MixHistory({ versions, onVersionClick }: MixHistoryProps) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2, delay: 2 }}
      className="fixed bottom-8 left-8"
    >
      <button
        onClick={() => onVersionClick(versions[versions.length - 1])}
        className="text-xs font-mono tracking-wider opacity-20 hover:opacity-40 transition-opacity duration-700"
      >
        view past evolutions
      </button>
    </motion.div>
  );
}
