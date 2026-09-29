import { useState, useEffect } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { AutoComplete } from 'primereact/autocomplete';
import { ProgressSpinner } from 'primereact/progressspinner';
import ImageUpload from '@/components/common/inputs/ImageUpload';
import SocialLinksInput from '@/components/common/inputs/SocialLinksInput';
import FormSubmitButton from '@/components/common/buttons/FormSubmitButton';
import apiService from '@/services/apiService';
import { useToast } from '@/contexts/ToastContext';

function formatDate(raw) {
  if (!raw) return null;
  const d = new Date(raw);
  if (isNaN(d.getTime())) return null;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const emptyEvento = {
  id: null,
  nombre: '',
  localizacion: '',
  fechaEvento: '',
  fechaCierreInscripcion: '',
  idReglamento: 1,
  imagen: '',
  linkTransmision: '',
  password: '',
  redesSociales: [],
  clubesInvitados: [],
  torneos: [],
};

const emptyTorneo = {
  _key: null,
  id: null,
  idModalidad: 1,
  idCategoria: 1,
  idGenero: 1,
  idTipoTorneo: null,
  password: '',
};

export default function EventForm({ initialData, mode = 'create', onSubmit }) {
  const { showError, showSuccess } = useToast();
  const [evento, setEvento] = useState(emptyEvento);
  const [reglamentoOptions, setReglamentoOptions] = useState([]);
  const [modalidadOptions, setModalidadOptions] = useState([]);
  const [generoOptions, setGeneroOptions] = useState([]);
  const [redesSocialesOptions, setRedesSocialesOptions] = useState([]);
  const [categoriaOptions, setCategoriaOptions] = useState([]);
  const [clubsOptions, setClubsOptions] = useState([]);
  const [filteredClubs, setFilteredClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [nuevoTorneo, setNuevoTorneo] = useState(emptyTorneo);

  const loadLookups = async () => {
    setLoading(true);
    try {
      const [reg, mod, gen, redes, clubs] = await Promise.all([
        apiService.fetchLookupReglamento?.() ?? [],
        apiService.fetchLookupModalidad?.() ?? [],
        apiService.fetchLookupGenero?.() ?? [],
        apiService.fetchLookupRedesSociales?.() ?? [],
        apiService.fetchClubs?.() ?? [],
      ]);
      setReglamentoOptions(reg || []);
      setModalidadOptions(mod || []);
      setGeneroOptions(gen || []);
      setRedesSocialesOptions(redes || []);
      setClubsOptions(clubs || []);
    } catch (err) {
      showError('Error al cargar catálogos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLookups();
  }, []);

  useEffect(() => {
    if (initialData) {
      setEvento({
        id: initialData.id || null,
        nombre: initialData.nombre || '',
        localizacion: initialData.localizacion || '',
        fechaEvento: initialData.fechaEvento || '',
        fechaCierreInscripcion: initialData.fechaCierreInscripcion || '',
        idReglamento: initialData.idReglamento || 1,
        imagen: initialData.imagen || '',
        linkTransmision: initialData.linkTransmision || '',
        password: '',
        redesSociales: mapRedesToForm(initialData.redesSociales || []),
        clubesInvitados: initialData.clubesInvitados || [],
        torneos: (initialData.torneos || []).map((t) => ({
          _key: t.id || `existing-${Math.random()}`,
          id: t.id || null,
          idModalidad: t.idModalidad,
          idCategoria: t.idCategoria,
          idGenero: t.idGenero,
          idTipoTorneo: t.idTipoTorneo || null,
          password: t.password || '',
        })),
      });
    }
  }, [initialData]);

  useEffect(() => {
    const loadCategorias = async () => {
      if (!nuevoTorneo.idModalidad) {
        setCategoriaOptions([]);
        return;
      }
      const data = await apiService.fetchLookupCategoria?.(nuevoTorneo.idModalidad) ?? [];
      setCategoriaOptions(data);
    };
    loadCategorias();
  }, [nuevoTorneo.idModalidad]);

  const mapRedesToForm = (redes = []) => {
    return redes
      .map((r) => {
        const option = redesSocialesOptions.find((o) => o.valor === r.nombre);
        if (!option) return null;
        return { idRedSocial: option.id, link: r.link || '' };
      })
      .filter(Boolean);
  };

  const mapRedesToPayload = (redes = []) => {
    return redes
      .filter((r) => r.idRedSocial && r.link)
      .map((r) => ({ idRedSocial: r.idRedSocial, link: r.link }));
  };

  const onInputChange = (e, name) => {
    const val = (e.target && e.target.value) || '';
    setEvento((prev) => ({ ...prev, [name]: val }));
  };

  const onDateChange = (e, name) => {
    const date = e.value;
    const formatted = date ? formatDate(date) : '';
    setEvento((prev) => ({ ...prev, [name]: formatted }));
  };

  const searchClubs = (e) => {
    const q = (e.query || '').toLowerCase();
    const results = clubsOptions.filter((c) => c.nombre.toLowerCase().includes(q));
    setFilteredClubs(results);
  };

  const handleAddClub = (e) => {
    const club = e.value;
    if (!club || evento.clubesInvitados.some((c) => c.idClub === club.id)) return;
    setEvento((prev) => ({
      ...prev,
      clubesInvitados: [...prev.clubesInvitados, { idClub: club.id, nombreClubManual: null, email: null, telefono: null }],
    }));
  };

  const handleRemoveClub = (idx) => {
    setEvento((prev) => ({
      ...prev,
      clubesInvitados: prev.clubesInvitados.filter((_, i) => i !== idx),
    }));
  };

  const refreshOtp = async () => {
    const data = await apiService.generateUniqueOtp();
    if (data?.otp) {
      setNuevoTorneo((prev) => ({ ...prev, password: data.otp }));
    }
  };

  const handleAddTorneo = async () => {
    if (!nuevoTorneo.idModalidad || !nuevoTorneo.idCategoria || !nuevoTorneo.idGenero) {
      showError('Modalidad, categoría y género son requeridos');
      return;
    }

    let otp = nuevoTorneo.password;
    if (!otp) {
      const data = await apiService.generateUniqueOtp();
      otp = data?.otp;
    }
    if (!otp) {
      showError('No se pudo generar OTP para el torneo');
      return;
    }

    const newT = {
      ...nuevoTorneo,
      password: otp,
      _key: `new-${Date.now()}-${Math.random()}`,
    };
    setEvento((prev) => ({ ...prev, torneos: [...prev.torneos, newT] }));
    setNuevoTorneo(emptyTorneo);
  };

  const handleRemoveTorneo = (key) => {
    setEvento((prev) => ({
      ...prev,
      torneos: prev.torneos.filter((t) => t._key !== key),
    }));
  };

  const validate = () => {
    if (!evento.nombre || !evento.localizacion || !evento.fechaEvento || !evento.fechaCierreInscripcion) {
      showError('Nombre, localización y fechas son requeridos');
      return false;
    }
    if (mode === 'create' && evento.torneos.length === 0) {
      showError('Debe agregar al menos un torneo/categoría');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);

    const payload = {
      nombre: evento.nombre,
      localizacion: evento.localizacion,
      fechaEvento: evento.fechaEvento,
      fechaCierreInscripcion: evento.fechaCierreInscripcion,
      idReglamento: evento.idReglamento,
      imagen: evento.imagen || null,
      linkTransmision: evento.linkTransmision || null,
      password: evento.password || undefined,
      redesSociales: mapRedesToPayload(evento.redesSociales),
      clubesInvitados: evento.clubesInvitados.map((c) => ({
        idClub: c.idClub || null,
        nombreClubManual: c.nombreClubManual || null,
        email: c.email || null,
        telefono: c.telefono || null,
      })),
      torneos: evento.torneos.map((t) => ({
        id: t.id || undefined,
        idModalidad: t.idModalidad,
        idCategoria: t.idCategoria,
        idGenero: t.idGenero,
        idTipoTorneo: t.idTipoTorneo,
        password: t.password || undefined,
      })),
    };

    let result;
    if (mode === 'edit' && evento.id) {
      result = await apiService.updateEvent(evento.id, payload);
    } else {
      result = await apiService.createEvent(payload);
    }

    setSubmitting(false);
    if (result?.error) {
      showError(result.error);
      return;
    }
    showSuccess(mode === 'edit' ? 'Evento actualizado' : 'Evento creado');
    if (onSubmit) onSubmit(payload);
    return result;
  };

  if (loading) {
    return (
      <div className="flex justify-content-center align-items-center p-6">
        <ProgressSpinner style={{ width: '50px', height: '50px' }} />
      </div>
    );
  }

  return (
    <div className="flex flex-column gap-4">
      <fieldset>
        <legend>Información Principal del Evento</legend>
        <div className="p-fluid grid">
          <div className="field col-12 md:col-6">
            <label htmlFor="nombre">Nombre *</label>
            <InputText id="nombre" value={evento.nombre} onChange={(e) => onInputChange(e, 'nombre')} disabled={submitting} />
          </div>
          <div className="field col-12 md:col-6">
            <label htmlFor="localizacion">Localización *</label>
            <InputText id="localizacion" value={evento.localizacion} onChange={(e) => onInputChange(e, 'localizacion')} disabled={submitting} />
          </div>
          <div className="field col-12 md:col-6">
            <label htmlFor="fechaEvento">Fecha del Evento *</label>
            <Calendar
              id="fechaEvento"
              value={evento.fechaEvento ? new Date(evento.fechaEvento) : null}
              onChange={(e) => onDateChange(e, 'fechaEvento')}
              dateFormat="yy-mm-dd"
              showIcon
              disabled={submitting}
            />
          </div>
          <div className="field col-12 md:col-6">
            <label htmlFor="fechaCierreInscripcion">Cierre de Inscripción *</label>
            <Calendar
              id="fechaCierreInscripcion"
              value={evento.fechaCierreInscripcion ? new Date(evento.fechaCierreInscripcion) : null}
              onChange={(e) => onDateChange(e, 'fechaCierreInscripcion')}
              dateFormat="yy-mm-dd"
              showIcon
              disabled={submitting}
            />
          </div>
          <div className="field col-12 md:col-6">
            <label htmlFor="idReglamento">Reglamento *</label>
            <Dropdown
              id="idReglamento"
              value={evento.idReglamento}
              options={reglamentoOptions.map((r) => ({ label: r.valor, value: r.id }))}
              onChange={(e) => setEvento((prev) => ({ ...prev, idReglamento: e.value }))}
              disabled={submitting}
            />
          </div>
          <div className="field col-12 md:col-6">
            <label htmlFor="password">OTP del Evento</label>
            <div className="flex gap-2">
              <InputText id="password" value={evento.password} disabled placeholder="Se autogenera al guardar" />
              {mode === 'create' && (
                <Button
                  icon="pi pi-refresh"
                  onClick={async () => {
                    const data = await apiService.generateUniqueOtp();
                    if (data?.otp) setEvento((prev) => ({ ...prev, password: data.otp }));
                  }}
                  disabled={submitting}
                />
              )}
            </div>
          </div>
          <div className="field col-12">
            <ImageUpload
              label="Banner / Imagen"
              value={evento.imagen}
              onChange={(url) => setEvento((prev) => ({ ...prev, imagen: url }))}
              disabled={submitting}
            />
          </div>
          <div className="field col-12">
            <label htmlFor="linkTransmision">Link de transmisión en vivo</label>
            <InputText
              id="linkTransmision"
              value={evento.linkTransmision}
              onChange={(e) => onInputChange(e, 'linkTransmision')}
              placeholder="https://youtube.com/..."
              disabled={submitting}
            />
          </div>
          <div className="field col-12">
            <SocialLinksInput
              value={evento.redesSociales}
              options={redesSocialesOptions}
              onChange={(redes) => !submitting && setEvento((prev) => ({ ...prev, redesSociales: redes }))}
            />
          </div>
        </div>
      </fieldset>

      <fieldset>
        <legend>Clubes Invitados</legend>
        <div className="flex flex-column gap-2">
          <AutoComplete
            field="nombre"
            suggestions={filteredClubs}
            completeMethod={searchClubs}
            onChange={handleAddClub}
            placeholder="Buscar club..."
            disabled={submitting}
          />
          <DataTable value={evento.clubesInvitados} emptyMessage="Sin clubes invitados">
            <Column
              header="Club"
              body={(row) => row.nombreClubManual || clubsOptions.find((c) => c.id === row.idClub)?.nombre || 'Sin nombre'}
            />
            <Column
              header="Acciones"
              body={(_, { rowIndex }) => (
                <Button
                  icon="pi pi-trash"
                  className="p-button-rounded p-button-danger p-button-sm"
                  onClick={() => handleRemoveClub(rowIndex)}
                  disabled={submitting}
                />
              )}
            />
          </DataTable>
        </div>
      </fieldset>

      <fieldset>
        <legend>Torneos / Categorías</legend>
        <div className="p-fluid grid mb-3">
          <div className="field col-12 md:col-3">
            <label htmlFor="newIdModalidad">Modalidad</label>
            <Dropdown
              id="newIdModalidad"
              value={nuevoTorneo.idModalidad}
              options={modalidadOptions.map((m) => ({ label: m.valor, value: m.id }))}
              onChange={(e) => setNuevoTorneo((prev) => ({ ...prev, idModalidad: e.value, idCategoria: 1 }))}
              disabled={submitting}
            />
          </div>
          <div className="field col-12 md:col-3">
            <label htmlFor="newIdCategoria">Categoría</label>
            <Dropdown
              id="newIdCategoria"
              value={nuevoTorneo.idCategoria}
              options={categoriaOptions.map((c) => ({ label: c.valor, value: c.value || c.id }))}
              onChange={(e) => setNuevoTorneo((prev) => ({ ...prev, idCategoria: e.value }))}
              disabled={submitting}
            />
          </div>
          <div className="field col-12 md:col-3">
            <label htmlFor="newIdGenero">Género</label>
            <Dropdown
              id="newIdGenero"
              value={nuevoTorneo.idGenero}
              options={generoOptions.map((g) => ({ label: g.valor, value: g.id }))}
              onChange={(e) => setNuevoTorneo((prev) => ({ ...prev, idGenero: e.value }))}
              disabled={submitting}
            />
          </div>
          <div className="field col-12 md:col-3">
            <label htmlFor="newPassword">OTP del Torneo</label>
            <div className="flex gap-2">
              <InputText id="newPassword" value={nuevoTorneo.password} disabled placeholder="Autogenerado" />
              <Button icon="pi pi-refresh" onClick={refreshOtp} disabled={submitting} />
            </div>
          </div>
          <div className="col-12 flex justify-content-end">
            <Button label="+ Agregar Categoría" icon="pi pi-plus" onClick={handleAddTorneo} disabled={submitting} />
          </div>
        </div>

        <DataTable value={evento.torneos} emptyMessage="Sin categorías agregadas">
          <Column
            header="Modalidad"
            body={(row) => modalidadOptions.find((m) => m.id === row.idModalidad)?.valor || '-'}
          />
          <Column
            header="Categoría"
            body={(row) => {
              const cats = row.idModalidad === nuevoTorneo.idModalidad ? categoriaOptions : [];
              return cats.find((c) => (c.value || c.id) === row.idCategoria)?.valor || `Cat #${row.idCategoria}`;
            }}
          />
          <Column
            header="Género"
            body={(row) => generoOptions.find((g) => g.id === row.idGenero)?.valor || '-'}
          />
          <Column header="OTP" field="password" />
          <Column
            header="Acciones"
            body={(_, { rowIndex, row }) => (
              <Button
                icon="pi pi-trash"
                className="p-button-rounded p-button-danger p-button-sm"
                onClick={() => handleRemoveTorneo(row._key)}
                disabled={submitting}
              />
            )}
          />
        </DataTable>
      </fieldset>

      <div className="flex justify-content-end">
        <FormSubmitButton
          loading={submitting}
          label={mode === 'edit' ? 'Guardar Cambios' : 'Crear Evento y Torneos'}
          icon="pi pi-check"
          onClick={handleSubmit}
        />
      </div>
    </div>
  );
}
