import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function RecentReviewsCardSkeleton() {
  return (
    <Card className="col-span-4 md:col-span-3">
      <CardHeader className="sticky top-0 border-b">
        <Skeleton className="mb-2 h-6 w-[140px]" />
        <Skeleton className="h-4 w-[180px]" />
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-8">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[100px]" />
              </div>
              <Skeleton className="ml-8 h-4 w-[80px]" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
