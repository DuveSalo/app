interface SkeletonProps {
  className?: string;
}

export const Skeleton = ({ className = '' }: SkeletonProps) => {
  return <div className={`animate-pulse rounded-lg bg-muted ${className}`} />;
};

const SkeletonCard = () => {
  return (
    <div className="border border-border rounded-lg bg-background p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-3.5 w-1/3" />
          <Skeleton className="h-7 w-1/2" />
        </div>
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
    </div>
  );
};

export const SkeletonCards = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
};

const SkeletonToolbar = () => (
  <div className="flex items-center gap-3">
    <Skeleton className="h-8 w-64 rounded-lg" />
    <Skeleton className="h-8 w-24 rounded-lg" />
    <Skeleton className="h-8 w-24 rounded-lg" />
  </div>
);

export const SkeletonTable = ({ rows = 5 }: { rows?: number }) => {
  return (
    <div className="space-y-4">
      <SkeletonToolbar />
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="py-3 px-4 border-b border-border">
          <div className="flex items-center gap-8">
            <Skeleton className="h-3.5 w-1/6" />
            <Skeleton className="h-3.5 w-1/6" />
            <Skeleton className="h-3.5 w-1/6" />
            <Skeleton className="h-3.5 w-1/8" />
          </div>
        </div>
        <div className="divide-y divide-border">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="py-3.5 px-4 flex items-center gap-8">
              <Skeleton className="h-3.5 w-1/4" />
              <Skeleton className="h-3.5 w-1/6" />
              <Skeleton className="h-3.5 w-1/6" />
              <Skeleton className="h-5 w-14 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const SkeletonForm = () => {
  return (
    <div className="border border-border rounded-lg bg-background p-6 space-y-5">
      <Skeleton className="h-6 w-1/3" />
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <Skeleton className="h-3.5 w-1/4" />
            <Skeleton className="h-8 w-full rounded-lg" />
          </div>
        ))}
      </div>
      <div className="flex justify-end gap-2 pt-4 border-t border-border">
        <Skeleton className="h-8 w-20 rounded-lg" />
        <Skeleton className="h-8 w-28 rounded-lg" />
      </div>
    </div>
  );
};

/** @deprecated Use SkeletonCards + SkeletonTable instead */
export const SkeletonDashboard = () => {
  return (
    <div className="space-y-5">
      <SkeletonCards />
      <SkeletonTable rows={8} />
    </div>
  );
};
