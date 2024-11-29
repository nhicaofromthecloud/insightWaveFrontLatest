import mongoose from 'mongoose';

// Check if models exist before defining new ones
const chatSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  userId: { type: String, required: true }
});

const messageSchema = new mongoose.Schema({
  id: { type: String, required: true },
  chatId: { type: String, required: true },
  role: { type: String, required: true },
  content: { type: Object, required: true }
});

// Use existing models or create new ones
export const Chat =
  mongoose.models.chats || mongoose.model('chats', chatSchema);
export const Message =
  mongoose.models.messages || mongoose.model('messages', messageSchema);
