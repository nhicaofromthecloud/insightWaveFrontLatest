import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { ReviewRow } from './review-row';
import { getTopFiveReviews } from '@/utils/getTopFiveReviews';

interface RecentReviewsCardProps {
  customers: any[];
  reviews: any[];
}

export function RecentReviewsCard({
  customers,
  reviews
}: RecentReviewsCardProps) {
  const topFiveReviews = getTopFiveReviews(reviews);

  return (
    <Card className="col-span-4 max-h-[50vh] w-full overflow-scroll md:col-span-3 md:max-h-[70vh]">
      <CardHeader className="sticky top-0 border-b bg-card text-card-foreground">
        <CardTitle>Recent reviews</CardTitle>
        <CardDescription>
          {`You have ${reviews.length} reviews this month.`}
        </CardDescription>
      </CardHeader>
      <CardContent className="bg-card pt-6">
        <div className="space-y-8">
          {topFiveReviews.map((review) => {
            const customer = customers.find(
              (customer) => customer._id === review.customerId
            );

            return (
              <ReviewRow
                key={review._id}
                review={review.responses[0].res}
                email={customer.email}
                score={review.score}
                mood={review.sentiment}
                createdAt={review.createdAt}
              />
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
