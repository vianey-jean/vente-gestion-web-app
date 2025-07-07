
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const LoadingFallback: React.FC = () => {
  return (
    <div className="container mx-auto p-4 space-y-4">
      <Skeleton className="h-8 w-1/4" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  );
};

export default LoadingFallback;
