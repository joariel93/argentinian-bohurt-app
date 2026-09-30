import { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { ProgressSpinner } from 'primereact/progressspinner';
import apiService from '@/services/apiService';
import { useToast } from '@/contexts/ToastContext';

const emptyForm = {
  dni: '',
  nombre: '',
  apellido: '',
  fechaNacimiento: null,
  idClub: null,
};

export default function FighterQuickCreateDialog({ visible, onHide, onCreated }) {
  const { showError, showSuccess } = useToast();
  const [form, setForm] = useState(emptyForm);
  const [clubs, setClubs] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!visible) {
      setForm(emptyForm);
      return;
    }
    const loadClubs = async () => {
      const data = await apiService.fetchClubsSimplify();
      setClubs(data || []);
    };
    loadClubs();
  }, [visible]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validate = () => {
    if (!form.dni || form.dni.length < 6) return 'DNI inválido';
    if (!form.nombre) return 'Nombre es requerido';
    if (!form.apellido) return 'Apellido es requerido';
    if (!form.fechaNacimiento) return 'Fecha de nacimiento es requerida';
    return null;
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) {
      showError(err);
      return;
    }
    setSubmitting(true);
    const dni = String(form.dni).replace(/\D/g, '');
    const fecha = form.fechaNacimiento instanceof Date
      ? form.fechaNacimiento.toISOString().split('T')[0]
      : form.fechaNacimiento;

    const result = await apiService.createUsuarioRapido({
      dni,
      nombre: form.nombre.trim(),
      apellido: form.apellido.trim(),
      fechaNacimiento: fecha,
      idClub: form.idClub || undefined,
    });
    setSubmitting(false);

    if (result?.error) {
      showError(result.error);
      return;
    }

    showSuccess(`Peleador ${result.nombre} ${result.apellido} creado`);
    if (onCreated) onCreated(result);
    onHide();
  };

  return (
    <Dialog
      header="Nuevo peleador"
      visible={visible}
      onHide={onHide}
      style={{ width: '450px' }}
      modal
    >
      <div className="p-fluid">
        <div className="field mb-3">
          <label htmlFor="dni">DNI *</label>
          <InputText
            id="dni"
            value={form.dni}
            onChange={(e) => handleChange('dni', e.target.value)}
            keyfilter="int"
            placeholder="12345678"
            disabled={submitting}
          />
        </div>
        <div className="field mb-3">
          <label htmlFor="nombre">Nombre *</label>
          <InputText
            id="nombre"
            value={form.nombre}
            onChange={(e) => handleChange('nombre', e.target.value)}
            disabled={submitting}
          />
        </div>
        <div className="field mb-3">
          <label htmlFor="apellido">Apellido *</label>
          <InputText
            id="apellido"
            value={form.apellido}
            onChange={(e) => handleChange('apellido', e.target.value)}
            disabled={submitting}
          />
        </div>
        <div className="field mb-3">
          <label htmlFor="fechaNacimiento">Fecha de nacimiento *</label>
          <Calendar
            id="fechaNacimiento"
            value={form.fechaNacimiento}
            onChange={(e) => handleChange('fechaNacimiento', e.value)}
            dateFormat="yy-mm-dd"
            showIcon
            disabled={submitting}
          />
        </div>
        <div className="field mb-3">
          <label htmlFor="idClub">Club (opcional)</label>
          <Dropdown
            id="idClub"
            value={form.idClub}
            options={clubs.map((c) => ({ label: c.nombre, value: c.id }))}
            onChange={(e) => handleChange('idClub', e.value)}
            placeholder="Sin club (se asignará a Mercenarios si existe)"
            filter
            disabled={submitting}
            showClear
          />
        </div>
        <div className="flex justify-content-end gap-2">
          <Button label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={onHide} disabled={submitting} />
          <Button
            label="Crear peleador"
            icon="pi pi-check"
            onClick={handleSubmit}
            disabled={submitting}
          />
        </div>
        {submitting && (
          <div className="flex justify-content-center mt-3">
            <ProgressSpinner style={{ width: '30px', height: '30px' }} />
          </div>
        )}
      </div>
    </Dialog>
  );
}
