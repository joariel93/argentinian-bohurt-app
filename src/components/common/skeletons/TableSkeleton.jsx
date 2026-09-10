import React from 'react';
import { Skeleton } from 'primereact/skeleton';

export default function TableSkeleton({ rows = 5, columns = 4 }) {
  return (
    <div className="w-full">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-2 mb-2">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} height="2.5rem" className="flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}
