import {
  convertToCoreMessages,
  Message,
  StreamData,
  streamObject,
  streamText
} from 'ai';
import { z } from 'zod';

import { customModel } from '@/ai';
import { models } from '@/ai/models';
import { systemPrompt } from '@/ai/prompts';
import { auth } from '@/auth';
import {
  deleteChatById,
  getChatById,
  saveChat,
  saveMessages
} from '@/db/queries';
import {
  generateUUID,
  getMostRecentUserMessage,
  sanitizeResponseMessages
} from '@/lib/utils';

import { generateTitleFromUserMessage } from '@/ai/actions';

import { connectToMongo } from '@/lib/utils';

export const maxDuration = 60;

type AllowedTools =
  | 'createDocument'
  | 'updateDocument'
  | 'requestSuggestions'
  | 'getWeather';

const blocksTools: AllowedTools[] = [
  'createDocument',
  'updateDocument',
  'requestSuggestions'
];

const weatherTools: AllowedTools[] = ['getWeather'];

const allTools: AllowedTools[] = [...blocksTools, ...weatherTools];

export async function GET(request: Request) {
  const session = await auth();
  return new Response('Hello, world!', { status: 200 });
}

export async function POST(request: Request) {
  const {
    id,
    messages,
    modelId
  }: { id: string; messages: Array<Message>; modelId: string } =
    await request.json();
  console.log(id, messages, modelId, 'THIS IS REQUEST');

  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  const model = models.find((model) => model.id === modelId);

  if (!model) {
    return new Response('Model not found', { status: 404 });
  }

  const mongoConnection = await connectToMongo();

  if (mongoConnection === null) {
    return new Response('Failed to connect to MongoDB', { status: 500 });
  }

  const coreMessages = convertToCoreMessages(messages);
  const userMessage = getMostRecentUserMessage(coreMessages);
  console.log(userMessage, 'THIS IS USER MESSAGE');
  console.log(coreMessages, 'THIS IS CORE MESSAGES');

  if (!userMessage) {
    return new Response('No user message found', { status: 400 });
  }

  const chat = await getChatById({ id });

  if (!chat || chat.length === 0) {
    const title = await generateTitleFromUserMessage({ message: userMessage });
    await saveChat({ id, userId: session.user.id, title });
  }

  await saveMessages({
    messages: [{ ...userMessage, id: generateUUID(), chatId: id }]
  });

  const streamingData = new StreamData();

  const reviewData = await fetch(
    'https://easy-next-piglet.ngrok-free.app/api/review',
    {
      headers: {
        Authorization: `Bearer ${session.accessToken}`
      }
    }
  ).then((res) => res.json());

  const systemPromptWithContext = `${systemPrompt}\n\nAvailable review data: ${JSON.stringify(
    reviewData
  )}`;

  const result = await streamText({
    model: customModel(model.apiIdentifier),
    system: systemPromptWithContext,
    messages: coreMessages,
    maxSteps: 5,
    onFinish: async ({ responseMessages }) => {
      if (session.user && session.user.id) {
        try {
          const responseMessagesWithoutIncompleteToolCalls =
            sanitizeResponseMessages(responseMessages);

          await saveMessages({
            messages: responseMessagesWithoutIncompleteToolCalls.map(
              (message) => {
                const messageId = generateUUID();

                if (message.role === 'assistant') {
                  streamingData.appendMessageAnnotation({
                    messageIdFromServer: messageId
                  });
                }

                return {
                  id: messageId,
                  chatId: id,
                  role: message.role,
                  content: message.content,
                  createdAt: new Date()
                };
              }
            )
          });
        } catch (error) {
          console.error('Failed to save chat');
        }
      }

      streamingData.close();
    },
    experimental_telemetry: {
      isEnabled: true,
      functionId: 'stream-text'
    }
  });

  return result.toDataStreamResponse({
    data: streamingData
  });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return new Response('Not Found', { status: 404 });
  }

  const session = await auth();

  if (!session || !session.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const chat = await getChatById({ id });

    if (chat.userId !== session.user.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    await deleteChatById({ id });

    return new Response('Chat deleted', { status: 200 });
  } catch (error) {
    return new Response('An error occurred while processing your request', {
      status: 500
    });
  }
}