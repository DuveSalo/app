interface SkeletonProps {
  className?: string;
}

export const Skeleton = ({ className = '' }: SkeletonProps) => {
  return (
    <div className={`animate-pulse rounded-md bg-neutral-100 ${className}`} />
  );
};

export const SkeletonCard = () => {
  return (
    <div className="bg-white rounded-lg border border-neutral-200 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-3.5 w-1/3" />
          <Skeleton className="h-7 w-1/2" />
        </div>
        <Skeleton className="h-9 w-9 rounded-md" />
      </div>
    </div>
  );
};

export const SkeletonTable = ({ rows = 5 }: { rows?: number }) => {
  return (
    <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
      <div className="px-4 py-2.5 border-b border-neutral-200 bg-neutral-50">
        <Skeleton className="h-4 w-1/4" />
      </div>
      <div className="divide-y divide-neutral-100">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="px-4 py-2.5 flex items-center gap-4">
            <Skeleton className="h-3.5 w-1/4" />
            <Skeleton className="h-3.5 w-1/6" />
            <Skeleton className="h-3.5 w-1/6" />
            <Skeleton className="h-5 w-14 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
};

export const SkeletonDashboard = () => {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
      <SkeletonTable rows={8} />
    </div>
  );
};

export const SkeletonList = ({ items = 5 }: { items?: number }) => {
  return (
    <div className="space-y-2">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="bg-white rounded-md border border-neutral-200 p-3.5">
          <div className="flex items-center justify-between mb-2.5">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-5 w-14 rounded-md" />
          </div>
          <div className="space-y-1.5">
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3.5 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const SkeletonForm = () => {
  return (
    <div className="bg-white rounded-lg border border-neutral-200 p-5 space-y-5">
      <Skeleton className="h-6 w-1/3" />
      <div className="space-y-3.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-1">
            <Skeleton className="h-3.5 w-1/4" />
            <Skeleton className="h-9 w-full rounded-md" />
          </div>
        ))}
      </div>
      <div className="flex justify-end gap-2">
        <Skeleton className="h-9 w-20 rounded-md" />
        <Skeleton className="h-9 w-28 rounded-md" />
      </div>
    </div>
  );
};
