'use client';
import { AreaGraph } from './area-graph';
import { MetricCard } from './metric-card';
import { useReviews } from '@/hooks/api/useReviews';
import { useCustomers } from '@/hooks/api/useCustomers';
import { useSession } from 'next-auth/react';
import { calculatePercentageChange, getDateRangeData } from '@/lib/utils';
import React from 'react';
import { RecentReviewsCard } from './recent-review-card';
import { ReviewsChart } from './review-chart';
import { MetricCardSkeleton } from './metric-card-skeleton';
import { ReviewsChartSkeleton } from './reviews-chart-skeleton';
import { RecentReviewsCardSkeleton } from './recent-reviews-skeleton';
import { motion } from 'framer-motion';

export function OverviewContent() {
  const { data: session } = useSession();

  const reviewData = useReviews({
    endpoint: `${process.env.NEXT_PUBLIC_API_URL}/api/review`,
    method: 'GET',
    accessToken: session?.accessToken
  });

  const customerData = useCustomers({
    endpoint: `${process.env.NEXT_PUBLIC_API_URL}/api/customer`,
    method: 'GET',
    accessToken: session?.accessToken
  });

  // Calculate metrics
  const metrics = React.useMemo(() => {
    if (!reviewData.data?.reviews || !customerData.data) return null;

    // Get current month's reviews and customers
    const {
      currentPeriodData: currentMonthReviews,
      previousPeriodData: lastMonthReviews
    } = getDateRangeData(reviewData.data.reviews, 'month');

    const {
      currentPeriodData: currentMonthCustomers,
      previousPeriodData: lastMonthCustomers
    } = getDateRangeData(customerData.data, 'month');

    // Get current week's reviews for average rating
    const {
      currentPeriodData: currentWeekReviews,
      previousPeriodData: lastWeekReviews
    } = getDateRangeData(reviewData.data.reviews, 'week');

    // Calculate percentage changes
    const reviewChange = calculatePercentageChange(
      lastMonthReviews.length,
      currentMonthReviews.length
    );

    const customerChange = calculatePercentageChange(
      lastMonthCustomers.length,
      currentMonthCustomers.length
    );

    // Calculate average scores with safety checks
    const currentWeekAvg =
      currentWeekReviews.length > 0
        ? currentWeekReviews.reduce((acc, review) => acc + review.score, 0) /
          currentWeekReviews.length
        : 0;

    const lastWeekAvg =
      lastWeekReviews.length > 0
        ? lastWeekReviews.reduce((acc, review) => acc + review.score, 0) /
          lastWeekReviews.length
        : 0;

    // Only calculate rating change if we have data for both weeks
    const ratingChange =
      currentWeekReviews.length > 0 && lastWeekReviews.length > 0
        ? currentWeekAvg - lastWeekAvg
        : 0;

    // Calculate monthly averages
    const currentMonthAvg =
      currentMonthReviews.length > 0
        ? currentMonthReviews.reduce((acc, review) => acc + review.score, 0) /
          currentMonthReviews.length
        : 0;

    const lastMonthAvg =
      lastMonthReviews.length > 0
        ? lastMonthReviews.reduce((acc, review) => acc + review.score, 0) /
          lastMonthReviews.length
        : 0;

    // Calculate percentage change in average rating
    const avgRatingChange =
      lastMonthAvg > 0
        ? ((currentMonthAvg - lastMonthAvg) / lastMonthAvg) * 100
        : 0;

    return {
      currentMonthReviews: currentMonthReviews.length,
      reviewChange,
      currentMonthCustomers: currentMonthCustomers.length,
      customerChange,
      currentWeekAvg: currentWeekAvg || 0, // Ensure we never return NaN
      ratingChange: ratingChange || 0, // Ensure we never return NaN
      currentMonthAvg: currentMonthAvg || 0,
      avgRatingChange: avgRatingChange || 0
    };
  }, [reviewData.data?.reviews, customerData.data]);

  if (reviewData.isLoading || customerData.isLoading || !metrics) {
    return (
      <>
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-3">
          <MetricCardSkeleton />
          <MetricCardSkeleton />
          <MetricCardSkeleton />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7">
          <ReviewsChartSkeleton />
          <RecentReviewsCardSkeleton />
        </div>
      </>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: 0.1
          }
        }
      }}
      className="grid gap-4"
    >
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 }
        }}
        className="grid gap-4 md:grid-cols-3 lg:grid-cols-3"
      >
        <MetricCard
          title="Reviews"
          value={metrics.currentMonthReviews}
          subtitle="from last month"
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path
                d="M13.0867 21.3877L13.7321 21.7697L13.0867 21.3877ZM13.6288 20.4718L12.9833 20.0898L13.6288 20.4718ZM10.3712 20.4718L9.72579 20.8539H9.72579L10.3712 20.4718ZM10.9133 21.3877L11.5587 21.0057L10.9133 21.3877Z"
                fill="#1C274C"
              />
            </svg>
          }
          trend={{
            value: metrics.reviewChange,
            isPositive: metrics.reviewChange > 0
          }}
        />

        <MetricCard
          title="New customers"
          value={metrics.currentMonthCustomers}
          subtitle="from last month"
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          }
          trend={{
            value: metrics.customerChange,
            isPositive: metrics.customerChange > 0
          }}
        />

        <MetricCard
          title="Average rating"
          value={
            metrics.currentMonthAvg === 0
              ? '-'
              : metrics.currentMonthAvg.toFixed(2)
          }
          subtitle="from last month"
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          }
          trend={{
            value: metrics.avgRatingChange,
            isPositive: metrics.avgRatingChange > 0
          }}
        />
      </motion.div>

      <motion.div
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 }
        }}
        className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7"
      >
        <ReviewsChart reviews={reviewData.data.reviews} />
        <RecentReviewsCard
          customers={customerData.data}
          reviews={reviewData.data.reviews}
        />
      </motion.div>
    </motion.div>
  );
}
