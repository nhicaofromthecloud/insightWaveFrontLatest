'use client';

import { TrendingUp } from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  BarChart,
  Bar
} from 'recharts';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';

const chartConfig = {
  score: {
    label: 'score',
    color: 'hsl(var(--chart-1))'
  }
} satisfies ChartConfig;

export function AreaGraph({ reviews }) {
  const monthlyData = calculateMonthlyAverage(reviews);
  const weeklyData = calculateWeeklyAverage(reviews);
  return (
    <Tabs defaultValue="monthly">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Sentiment over time</CardTitle>
          <CardDescription>
            Average monthly score for the past 12 months
          </CardDescription>
        </div>
        <TabsList>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
        </TabsList>
      </CardHeader>

      <TabsContent value="monthly">
        <CardContent className="min-h-[30vh] flex-1">
          <ChartContainer config={chartConfig} className="h-[40vh] w-full">
            <BarChart
              accessibilityLayer
              data={monthlyData}
              margin={{
                left: -36,
                right: 12
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                isAnimationActive={false}
                dataKey="month"
                tickLine={true}
                axisLine={true}
                tickMargin={8}
                tickFormatter={(value, index, ticks) => {
                  if (value.includes('January') || index === 0) {
                    return value;
                  }
                  return value.slice(0, 3);
                }}
              />

              <YAxis
                dataKey="score"
                tickLine={true}
                axisLine={true}
                type="number"
                domain={[0, 10]}
                tickCount={10}
              />

              <ChartTooltip
                cursor={true}
                content={<ChartTooltipContent indicator="dot" />}
              />

              <Bar
                isAnimationActive={false}
                dataKey="score"
                type="bumpX"
                fill="var(--color-score)"
                fillOpacity={0.4}
                stroke="var(--color-score)"
                stackId="a"
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </TabsContent>

      <TabsContent value="weekly">
        <CardContent className="min-h-0 flex-1">
          <ChartContainer config={chartConfig} className="h-[40vh] w-full">
            <AreaChart
              accessibilityLayer
              data={weeklyData}
              margin={{
                left: -36,
                right: 12
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="weekDay"
                tickLine={true}
                axisLine={true}
                tickMargin={8}
                tickFormatter={(value) => value.slice(0, 3)}
              />

              <YAxis
                dataKey="score"
                tickLine={true}
                axisLine={true}
                type="number"
                domain={[0, 10]}
                tickCount={10}
              />

              <ChartTooltip
                cursor={true}
                content={<ChartTooltipContent indicator="dot" />}
              />

              <Area
                isAnimationActive={false}
                dataKey="score"
                type="bumpX"
                fill="var(--color-score)"
                fillOpacity={0.4}
                stroke="var(--color-score)"
                stackId="a"
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </TabsContent>

      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              January - June 2024
            </div>
          </div>
        </div>
      </CardFooter>
    </Tabs>
  );
}

function getMonthName(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString('default', { month: 'long' });
}

// Group reviews by month and calculate the average score
function calculateMonthlyAverage(reviews) {
  const monthlyData = {};

  reviews.forEach((review) => {
    const date = new Date(review.createdAt);
    const key = date.toISOString().substring(0, 7);
    if (!monthlyData[key]) {
      monthlyData[key] = {
        totalScore: 0,
        count: 0,
        date: date
      };
    }
    monthlyData[key].totalScore += review.score;
    monthlyData[key].count += 1;
  });

  const chartData = Object.entries(monthlyData)
    .map(([key, data]) => {
      const { totalScore, count, date } = data;
      const monthName = date.toLocaleString('default', { month: 'long' });
      const year = date.getFullYear();
      return {
        month: `${monthName}${monthName === 'January' ? ' ' + year : ''}`,
        score: parseFloat((totalScore / count).toFixed(1)),
        timestamp: date.getTime()
      };
    })
    .sort((a, b) => a.timestamp - b.timestamp)
    .slice(-12);

  return chartData;
}

// Get day name (Mon, Tue, etc.)
function getDayName(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString('default', { weekday: 'short' });
}

// Group reviews by day for the last week and calculate the average score
function calculateWeeklyAverage(reviews) {
  const weeklyData = {};
  const now = new Date();
  const oneWeekAgo = new Date(now.setDate(now.getDate() - 7));

  // Initialize all days of the week with empty data
  for (let i = 0; i < 7; i++) {
    const date = new Date(oneWeekAgo);
    date.setDate(date.getDate() + i);
    const dayName = getDayName(date);
    weeklyData[dayName] = { totalScore: 0, count: 0 };
  }

  // Step 1: Group scores by day
  reviews.forEach((review) => {
    const reviewDate = new Date(review.createdAt);
    if (reviewDate >= oneWeekAgo) {
      const dayName = getDayName(review.createdAt);
      weeklyData[dayName].totalScore += review.score;
      weeklyData[dayName].count += 1;
    }
  });

  // Step 2: Calculate average score for each day
  const chartData = Object.entries(weeklyData).map(([day, data]) => {
    const { totalScore, count } = data;
    return {
      weekDay: day, // Using 'month' as the key to match existing chart configuration
      score: count > 0 ? parseFloat((totalScore / count).toFixed(1)) : 0
    };
  });

  return chartData;
}
