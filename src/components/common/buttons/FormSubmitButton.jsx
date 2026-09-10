import React from 'react';
import { Button } from 'primereact/button';

export default function FormSubmitButton({ loading, label = 'Guardar', icon = 'pi pi-check', ...props }) {
  return <Button label={label} icon={icon} loading={loading} disabled={loading || props.disabled} {...props} />;
}
