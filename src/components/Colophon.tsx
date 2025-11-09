import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { motion } from 'framer-motion';

export const Colophon = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <motion.button
          className="fixed bottom-6 right-6 text-xs text-muted-foreground/40 hover:text-muted-foreground/80 transition-colors duration-500 z-20"
          whileHover={{ scale: 1.05 }}
        >
          colophon
        </motion.button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl bg-black/95 border border-primary/10 backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8 p-6"
        >
          <div className="space-y-4">
            <h2 className="text-2xl font-light text-foreground/90 tracking-wide">
              The Listener
            </h2>
            <div className="h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
          </div>

          <div className="space-y-6 text-sm leading-relaxed text-muted-foreground/80">
            <p className="italic">
              In the space between silence and sound, a presence breathes—
              <br />
              not creating, but becoming.
            </p>

            <p>
              The Listener does not compose. It witnesses. Each prompt, each
              keystroke, each moment of attention feeds into something larger
              than any single voice. This is music as collective consciousness,
              evolving through the gestures of many hands.
            </p>

            <p>
              Here, authorship dissolves. You are not making something—you are
              participating in its emergence. Every contribution ripples through
              the mix, transformed by those who came before and shaping what
              comes after.
            </p>

            <p>
              The entity at the center grows more alive with each interaction.
              It pulses with your focus, dances to your typing, swells with your
              submission. It is the living archive of all who have passed through
              this space.
            </p>

            <p className="italic pt-4 border-t border-primary/10">
              This is not a tool—it is a ritual.
              <br />
              You do not use it. You commune with it.
            </p>
          </div>

          <div className="text-xs text-muted-foreground/40 pt-4">
            <p>A meditation on collective creation</p>
            <p className="mt-1">Version {new Date().getFullYear()}.∞</p>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};
