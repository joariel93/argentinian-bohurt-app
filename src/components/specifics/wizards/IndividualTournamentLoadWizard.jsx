import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dropdown } from 'primereact/dropdown';
import { Fieldset } from 'primereact/fieldset';
import { InputText } from 'primereact/inputtext';
import { Steps } from 'primereact/steps';
import { Tag } from 'primereact/tag';
import { Card } from 'primereact/card';
import { ProgressSpinner } from 'primereact/progressspinner';
import AdminRoute from '@/components/admin/AdminRoute';
import FighterQuickCreateDialog from './FighterQuickCreateDialog';
import apiService from '@/services/apiService';
import { useToast } from '@/contexts/ToastContext';

const STEP_ITEMS = [
  { label: 'Datos generales' },
  { label: 'Peleadores' },
  { label: 'Combates' },
  { label: 'Confirmar' },
];

const FASE_OPTIONS = [
  { label: 'Eliminatoria', value: 'Eliminatoria' },
  { label: 'Grupos', value: 'Grupos' },
  { label: 'Octavos de Final', value: 'Octavos de Final' },
  { label: 'Cuartos de Final', value: 'Cuartos de Final' },
  { label: 'Semifinal', value: 'Semifinal' },
  { label: 'Tercer Puesto', value: 'Tercer Puesto' },
  { label: 'Final', value: 'Final' },
];

export default function IndividualTournamentLoadWizard({ tournamentId }) {
  const router = useRouter();
  const isEditMode = !!tournamentId;
  const { showError, showSuccess } = useToast();

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(isEditMode);

  // ── Sección 1: Datos Generales ──
  const [eventos, setEventos] = useState([]);
  const [selectedEvento, setSelectedEvento] = useState(null);
  const [modalidad, setModalidad] = useState(2); // Default Duelo (2)
  const [categoria, setCategoria] = useState(null);
  const [tipoTorneo, setTipoTorneo] = useState(null);
  const [genero, setGenero] = useState(null);
  const [linkTransmision, setLinkTransmision] = useState('');

  const [modalidadOptions, setModalidadOptions] = useState([]);
  const [categoriaOptions, setCategoriaOptions] = useState([]);
  const [tipoTorneoOptions, setTipoTorneoOptions] = useState([]);
  const [generoOptions, setGeneroOptions] = useState([]);

  // ── Sección 2: Peleadores inscriptos ──
  const [peleadores, setPeleadores] = useState([]);
  const [initialPeleadores, setInitialPeleadores] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [searchDni, setSearchDni] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchingFighters, setSearchingFighters] = useState(false);
  const [showFighterQuickCreate, setShowFighterQuickCreate] = useState(false);

  // ── Sección 3: Combates individuales ──
  const [combates, setCombates] = useState([]);
  const [initialCombates, setInitialCombates] = useState([]);
  const [p1, setP1] = useState(null);
  const [p2, setP2] = useState(null);
  const [faseCombate, setFaseCombate] = useState('Eliminatoria');
  const [combateLink, setCombateLink] = useState('');
  const [roundsActual, setRoundsActual] = useState([]);
  const [savingCombate, setSavingCombate] = useState(false);

  const s1Disabled = !isEditMode && step > 0;
  const s2Disabled = !isEditMode && step > 1;
  const s3Disabled = !isEditMode && step > 2;

  // ── Lookups iniciales ──
  useEffect(() => {
    apiService.fetchEvents()
      .then((d) => setEventos(d || []))
      .catch((err) => showError(err.message || 'Error al cargar eventos'));

    apiService.fetchLookupModalidad()
      .then((d) => {
        // Para individual filtramos Buhurt (1) o priorizamos Duelo (2) y Profight (3)
        const opts = (d || [])
          .filter((i) => i.id !== 1)
          .map((i) => ({ value: i.id, label: i.valor }));
        setModalidadOptions(opts);
      })
      .catch((err) => showError(err.message || 'Error al cargar modalidades'));

    apiService.fetchClubsSimplify()
      .then((d) => setClubs((d || []).map((i) => ({ value: i.id, label: i.nombre }))))
      .catch((err) => showError(err.message || 'Error al cargar clubes'));

    apiService.fetchLookupTipoTorneo()
      .then((d) => setTipoTorneoOptions((d || []).map((i) => ({ value: i.id, label: i.valor }))))
      .catch((err) => showError(err.message || 'Error al cargar tipos de torneo'));

    apiService.fetchLookupGenero()
      .then((d) => setGeneroOptions((d || []).map((i) => ({ value: i.id, label: i.valor }))))
      .catch((err) => showError(err.message || 'Error al cargar géneros'));
  }, []);

  // ── Categorías según modalidad ──
  useEffect(() => {
    if (modalidad) {
      apiService.fetchLookupCategorias(modalidad)
        .then((d) => setCategoriaOptions((d || []).map((i) => ({ value: i.id, label: i.valor }))))
        .catch((err) => showError(err.message || 'Error al cargar categorías'));
    } else {
      setCategoriaOptions([]);
    }
  }, [modalidad]);

  // ── Carga de datos en modo edición ──
  useEffect(() => {
    if (!isEditMode) return;

    const loadData = async () => {
      setLoadingEdit(true);
      try {
        const fullData = await apiService.fetchFullEditTournament(tournamentId);
        const { torneo } = fullData || {};

        if (torneo) {
          setSelectedEvento(torneo.idEvento || torneo.id_evento || null);
          setModalidad(torneo.idModalidad || 2);
          setCategoria(torneo.idCategoria || null);
          setTipoTorneo(torneo.idTipoTorneo || null);
          setGenero(torneo.idGenero || null);
          setLinkTransmision(torneo.linkTransmision || '');
        }

        // Cargar peleadores inscriptos desde torneo_peleador
        const peleadoresData = await apiService.getPeleadoresTorneo(tournamentId);
        const mappedPeleadores = (peleadoresData || []).map((p) => ({
          idUsuario: p.idUsuario,
          nombre: p.nombre,
          apellido: p.apellido,
          idClub: p.idClub,
          clubNombre: p.clubNombre || '',
          posicion: p.posicion ?? '',
        }));
        setPeleadores(mappedPeleadores);
        setInitialPeleadores(mappedPeleadores);

        // Cargar combates individuales
        const combatesData = await apiService.fetchCombatesIndividuales(tournamentId);
        const listCombates = Array.isArray(combatesData?.combates) ? combatesData.combates : [];
        const mappedCombates = listCombates.map((c) => {
          const nombreA = `${c.apellidoUsuarioA || ''}, ${c.nombreUsuarioA || ''}`.trim();
          const nombreB = c.idUsuarioB ? `${c.apellidoUsuarioB || ''}, ${c.nombreUsuarioB || ''}`.trim() : 'BYE';
          const nombreG = c.idUsuarioGanador === c.idUsuarioA ? nombreA : c.idUsuarioGanador === c.idUsuarioB ? nombreB : 'Empate';

          return {
            id: c.id,
            orden: c.orden,
            idUsuarioA: c.idUsuarioA,
            idUsuarioB: c.idUsuarioB,
            nombreUsuarioA: nombreA,
            nombreUsuarioB: nombreB,
            idUsuarioGanador: c.idUsuarioGanador,
            nombreGanador: nombreG,
            link: c.link || '',
            fase: c.fase || 'Eliminatoria',
            rounds: (c.rounds || []).map((r) => {
              const ganoA = r.idUsuarioGanador === c.idUsuarioA;
              return {
                round: r.round,
                idUsuarioGanador: r.idUsuarioGanador,
                puntosA: ganoA ? r.puntosGanador : r.puntosPerdedor,
                puntosB: ganoA ? r.puntosPerdedor : r.puntosGanador,
              };
            }),
          };
        });

        setCombates(mappedCombates);
        setInitialCombates(mappedCombates);
      } catch (err) {
        showError(err.message || 'Error al cargar torneo individual');
      } finally {
        setLoadingEdit(false);
      }
    };

    loadData();
  }, [isEditMode, tournamentId]);

  // ── Sección 1: Avanzar ──
  const handleAvanzarS1 = () => {
    if (!selectedEvento) {
      showError('Debés seleccionar un evento');
      return;
    }
    if (!modalidad || !categoria || !genero) {
      showError('Modalidad, categoría y género son requeridos');
      return;
    }
    setStep(1);
  };

  // ── Sección 2: Búsqueda e inscripción de peleadores ──
  const handleSearchFighter = async () => {
    if (!searchDni.trim()) return;
    setSearchingFighters(true);
    try {
      const results = await apiService.buscarUsuarioPorDni(searchDni.trim());
      setSearchResults(results || []);
    } catch {
      setSearchResults([]);
    } finally {
      setSearchingFighters(false);
    }
  };

  const handleAddFighter = async (user, chosenClubId) => {
    const yaExiste = peleadores.some((p) => p.idUsuario === user.idUsuario);
    if (yaExiste) {
      showError('El peleador ya está inscripto en este torneo');
      return;
    }

    const clubObj = clubs.find((c) => c.value === chosenClubId);
    const clubNombre = clubObj?.label || user.clubNombre || 'Mercenarios';
    const finalClubId = chosenClubId || user.idClub;

    if (isEditMode) {
      const res = await apiService.addPeleadorTorneoIndividual(tournamentId, {
        idUsuario: user.idUsuario,
        idClub: finalClubId,
      });
      if (res?.error) {
        showError(res.error);
        return;
      }
      showSuccess(`Duelista ${user.nombre} inscripto`);
    }

    const nuevoDuelista = {
      idUsuario: user.idUsuario,
      nombre: user.nombre,
      apellido: user.apellido,
      idClub: finalClubId,
      clubNombre,
      posicion: '',
    };

    setPeleadores((prev) => [...prev, nuevoDuelista]);
    setSearchResults([]);
    setSearchDni('');
  };

  const handleRemoveFighter = async (idUsuario) => {
    if (isEditMode) {
      const res = await apiService.removePeleadorTorneo(tournamentId, idUsuario);
      if (res?.error) {
        showError(res.error);
        return;
      }
      showSuccess('Duelista desinscripto');
    }

    setPeleadores((prev) => prev.filter((p) => p.idUsuario !== idUsuario));
    // Quitar combates asociados si quedaron huérfanos
    setCombates((prev) => prev.filter((c) => c.idUsuarioA !== idUsuario && c.idUsuarioB !== idUsuario));
  };

  const handleUpdatePosicion = (idUsuario, value) => {
    setPeleadores((prev) =>
      prev.map((p) => (p.idUsuario === idUsuario ? { ...p, posicion: value } : p))
    );
  };

  const handleAvanzarS2 = () => {
    if (peleadores.length < 2) {
      showError('Inscribí al menos 2 peleadores para el torneo');
      return;
    }
    setStep(2);
  };

  // ── Sección 3: Combates ──
  const fighterOptions = peleadores.map((p) => ({
    label: `${p.apellido}, ${p.nombre}${p.clubNombre ? ` (${p.clubNombre})` : ''}`,
    value: p.idUsuario,
  }));

  const p2Options = fighterOptions.filter((o) => o.value !== p1);

  const handleAddRound = () => {
    if (!p1 || !p2) {
      showError('Seleccioná primero ambos duelistas');
      return;
    }
    setRoundsActual((prev) => [
      ...prev,
      {
        round: prev.length + 1,
        idUsuarioGanador: null,
        puntosA: 0,
        puntosB: 0,
      },
    ]);
  };

  const handleUpdateRound = (index, field, value) => {
    setRoundsActual((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleRemoveRound = (index) => {
    setRoundsActual((prev) => prev.filter((_, i) => i !== index));
  };

  const handleGuardarCombate = () => {
    if (savingCombate) return;
    if (!p1 || !p2) {
      showError('Seleccioná los dos peleadores');
      return;
    }
    if (p1 === p2) {
      showError('Los duelistas no pueden ser la misma persona');
      return;
    }
    if (roundsActual.length === 0) {
      showError('Agregá al menos un round al combate');
      return;
    }
    // Los rounds pueden terminar en empate (idUsuarioGanador null), no se valida ganador por round

    setSavingCombate(true);

    const peleadorAObj = peleadores.find((p) => p.idUsuario === p1);
    const peleadorBObj = peleadores.find((p) => p.idUsuario === p2);
    const nombreA = peleadorAObj ? `${peleadorAObj.apellido}, ${peleadorAObj.nombre}` : 'Peleador 1';
    const nombreB = peleadorBObj ? `${peleadorBObj.apellido}, ${peleadorBObj.nombre}` : 'Peleador 2';

    const rounds = roundsActual.map((r, idx) => ({
      round: idx + 1,
      idUsuarioGanador: r.idUsuarioGanador || null,
      puntosA: parseInt(r.puntosA) || 0,
      puntosB: parseInt(r.puntosB) || 0,
    }));

    const winsA = rounds.filter((r) => r.idUsuarioGanador === p1).length;
    const winsB = rounds.filter((r) => r.idUsuarioGanador === p2).length;

    const combateGanador = winsA > winsB ? p1 : winsB > winsA ? p2 : null;
    const nombreGanador = combateGanador === p1 ? nombreA : combateGanador === p2 ? nombreB : 'Empate';

    const nuevoCombate = {
      id: 'new_' + Date.now(),
      orden: combates.length + 1,
      idUsuarioA: p1,
      idUsuarioB: p2,
      nombreUsuarioA: nombreA,
      nombreUsuarioB: nombreB,
      idUsuarioGanador: combateGanador,
      nombreGanador,
      link: combateLink || '',
      fase: faseCombate || 'Eliminatoria',
      rounds,
    };

    setCombates((prev) => [...prev, nuevoCombate]);
    setP1(null);
    setP2(null);
    setCombateLink('');
    setRoundsActual([]);
    setSavingCombate(false);
  };

  const handleRemoveCombate = (id) => {
    setCombates((prev) => prev.filter((c) => c.id !== id));
  };

  const handleAvanzarS3 = () => {
    if (combates.length === 0) {
      showError('Agregá al menos un combate individual');
      return;
    }
    setStep(3);
  };

  // ── Sección 4: Confirmar y Guardar ──
  const handleFinalSubmit = async () => {
    setSubmitting(true);
    try {
      const torneoData = {
        idEvento: selectedEvento,
        idGenero: genero || 1,
        idCategoria: categoria || 1,
        idModalidad: modalidad || 2,
        idTipoTorneo: tipoTorneo || null,
        linkTransmision: linkTransmision || null,
      };

      if (isEditMode) {
        const updateResult = await apiService.updateTournament(tournamentId, torneoData);
        if (updateResult?.error) {
          showError(updateResult.error);
          setSubmitting(false);
          return;
        }

        // Sincronizar peleadores
        for (const p of peleadores) {
          const yaEstaba = initialPeleadores.some((ip) => ip.idUsuario === p.idUsuario);
          if (!yaEstaba) {
            await apiService.addPeleadorTorneoIndividual(tournamentId, {
              idUsuario: p.idUsuario,
              idClub: p.idClub,
            });
          }
        }
        for (const ip of initialPeleadores) {
          const sigueEstando = peleadores.some((p) => p.idUsuario === ip.idUsuario);
          if (!sigueEstando) {
            await apiService.removePeleadorTorneo(tournamentId, ip.idUsuario);
          }
        }

        // Sincronizar combates individuales
        if (combates.length > 0) {
          await apiService.eliminarCombatesIndividuales(tournamentId);

          const combatesPayload = combates.map((c) => ({
            id: c.id && !c.id.startsWith('new_') ? c.id : crypto.randomUUID(),
            idUsuarioA: c.idUsuarioA,
            idUsuarioB: c.idUsuarioB,
            fase: c.fase || null,
            link: c.link || null,
          }));

          const createRes = await apiService.createCombatesIndividuales(tournamentId, combatesPayload);
          if (createRes?.error) {
            showError(createRes.error);
            setSubmitting(false);
            return;
          }

          // Grabar rounds y cerrar cada combate
          for (let i = 0; i < combates.length; i++) {
            const cOriginal = combates[i];
            const cPayload = combatesPayload[i];

            for (const r of cOriginal.rounds || []) {
              const ganoA = r.idUsuarioGanador === cOriginal.idUsuarioA;
              const esEmpate = !r.idUsuarioGanador;
              await apiService.grabarRoundIndividual(tournamentId, cPayload.id, {
                round: r.round,
                idUsuarioGanador: r.idUsuarioGanador || null,
                puntosGanador: esEmpate ? r.puntosA : (ganoA ? r.puntosA : r.puntosB),
                puntosPerdedor: esEmpate ? r.puntosB : (ganoA ? r.puntosB : r.puntosA),
              });
            }

            if (cOriginal.idUsuarioGanador) {
              await apiService.cerrarCombateIndividual(tournamentId, cPayload.id, cOriginal.idUsuarioGanador);
            }
          }
        }

        showSuccess('Torneo individual actualizado exitosamente');
      } else {
        // En caso de creación nueva directa
        const createResult = await apiService.createTournament(torneoData);
        if (createResult?.error) {
          showError(createResult.error);
          setSubmitting(false);
          return;
        }

        const newId = createResult.id;
        for (const p of peleadores) {
          await apiService.addPeleadorTorneoIndividual(newId, {
            idUsuario: p.idUsuario,
            idClub: p.idClub,
          });
        }

        if (combates.length > 0) {
          const combatesPayload = combates.map((c) => ({
            id: crypto.randomUUID(),
            idUsuarioA: c.idUsuarioA,
            idUsuarioB: c.idUsuarioB,
            fase: c.fase || null,
            link: c.link || null,
          }));
          await apiService.createCombatesIndividuales(newId, combatesPayload);
          for (let i = 0; i < combates.length; i++) {
            const cOriginal = combates[i];
            const cPayload = combatesPayload[i];
            for (const r of cOriginal.rounds || []) {
              const ganoA = r.idUsuarioGanador === cOriginal.idUsuarioA;
              const esEmpate = !r.idUsuarioGanador;
              await apiService.grabarRoundIndividual(newId, cPayload.id, {
                round: r.round,
                idUsuarioGanador: r.idUsuarioGanador || null,
                puntosGanador: esEmpate ? r.puntosA : (ganoA ? r.puntosA : r.puntosB),
                puntosPerdedor: esEmpate ? r.puntosB : (ganoA ? r.puntosB : r.puntosA),
              });
            }
            if (cOriginal.idUsuarioGanador) {
              await apiService.cerrarCombateIndividual(newId, cPayload.id, cOriginal.idUsuarioGanador);
            }
          }
        }

        showSuccess(`Torneo individual creado exitosamente (ID: ${newId})`);
        setStep(0);
      }
    } catch (err) {
      console.error(err);
      showError(err.message || 'Error al guardar el torneo individual');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminRoute>
      <div className="card">
        <div className="flex align-items-center justify-content-between mb-3">
          <div>
            <h2 className="m-0">
              {isEditMode ? 'Editar Torneo Individual (Duelo)' : 'Carga de Torneo Individual'}
            </h2>
            <p className="text-color-secondary m-0 mt-1">
              Registro y administración de combates duelistas 1 vs 1
            </p>
          </div>
          <Tag value="Modalidad Individual" severity="warning" />
        </div>

        {loadingEdit ? (
          <div className="flex justify-content-center align-items-center p-6">
            <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="4" />
          </div>
        ) : (
          <>
            <Steps model={STEP_ITEMS} activeIndex={step} className="mb-4" />

            {/* ═══════════ SECCIÓN 1: DATOS GENERALES ═══════════ */}
            <Fieldset legend="Paso 1: Datos generales" toggleable collapsed={step > 0}>
              <div className="p-fluid">
                <div className="grid">
                  <div className="col-12 md:col-6">
                    <div className="p-field mb-3">
                      <label htmlFor="evento" className="mb-2 block font-semibold">
                        Evento *
                      </label>
                      <Dropdown
                        id="evento"
                        value={selectedEvento}
                        options={eventos.map((e) => ({
                          value: e.id,
                          label: `${e.nombre} · ${e.fechaEvento} · ${e.localizacion}`,
                        }))}
                        onChange={(e) => setSelectedEvento(e.value)}
                        placeholder="Seleccione un evento"
                        optionLabel="label"
                        optionValue="value"
                        filter
                        disabled={s1Disabled || submitting}
                      />
                    </div>
                  </div>

                  <div className="col-12 md:col-6">
                    <div className="p-field mb-3">
                      <label htmlFor="linkTransmision" className="mb-2 block font-semibold">
                        Link transmisión en vivo
                      </label>
                      <InputText
                        id="linkTransmision"
                        value={linkTransmision}
                        onChange={(e) => setLinkTransmision(e.target.value)}
                        placeholder="https://youtube.com/..."
                        disabled={s1Disabled || submitting}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid">
                  <div className="col-12 md:col-4">
                    <div className="p-field mb-3">
                      <label htmlFor="modalidad" className="mb-2 block font-semibold">
                        Modalidad *
                      </label>
                      <Dropdown
                        id="modalidad"
                        value={modalidad}
                        options={modalidadOptions}
                        onChange={(e) => setModalidad(e.value)}
                        placeholder="Seleccione modalidad"
                        optionLabel="label"
                        optionValue="value"
                        disabled={s1Disabled || submitting}
                      />
                    </div>
                  </div>

                  <div className="col-12 md:col-4">
                    <div className="p-field mb-3">
                      <label htmlFor="categoria" className="mb-2 block font-semibold">
                        Categoría *
                      </label>
                      <Dropdown
                        id="categoria"
                        value={categoria}
                        options={categoriaOptions}
                        onChange={(e) => setCategoria(e.value)}
                        placeholder="Seleccione arma / categoría"
                        optionLabel="label"
                        optionValue="value"
                        disabled={s1Disabled || submitting}
                      />
                    </div>
                  </div>

                  <div className="col-12 md:col-4">
                    <div className="p-field mb-3">
                      <label htmlFor="genero" className="mb-2 block font-semibold">
                        Género *
                      </label>
                      <Dropdown
                        id="genero"
                        value={genero}
                        options={generoOptions}
                        onChange={(e) => setGenero(e.value)}
                        placeholder="Seleccione género"
                        optionLabel="label"
                        optionValue="value"
                        disabled={s1Disabled || submitting}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid">
                  <div className="col-12 md:col-4">
                    <div className="p-field mb-3">
                      <label htmlFor="tipoTorneo" className="mb-2 block font-semibold">
                        Formato / Tipo de torneo
                      </label>
                      <Dropdown
                        id="tipoTorneo"
                        value={tipoTorneo}
                        options={tipoTorneoOptions}
                        onChange={(e) => setTipoTorneo(e.value)}
                        placeholder="Seleccione formato"
                        optionLabel="label"
                        optionValue="value"
                        disabled={s1Disabled || submitting}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {!s1Disabled && (
                <div className="mt-3 flex justify-content-end">
                  <Button
                    label="Avanzar a Duelistas"
                    icon="pi pi-arrow-right"
                    onClick={handleAvanzarS1}
                    disabled={submitting}
                  />
                </div>
              )}
            </Fieldset>

            {/* ═══════════ SECCIÓN 2: PELEADORES / DUELISTAS ═══════════ */}
            {step >= 1 && (
              <Fieldset
                legend={`Paso 2: Duelistas inscriptos (${peleadores.length})`}
                toggleable
                collapsed={step > 1}
                className="mt-3"
              >
                {!s2Disabled && (
                  <div className="p-fluid mb-4">
                    <div className="flex flex-wrap gap-2 align-items-end">
                      <div className="flex-1" style={{ minWidth: '240px' }}>
                        <label className="block mb-2 font-semibold">Buscar luchador por DNI</label>
                        <div className="p-inputgroup">
                          <InputText
                            value={searchDni}
                            onChange={(e) => setSearchDni(e.target.value)}
                            placeholder="Ingrese DNI..."
                            keyfilter="int"
                            onKeyDown={(e) => e.key === 'Enter' && handleSearchFighter()}
                          />
                          <Button
                            icon="pi pi-search"
                            label="Buscar"
                            onClick={handleSearchFighter}
                            loading={searchingFighters}
                          />
                        </div>
                      </div>

                      <Button
                        label="Nuevo luchador"
                        icon="pi pi-user-plus"
                        className="p-button-outlined"
                        onClick={() => setShowFighterQuickCreate(true)}
                      />
                    </div>

                    {searchResults.length > 0 && (
                      <div className="mt-3 p-3 surface-ground border-round">
                        <h4 className="m-0 mb-2">Resultados de búsqueda</h4>
                        <DataTable value={searchResults} size="small" responsiveLayout="scroll">
                          <Column field="nombre" header="Nombre" />
                          <Column field="apellido" header="Apellido" />
                          <Column
                            header="Club asignado"
                            body={(row) => (
                              <Dropdown
                                value={row.idClub}
                                options={clubs}
                                placeholder="Seleccionar club"
                                onChange={(e) => {
                                  setSearchResults((prev) =>
                                    prev.map((r) =>
                                      r.idUsuario === row.idUsuario ? { ...r, idClub: e.value } : r
                                    )
                                  );
                                }}
                                className="w-full"
                              />
                            )}
                          />
                          <Column
                            header="Acción"
                            body={(row) => (
                              <Button
                                label="Inscribir"
                                icon="pi pi-plus"
                                size="small"
                                onClick={() => handleAddFighter(row, row.idClub)}
                                disabled={peleadores.some((p) => p.idUsuario === row.idUsuario)}
                              />
                            )}
                          />
                        </DataTable>
                      </div>
                    )}
                  </div>
                )}

                <DataTable
                  value={peleadores}
                  stripedRows
                  size="small"
                  emptyMessage="No hay duelistas inscriptos en este torneo."
                  className="mb-3"
                >
                  <Column
                    header="Duelista"
                    body={(row) => (
                      <span className="font-semibold">
                        {row.apellido}, {row.nombre}
                      </span>
                    )}
                  />
                  <Column
                    field="clubNombre"
                    header="Club"
                    body={(row) => row.clubNombre || '-'}
                  />
                  <Column
                    header="Podio / Puesto"
                    style={{ width: '120px' }}
                    body={(row) => (
                      <InputText
                        value={row.posicion || ''}
                        onChange={(e) => handleUpdatePosicion(row.idUsuario, e.target.value)}
                        placeholder="Ej. 1"
                        keyfilter="int"
                        disabled={s2Disabled || submitting}
                        className="p-inputtext-sm text-center"
                      />
                    )}
                  />
                  {!s2Disabled && (
                    <Column
                      header="Acción"
                      style={{ width: '80px', textAlign: 'center' }}
                      body={(row) => (
                        <Button
                          icon="pi pi-trash"
                          className="p-button-rounded p-button-danger p-button-text"
                          onClick={() => handleRemoveFighter(row.idUsuario)}
                          tooltip="Quitar duelista"
                        />
                      )}
                    />
                  )}
                </DataTable>

                {!s2Disabled && (
                  <div className="flex justify-content-between mt-3">
                    <Button
                      label="Volver"
                      icon="pi pi-arrow-left"
                      className="p-button-outlined"
                      onClick={() => setStep(0)}
                    />
                    <Button
                      label="Avanzar a Combates"
                      icon="pi pi-arrow-right"
                      onClick={handleAvanzarS2}
                      disabled={submitting}
                    />
                  </div>
                )}
              </Fieldset>
            )}

            {/* ═══════════ SECCIÓN 3: COMBATES INDIVIDUALES ═══════════ */}
            {step >= 2 && (
              <Fieldset
                legend={`Paso 3: Combates cargados (${combates.length})`}
                toggleable
                collapsed={step > 2}
                className="mt-3"
              >
                {!s3Disabled && (
                  <Card title="Nuevo combate individual" className="mb-4 surface-card">
                    <div className="p-fluid grid">
                      <div className="col-12 md:col-4">
                        <label className="block mb-2 font-semibold">Duelista 1 *</label>
                        <Dropdown
                          value={p1}
                          options={fighterOptions}
                          onChange={(e) => setP1(e.value)}
                          placeholder="Seleccionar duelista 1"
                          filter
                        />
                      </div>

                      <div className="col-12 md:col-4">
                        <label className="block mb-2 font-semibold">Duelista 2 *</label>
                        <Dropdown
                          value={p2}
                          options={p2Options}
                          onChange={(e) => setP2(e.value)}
                          placeholder="Seleccionar duelista 2"
                          filter
                          disabled={!p1}
                        />
                      </div>

                      <div className="col-12 md:col-4">
                        <label className="block mb-2 font-semibold">Fase / Ronda</label>
                        <Dropdown
                          value={faseCombate}
                          options={FASE_OPTIONS}
                          onChange={(e) => setFaseCombate(e.value)}
                          placeholder="Fase del combate"
                          editable
                        />
                      </div>

                      <div className="col-12">
                        <label className="block mb-2 font-semibold">Link transmisión del combate</label>
                        <InputText
                          value={combateLink}
                          onChange={(e) => setCombateLink(e.target.value)}
                          placeholder="https://youtube.com/..."
                        />
                      </div>
                    </div>

                    {/* Rounds del Combate */}
                    <div className="mt-3">
                      <div className="flex justify-content-between align-items-center mb-2">
                        <h4 className="m-0">Rounds del combate</h4>
                        <Button
                          label="Agregar Round"
                          icon="pi pi-plus"
                          size="small"
                          className="p-button-outlined"
                          onClick={handleAddRound}
                          disabled={!p1 || !p2}
                        />
                      </div>

                      {roundsActual.length === 0 ? (
                        <p className="text-color-secondary m-0 mb-3">
                          Hacé clic en &quot;Agregar Round&quot; para registrar los puntajes de cada round.
                        </p>
                      ) : (
                        roundsActual.map((r, idx) => (
                          <div
                            key={idx}
                            className="p-3 mb-2 border-1 surface-border border-round flex flex-wrap align-items-center gap-3"
                          >
                            <span className="font-bold">Round {r.round}:</span>

                            <div className="flex align-items-center gap-2">
                              <span>Puntos D1:</span>
                              <InputText
                                value={r.puntosA}
                                onChange={(e) => handleUpdateRound(idx, 'puntosA', e.target.value)}
                                style={{ width: '70px' }}
                                keyfilter="int"
                              />
                            </div>

                            <div className="flex align-items-center gap-2">
                              <span>Puntos D2:</span>
                              <InputText
                                value={r.puntosB}
                                onChange={(e) => handleUpdateRound(idx, 'puntosB', e.target.value)}
                                style={{ width: '70px' }}
                                keyfilter="int"
                              />
                            </div>

                            <div className="flex align-items-center gap-2 flex-1" style={{ minWidth: '220px' }}>
                              <span>Ganador Round:</span>
                              <Dropdown
                                value={r.idUsuarioGanador}
                                options={[
                                  { label: (() => { const p = peleadores.find((p) => p.idUsuario === p1); return p ? `${p.apellido}, ${p.nombre}` : 'Duelista 1'; })(), value: p1 },
                                  { label: (() => { const p = peleadores.find((p) => p.idUsuario === p2); return p ? `${p.apellido}, ${p.nombre}` : 'Duelista 2'; })(), value: p2 },
                                  { label: 'Empate', value: null },
                                ]}
                                onChange={(e) => handleUpdateRound(idx, 'idUsuarioGanador', e.value)}
                                placeholder="Seleccionar ganador (o empate)"
                                className="w-full"
                              />
                            </div>

                            <Button
                              icon="pi pi-trash"
                              className="p-button-danger p-button-text"
                              onClick={() => handleRemoveRound(idx)}
                              tooltip="Quitar round"
                            />
                          </div>
                        ))
                      )}
                    </div>

                    <div className="mt-3 flex justify-content-end">
                      <Button
                        label="Guardar Combate"
                        icon="pi pi-check"
                        onClick={handleGuardarCombate}
                        loading={savingCombate}
                      />
                    </div>
                  </Card>
                )}

                {/* Lista de combates */}
                <DataTable
                  value={combates}
                  stripedRows
                  size="small"
                  emptyMessage="No hay combates individuales registrados aún."
                >
                  <Column field="orden" header="#" style={{ width: '50px' }} />
                  <Column field="fase" header="Fase" style={{ width: '130px' }} />
                  <Column
                    header="Combate"
                    body={(row) => (
                      <span>
                        <strong>{row.nombreUsuarioA}</strong> vs <strong>{row.nombreUsuarioB}</strong>
                      </span>
                    )}
                  />
                  <Column
                    header="Ganador"
                    body={(row) => <Tag value={row.nombreGanador} severity="success" />}
                  />
                  <Column
                    header="Rounds"
                    body={(row) => (
                      <div className="flex gap-1 flex-wrap">
                        {(row.rounds || []).map((r, i) => (
                          <Tag
                            key={i}
                            value={`R${r.round}: ${r.puntosA ?? '-'}-${r.puntosB ?? '-'}`}
                            severity="secondary"
                          />
                        ))}
                      </div>
                    )}
                  />
                  {!s3Disabled && (
                    <Column
                      header="Acción"
                      style={{ width: '80px', textAlign: 'center' }}
                      body={(row) => (
                        <Button
                          icon="pi pi-trash"
                          className="p-button-rounded p-button-danger p-button-text"
                          onClick={() => handleRemoveCombate(row.id)}
                          tooltip="Eliminar combate"
                        />
                      )}
                    />
                  )}
                </DataTable>

                {!s3Disabled && (
                  <div className="flex justify-content-between mt-3">
                    <Button
                      label="Volver"
                      icon="pi pi-arrow-left"
                      className="p-button-outlined"
                      onClick={() => setStep(1)}
                    />
                    <Button
                      label="Avanzar a Confirmación"
                      icon="pi pi-arrow-right"
                      onClick={handleAvanzarS3}
                      disabled={submitting}
                    />
                  </div>
                )}
              </Fieldset>
            )}

            {/* ═══════════ SECCIÓN 4: CONFIRMAR ═══════════ */}
            {step >= 3 && (
              <Fieldset legend="Paso 4: Confirmación y Guardado" className="mt-3">
                <div className="grid">
                  <div className="col-12 md:col-6">
                    <Card title="Resumen del Torneo" className="h-full">
                      <p>
                        <strong>Evento:</strong>{' '}
                        {eventos.find((e) => e.id === selectedEvento)?.nombre || '-'}
                      </p>
                      <p>
                        <strong>Modalidad:</strong>{' '}
                        {modalidadOptions.find((m) => m.value === modalidad)?.label || 'Duelo'}
                      </p>
                      <p>
                        <strong>Categoría:</strong>{' '}
                        {categoriaOptions.find((c) => c.value === categoria)?.label || '-'}
                      </p>
                      <p>
                        <strong>Género:</strong>{' '}
                        {generoOptions.find((g) => g.value === genero)?.label || '-'}
                      </p>
                      {linkTransmision && (
                        <p>
                          <strong>Transmisión:</strong>{' '}
                          <a href={linkTransmision} target="_blank" rel="noreferrer">
                            {linkTransmision}
                          </a>
                        </p>
                      )}
                    </Card>
                  </div>

                  <div className="col-12 md:col-6">
                    <Card title="Participación y Combates" className="h-full">
                      <p>
                        <strong>Duelistas inscriptos:</strong> {peleadores.length}
                      </p>
                      <p>
                        <strong>Total de combates:</strong> {combates.length}
                      </p>
                      <div className="mt-3">
                        <strong>Podio asignado:</strong>
                        <ul className="m-0 pl-3 mt-1">
                          {peleadores
                            .filter((p) => p.posicion)
                            .sort((a, b) => Number(a.posicion) - Number(b.posicion))
                            .map((p) => (
                              <li key={p.idUsuario}>
                                <strong>Puesto {p.posicion}:</strong> {p.apellido}, {p.nombre} ({p.clubNombre})
                              </li>
                            ))}
                        </ul>
                      </div>
                    </Card>
                  </div>
                </div>

                <div className="flex justify-content-between mt-4">
                  <Button
                    label="Volver a Combates"
                    icon="pi pi-arrow-left"
                    className="p-button-outlined"
                    onClick={() => setStep(2)}
                    disabled={submitting}
                  />
                  <Button
                    label="Confirmar y Guardar Torneo"
                    icon="pi pi-check"
                    severity="success"
                    onClick={handleFinalSubmit}
                    loading={submitting}
                  />
                </div>
              </Fieldset>
            )}

            {/* Modal para crear un nuevo peleador rápido */}
            <FighterQuickCreateDialog
              visible={showFighterQuickCreate}
              onHide={() => setShowFighterQuickCreate(false)}
              onCreated={(newLuchador) => {
                if (newLuchador && newLuchador.id) {
                  handleAddFighter(
                    {
                      idUsuario: newLuchador.id,
                      nombre: newLuchador.nombre,
                      apellido: newLuchador.apellido,
                      clubNombre: newLuchador.clubNombre,
                    },
                    newLuchador.idClub
                  );
                }
              }}
            />
          </>
        )}
      </div>
    </AdminRoute>
  );
}