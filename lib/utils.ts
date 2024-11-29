import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import {
  CoreAssistantMessage,
  CoreMessage,
  CoreToolMessage,
  generateText,
  Message,
  ToolInvocation
} from 'ai';

import mongoose from 'mongoose';
import { customModel } from '@/ai';

let isConnected = false;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sanitizeResponseMessages(
  messages: Array<CoreToolMessage | CoreAssistantMessage>
): Array<CoreToolMessage | CoreAssistantMessage> {
  let toolResultIds: Array<string> = [];

  for (const message of messages) {
    if (message.role === 'tool') {
      for (const content of message.content) {
        if (content.type === 'tool-result') {
          toolResultIds.push(content.toolCallId);
        }
      }
    }
  }

  const messagesBySanitizedContent = messages.map((message) => {
    if (message.role !== 'assistant') return message;

    if (typeof message.content === 'string') return message;

    const sanitizedContent = message.content.filter((content) =>
      content.type === 'tool-call'
        ? toolResultIds.includes(content.toolCallId)
        : content.type === 'text'
        ? content.text.length > 0
        : true
    );

    return {
      ...message,
      content: sanitizedContent
    };
  });

  return messagesBySanitizedContent.filter(
    (message) => message.content.length > 0
  );
}

export function sanitizeUIMessages(messages: Array<Message>): Array<Message> {
  const messagesBySanitizedToolInvocations = messages.map((message) => {
    if (message.role !== 'assistant') return message;

    if (!message.toolInvocations) return message;

    let toolResultIds: Array<string> = [];

    for (const toolInvocation of message.toolInvocations) {
      if (toolInvocation.state === 'result') {
        toolResultIds.push(toolInvocation.toolCallId);
      }
    }

    const sanitizedToolInvocations = message.toolInvocations.filter(
      (toolInvocation) =>
        toolInvocation.state === 'result' ||
        toolResultIds.includes(toolInvocation.toolCallId)
    );

    return {
      ...message,
      toolInvocations: sanitizedToolInvocations
    };
  });

  return messagesBySanitizedToolInvocations.filter(
    (message) =>
      message.content.length > 0 ||
      (message.toolInvocations && message.toolInvocations.length > 0)
  );
}

export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function connectToMongo() {
  if (!process.env.MONGODB_URI) {
    throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
  }

  if (isConnected) {
    console.log('🌿 Using existing MongoDB connection');
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 10000,
      maxPoolSize: 10
    });

    isConnected = true;
    console.log('🌿 MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
}

export function getMostRecentUserMessage(messages: Array<CoreMessage>) {
  const userMessages = messages.filter((message) => message.role === 'user');
  return userMessages.at(-1);
}

export function formatDate(date: string) {
  const dateObj = new Date(date);
  return {
    date: dateObj.getDate(),
    month: dateObj.toLocaleString('default', { month: 'long' }),
    year: dateObj.getFullYear(),
    weekDay: dateObj.toLocaleString('default', { weekday: 'long' })
  };
}

export function getDateRangeData<T extends { createdAt: string }>(
  data: T[],
  period: 'week' | 'month'
): {
  currentPeriodData: T[];
  previousPeriodData: T[];
} {
  const now = new Date();
  let currentStart: Date;
  let previousStart: Date;

  if (period === 'month') {
    // Current month start
    currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
    // Previous month start
    previousStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  } else {
    // Current week start (last Sunday)
    currentStart = new Date(now);
    currentStart.setDate(now.getDate() - now.getDay());
    currentStart.setHours(0, 0, 0, 0);
    // Previous week start
    previousStart = new Date(currentStart);
    previousStart.setDate(currentStart.getDate() - 7);
  }

  const previousEnd = new Date(currentStart);
  previousEnd.setMilliseconds(-1);

  return {
    currentPeriodData: data.filter(
      (item) => new Date(item.createdAt) >= currentStart
    ),
    previousPeriodData: data.filter(
      (item) =>
        new Date(item.createdAt) >= previousStart &&
        new Date(item.createdAt) < currentStart
    )
  };
}

export function calculatePercentageChange(
  previousValue: number,
  currentValue: number
): number {
  if (previousValue === 0) return currentValue > 0 ? 100 : 0;
  return ((currentValue - previousValue) / previousValue) * 100;
}

interface TimeRange {
  start: Date;
  end: Date;
  type: 'weekly' | 'monthly' | 'yearly';
}

export function determineAnalysisType(message: string): TimeRange {
  const text = message.toLowerCase();
  const now = new Date();
  const currentYear = now.getFullYear();

  // Helper to check if string is a year
  const isYear = (str: string) => /^(20)\d{2}$/.test(str);

  // Extract year if present (either as number or written form)
  const yearMatch =
    text.match(/\b(19|20)\d{2}\b/) || text.match(/\b(last|this|next)\s+year\b/);

  // Extract month if present
  const months = [
    'january',
    'february',
    'march',
    'april',
    'may',
    'june',
    'july',
    'august',
    'september',
    'october',
    'november',
    'december'
  ];
  const monthMatch = months.find((month) => text.includes(month));

  // Handle specific year analysis
  if (yearMatch) {
    let year: number;
    if (isYear(yearMatch[0])) {
      year = parseInt(yearMatch[0]);
    } else {
      // Handle relative year references
      switch (yearMatch[1]) {
        case 'last':
          year = currentYear - 1;
          break;
        case 'next':
          year = currentYear + 1;
          break;
        default:
          year = currentYear;
      }
    }
    return {
      start: new Date(year, 0, 1),
      end: new Date(year, 11, 31, 23, 59, 59, 999),
      type: 'yearly'
    };
  }

  // Handle specific month analysis
  if (monthMatch) {
    const monthIndex = months.indexOf(monthMatch);
    let year = currentYear;

    // Check if year is also specified
    const yearInText = text.match(/\b(19|20)\d{2}\b/);
    if (yearInText) {
      year = parseInt(yearInText[0]);
    }

    return {
      start: new Date(year, monthIndex, 1),
      end: new Date(year, monthIndex + 1, 0, 23, 59, 59, 999),
      type: 'monthly'
    };
  }

  // Handle general time period mentions
  if (
    text.includes('year') ||
    text.includes('annual') ||
    text.includes('12 month') ||
    text.includes('yearly')
  ) {
    return {
      start: new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()),
      end: now,
      type: 'yearly'
    };
  }

  if (
    text.includes('month') ||
    text.includes('30 day') ||
    text.includes('monthly') ||
    text.includes('last month')
  ) {
    return {
      start: new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()),
      end: now,
      type: 'monthly'
    };
  }

  // Default to weekly (last 7 days)
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - 7);
  return {
    start: weekStart,
    end: now,
    type: 'weekly'
  };
}
