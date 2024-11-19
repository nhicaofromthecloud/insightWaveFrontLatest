'use client';

import { TrendingUp } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';

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
  const reviewChart = calculateMonthlyAverage(reviews);
  console.log(reviewChart);
  return (
    <Card className="max-h-[40vh] md:max-h-[70vh]">
      <CardHeader>
        <CardTitle>Sentiment over time</CardTitle>
        <CardDescription>
          Average monthly score for the past 12 months
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[25vh] w-full md:h-[55vh]"
        >
          <AreaChart
            accessibilityLayer
            data={reviewChart}
            margin={{
              left: -36,
              right: 12
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
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
    </Card>
  );
}

function getMonthName(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString('default', { month: 'long' });
}

// Group reviews by month and calculate the average score
function calculateMonthlyAverage(reviews) {
  const monthlyData = {};

  // Step 1: Group scores by month
  reviews.forEach((review) => {
    const month = getMonthName(review.createdAt);
    if (!monthlyData[month]) {
      monthlyData[month] = { totalScore: 0, count: 0 };
    }
    monthlyData[month].totalScore += review.score;
    monthlyData[month].count += 1;
  });

  // Step 2: Calculate average score for each month
  const chartData = Object.keys(monthlyData).map((month) => {
    const { totalScore, count } = monthlyData[month];
    return {
      month,
      score: parseFloat((totalScore / count).toFixed(1)) // Round to one decimal
    };
  });

  return chartData;
}
