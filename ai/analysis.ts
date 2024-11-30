import { Review } from '@/db/schema.model';
import { Types } from 'mongoose';
import { customModel } from '.';
import { generateText } from 'ai';

interface ReviewType {
  responses: Array<{
    query: string;
    res: string;
  }>;
  customerId: Types.ObjectId;
  createdAt: Date;
  score: number;
  sentiment: string;
}

interface AnalysisParams {
  timeRange: {
    start: Date;
    end: Date;
    type: 'weekly' | 'monthly' | 'yearly';
  };
}

interface AnalysisResult {
  reviews: ReviewType[];
  averageScore?: number;
  prompt: string;
}

export async function weeklyAnalysis({
  timeRange
}: AnalysisParams): Promise<AnalysisResult> {
  console.log('Weekly Analysis Time Range:', {
    start: timeRange.start.toISOString(),
    end: timeRange.end.toISOString()
  });

  const reviews = await Review.find({
    createdAt: {
      $gte: timeRange.start,
      $lte: timeRange.end
    }
  }).sort({ createdAt: -1 });

  return {
    reviews,
    prompt: `Analyze the following customer reviews and their sentiments from ${timeRange.start.toISOString()} to ${timeRange.end.toISOString()}. For each review, consider both the numerical score and sentiment analysis: ${JSON.stringify(
      reviews.map((r) => ({
        score: r.score,
        sentiment: r.sentiment,
        responses: r.responses,
        date: r.createdAt.toISOString()
      }))
    )}`
  };
}

export async function monthlyAnalysis({
  timeRange
}: AnalysisParams): Promise<AnalysisResult> {
  console.log('Monthly Analysis Time Range:', {
    start: timeRange.start.toISOString(),
    end: timeRange.end.toISOString()
  });

  const reviews = await Review.find({
    createdAt: {
      $gte: timeRange.start,
      $lte: timeRange.end
    }
  }).sort({ createdAt: -1 });

  const scores = reviews.map((review: ReviewType) => review.score);
  const averageScore =
    scores.reduce((a: number, b: number) => a + b, 0) / scores.length;

  const reviewsWithDistance = reviews.map((review: ReviewType) => ({
    review,
    distance: Math.abs(review.score - averageScore)
  }));

  const closestReviews = reviewsWithDistance
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 10)
    .map((item) => item.review);

  return {
    reviews: closestReviews,
    averageScore,
    prompt: `Analyze these representative customer reviews from ${timeRange.start.toISOString()} to ${timeRange.end.toISOString()}. The average score is ${averageScore}. Consider both numerical scores and sentiment analysis for each review: ${JSON.stringify(
      closestReviews.map((r) => ({
        score: r.score,
        sentiment: r.sentiment,
        responses: r.responses,
        date: r.createdAt.toISOString()
      }))
    )}`
  };
}

export async function yearlyAnalysis({
  timeRange
}: AnalysisParams): Promise<AnalysisResult> {
  console.log('Yearly Analysis Time Range:', {
    start: timeRange.start.toISOString(),
    end: timeRange.end.toISOString()
  });

  const reviews = await Review.find({
    createdAt: {
      $gte: timeRange.start,
      $lte: timeRange.end
    }
  }).sort({ createdAt: -1 });

  const monthlyGroups = new Map<string, ReviewType[]>();

  reviews.forEach((review: ReviewType) => {
    const monthKey = review.createdAt.toISOString().slice(0, 7);
    if (!monthlyGroups.has(monthKey)) {
      monthlyGroups.set(monthKey, []);
    }
    monthlyGroups.get(monthKey)?.push(review);
  });

  const sampledReviews: ReviewType[] = [];
  monthlyGroups.forEach((monthReviews) => {
    for (let i = 0; i < 3; i++) {
      const periodStart = i * 10;
      const periodEnd = (i + 1) * 10;

      const periodReviews = monthReviews.filter((review: ReviewType) => {
        const day = review.createdAt.getDate();
        return day >= periodStart && day < periodEnd;
      });

      if (periodReviews.length > 0) {
        const randomIndex = Math.floor(Math.random() * periodReviews.length);
        sampledReviews.push(periodReviews[randomIndex]);
      }
    }
  });

  const scores = sampledReviews.map((review) => review.score);
  const averageScore =
    scores.reduce((a: number, b: number) => a + b, 0) / scores.length;

  return {
    reviews: sampledReviews,
    averageScore,
    prompt: `Analyze these representative customer reviews from ${timeRange.start.toISOString()} to ${timeRange.end.toISOString()}. The average score is ${averageScore}. Consider both numerical scores and sentiment analysis trends over time: ${JSON.stringify(
      sampledReviews.map((r) => ({
        score: r.score,
        sentiment: r.sentiment,
        responses: r.responses,
        date: r.createdAt.toISOString()
      }))
    )}`
  };
}

interface TimeRangeRequest {
  from: string;
  to: string;
}

interface PreprocessedMessage {
  userMessage: string;
  timeRange: TimeRangeRequest;
}

export async function preprocessUserMessage(
  message: string
): Promise<PreprocessedMessage> {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const currentDay = new Date().getDate();
  console.log('Current year:', currentYear);
  console.log('Current month:', currentMonth);
  console.log('Current day:', currentDay);
  const completion = await generateText({
    model: customModel('gpt-3.5-turbo'),
    system: `You are a date range extractor. Given a user message, extract or infer the date range they're asking about.
    Always respond in this exact JSON format:
    {
      "userMessage": "original message",
      "timeRangeInRequest": {
        "from": "dd/mm/yy",
        "to": "dd/mm/yy"
      }
    }
    
    If no specific dates are mentioned:
    - For "last month" use 1st to last day of previous month, current month is ${currentMonth}
    - For "this year" use 01/01/2024 to today
    - For "last week" use last 7 days, current day is ${currentDay}
    - Default to last 7 days if no time reference is found`,
    prompt: message
  });

  console.log('Completion:', completion.text);

  // Post-process the completion to handle potential non-JSON responses
  return extractDateRangeFromResponse(completion.text);
}

function extractDateRangeFromResponse(response: string): PreprocessedMessage {
  const result = JSON.parse(response);
  console.log('Result:', result);
  const from = result.timeRangeInRequest.from;
  const to = result.timeRangeInRequest.to;
  console.log('Extracted dates:', { from, to });
  if (from && to) {
    return {
      userMessage: result.userMessage,
      timeRange: { from, to }
    };
  } else {
    return {
      userMessage: result.userMessage,
      timeRange: {
        from: `${new Date().getDate() - 7}/${
          new Date().getMonth() + 1
        }/${new Date().getFullYear()}`,
        to: `${new Date().getDate()}/${
          new Date().getMonth() + 1
        }/${new Date().getFullYear()}`
      }
    };
  }
}
