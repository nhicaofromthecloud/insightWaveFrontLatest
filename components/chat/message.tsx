'use client';

import { Message } from 'ai';
import cx from 'classnames';
import { motion } from 'framer-motion';

//import { Vote } from '@/db/schema';
import { Markdown } from './markdown';
import { MessageActions } from './message-actions';
import { PreviewAttachment } from './preview-attachment';
import { SparklesIcon } from '@/components/icons';

export const PreviewMessage = ({
  chatId,
  message,
  // vote,
  isLoading
}: {
  chatId: string;
  message: Message;
  // vote: Vote | undefined;
  isLoading: boolean;
}) => {
  return (
    <motion.div
      className="group/message mx-auto w-full max-w-3xl px-4"
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      data-role={message.role}
    >
      <div
        className={cx(
          'flex w-full gap-4 rounded-xl group-data-[role=user]/message:ml-auto group-data-[role=user]/message:w-fit group-data-[role=user]/message:max-w-2xl group-data-[role=user]/message:bg-primary group-data-[role=user]/message:px-3 group-data-[role=user]/message:py-2 group-data-[role=user]/message:text-primary-foreground'
        )}
      >
        {message.role === 'assistant' && (
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full ring-1 ring-border">
            <SparklesIcon size={14} />
          </div>
        )}

        <div className="flex w-full flex-col gap-2">
          {message.content && (
            <div className="flex flex-col gap-4">
              <Markdown>{message.content as string}</Markdown>
            </div>
          )}

          {message.experimental_attachments && (
            <div className="flex flex-row gap-2">
              {message.experimental_attachments.map((attachment) => (
                <PreviewAttachment
                  key={attachment.url}
                  attachment={attachment}
                />
              ))}
            </div>
          )}

          {/* <MessageActions
            key={`action-${message.id}`}
            chatId={chatId}
            message={message}
            //vote={vote}
            isLoading={isLoading}
          /> */}
        </div>
      </div>
    </motion.div>
  );
};

export const ThinkingMessage = () => {
  const role = 'assistant';

  return (
    <motion.div
      className="group/message mx-auto w-full max-w-3xl px-4 "
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1, transition: { delay: 1 } }}
      data-role={role}
    >
      <div
        className={cx(
          'flex w-full gap-4 rounded-xl group-data-[role=user]/message:ml-auto group-data-[role=user]/message:w-fit group-data-[role=user]/message:max-w-2xl group-data-[role=user]/message:px-3 group-data-[role=user]/message:py-2',
          {
            'group-data-[role=user]/message:bg-muted': true
          }
        )}
      >
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full ring-1 ring-border">
          <SparklesIcon size={14} />
        </div>

        <div className="flex w-full flex-col gap-2">
          <div className="flex flex-col gap-4 text-muted-foreground">
            Thinking...
          </div>
        </div>
      </div>
    </motion.div>
  );
};