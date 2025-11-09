import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Comment } from '@/data/mockData';

interface CommentStreamProps {
  comments: Comment[];
  onNewComment: (comment: Comment) => void;
}

export function CommentStream({ comments, onNewComment }: CommentStreamProps) {
  const [displayComments, setDisplayComments] = useState(comments);

  useEffect(() => {
    setDisplayComments(comments);
  }, [comments]);

  const formatTimestamp = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <Card className="p-4 bg-card border-border/50 h-[500px] flex flex-col">
      <h3 className="text-lg font-semibold mb-3 flex items-center justify-between">
        Live Feed
        <span className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
      </h3>
      
      <ScrollArea className="flex-1">
        <div className="space-y-3 pr-4">
          {displayComments.map((comment, index) => (
            <div
              key={comment.id}
              className="p-3 rounded-lg bg-muted/30 border border-border/30 hover:border-primary/30 transition-all slide-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-start gap-2 mb-1">
                <span className="text-xl">{comment.user.avatar}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{comment.user.username}</p>
                  <p className="text-xs text-muted-foreground">{formatTimestamp(comment.timestamp)}</p>
                </div>
              </div>
              <p className="text-sm mt-1 ml-7">{comment.message}</p>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
}
