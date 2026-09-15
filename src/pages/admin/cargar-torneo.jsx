import { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { Fieldset } from 'primereact/fieldset';
import { FloatLabel } from 'primereact/floatlabel';
import { InputText } from 'primereact/inputtext';
import { RadioButton } from 'primereact/radiobutton';
import { Steps } from 'primereact/steps';
import AdminRoute from '@/components/admin/AdminRoute';
import SocialLinksInput from '@/components/common/inputs/SocialLinksInput';
import FormSubmitButton from '@/components/common/buttons/FormSubmitButton';
import apiService from '@/services/apiService';
import { useToast } from '@/contexts/ToastContext';

const STEP_ITEMS = [
  { label: 'Datos generales' },
  { label: 'Equipos' },
  { label: 'Combates' },
  { label: 'Confirmar' },
];

export default function CargarTorneo() {
  const { showError, showSuccess } = useToast();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // ── Sección 1 ──
  const [nombre, setNombre] = useState('');
  const [fechaTorneo, setFechaTorneo] = useState(null);
  const [fechaCierre, setFechaCierre] = useState(null);
  const [localizacion, setLocalizacion] = useState('');
  const [reglamento, setReglamento] = useState(null);
  const [modalidad, setModalidad] = useState(null);
  const [categoria, setCategoria] = useState(null);
  const [tipoTorneo, setTipoTorneo] = useState(null);
  const [genero, setGenero] = useState(null);
  const [linkTransmision, setLinkTransmision] = useState('');
  const [redesSociales, setRedesSociales] = useState([]);

  const [reglamentoOptions, setReglamentoOptions] = useState([]);
  const [modalidadOptions, setModalidadOptions] = useState([]);
  const [categoriaOptions, setCategoriaOptions] = useState([]);
  const [tipoTorneoOptions, setTipoTorneoOptions] = useState([]);
  const [generoOptions, setGeneroOptions] = useState([]);
  const [redesSocialesOptions, setRedesSocialesOptions] = useState([]);

  // ── Sección 2 ──
  const [equiposLocales, setEquiposLocales] = useState([]);
  const [equiposFiltrados, setEquiposFiltrados] = useState([]);
  const [selectedEquipo, setSelectedEquipo] = useState(null);
  const [equipoSeleccionadoEnGrilla, setEquipoSeleccionadoEnGrilla] = useState(null);
  const [showNewTeamModal, setShowNewTeamModal] = useState(false);
  const [newTeamNombre, setNewTeamNombre] = useState('');
  const [newTeamFecha, setNewTeamFecha] = useState(null);
  const [newTeamLogo, setNewTeamLogo] = useState('');

  // ── Sección 2: peleadores ──
  const [showFightersModal, setShowFightersModal] = useState(false);
  const [fighterSearch, setFighterSearch] = useState('');
  const [fighterSearchResults, setFighterSearchResults] = useState([]);
  const [searchingFighters, setSearchingFighters] = useState(false);
  const [showNewFighterModal, setShowNewFighterModal] = useState(false);
  const [newFighterNombre, setNewFighterNombre] = useState('');
  const [newFighterApellido, setNewFighterApellido] = useState('');
  const [newFighterDni, setNewFighterDni] = useState('');
  const [newFighterFechaNacimiento, setNewFighterFechaNacimiento] = useState(null);
  const [creatingFighter, setCreatingFighter] = useState(false);
  const [peleadoresPorEquipo, setPeleadoresPorEquipo] = useState([]);

  // ── Sección 3: Combates ──
  const [combates, setCombates] = useState([]);
  const [eq1, setEq1] = useState(null);
  const [eq2, setEq2] = useState(null);
  const [roundsActual, setRoundsActual] = useState([]);
  const [combateLink, setCombateLink] = useState('');
  const [savingCombate, setSavingCombate] = useState(false);

  const s1Disabled = step > 0;
  const s2Disabled = step > 1;
  const s3Disabled = step > 2;

  // ── Lookups iniciales ──
  useEffect(() => {
    apiService.fetchLookupReglamento()
      .then((d) => setReglamentoOptions(d.map((i) => ({ value: i.id, label: i.valor }))))
      .catch((err) => showError(err.message || 'Error al cargar reglamentos'));
    apiService.fetchLookupModalidad()
      .then((d) => setModalidadOptions(d.map((i) => ({ value: i.id, label: i.valor }))))
      .catch((err) => showError(err.message || 'Error al cargar modalidades'));
    apiService.fetchLookupTipoTorneo()
      .then((d) => setTipoTorneoOptions(d.map((i) => ({ value: i.id, label: i.valor }))))
      .catch((err) => showError(err.message || 'Error al cargar tipos de torneo'));
    apiService.fetchLookupGenero()
      .then((d) => setGeneroOptions(d.map((i) => ({ value: i.id, label: i.valor }))))
      .catch((err) => showError(err.message || 'Error al cargar géneros'));
    apiService.fetchLookupRedesSociales()
      .then((d) => setRedesSocialesOptions(d))
      .catch((err) => showError(err.message || 'Error al cargar redes sociales'));
  }, []);

  useEffect(() => {
    if (modalidad) {
      apiService.fetchLookupCategorias(modalidad)
        .then((d) => setCategoriaOptions(d.map((i) => ({ value: i.id, label: i.valor }))))
        .catch((err) => showError(err.message || 'Error al cargar categorías'));
      setCategoria(null);
    } else {
      setCategoriaOptions([]);
    }
  }, [modalidad]);

  useEffect(() => {
    if (modalidad && categoria && genero) {
      apiService.fetchTeamsByFilters(modalidad, categoria, genero)
        .then(setEquiposFiltrados)
        .catch((err) => showError(err.message || 'Error al cargar equipos'));
    }
  }, [modalidad, categoria, genero]);

  // ── Utilidades ──
  const toDateString = (d) => {
    if (!d) return '';
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${yyyy}-${mm}-${dd}`;
  };

  // ── Sección 1: avanzar ──
  const handleAvanzarS1 = () => {
    if (!nombre || !fechaTorneo || !localizacion) {
      showError('Nombre, fecha y localización son requeridos');
      return;
    }
    setStep(1);
  };

  // ── Sección 2: equipos ──
  const handleAddEquipo = () => {
    if (!selectedEquipo) return;
    const yaExiste = equiposLocales.find((e) => e.id === selectedEquipo);
    if (yaExiste) {
      showError('El equipo ya está agregado');
      return;
    }
    const eq = equiposFiltrados.find((e) => e.id === selectedEquipo);
    if (eq) {
      setEquiposLocales([...equiposLocales, { ...eq, _isNew: false, posicion: '' }]);
    }
    setSelectedEquipo(null);
  };

  const handleCreateTeam = () => {
    if (!newTeamNombre || !newTeamFecha) {
      showError('Nombre y fecha de creación son requeridos');
      return;
    }
    setEquiposLocales([
      ...equiposLocales,
      {
        id: 'new_' + Date.now(),
        _isNew: true,
        nombre: newTeamNombre,
        fechaCreacion: toDateString(newTeamFecha),
        logo: newTeamLogo || '/Mercenarios.svg',
        posicion: '',
      },
    ]);
    setShowNewTeamModal(false);
    setNewTeamNombre('');
    setNewTeamFecha(null);
    setNewTeamLogo('');
  };

  const getPeleadoresEquipo = (equipoId) => {
    return peleadoresPorEquipo.find((p) => p.equipoId === equipoId)?.peleadores || [];
  };

  const handleOpenFightersModal = () => {
    if (!equipoSeleccionadoEnGrilla) return;
    setFighterSearch('');
    setFighterSearchResults([]);
    setShowFightersModal(true);
  };

  const handleCloseFightersModal = () => {
    setShowFightersModal(false);
    setFighterSearch('');
    setFighterSearchResults([]);
  };

  const handleSearchFighters = async () => {
    if (!fighterSearch.trim()) return;
    setSearchingFighters(true);
    const term = fighterSearch.trim();
    let results = [];
    if (/^\d+$/.test(term)) {
      results = await apiService.fetchFighterByDni(term);
    } else {
      results = await apiService.fetchFighters(term);
    }
    setFighterSearchResults(results);
    setSearchingFighters(false);
  };

  const handleSelectFighter = (fighter) => {
    const equipoId = equipoSeleccionadoEnGrilla.id;
    const yaExiste = getPeleadoresEquipo(equipoId).some((p) => p.id === fighter.id);
    if (yaExiste) {
      showError('El peleador ya está agregado a este equipo');
      return;
    }
    const nuevoPeleador = {
      id: fighter.id,
      nombre: fighter.nombre,
      apellido: fighter.apellido,
      dni: fighter.dni,
      fechaNacimiento: fighter.fechaNacimiento || '',
      numeroPeleador: getPeleadoresEquipo(equipoId).length + 1,
    };
    setPeleadoresPorEquipo((prev) => {
      const index = prev.findIndex((p) => p.equipoId === equipoId);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = { ...updated[index], peleadores: [...updated[index].peleadores, nuevoPeleador] };
        return updated;
      }
      return [...prev, { equipoId, peleadores: [nuevoPeleador] }];
    });
  };

  const handleCreateFighter = async () => {
    if (!newFighterNombre || !newFighterApellido || !newFighterDni || !newFighterFechaNacimiento) {
      showError('Nombre, apellido, DNI y fecha de nacimiento son requeridos');
      return;
    }
    setCreatingFighter(true);
    const result = await apiService.createFighter({
      nombre: newFighterNombre,
      apellido: newFighterApellido,
      dni: newFighterDni,
      fechaNacimiento: toDateString(newFighterFechaNacimiento),
    });
    setCreatingFighter(false);
    if (result.error) {
      showError(result.error);
      return;
    }
    handleSelectFighter({
      id: result.id,
      nombre: result.nombre,
      apellido: result.apellido,
      dni: result.dni,
      fechaNacimiento: result.fechaNacimiento,
    });
    setShowNewFighterModal(false);
    setNewFighterNombre('');
    setNewFighterApellido('');
    setNewFighterDni('');
    setNewFighterFechaNacimiento(null);
  };

  const handleUpdateNumeroPeleador = (equipoId, peleadorId, value) => {
    setPeleadoresPorEquipo((prev) =>
      prev.map((grupo) =>
        grupo.equipoId === equipoId
          ? {
              ...grupo,
              peleadores: grupo.peleadores.map((p) =>
                p.id === peleadorId ? { ...p, numeroPeleador: parseInt(value) || 0 } : p
              ),
            }
          : grupo
      )
    );
  };

  const handleRemovePeleador = (equipoId, peleadorId) => {
    setPeleadoresPorEquipo((prev) =>
      prev.map((grupo) =>
        grupo.equipoId === equipoId
          ? { ...grupo, peleadores: grupo.peleadores.filter((p) => p.id !== peleadorId) }
          : grupo
      )
    );
  };

  const handleRemoveEquipo = (id) => {
    setEquiposLocales(equiposLocales.filter((e) => e.id !== id));
    setPeleadoresPorEquipo((prev) => prev.filter((p) => p.equipoId !== id));
    if (equipoSeleccionadoEnGrilla?.id === id) {
      setEquipoSeleccionadoEnGrilla(null);
    }
  };

  const handleUpdatePosicion = (id, value) => {
    setEquiposLocales(equiposLocales.map((e) => (e.id === id ? { ...e, posicion: value } : e)));
  };

  const handleAvanzarS2 = () => {
    if (equiposLocales.length === 0) {
      showError('Agregá al menos un equipo');
      return;
    }
    setStep(2);
  };

  // ── Sección 3: combates ──
  const equipoOptions = () => equiposLocales.map((e) => ({ label: e.nombre, value: e.id }));
  const eq2Options = () => equipoOptions().filter((o) => o.value !== eq1);

  const handleAddRound = () => {
    if (!eq1 || !eq2) return;
    setRoundsActual([...roundsActual, { idGanador: null, puntajeEquipo1: '', puntajeEquipo2: '' }]);
  };

  const handleUpdateRound = (index, field, value) => {
    const updated = [...roundsActual];
    updated[index] = { ...updated[index], [field]: value };
    setRoundsActual(updated);
  };

  const handleRemoveRound = (index) => {
    setRoundsActual(roundsActual.filter((_, i) => i !== index));
  };

  const handleGuardarCombate = () => {
    if (savingCombate) return;
    if (!eq1 || !eq2) {
      showError('Seleccioná los dos equipos');
      return;
    }
    if (roundsActual.length === 0) {
      showError('Agregá al menos un round');
      return;
    }
    for (let i = 0; i < roundsActual.length; i++) {
      if (!roundsActual[i].idGanador) {
        showError(`Seleccioná el ganador del round ${i + 1}`);
        return;
      }
    }
    setSavingCombate(true);
    const rounds = roundsActual.map((r) => ({
      idGanador: r.idGanador,
      puntajeEquipo1: parseInt(r.puntajeEquipo1) || 0,
      puntajeEquipo2: parseInt(r.puntajeEquipo2) || 0,
    }));
    const wins1 = rounds.filter((r) => r.idGanador === eq1).length;
    const wins2 = rounds.filter((r) => r.idGanador === eq2).length;
    const combateGanador = wins1 > wins2 ? eq1 : wins2 > wins1 ? eq2 : null;

    setCombates([
      ...combates,
      {
        id: combates.length + 1,
        idEquipo1: eq1,
        idEquipo2: eq2,
        nombreEquipo1: equiposLocales.find((e) => e.id === eq1)?.nombre || '',
        nombreEquipo2: equiposLocales.find((e) => e.id === eq2)?.nombre || '',
        idGanadorCombate: combateGanador,
        nombreGanador: combateGanador
          ? equiposLocales.find((e) => e.id === combateGanador)?.nombre || ''
          : 'Empate',
        rounds,
        link: combateLink || '',
      },
    ]);
    setEq1(null);
    setEq2(null);
    setRoundsActual([]);
    setCombateLink('');
    setSavingCombate(false);
  };

  const handleRemoveCombate = (id) => {
    setCombates(combates.filter((c) => c.id !== id));
  };

  const handleAvanzarS3 = () => {
    if (combates.length === 0) {
      showError('Agregá al menos un combate');
      return;
    }
    setStep(3);
  };

  // ── Sección 4: confirmar y enviar todo ──
  const handleFinalSubmit = async () => {
    setSubmitting(true);
    try {
      const torneoData = {
        nombre,
        localizacion,
        fechaTorneo: toDateString(fechaTorneo),
        fechaCierreInscripcion: fechaCierre ? toDateString(fechaCierre) : toDateString(fechaTorneo),
        idReglamento: reglamento || 1,
        idGenero: genero || 1,
        idCategoria: categoria || 1,
        idModalidad: modalidad || 1,
        idTipoTorneo: tipoTorneo || null,
        linkTransmision: linkTransmision || null,
        redesSociales: redesSociales
          .filter((r) => r.idRedSocial && r.link)
          .map((r) => ({ idRedSocial: r.idRedSocial, link: r.link })),
      };

      const result = await apiService.adminCreateTorneo(torneoData);
      if (!result || !result.id) {
        showError('Error al crear el torneo');
        setSubmitting(false);
        return;
      }
      const torneoId = result.id;
      const idMap = {};
      let equipos = [];
      for (const eq of equiposLocales) {
        let equipoId = eq.id;
        if (eq._isNew) {
          const newResult = await apiService.adminCreateTeam({
            nombre: eq.nombre,
            fechaCreacion: eq.fechaCreacion,
            logo: eq.logo,
            idCategoria: categoria || 1,
            idModalidad: modalidad || 1,
            idGenero: genero || 1,
          });
          if (newResult && newResult.id) {
            idMap[eq.id] = newResult.id;
            equipoId = newResult.id;
          } else {
            continue;
          }
        }
        const originalId = eq.id;
        const cantidadCombates = combates.filter((x) => x.idEquipo1 === originalId || x.idEquipo2 === originalId).length;
        const cantidadVictorias = combates.filter((x) => x.idGanadorCombate === originalId).length;
        const roundsGanados = combates.reduce((total, combate) => {
          const rg = combate.rounds.filter((round) => round.idGanador === originalId).length;
          return total + rg;
        }, 0);
        const rounds = combates.reduce((total, combate) => {
          const participa = combate.idEquipo1 === originalId || combate.idEquipo2 === originalId;
          if (!participa) {
            return total;
          }
          return total + combate.rounds.length;
        }, 0);

        equipos.push({
          id_equipo: equipoId,
          posicion: eq.posicion,
          cantidadCombates: cantidadCombates,
          cantidadVictorias: cantidadVictorias,
          cantidadDerrotas: cantidadCombates - cantidadVictorias,
          cantidadRoundGanados: roundsGanados,
          cantidadRoundPerdidos: rounds - roundsGanados,
        });
      }

      const resolveId = (id) => idMap[id] || id;
      const combatesToSend = combates.map((c) => ({
        ...c,
        idEquipo1: resolveId(c.idEquipo1),
        idEquipo2: resolveId(c.idEquipo2),
        idGanadorCombate: c.idGanadorCombate ? resolveId(c.idGanadorCombate) : null,
        rounds: c.rounds.map((r) => ({
          ...r,
          idGanador: resolveId(r.idGanador),
        })),
      }));

      const peleadoresToSend = peleadoresPorEquipo.flatMap((grupo) =>
        grupo.peleadores.map((p) => ({
          idUsuario: p.id,
          idEquipo: resolveId(grupo.equipoId),
          numeroPeleador: p.numeroPeleador,
        }))
      );

      await apiService.addCombatesYEquiposToTorneo(torneoId, equipos, combatesToSend, peleadoresToSend);

      showSuccess(`Torneo "${nombre}" creado exitosamente (ID: ${torneoId})`);

      setNombre('');
      setFechaTorneo(null);
      setFechaCierre(null);
      setLocalizacion('');
      setReglamento(null);
      setModalidad(null);
      setCategoria(null);
      setTipoTorneo(null);
      setGenero(null);
      setLinkTransmision('');
      setRedesSociales([]);
      setEquiposLocales([]);
      setCombates([]);
      setPeleadoresPorEquipo([]);
      setEquipoSeleccionadoEnGrilla(null);
      setStep(0);
    } catch {
      showError('Error al crear el torneo');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Templates ──
  const logoBodyTemplate = (rowData) => {
    return rowData.logo ? (
      <img src={rowData.logo} alt={rowData.nombre} style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
    ) : null;
  };

  const actionBodyTemplate = (rowData) => {
    if (s2Disabled) return null;
    return (
      <Button
        icon="pi pi-trash"
        className="p-button-rounded p-button-danger p-button-text"
        onClick={() => handleRemoveEquipo(rowData.id)}
      />
    );
  };

  // ── Render ──
  return (
    <AdminRoute>
      <div className="card">
        <h2 className="mb-3">Carga de Torneo</h2>
        <Steps model={STEP_ITEMS} activeIndex={step} className="mb-4" />

        {/* ═══════════ SECCIÓN 1 ═══════════ */}
        <Fieldset legend="Sección 1: Datos generales" toggleable collapsed={step > 0}>
          <div className="p-fluid">
            <div className="grid">
              <div className="col-12 md:col-6">
                <div className="p-field mb-3">
                  <FloatLabel>
                    <InputText id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} disabled={s1Disabled || submitting} />
                    <label htmlFor="nombre">Nombre del torneo</label>
                  </FloatLabel>
                </div>
              </div>
              <div className="col-12 md:col-6">
                <div className="p-field mb-3">
                  <FloatLabel>
                    <InputText id="localizacion" value={localizacion} onChange={(e) => setLocalizacion(e.target.value)} disabled={s1Disabled || submitting} />
                    <label htmlFor="localizacion">Localización</label>
                  </FloatLabel>
                </div>
              </div>
            </div>

            <div className="grid">
              <div className="col-12 md:col-4">
                <div className="p-field mb-3">
                  <label htmlFor="fechaTorneo" className="mb-2 block">Fecha del torneo</label>
                  <Calendar id="fechaTorneo" value={fechaTorneo} onChange={(e) => setFechaTorneo(e.value)} dateFormat="dd/mm/yy" showIcon disabled={s1Disabled || submitting} />
                </div>
              </div>
              <div className="col-12 md:col-4">
                <div className="p-field mb-3">
                  <label htmlFor="fechaCierre" className="mb-2 block">Fecha cierre inscripción</label>
                  <Calendar id="fechaCierre" value={fechaCierre} onChange={(e) => setFechaCierre(e.value)} dateFormat="dd/mm/yy" showIcon disabled={s1Disabled || submitting} />
                </div>
              </div>
              <div className="col-12 md:col-4">
                <div className="p-field mb-3">
                  <FloatLabel>
                    <InputText id="linkTransmision" value={linkTransmision} onChange={(e) => setLinkTransmision(e.target.value)} disabled={s1Disabled || submitting} />
                    <label htmlFor="linkTransmision">Link transmisión en vivo</label>
                  </FloatLabel>
                </div>
              </div>
            </div>

            <div className="grid">
              <div className="col-12 md:col-4">
                <div className="p-field mb-3">
                  <label htmlFor="reglamento" className="mb-2 block">Reglamento</label>
                  <Dropdown id="reglamento" value={reglamento} options={reglamentoOptions} onChange={(e) => setReglamento(e.value)} placeholder="Seleccione reglamento" optionLabel="label" optionValue="value" disabled={s1Disabled || submitting} />
                </div>
              </div>
              <div className="col-12 md:col-4">
                <div className="p-field mb-3">
                  <label htmlFor="modalidad" className="mb-2 block">Modalidad</label>
                  <Dropdown id="modalidad" value={modalidad} options={modalidadOptions} onChange={(e) => setModalidad(e.value)} placeholder="Seleccione modalidad" optionLabel="label" optionValue="value" disabled={s1Disabled || submitting} />
                </div>
              </div>
              <div className="col-12 md:col-4">
                <div className="p-field mb-3">
                  <label htmlFor="categoria" className="mb-2 block">Categoría</label>
                  <Dropdown id="categoria" value={categoria} options={categoriaOptions} onChange={(e) => setCategoria(e.value)} placeholder={modalidad ? 'Seleccione categoría' : 'Primero seleccione modalidad'} optionLabel="label" optionValue="value" disabled={!modalidad || s1Disabled || submitting} />
                </div>
              </div>
            </div>

            <div className="grid">
              <div className="col-12 md:col-4">
                <div className="p-field mb-3">
                  <label htmlFor="tipoTorneo" className="mb-2 block">Tipo de torneo</label>
                  <Dropdown id="tipoTorneo" value={tipoTorneo} options={tipoTorneoOptions} onChange={(e) => setTipoTorneo(e.value)} placeholder="Seleccione tipo" optionLabel="label" optionValue="value" disabled={s1Disabled || submitting} />
                </div>
              </div>
              <div className="col-12 md:col-4">
                <div className="p-field mb-3">
                  <label htmlFor="genero" className="mb-2 block">Género</label>
                  <Dropdown id="genero" value={genero} options={generoOptions} onChange={(e) => setGenero(e.value)} placeholder="Seleccione género" optionLabel="label" optionValue="value" disabled={s1Disabled || submitting} />
                </div>
              </div>
            </div>

            <div className="grid">
              <div className="col-12">
                <SocialLinksInput
                  label="Redes sociales del torneo"
                  value={redesSociales}
                  options={redesSocialesOptions}
                  onChange={(redes) => !s1Disabled && !submitting && setRedesSociales(redes)}
                />
              </div>
            </div>
          </div>

          {!s1Disabled && (
            <div className="mt-3 flex justify-content-end">
              <Button label="Avanzar" icon="pi pi-arrow-right" onClick={handleAvanzarS1} disabled={submitting} />
            </div>
          )}
        </Fieldset>

        {/* ═══════════ SECCIÓN 2 ═══════════ */}
        {step >= 1 && (
          <Fieldset legend="Sección 2: Equipos participantes" toggleable collapsed={step > 1} className="mt-3">
            {!s2Disabled && (
              <div className="flex flex-wrap align-items-end gap-3 mb-3">
                <div className="flex-1 md:flex-none" style={{ minWidth: '250px' }}>
                  <label className="mb-2 block">Equipos existentes</label>
                  <Dropdown
                    value={selectedEquipo}
                    options={equiposFiltrados}
                    onChange={(e) => setSelectedEquipo(e.value)}
                    optionLabel="nombre"
                    optionValue="id"
                    placeholder="Seleccione un equipo"
                    filter
                    className="w-full"
                    disabled={submitting}
                  />
                </div>
                <Button label="Agregar" icon="pi pi-plus" disabled={!selectedEquipo || submitting} onClick={handleAddEquipo} />
                <Button label="Nuevo equipo" icon="pi pi-plus-circle" className="p-button-outlined" onClick={() => setShowNewTeamModal(true)} disabled={submitting} />
                <Button
                  label="Agregar peleadores"
                  icon="pi pi-users"
                  className="p-button-secondary"
                  disabled={!equipoSeleccionadoEnGrilla || submitting}
                  onClick={handleOpenFightersModal}
                />
              </div>
            )}

            <DataTable
              value={equiposLocales}
              stripedRows
              size="small"
              emptyMessage="No hay equipos agregados"
              selectionMode="single"
              selection={equipoSeleccionadoEnGrilla}
              onSelectionChange={(e) => setEquipoSeleccionadoEnGrilla(e.value)}
            >
              <Column field="nombre" header="Nombre" sortable />
              <Column field="fechaCreacion" header="Creación" />
              <Column
                header="Posición"
                body={(row) => (
                  <InputText
                    value={row.posicion || ''}
                    onChange={(e) => handleUpdatePosicion(row.id, e.target.value)}
                    keyfilter="int"
                    placeholder="-"
                    className="w-4rem"
                    disabled={s2Disabled || submitting}
                  />
                )}
                style={{ width: '6rem' }}
              />
              <Column header="Peleadores" body={(row) => getPeleadoresEquipo(row.id).length} style={{ width: '5rem' }} />
              <Column header="Logo" body={logoBodyTemplate} style={{ width: '4rem' }} />
              <Column header="Quitar" body={actionBodyTemplate} style={{ width: '4rem' }} />
            </DataTable>

            {!s2Disabled && (
              <div className="mt-3 flex justify-content-end">
                <Button label="Avanzar" icon="pi pi-arrow-right" onClick={handleAvanzarS2} disabled={submitting} />
              </div>
            )}
          </Fieldset>
        )}

        {/* ═══════════ SECCIÓN 3: COMBATES ═══════════ */}
        {step >= 2 && (
          <Fieldset legend="Sección 3: Combates y rounds" toggleable collapsed={step > 2} className="mt-3">
            <DataTable value={combates} stripedRows size="small" emptyMessage="No hay combates creados">
              <Column header="Orden" body={(_, { rowIndex }) => rowIndex + 1} style={{ width: '4rem' }} />
              <Column field="nombreEquipo1" header="Equipo 1" />
              <Column field="nombreEquipo2" header="Equipo 2" />
              <Column header="Ganador" body={(row) => row.nombreGanador} />
              <Column header="Rounds" body={(row) => row.rounds.length} style={{ width: '5rem' }} />
              <Column header="Link" body={(row) => (row.link ? <i className="pi pi-video text-primary" /> : '-')} style={{ width: '4rem' }} />
              {!s3Disabled && (
                <Column
                  header="Quitar"
                  body={(row) => (
                    <Button icon="pi pi-trash" className="p-button-rounded p-button-danger p-button-text" onClick={() => handleRemoveCombate(row.id)} />
                  )}
                  style={{ width: '4rem' }}
                />
              )}
            </DataTable>

            {!s3Disabled && (
              <div className="mt-4 p-3 border-1 surface-border border-round">
                <h4 className="mt-0">Nuevo Combate</h4>
                <div className="flex flex-wrap gap-3 mb-3">
                  <div style={{ minWidth: '200px', flex: 1 }}>
                    <label className="mb-2 block">Equipo 1</label>
                    <Dropdown
                      value={eq1}
                      options={equipoOptions()}
                      onChange={(e) => {
                        setEq1(e.value);
                        setEq2(null);
                        setRoundsActual([]);
                      }}
                      optionLabel="label"
                      optionValue="value"
                      placeholder="Seleccione equipo 1"
                      className="w-full"
                      disabled={submitting || savingCombate}
                    />
                  </div>
                  <div style={{ minWidth: '200px', flex: 1 }}>
                    <label className="mb-2 block">Equipo 2</label>
                    <Dropdown
                      value={eq2}
                      options={eq2Options()}
                      onChange={(e) => setEq2(e.value)}
                      optionLabel="label"
                      optionValue="value"
                      placeholder={eq1 ? 'Seleccione equipo 2' : 'Primero seleccione equipo 1'}
                      className="w-full"
                      disabled={!eq1 || submitting || savingCombate}
                    />
                  </div>
                </div>

                {eq1 && eq2 && (
                  <>
                    <div className="flex flex-wrap gap-3 mb-3">
                      <div style={{ minWidth: '300px', flex: 1 }}>
                        <label className="mb-2 block">Link de YouTube del combate</label>
                        <InputText
                          value={combateLink}
                          onChange={(e) => setCombateLink(e.target.value)}
                          placeholder="https://youtube.com/..."
                          className="w-full"
                          disabled={submitting || savingCombate}
                        />
                      </div>
                    </div>

                    <div className="flex align-items-center gap-2 mb-3">
                      <Button label="Agregar Round" icon="pi pi-plus" className="p-button-sm p-button-outlined" onClick={handleAddRound} disabled={submitting || savingCombate} />
                    </div>

                    {roundsActual.length > 0 && (
                      <div className="p-fluid">
                        <div className="grid font-bold mb-2">
                          <div className="col-1">#</div>
                          <div className="col-3">Ganador</div>
                          <div className="col-4">Puntaje {equiposLocales.find((e) => e.id === eq1)?.nombre || 'E1'}</div>
                          <div className="col-4">Puntaje {equiposLocales.find((e) => e.id === eq2)?.nombre || 'E2'}</div>
                        </div>
                        {roundsActual.map((r, i) => (
                          <div className="grid align-items-center mb-2" key={i}>
                            <div className="col-1">
                              <strong>{i + 1}</strong>
                            </div>
                            <div className="col-3">
                              <div className="flex flex-column gap-1">
                                <div className="flex align-items-center gap-1">
                                  <RadioButton
                                    inputId={`r${i}_e1`}
                                    name={`r${i}_ganador`}
                                    value={eq1}
                                    checked={r.idGanador === eq1}
                                    onChange={(e) => handleUpdateRound(i, 'idGanador', e.value)}
                                    disabled={submitting || savingCombate}
                                  />
                                  <label htmlFor={`r${i}_e1`} className="text-sm">
                                    {equiposLocales.find((e) => e.id === eq1)?.nombre || 'E1'}
                                  </label>
                                </div>
                                <div className="flex align-items-center gap-1">
                                  <RadioButton
                                    inputId={`r${i}_e2`}
                                    name={`r${i}_ganador`}
                                    value={eq2}
                                    checked={r.idGanador === eq2}
                                    onChange={(e) => handleUpdateRound(i, 'idGanador', e.value)}
                                    disabled={submitting || savingCombate}
                                  />
                                  <label htmlFor={`r${i}_e2`} className="text-sm">
                                    {equiposLocales.find((e) => e.id === eq2)?.nombre || 'E2'}
                                  </label>
                                </div>
                              </div>
                            </div>
                            <div className="col-4">
                              <InputText value={r.puntajeEquipo1} onChange={(e) => handleUpdateRound(i, 'puntajeEquipo1', e.target.value)} keyfilter="num" placeholder="0" className="w-full" disabled={submitting || savingCombate} />
                            </div>
                            <div className="col-4">
                              <InputText value={r.puntajeEquipo2} onChange={(e) => handleUpdateRound(i, 'puntajeEquipo2', e.target.value)} keyfilter="num" placeholder="0" className="w-full" disabled={submitting || savingCombate} />
                            </div>
                            <div className="col-1">
                              <Button icon="pi pi-trash" className="p-button-rounded p-button-text p-button-danger" onClick={() => handleRemoveRound(i)} disabled={submitting || savingCombate} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mt-3">
                      <FormSubmitButton loading={savingCombate} label="Guardar Combate" icon="pi pi-check" onClick={handleGuardarCombate} disabled={roundsActual.length === 0} />
                    </div>
                  </>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="mt-3 flex justify-content-end">
                <Button label="Avanzar" icon="pi pi-arrow-right" onClick={handleAvanzarS3} disabled={submitting} />
              </div>
            )}
          </Fieldset>
        )}

        {/* ═══════════ SECCIÓN 4 ═══════════ */}
        {step >= 3 && (
          <Fieldset legend="Sección 4: Confirmar y crear" className="mt-3">
            <div className="grid">
              <div className="col-12 md:col-4">
                <h4>Datos del torneo</h4>
                <p>
                  <strong>Nombre: </strong> {nombre}
                </p>
                <p>
                  <strong>Fecha: </strong> {toDateString(fechaTorneo)}
                </p>
                <p>
                  <strong>Localización: </strong> {localizacion}
                </p>
                <p>
                  <strong>Modalidad: </strong> {modalidadOptions.find((o) => o.value === modalidad)?.label || '-'}
                  {' | '}
                  <strong>Categoría: </strong> {categoriaOptions.find((o) => o.value === categoria)?.label || '-'}
                  {' | '}
                  <strong>Género: </strong> {generoOptions.find((o) => o.value === genero)?.label || '-'}
                </p>
              </div>
              <div className="col-12 md:col-3">
                <h4>Equipos({equiposLocales.length})</h4>
                <ul>
                  {equiposLocales.map((e) => (
                    <li key={e.id}>
                      {e.nombre}
                      {e._isNew ? ' (nuevo)' : ''}
                      {e.posicion ? ` — Puesto ${e.posicion}` : ''}
                      <br />
                      <small className="text-color-secondary">
                        {getPeleadoresEquipo(e.id).length} peleador(es)
                      </small>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="col-12 md:col-5">
                <h4>Combates({combates.length})</h4>
                <ul>
                  {combates.map((c) => (
                    <li key={c.id}>
                      {c.nombreEquipo1} vs {c.nombreEquipo2}({c.rounds.length} rounds) — <strong>Ganó: {c.nombreGanador}</strong>
                      {c.link && ' | 🎥'}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-3 flex justify-content-end">
              <FormSubmitButton loading={submitting} label="Crear Torneo" icon="pi pi-check" severity="success" onClick={handleFinalSubmit} />
            </div>
          </Fieldset>
        )}

        {/* Modal nuevo equipo */}
        <Dialog header="Nuevo Equipo" visible={showNewTeamModal} onHide={() => setShowNewTeamModal(false)} style={{ width: '450px' }}>
          <div className="p-fluid">
            {modalidad && categoria && genero && (
              <p className="text-color-secondary mb-3">
                Modalidad: {modalidadOptions.find((o) => o.value === modalidad)?.label || modalidad}
                {' | '}
                Categoría: {categoriaOptions.find((o) => o.value === categoria)?.label || categoria}
                {' | '}
                Género: {generoOptions.find((o) => o.value === genero)?.label || genero}
              </p>
            )}
            <div className="p-field mb-3">
              <FloatLabel>
                <InputText id="newTeamNombre" value={newTeamNombre} onChange={(e) => setNewTeamNombre(e.target.value)} />
                <label htmlFor="newTeamNombre">Nombre del equipo *</label>
              </FloatLabel>
            </div>
            <div className="p-field mb-3">
              <label htmlFor="newTeamFecha" className="mb-2 block">
                Fecha de creación *
              </label>
              <Calendar id="newTeamFecha" value={newTeamFecha} onChange={(e) => setNewTeamFecha(e.value)} dateFormat="dd/mm/yy" showIcon />
            </div>
            <div className="p-field mb-3">
              <FloatLabel>
                <InputText id="newTeamLogo" value={newTeamLogo} onChange={(e) => setNewTeamLogo(e.target.value)} />
                <label htmlFor="newTeamLogo">Link del logo(opcional)</label>
              </FloatLabel>
              <small className="text-color-secondary"> Si no se completa se usará /Mercenarios.svg </small>
            </div>
            <Button label="Crear Equipo" icon="pi pi-check" onClick={handleCreateTeam} />
          </div>
        </Dialog>

        {/* Modal peleadores */}
        <Dialog
          header={`Peleadores - ${equipoSeleccionadoEnGrilla?.nombre || ''}`}
          visible={showFightersModal}
          onHide={handleCloseFightersModal}
          style={{ width: '650px' }}
        >
          <div className="p-fluid">
            <div className="flex gap-2 mb-3">
              <InputText
                value={fighterSearch}
                onChange={(e) => setFighterSearch(e.target.value)}
                placeholder="Buscar por nombre, apellido o DNI"
                className="w-full"
              />
              <Button label="Buscar" icon="pi pi-search" onClick={handleSearchFighters} loading={searchingFighters} />
              <Button label="Nuevo" icon="pi pi-plus" className="p-button-outlined" onClick={() => setShowNewFighterModal(true)} />
            </div>

            {fighterSearchResults.length > 0 && (
              <div className="mb-3">
                <h5 className="mt-0">Resultados</h5>
                <DataTable value={fighterSearchResults} size="small" emptyMessage="Sin resultados">
                  <Column field="nombre" header="Nombre" />
                  <Column field="apellido" header="Apellido" />
                  <Column field="dni" header="DNI" />
                  <Column
                    header="Acción"
                    body={(row) => (
                      <Button
                        label="Seleccionar"
                        icon="pi pi-check"
                        className="p-button-sm p-button-success"
                        onClick={() => handleSelectFighter(row)}
                      />
                    )}
                  />
                </DataTable>
              </div>
            )}

            <div>
              <h5>Peleadores agregados</h5>
              <DataTable
                value={equipoSeleccionadoEnGrilla ? getPeleadoresEquipo(equipoSeleccionadoEnGrilla.id) : []}
                size="small"
                emptyMessage="No hay peleadores agregados"
              >
                <Column field="apellido" header="Apellido" />
                <Column field="nombre" header="Nombre" />
                <Column field="dni" header="DNI" />
                <Column
                  header="Número"
                  body={(row) => (
                    <InputText
                      value={row.numeroPeleador}
                      onChange={(e) => handleUpdateNumeroPeleador(equipoSeleccionadoEnGrilla.id, row.id, e.target.value)}
                      keyfilter="int"
                      className="w-4rem"
                    />
                  )}
                />
                <Column
                  header="Quitar"
                  body={(row) => (
                    <Button
                      icon="pi pi-trash"
                      className="p-button-rounded p-button-danger p-button-text"
                      onClick={() => handleRemovePeleador(equipoSeleccionadoEnGrilla.id, row.id)}
                    />
                  )}
                />
              </DataTable>
            </div>
          </div>
        </Dialog>

        {/* Modal nuevo peleador */}
        <Dialog
          header="Nuevo Peleador"
          visible={showNewFighterModal}
          onHide={() => setShowNewFighterModal(false)}
          style={{ width: '450px' }}
        >
          <div className="p-fluid">
            <div className="p-field mb-3">
              <FloatLabel>
                <InputText id="newFighterNombre" value={newFighterNombre} onChange={(e) => setNewFighterNombre(e.target.value)} />
                <label htmlFor="newFighterNombre">Nombre *</label>
              </FloatLabel>
            </div>
            <div className="p-field mb-3">
              <FloatLabel>
                <InputText id="newFighterApellido" value={newFighterApellido} onChange={(e) => setNewFighterApellido(e.target.value)} />
                <label htmlFor="newFighterApellido">Apellido *</label>
              </FloatLabel>
            </div>
            <div className="p-field mb-3">
              <FloatLabel>
                <InputText id="newFighterDni" value={newFighterDni} onChange={(e) => setNewFighterDni(e.target.value)} keyfilter="int" />
                <label htmlFor="newFighterDni">DNI *</label>
              </FloatLabel>
            </div>
            <div className="p-field mb-3">
              <label htmlFor="newFighterFechaNacimiento" className="mb-2 block">Fecha de nacimiento *</label>
              <Calendar
                id="newFighterFechaNacimiento"
                value={newFighterFechaNacimiento}
                onChange={(e) => setNewFighterFechaNacimiento(e.value)}
                dateFormat="dd/mm/yy"
                showIcon
              />
            </div>
            <Button label="Crear Peleador" icon="pi pi-check" onClick={handleCreateFighter} loading={creatingFighter} />
          </div>
        </Dialog>
      </div>
    </AdminRoute>
  );
}
