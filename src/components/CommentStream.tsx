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
    <div className="p-0 bg-transparent h-[500px] flex flex-col">
      <h3 className="text-xs tracking-widest uppercase opacity-30 mb-6 font-sans flex items-center justify-between">
        Live Feed
        <span className="w-1 h-1 bg-foreground/30 heartbeat-line" />
      </h3>
      
      <ScrollArea className="flex-1">
        <div className="space-y-6 pr-4">
          {displayComments.map((comment, index) => (
            <div
              key={comment.id}
              className="float-up opacity-0 [animation-fill-mode:forwards]"
              style={{ animationDelay: `${index * 0.08}s` }}
            >
              <div className="flex items-start gap-3 mb-2">
                <span className="text-base opacity-50">{comment.user.avatar}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-light opacity-50 truncate">{comment.user.username}</p>
                  <p className="text-xs opacity-30 font-sans mt-0.5">{formatTimestamp(comment.timestamp)}</p>
                </div>
              </div>
              <p className="text-sm font-light leading-relaxed opacity-70 ml-7">{comment.message}</p>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
