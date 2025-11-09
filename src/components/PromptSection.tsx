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
    <div className="mb-16 mt-8">
      <h2 className="text-4xl md:text-5xl font-serif font-light mb-12 text-center tracking-tight leading-tight">
        What should the song do next?
      </h2>
      
      <div className="relative max-w-2xl mx-auto">
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Introduce a subtle bassline... shift to minor key... add layered vocals..."
          className="min-h-[140px] pr-14 resize-none bg-transparent border-0 border-b border-border/30 focus:border-foreground/30 transition-all text-base font-light leading-relaxed placeholder:text-muted-foreground/30 rounded-none px-0"
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
          className="absolute bottom-3 right-0 rounded-none border-0 bg-transparent hover:bg-transparent transition-opacity hover:opacity-60 disabled:opacity-20"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
      
      <p className="text-xs text-muted-foreground/40 text-center mt-6 font-sans tracking-wider uppercase">
        Ctrl + Enter to contribute
      </p>
    </div>
  );
}
