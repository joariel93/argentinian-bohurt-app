# Análisis Completo: Argentinian Buhurt App

## 1. ¿De qué trata la aplicación?

Aplicación web para la gestión de **clubes, equipos y torneos de Buhurt** (Combate Medieval Histórico) en Argentina. Desarrollada con **Next.js 14** (Pages Router) y **PrimeReact 10**, permite:

- Visualizar un directorio de **clubes** y sus **equipos**
- Consultar **estadísticas** (combates, victorias, derrotas, rounds) por club y por equipo desglosado por torneo
- Gestionar **torneos**: crearlos con formularios (datos principales, modalidad, clubes invitados)
- Acceso autenticado vía **OTP** para organizadores

---

## 2. Stack Tecnológico

| Tecnología | Versión | Uso |
|---|---|---|
| Next.js | 14.2.5 | Framework (Pages Router) |
| React | 18 | UI |
| PrimeReact | 10.8.2 | Biblioteca de componentes (DataTable, TreeTable, Fieldset, Dialog, InputOtp, AutoComplete, etc.) |
| PrimeFlex | 3.3.1 | Grid y utilidades CSS |
| PrimeIcons / Font Awesome 6 | — | Iconografía |
| Tailwind CSS | 3.4.1 | Estilos utilitarios |
| Axios | — | Cliente HTTP |
| MariaDB | — | Base de datos (según script SQL) |

---

## 3. Estructura de la Aplicación

```
argentinian-buhurt-app/
├── .gitignore
├── next.config.mjs
├── package.json
├── postcss.config.mjs
├── tailwind.config.js
├── jsconfig.json
├── public/
│   ├── flag_placeholder.png
│   ├── shield.png
│   └── shield1.png
└── src/
    ├── pages/                    # 7 páginas con routing dinámico
    │   ├── _app.jsx              # Wrapper global (temas PrimeReact, estilos)
    │   ├── _document.jsx         # Documento HTML (Font Awesome CDN)
    │   ├── clubs/
    │   │   ├── index.jsx         # Listado de clubes (/clubs)
    │   │   ├── [id].jsx          # Detalle de club (/clubs/:id)
    │   │   └── clubInfo/[clubId].jsx  # (VACÍO) Ruta planeada
    │   ├── team/[id].jsx         # Detalle de equipo (/team/:id)
    │   ├── tournaments/[tournamentId].jsx  # Gestión de torneo (OTP + form/info)
    │   └── organizers/[organizerId].jsx    # Gestión organizador (OTP, incompleto)
    ├── components/
    │   ├── common/
    │   │   ├── cards/TeamCard.jsx           # Card de club/equipo
    │   │   ├── grids/TeamGrid.jsx           # Grilla responsive de TeamCards
    │   │   ├── inputs/InputVerification.jsx # Input OTP de 6 dígitos
    │   │   └── tables/
    │   │       ├── StaticsTable.jsx         # Tabla plana de estadísticas (club)
    │   │       └── DetailStaticsTable.jsx   # TreeTable jerárquico (equipo → torneos)
    │   └── specifics/
    │       ├── forms/TournamentForm.jsx     # Formulario creación de torneo (~300 líneas)
    │       └── infoViews/TournamentInfo.jsx # Vista info torneo (ROTA)
    ├── services/
    │   ├── apiService.js         # Capa API (stubs con mock data + 2 endpoints reales)
    │   ├── authService.js        # Servicio de login (NO USADO)
    │   └── mockupData.js         # Datos mock (501 líneas, 7 datasets)
    └── styles/
        ├── globals.css           # Estilos globales + clase .tableTree
        └── flags.css             # Sprites de banderas (~240 países)
```

### 3.1 Páginas

| Ruta | Archivo | Estado |
|---|---|---|
| `/clubs` | `clubs/index.jsx` | ✅ Listado de clubes con grid |
| `/clubs/:id` | `clubs/[id].jsx` | ✅ Detalle de club (info + stats + equipos) |
| `/clubs/clubInfo/:clubId` | `clubs/clubInfo/[clubId].jsx` | ❌ Archivo vacío |
| `/team/:id` | `team/[id].jsx` | ✅ Detalle de equipo (info + stats x torneo) |
| `/tournaments/:tournamentId` | `tournaments/[tournamentId].jsx` | ⚠️ OTP + formulario OK, vista info rota |
| `/organizers/:organizerId` | `organizers/[organizerId].jsx` | 🔴 Incompleta, componente faltante |

---

## 4. Base de Datos (MariaDB) — Mapeo con la App

El script SQL define **16 tablas**. Estado de cada una respecto a la aplicación:

| Tabla | Descripción | Estado en la App |
|---|---|---|
| **USUA** | Usuarios (ID, nick, password, nombre, mail, teléfono, tipo, fecha nac., habilitado, intentos login) | ❌ No implementado |
| **CLUB** | Clubes (ID, nombre, país, logo, fundación, info, responsable) | ⚠️ Mockeado en `equipos` |
| **TEAM** | Equipos (ID, club, logo, nombre, fecha creac., 3 colores, categoría, modalidad, género) | ⚠️ Mockeado en `equipos` y `equiposDetail` |
| **CLRS** | Colores (ID, nombre, estilo, hexa) | ❌ No implementado |
| **RDSS** | Redes Sociales (ID, nombre, icono) | ⚠️ Mockeado inline en datos |
| **CRDS** | Club-RedSocial (club, red social, link) | ⚠️ Mockeado inline |
| **EQRS** | Equipo-RedSocial (equipo, red social, link) | ⚠️ Mockeado inline |
| **TNEO** | Torneos (ID, nombre, lugar, fechas, organizador, reglamento, género, categoría, modalidad, tipo, link transmisión, cant. grupos) | ⚠️ Formulario de creación implementado |
| **TNFT** | Torneo-Peleador (torneo, peleador, equipo, número, posición, estadísticas) | ❌ No implementado |
| **TNTE** | Torneo-Equipo (torneo, equipo, posición, estadísticas) | ⚠️ Estadísticas mockeadas en `statsTeam` |
| **TEGR** | Torneo-Grupo-Equipo (torneo, equipo, grupo) | ❌ No implementado |
| **CMBT** | Combates (torneo, ID, orden, rounds ganados, equipos, ganador, eliminatoria, ronda, modalidad, en curso) | ❌ No implementado |
| **RNDC** | Rounds (combate, número, equipo ganador, puntos) | ❌ No implementado |
| **RNDP** | Round-Peleador (combate, round, peleador, en pie, amonestado, expulsado) | ❌ No implementado |
| **FGTR** | Peleadores (usuario, nombre emergencia, teléfono emergencia) | ❌ No implementado |
| **RGMT** | Reglamentos (ID, nombre, link) | ❌ No implementado |
| **TNRS** | Torneo-RedSocial (torneo, red social, link) | ❌ No implementado |
| **TNPO** | Torneo Pendiente Organizar (torneo, organizador, fecha) | ❌ No implementado |
| **MSJS** | Mensajes (ID, destinatario, tipo, asunto, cuerpo) | ❌ No implementado |

---

## 5. Funcionalidad Implementada (Resuelto)

### 5.1 Frontend

| Funcionalidad | Archivos | Estado |
|---|---|---|
| Listado de clubes con grid responsive | `clubs/index.jsx`, `TeamGrid.jsx`, `TeamCard.jsx` | ✅ Funcional con datos mock |
| Detalle de club (info, palmares, estadísticas, equipos) | `clubs/[id].jsx`, `StaticsTable.jsx` | ✅ Funcional con datos mock |
| Detalle de equipo (info, palmares, estadísticas por torneo) | `team/[id].jsx`, `DetailStaticsTable.jsx` | ✅ Funcional con datos mock |
| Formulario de creación de torneo | `tournaments/[tournamentId].jsx`, `TournamentForm.jsx` | ✅ Funcional con OTP |
| Diálogo OTP de 6 dígitos | `InputVerification.jsx` | ✅ Funcional |
| Tematización PrimeReact Arya-Green | `_app.jsx` | ✅ |
| Banderas por país (sprites CSS) | `flags.css`, `TeamCard.jsx` | ✅ |
| Social links en cards | `TeamCard.jsx` | ✅ |
| Navegación entre rutas | Todas las páginas | ✅ |

### 5.2 API / Servicios

| Endpoint | Método | Ubicación | Estado |
|---|---|---|---|
| `GET /api/clubs` | Mock | `apiService.fetchClubs` | ✅ Mock |
| `GET /api/club/:id` | Mock | `apiService.fetchClubData` | ✅ Mock |
| `GET /api/clubStats/:id` | Mock | `apiService.fetchClubStats` | ✅ Mock |
| `GET /api/get-clubs-simplify` | Mock | `apiService.fetchClubsSimplify` | ✅ Mock |
| `GET /api/teams/:id` | Mock | `apiService.fetchTeam` | ✅ Mock |
| `GET /api/tournaments-team/:id` | Mock | `apiService.fetchTeamTournamentStats` | ✅ Mock |
| `GET /api/combat-types/:modalidad` | Mock | `apiService.fetchTiposCombate` | ✅ Mock |
| `POST /api/organizers/:id/validate-otp` | Real | `apiService.validateOtp` | ✅ Real |
| `POST /api/organizers/:id/tournaments` | Real | `apiService.submitTournament` | ✅ Real |

---

## 6. Bugs Conocidos

| # | Bug | Archivo | Gravedad |
|---|---|---|---|
| 1 | `return` fuera de la función → componente no renderiza | `TournamentInfo.jsx` | 🔴 ALTA |
| 2 | `fetchTournamentInfoSimplify` no existe en `apiService.js` | `TournamentInfo.jsx:18` | 🔴 ALTA |
| 3 | `TournamentInfo` no está importado en la página de torneo | `tournaments/[tournamentId].jsx` | 🔴 ALTA |
| 4 | Componente `OrganizerInfo` no existe ni está importado | `organizers/[organizerId].jsx` | 🔴 ALTA |
| 5 | `checkTournamentExists` siempre retorna `undefined` | `apiService.js` | 🔴 ALTA |
| 6 | OTP siempre válido (`const isValid = true` hardcodeado) | `tournaments/[tournamentId].jsx:47`, `organizers/[organizerId].jsx:47` | 🟡 MEDIA |
| 7 | Variable `equiposSimplificados` no exportada de `mockupData.js` | `apiService.js` (fetchTeamsSimplify) | 🟡 MEDIA |
| 8 | Valores duplicados en `categoriasCombate` (value:1 aparece 2 veces) | `mockupData.js` | 🟡 MEDIA |
| 9 | CSS: coma extra antes de punto y coma en `height: 'auto',;` | `globals.css:29` | 🟢 BAJA |
| 10 | Label "Localizacion" en campo "categoria" | `TournamentInfo.jsx` | 🟢 BAJA |

---

## 7. Funcionalidad FALTANTE vs Base de Datos

A continuación, todo lo que NO está implementado pero está modelado en la BD:

### 7.1 Módulo de Usuarios y Autenticación

| Tabla | Pendiente |
|---|---|
| `USUA` | Registro, login (authService.js existe pero no se usa), recuperación de contraseña, perfil de usuario |
| `FGTR` | Perfil de peleador (datos de emergencia vinculados a usuario) |
| `USUA_HABI`, `USUA_CANT_LOGIN` | Control de habilitación e intentos de login |

### 7.2 Módulo de Combates (Core del Torneo)

| Tabla | Pendiente |
|---|---|
| `CMBT` | CRUD de combates: asignar equipos, determinar ganador, control de ronda, modalidad, estado "en curso" |
| `RNDC` | Registro de rounds por combate: puntuación por round |
| `RNDP` | Seguimiento individual por peleador dentro de cada round (amonestaciones, expulsiones, si está en pie) |

### 7.3 Módulo de Torneos (Lógica Faltante)

| Funcionalidad | Pendiente |
|---|---|
| `TNFT` | Inscripción de peleadores a torneos con estadísticas individuales (victorias, derrotas, rounds, amonestaciones, expulsiones) |
| `TNTE` | Inscripción de equipos a torneos con estadísticas (YA mockeado parcialmente en `statsTeam`) |
| `TEGR` | Asignación de equipos a grupos dentro de un torneo |
| `TNRS` | Redes sociales asociadas al torneo |
| `TNPO` | Torneos pendientes de organización (workflow de aprobación) |
| `TNEO_TNTP` | Tipo de torneo (no implementado en UI) |
| `TNEO_CANT_GRUPOS` | Configuración de cantidad de grupos |

### 7.4 Módulo de Reglamentos

| Tabla | Pendiente |
|---|---|
| `RGMT` | CRUD de reglamentos (nombre + link). El formulario de torneo tiene un dropdown de reglamento pero usa datos mock |

### 7.5 Módulo de Mensajería

| Tabla | Pendiente |
|---|---|
| `MSJS` | Sistema de mensajería entre usuarios (destinatario, tipo, asunto, cuerpo). Tabla creada en BD pero sin uso en app |

### 7.6 Módulo de Colores

| Tabla | Pendiente |
|---|---|
| `CLRS` | Gestión de colores para equipos. El equipo tiene 3 colores (`TEAM_CLRS_1/2/3`) pero no hay UI para seleccionarlos ni datos |

### 7.7 Redes Sociales (Falta Integración Real)

| Tabla | Pendiente |
|---|---|
| `RDSS`, `CRDS`, `EQRS`, `TNRS` | Actualmente los datos de redes sociales están hardcodeados en los mocks. Falta CRUD real |

### 7.8 Páginas Faltantes / Incompletas

| Ruta | Estado |
|---|---|
| `/clubs/clubInfo/:clubId` | Archivo VACÍO (ruta planeada) |
| `/organizers/:organizerId` | Página incompleta (componente `OrganizerInfo` faltante, depende de `checkTournamentExists`) |
| `/tournaments/:tournamentId` (vista info) | `TournamentInfo.jsx` ROTO (syntax error + método faltante) |

---

## 8. API que habría que desarrollar (Backend)

Basado en los stubs en `apiService.js` y las tablas de la BD, estos son los endpoints necesarios:

### 8.1 Endpoints YA referenciados en el frontend

| Método | Endpoint | Prioridad |
|---|---|---|
| GET | `/api/clubs` | Alta |
| GET | `/api/club/:idClub` | Alta |
| GET | `/api/clubStats/:idClub` | Alta |
| GET | `/api/get-clubs-simplify` | Alta |
| GET | `/api/teams/:idTeam` | Alta |
| GET | `/api/get-teams-simplify/:idClub` | Alta |
| GET | `/api/tournaments-team/:idTeam` | Alta |
| GET | `/api/combat-types/:idModalidad` | Alta |
| POST | `/api/organizers/:organizerId/validate-otp` | Alta (real, funciona) |
| POST | `/api/organizers/:organizerId/tournaments` | Alta (real, funciona) |
| GET | `/api/tournaments/:tournamentId/info` | Alta (método faltante `fetchTournamentInfoSimplify`) |
| GET | `/api/club/:organizerId` (check exists) | Alta (actualmente roto) |

### 8.2 Endpoints NO implementados (basados en la BD)

| Método | Endpoint | Descripción |
|---|---|---|
| POST | `/api/auth/login` | Login de usuario (authService.js ya lo llama) |
| POST | `/api/auth/register` | Registro de usuario |
| GET/PUT | `/api/users/:userId` | Perfil de usuario |
| GET/PUT | `/api/fighters/:userId` | Perfil de peleador (FGTR) |
| CRUD | `/api/clubs` | ABM completo de clubes |
| CRUD | `/api/teams` | ABM completo de equipos |
| CRUD | `/api/teams/:teamId/colors` | Asignación de colores (CLRS) |
| GET/POST | `/api/tournaments/:tournamentId/fighters` | Peleadores en torneo (TNFT) |
| GET/POST | `/api/tournaments/:tournamentId/teams` | Equipos en torneo (TNTE) |
| POST | `/api/tournaments/:tournamentId/groups` | Asignación a grupos (TEGR) |
| CRUD | `/api/tournaments/:tournamentId/bouts` | Combates (CMBT) |
| CRUD | `/api/tournaments/:tournamentId/bouts/:boutId/rounds` | Rounds (RNDC) |
| CRUD | `/api/tournaments/:tournamentId/bouts/:boutId/rounds/:roundId/fighters` | Round-Peleador (RNDP) |
| CRUD | `/api/regulations` | Reglamentos (RGMT) |
| CRUD | `/api/social-networks` | Redes sociales (RDSS) |
| CRUD | `/api/colors` | Colores (CLRS) |
| CRUD | `/api/messages` | Mensajería (MSJS) |
| CRUD | `/api/tournaments/pending` | Torneos pendientes (TNPO) |

---

## 9. Resumen de Estado del Proyecto

```
┌─────────────────────────────────────────────────────┐
│   ESTADO GENERAL: PROTOTIPO FUNCIONAL PARCIAL       │
├─────────────────────────────────────────────────────┤
│                                                       │
│  Frontend visual             ████████░░  80%         │
│  Datos (mock)                ████████░░  80%         │
│  API real conectada          ██░░░░░░░░  20%         │
│  Lógica de torneo            ██░░░░░░░░  20%         │
│  Gestión de usuarios         ░░░░░░░░░░   0%         │
│  Combates / Rounds           ░░░░░░░░░░   0%         │
│  Mensajería                  ░░░░░░░░░░   0%         │
│  Reglamentos                 ░░░░░░░░░░   0%         │
│  Colores                     ░░░░░░░░░░   0%         │
│                                                       │
│  Bugs activos:               ██████░░░░  10 bugs     │
│  De los cuales críticos:     ████░░░░░░   6 bugs     │
└─────────────────────────────────────────────────────┘
```

### Prioridades de desarrollo sugeridas:

1. **🔴 Crítico**: Arreglar bugs existentes (TournamentInfo, OrganizerInfo, checkTournamentExists, imports faltantes)
2. **🔴 Alta**: Implementar API real para los endpoints que el frontend ya consume (reemplazar mocks)
3. **🟡 Media**: Módulo de usuarios (registro, login, roles)
4. **🟡 Media**: Módulo de combates y rounds (CMBT, RNDC, RNDP)
5. **🟡 Media**: Inscripción de peleadores/equipos a torneos (TNFT, TNTE, TEGR)
6. **🟢 Baja**: Reglamentos, colores, redes sociales, mensajería

---

## 10. Notas sobre el Script SQL

El script de MariaDB proporcionado (`ScriptMariaDb.txt`) tiene nombres de tablas y columnas abreviados (estilo legacy: `CLRS`, `USUA`, `FGTR`, `CMBT`, `RNDC`, `RNDP`, `TNEO`, `TNFT`, `TNTE`, `TEGR`, `TNPO`, `TNRS`, `RGMT`, `RDSS`, `CRDS`, `EQRS`, `MSJS`). Las foreign keys están comentadas pero no implementadas en el script provisto.

La aplicación frontend usa nombres semánticos en inglés/español (ej. `clubes`, `equipos`, `nombre`, `pais`), que no se corresponden directamente con los nombres abreviados del script SQL. Esto implica que la API deberá traducir entre ambos naming conventions.
