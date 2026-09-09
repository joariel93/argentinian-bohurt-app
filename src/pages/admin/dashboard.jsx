import React from 'react';
import { useRouter } from 'next/router';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import AdminRoute from '@/components/admin/AdminRoute';

const AdminDashboardPage = () => {
  const router = useRouter();

  const modules = [
    { label: 'Clubes', icon: 'pi pi-users', route: '/admin/clubs', description: 'Gestión de clubes' },
    { label: 'Equipos', icon: 'pi pi-shield', route: '/admin/teams', description: 'Gestión de equipos' },
    { label: 'Usuarios', icon: 'pi pi-user', route: '/admin/users', description: 'Gestión de usuarios' },
    { label: 'Torneos', icon: 'pi pi-trophy', route: '/admin/tournaments', description: 'Gestión de torneos' },
    { label: 'Noticias', icon: 'pi pi-comments', route: '/admin/news', description: 'Gestión de noticias' },
  ];

  return (
    <AdminRoute>
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">Panel de Administración</h1>
      <div className="grid">
        {modules.map((module) => (
          <div key={module.route} className="col-12 md:col-6 lg:col-4 p-2">
            <Card title={module.label} subTitle={module.description}>
              <div className="flex justify-content-end">
                <Button
                  icon={module.icon}
                  label="Gestionar"
                  onClick={() => router.push(module.route)}
                />
              </div>
            </Card>
          </div>
        ))}
      </div>
    </div>
    </AdminRoute>
  );
};

export default AdminDashboardPage;
