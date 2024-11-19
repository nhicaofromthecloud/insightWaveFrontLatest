'use client';

import { Attachment, Message } from 'ai';
import { useChat } from 'ai/react';
import { useState } from 'react';
//import useSWR from 'swr';
import { useWindowSize } from 'usehooks-ts';
import { useQueryClient } from '@tanstack/react-query';

import { ChatHeader } from './chat-header';
import { PreviewMessage, ThinkingMessage } from './message';
import { useScrollToBottom } from './use-scroll-to-bottom';
//import { Vote } from '@/db/schema';
//import { fetcher } from '@/lib/utils';
import { MultimodalInput } from './multimodal-input';
import { Overview } from './overview';

export function Chat({
  id,
  initialMessages,
  selectedModelId
}: {
  id: string;
  initialMessages: Array<Message>;
  selectedModelId: string;
}) {
  const queryClient = useQueryClient();

  const {
    messages,
    setMessages,
    handleSubmit,
    input,
    setInput,
    append,
    isLoading,
    stop
  } = useChat({
    body: { id, modelId: selectedModelId },
    initialMessages,
    onFinish: () => {
      queryClient.invalidateQueries({ queryKey: ['history'] });
    }
  });

  //const { data: votes } = useSWR<Array<Vote>>(`/api/vote?chatId=${id}`, fetcher);
  const [messagesContainerRef, messagesEndRef] =
    useScrollToBottom<HTMLDivElement>();

  return (
    <div className="flex h-full min-w-0 flex-col bg-background">
      <ChatHeader selectedModelId={selectedModelId} />
      <div
        ref={messagesContainerRef}
        className="flex min-w-0 flex-1 flex-col gap-6 overflow-y-scroll pt-4"
      >
        {messages.length === 0 && <Overview />}

        {messages.map((message, index) => (
          <PreviewMessage
            key={message.id}
            chatId={id}
            message={message}
            isLoading={isLoading && messages.length - 1 === index}
            //vote={votes?.find((vote) => vote.messageId === message.id)}
          />
        ))}

        {isLoading &&
          messages.length > 0 &&
          messages[messages.length - 1].role === 'user' && <ThinkingMessage />}

        <div
          ref={messagesEndRef}
          className="min-h-[24px] min-w-[24px] shrink-0"
        />
      </div>
      <form className="mx-auto flex w-full gap-2 bg-background px-4 pb-4 md:max-w-3xl md:pb-6">
        <MultimodalInput
          chatId={id}
          input={input}
          setInput={setInput}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
          stop={stop}
          messages={messages}
          setMessages={setMessages}
          append={append}
        />
      </form>
    </div>
  );
}
