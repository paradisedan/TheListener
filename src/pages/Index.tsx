import { useState, useEffect } from 'react';
import { PlayerBar } from '@/components/PlayerBar';
import { PromptSection } from '@/components/PromptSection';
import { AIDirectionPanel } from '@/components/AIDirectionPanel';
import { CommentStream } from '@/components/CommentStream';
import { TopContributors } from '@/components/TopContributors';
import { MixHistory } from '@/components/MixHistory';
import { VersionDrawer } from '@/components/VersionDrawer';
import { useCountdown } from '@/hooks/useCountdown';
import {
  mockUsers,
  mockComments,
  mockVersions,
  aiDirection,
  getRandomComment,
  Comment,
  Version,
} from '@/data/mockData';

const Index = () => {
  const [comments, setComments] = useState<Comment[]>(mockComments);
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
  const countdown = useCountdown();
  const currentVersion = mockVersions.length;

  useEffect(() => {
    const interval = setInterval(() => {
      const newComment = getRandomComment();
      setComments((prev) => [newComment, ...prev.slice(0, 19)]);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleNewComment = (comment: Comment) => {
    setComments((prev) => [comment, ...prev]);
  };

  const handleVersionClick = (version: Version) => {
    setSelectedVersion(version);
  };

  return (
    <div className="min-h-screen bg-background">
      <PlayerBar version={currentVersion} countdown={countdown} />
      
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <PromptSection />
            <AIDirectionPanel direction={aiDirection} />
          </div>
          
          {/* Sidebar */}
          <div className="space-y-4">
            <CommentStream comments={comments} onNewComment={handleNewComment} />
            <TopContributors users={mockUsers} />
          </div>
        </div>
      </div>
      
      <div className="fixed bottom-0 left-0 right-0">
        <MixHistory
          versions={mockVersions}
          currentVersion={currentVersion}
          onVersionClick={handleVersionClick}
        />
      </div>
      
      <VersionDrawer
        version={selectedVersion}
        isOpen={selectedVersion !== null}
        onClose={() => setSelectedVersion(null)}
      />
    </div>
  );
};

export default Index;
