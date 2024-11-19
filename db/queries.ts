'server-only';

import { genSaltSync, hashSync } from 'bcrypt-ts';
import { Chat, Message } from './schema.model';

export async function saveChat({
  id,
  userId,
  title
}: {
  id: string;
  userId: string;
  title: string;
}) {
  try {
    const chat = new Chat({
      id,
      userId,
      title
    });
    return await chat.save();
  } catch (error) {
    console.error('Failed to save chat in database');
    throw error;
  }
}

export async function deleteChatById({ id }: { id: string }) {
  try {
    await Message.deleteMany({ chatId: id });
    return await Chat.findByIdAndDelete(id);
  } catch (error) {
    console.error('Failed to delete chat by id from database');
    throw error;
  }
}

export async function getChatsByUserId({ id }: { id: string }) {
  try {
    return await Chat.find({ userId: id }).sort({ createdAt: -1 });
  } catch (error) {
    console.error('Failed to get chats by user from database');
    throw error;
  }
}

export async function getChatById({ id }: { id: string }) {
  try {
    return await Chat.find({ id });
  } catch (error) {
    console.error('Failed to get chat by id from database');
    throw error;
  }
}

export async function saveMessages({ messages }: { messages: Array<any> }) {
  try {
    const formattedMessages = messages.map((message) => {
      const content = Array.isArray(message.content)
        ? message.content.map((c: any) => c.text).join(' ')
        : message.content;

      return {
        id: message.id,
        chatId: message.chatId,
        content: content,
        role: message.role,
        ...(message.toolCalls && { toolCalls: message.toolCalls }),
        ...(message.functionCall && { functionCall: message.functionCall })
      };
    });

    return await Message.insertMany(formattedMessages);
  } catch (error) {
    console.error('Failed to save messages in database', error);
    throw error;
  }
}

export async function getMessagesByChatId({ id }: { id: string }) {
  try {
    return await Message.find({ chatId: id }).sort({ createdAt: 1 });
  } catch (error) {
    console.error('Failed to get messages by chat id from database', error);
    throw error;
  }
}
