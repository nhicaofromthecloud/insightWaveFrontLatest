import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ReviewRow } from './review-row';
import { getTopFiveReviews } from '@/utils/getTopFiveReviews';

export function RecentReviews({ customers, reviews }) {
  const topFiveReviews = getTopFiveReviews(reviews);

  console.log(customers, reviews);

  return (
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
          />
        );
      })}
    </div>
  );
}
