import { Trophy } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { User } from '@/data/mockData';

interface TopContributorsProps {
  users: User[];
}

export function TopContributors({ users }: TopContributorsProps) {
  const topUsers = [...users].sort((a, b) => b.contributions - a.contributions).slice(0, 5);

  return (
    <Card className="p-4 bg-card border-border/50 mt-4">
      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <Trophy className="h-5 w-5 text-secondary" />
        Top Contributors
      </h3>
      
      <div className="space-y-2">
        {topUsers.map((user, index) => (
          <div
            key={user.id}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-all"
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className={`text-sm font-bold ${
                index === 0 ? 'text-secondary' : 'text-muted-foreground'
              }`}>
                #{index + 1}
              </span>
              <span className="text-xl">{user.avatar}</span>
              <span className="text-sm font-medium truncate">{user.username}</span>
            </div>
            <span className="text-xs text-primary font-semibold">{user.contributions}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
