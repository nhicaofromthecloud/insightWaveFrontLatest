import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function ReviewRow({ review, email, score, mood }) {
  return (
    <div className="flex items-center">
      <div className=" space-y-1">
        <p className="text-base font-medium leading-normal">{review}</p>
        <p className="text-sm text-muted-foreground">{email}</p>
        <div className="ml-auto font-medium">Mood: {mood}</div>
      </div>

      <div className="ml-auto pl-8 font-medium">Score: {score}</div>
    </div>
  );
}
