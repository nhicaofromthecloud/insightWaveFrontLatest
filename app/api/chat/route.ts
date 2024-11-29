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
import {
  weeklyAnalysis,
  monthlyAnalysis,
  yearlyAnalysis,
  preprocessUserMessage
} from '@/ai/analysis';
import { determineAnalysisType } from '@/lib/utils';

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
  }: {
    id: string;
    messages: Array<Message>;
    modelId: string;
  } = await request.json();

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

  if (!userMessage) {
    return new Response('No user message found', { status: 400 });
  }

  const preprocessed = await preprocessUserMessage(userMessage.content);
  console.log('Preprocessed:', preprocessed);

  const timeRange = {
    start: parseDate(preprocessed.timeRange.from),
    end: parseDate(preprocessed.timeRange.to),
    type: determineRangeType(
      parseDate(preprocessed.timeRange.from),
      parseDate(preprocessed.timeRange.to)
    )
  };

  const chat = await getChatById({ id });

  if (!chat || chat.length === 0) {
    const title = await generateTitleFromUserMessage({ message: userMessage });
    await saveChat({ id, userId: session.user.id, title });
  }

  await saveMessages({
    messages: [{ ...userMessage, id: generateUUID(), chatId: id }]
  });

  const streamingData = new StreamData();

  let analysisResult;
  switch (timeRange.type) {
    case 'monthly':
      analysisResult = await monthlyAnalysis({ timeRange });
      break;
    case 'yearly':
      analysisResult = await yearlyAnalysis({ timeRange });
      break;
    default:
      analysisResult = await weeklyAnalysis({ timeRange });
  }

  const systemPromptWithContext = `${systemPrompt}\n\n${analysisResult.prompt}`;

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

function parseDate(dateStr: string): Date {
  const [day, month, year] = dateStr.split('/').map(Number);
  return new Date(year, month - 1, day);
}

function determineRangeType(
  start: Date,
  end: Date
): 'weekly' | 'monthly' | 'yearly' {
  const diffDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
  if (diffDays > 180) return 'yearly';
  if (diffDays > 27) return 'monthly';
  return 'weekly';
}
