'use client';
import PageContainer from '@/components/layout/page-container';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OverviewContent } from './overview-content';
import { ChatHeader } from '@/components/chat/chat-header';
import { Chat } from '@/components/chat/chat';
import { generateUUID } from '@/lib/utils';

export default function OverViewPage() {
  const id = generateUUID();
  return (
    <PageContainer scrollable>
      <div className="space-y-2">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">
            Hi, Welcome back 👋
          </h2>
        </div>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="chat">Chat</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <OverviewContent />
          </TabsContent>

          <TabsContent value="chat" className="space-y-4">
            <div className="h-[80vh]">
              <Chat id={id} initialMessages={[]} selectedModelId="gpt-4o" />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
}
