import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDate } from '@/lib/utils';

export function ReviewRow({ review, email, score, mood, createdAt }) {
  const { date, month, year, weekDay } = formatDate(createdAt);
  return (
    <div className="flex items-center">
      <div className=" space-y-1">
        <p className="text-base font-medium leading-normal">{review}</p>
        <p className="text-sm text-muted-foreground">
          {email + ` ${date}/${month}/${year}`}
        </p>
        <div className="ml-auto font-medium">Mood: {mood}</div>
      </div>

      <div className="ml-auto pl-8 font-medium">Score: {score}</div>
    </div>
  );
}
