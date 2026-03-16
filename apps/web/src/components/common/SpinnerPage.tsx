import { Skeleton } from './SkeletonLoader';

export const SpinnerPage = () => (
  <div className="flex flex-col gap-6 p-6">
    <Skeleton className="h-8 w-48" />
    <div className="space-y-4">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  </div>
);
