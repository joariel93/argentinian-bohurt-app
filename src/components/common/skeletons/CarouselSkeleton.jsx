import React from 'react';
import { Skeleton } from 'primereact/skeleton';

export default function CarouselSkeleton() {
  return (
    <div className="news-carousel-container">
      <div className="border-round overflow-hidden surface-card shadow-2" style={{ height: '400px' }}>
        <Skeleton width="100%" height="250px" />
        <div className="p-3">
          <Skeleton width="70%" height="1.5rem" className="mb-2" />
          <Skeleton width="40%" height="1rem" className="mb-3" />
          <Skeleton width="100%" height="1rem" className="mb-2" />
          <Skeleton width="30%" height="2rem" />
        </div>
      </div>
    </div>
  );
}
