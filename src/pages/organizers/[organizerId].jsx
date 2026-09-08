import React from 'react';
import { Card } from 'primereact/card';

const OrganizerPage = () => {
  return (
    <div className="p-4 flex justify-content-center">
      <Card title="Gestión de Organizadores" className="col-12 md:col-8 lg:col-6">
        <p className="text-lg text-center">
          Esta funcionalidad estará disponible próximamente.
        </p>
        <p className="text-center text-secondary">
          Muy pronto podrás gestionar tus torneos, invitar capitanes y configurar la estructura del evento.
        </p>
      </Card>
    </div>
  );
};

export default OrganizerPage;
