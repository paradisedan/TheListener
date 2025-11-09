import { useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export function PromptSection() {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = () => {
    if (prompt.trim()) {
      toast.success('Your idea has been submitted! 🎵');
      setPrompt('');
    }
  };

  return (
    <div className="mb-8">
      <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
        What should the song do next?
      </h2>
      
      <div className="relative">
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Add more bass, change the tempo, add vocals, make it dreamier..."
          className="min-h-[120px] pr-14 resize-none bg-card border-border focus:border-primary transition-all glow-effect text-base"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
              handleSubmit();
            }
          }}
        />
        <Button
          onClick={handleSubmit}
          disabled={!prompt.trim()}
          size="icon"
          className="absolute bottom-3 right-3 rounded-full glow-effect"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
      
      <p className="text-xs text-muted-foreground text-center mt-2">
        Press <kbd className="px-2 py-0.5 rounded bg-muted">Ctrl</kbd> + <kbd className="px-2 py-0.5 rounded bg-muted">Enter</kbd> to submit
      </p>
    </div>
  );
}
