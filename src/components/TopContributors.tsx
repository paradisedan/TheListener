import { Trophy } from 'lucide-react';
import { User } from '@/data/mockData';

interface TopContributorsProps {
  users: User[];
}

export function TopContributors({ users }: TopContributorsProps) {
  const topUsers = [...users].sort((a, b) => b.contributions - a.contributions).slice(0, 5);

  return (
    <div className="p-0 bg-transparent mt-8">
      <h3 className="text-xs tracking-widest uppercase opacity-30 mb-6 font-sans flex items-center gap-2">
        <Trophy className="h-3 w-3 opacity-20" />
        Contributors
      </h3>
      
      <div className="space-y-4">
        {topUsers.map((user, index) => (
          <div
            key={user.id}
            className="flex items-center gap-4 transition-opacity hover:opacity-70"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <span className={`text-xs font-light opacity-30 w-6`}>
                {index + 1}
              </span>
              <span className="text-base opacity-50">{user.avatar}</span>
              <span className="text-xs font-light opacity-50 truncate">{user.username}</span>
            </div>
            <span className="text-xs opacity-30 font-light">{user.contributions}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
