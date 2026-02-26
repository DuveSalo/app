interface SkeletonProps {
  className?: string;
}

export const Skeleton = ({ className = '' }: SkeletonProps) => {
  return (
    <div className={`animate-pulse bg-neutral-200 rounded-lg ${className}`} />
  );
};

export const SkeletonCard = () => {
  return (
    <div className="bg-white rounded-xl border border-neutral-200 shadow-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-8 w-1/2" />
        </div>
        <Skeleton className="h-10 w-10 rounded-md" />
      </div>
    </div>
  );
};

export const SkeletonTable = ({ rows = 5 }: { rows?: number }) => {
  return (
    <div className="bg-white rounded-xl border border-neutral-200 shadow-card overflow-hidden">
      <div className="px-4 py-3 border-b border-neutral-200 bg-neutral-50">
        <Skeleton className="h-5 w-1/4" />
      </div>
      <div className="divide-y divide-neutral-200">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="px-4 py-3 flex items-center space-x-4">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/6" />
            <Skeleton className="h-4 w-1/6" />
            <Skeleton className="h-5 w-16 rounded-sm" />
          </div>
        ))}
      </div>
    </div>
  );
};

export const SkeletonDashboard = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-neutral-200 shadow-card p-4">
          <div className="flex items-center justify-between mb-3">
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-5 w-16 rounded-sm" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const SkeletonForm = () => {
  return (
    <div className="bg-white rounded-xl border border-neutral-200 shadow-card p-6 space-y-6">
      <Skeleton className="h-7 w-1/3" />
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-9 w-full rounded-md" />
          </div>
        ))}
      </div>
      <div className="flex justify-end space-x-3">
        <Skeleton className="h-9 w-24 rounded-md" />
        <Skeleton className="h-9 w-32 rounded-md" />
      </div>
    </div>
  );
};
