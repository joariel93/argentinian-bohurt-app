import React from 'react';
import { Skeleton } from 'primereact/skeleton';

export default function NewsDetailSkeleton() {
  return (
    <div className="card noticia-detail">
      <Skeleton width="6rem" height="2rem" className="mb-4" />
      <Skeleton width="100%" height="400px" className="mb-4" />
      <Skeleton width="80%" height="3rem" className="mb-3" />
      <Skeleton width="60%" height="1.5rem" className="mb-4" />
      <Skeleton width="100%" height="1rem" className="mb-2" />
      <Skeleton width="100%" height="1rem" className="mb-2" />
      <Skeleton width="90%" height="1rem" className="mb-2" />
      <Skeleton width="100%" height="1rem" className="mb-2" />
    </div>
  );
}
