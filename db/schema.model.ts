import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema(
  {
    id: String,
    userId: String,
    title: String
  },
  { timestamps: true }
);

const messageSchema = new mongoose.Schema(
  {
    id: String,
    chatId: String,
    content: String,
    role: String,
    toolCalls: Array,
    functionCall: Object
  },
  { timestamps: true }
);

const responseSchema = new mongoose.Schema({
  query: {
    type: String,
    required: true
  },
  res: {
    type: String,
    required: true
  }
});

const reviewSchema = new mongoose.Schema({
  responses: {
    type: [responseSchema],
    required: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now()
  },
  score: {
    type: Number,
    required: true
  },
  sentiment: {
    type: String,
    required: true
  }
});

// Add static methods
reviewSchema.statics.getAll = async function () {
  try {
    return await this.find();
  } catch (error: any) {
    throw new Error('Error retrieving reviews: ' + error.message);
  }
};

reviewSchema.statics.delete = async function (id) {
  try {
    const review = await this.findByIdAndDelete(id);
    if (!review) {
      throw new Error('Review not found.');
    }
    return review;
  } catch (error: any) {
    throw new Error('Error deleting review: ' + error.message);
  }
};

reviewSchema.statics.deleteAll = async function () {
  try {
    const result = await this.deleteMany({});
    return result.deletedCount;
  } catch (error: any) {
    throw new Error('Error deleting all reviews: ' + error.message);
  }
};

export const Chat = mongoose.models.Chat || mongoose.model('Chat', chatSchema);
export const Message =
  mongoose.models.Message || mongoose.model('Message', messageSchema);
export const Review =
  mongoose.models.Review || mongoose.model('Review', reviewSchema);
