'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { ModelSelector } from '@/components/chat/model-selector';
import { Button } from '@/components/ui/button';
import { BetterTooltip } from '@/components/ui/tooltip';

import { PlusIcon, VercelIcon } from '@/components/icons';

export function ChatHeader({ selectedModelId }: { selectedModelId: string }) {
  const router = useRouter();

  return (
    <header className="sticky top-0 flex items-center gap-2 bg-background px-2 py-1.5 md:px-2">
      <BetterTooltip content="New Chat">
        <Button
          variant="outline"
          className="order-2 ml-auto px-2 md:order-1 md:ml-0 md:h-fit md:px-2"
          onClick={() => {
            router.push('/');
            router.refresh();
          }}
        >
          <PlusIcon />
          <span className="md:sr-only">New Chat</span>
        </Button>
      </BetterTooltip>
      <ModelSelector
        selectedModelId={selectedModelId}
        className="order-1 md:order-2"
      />
    </header>
  );
}
