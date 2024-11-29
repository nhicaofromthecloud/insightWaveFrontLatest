import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function ReviewsChartSkeleton() {
  return (
    <Card className="col-span-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <Skeleton className="mb-2 h-6 w-[150px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
        <Skeleton className="h-8 w-[150px]" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[40vh] w-full" />
      </CardContent>
    </Card>
  );
}
