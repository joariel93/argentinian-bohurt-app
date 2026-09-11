import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { ProgressSpinner } from 'primereact/progressspinner';

const AdminRoute = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    debugger
    /*if (!loading && (!user || !isAdmin())) {
      router.push('/login');
    }*/
  }, [user, loading, isAdmin, router]);

  if (loading) {
    return (
      <div className="flex justify-content-center align-items-center min-h-screen">
        <ProgressSpinner />
      </div>
    );
  }

  if (!user || !isAdmin()) {
    return null;
  }

  return children;
};

export default AdminRoute;
