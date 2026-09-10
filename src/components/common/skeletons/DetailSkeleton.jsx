import React from 'react';
import { Skeleton } from 'primereact/skeleton';

export default function DetailSkeleton({ hasImage = true, lines = 4, actionButtons = 0 }) {
  return (
    <div className="card">
      <div className="flex flex-column md:flex-row gap-4 mb-4">
        {hasImage && (
          <div className="flex justify-content-center md:justify-content-start" style={{ minWidth: '200px' }}>
            <Skeleton width="200px" height="200px" shape="circle" />
          </div>
        )}
        <div className="flex-1">
          <Skeleton width="70%" height="2rem" className="mb-3" />
          <Skeleton width="50%" height="1rem" className="mb-2" />
          <Skeleton width="40%" height="1rem" className="mb-2" />
          {Array.from({ length: lines }).map((_, i) => (
            <Skeleton key={i} width="100%" height="1rem" className="mb-2" />
          ))}
          {actionButtons > 0 && (
            <div className="flex gap-2 mt-3">
              {Array.from({ length: actionButtons }).map((_, i) => (
                <Skeleton key={i} width="8rem" height="2.5rem" />
              ))}
            </div>
          )}
        </div>
      </div>
      <Skeleton width="100%" height="150px" />
    </div>
  );
}
