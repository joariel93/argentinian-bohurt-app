# Plan de Ejecución (Actualizado): Entidad Evento, Múltiples Torneos por Evento y ABM de Eventos

## 1. Contexto y Objetivos

En el Buhurt, cada fecha competitiva es un **Evento** integral (ej. "Copa Centinela 2026") que alberga múltiples **Torneos / Categorías** simultáneos (ej. Buhurt 5v5 Masculino, Buhurt 3v3 Femenino, Duelo Espada Larga, etc.). 

El objetivo es normalizar el modelo de datos, centralizar los datos comunes en `Evento`, eliminar redundancias en `Torneo`, incorporar generación automática de OTP alfanumérico único, implementar un **ABM completo de Eventos** para la administración y migrar la cartelera pública de `/tournaments` a `/events`.

---

## 2. Fase 1: Base de Datos y Backend (`argentinian-buhurt-api`)

### 2.1 Esquema de Base de Datos (SQLite / Turso)

#### A. Nueva tabla `evento`
Utilizará **UUID v4** como clave primaria (`id_evento`):
```sql
CREATE TABLE IF NOT EXISTS evento (
  id_evento TEXT PRIMARY KEY,                       -- UUID v4
  nombre TEXT NOT NULL,                             -- Nombre del evento
  localizacion TEXT NOT NULL,                       -- Lugar / Ciudad / Sede
  fecha_evento TEXT NOT NULL,                       -- Fecha del evento
  fecha_cierre_inscripcion TEXT NOT NULL,           -- Cierre de inscripciones
  id_reglamento INTEGER NOT NULL DEFAULT 1,         -- Reglamento del evento
  id_organizador TEXT,                              -- FK usuario
  imagen TEXT,                                      -- Banner / Afiche
  link_transmision TEXT,                            -- Stream en vivo
  password TEXT NOT NULL,                           -- OTP del Evento (6 caracteres alfanuméricos)
  estado TEXT DEFAULT 'Pendiente',                  -- Pendiente / En curso / Finalizado
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (id_reglamento) REFERENCES reglamento(id_reglamento),
  FOREIGN KEY (id_organizador) REFERENCES usuario(id_usuario)
);
```

#### B. Nueva tabla `evento_redes_sociales` y eliminación de `torneo_redes_sociales`
- Se crea `evento_redes_sociales`:
  ```sql
  CREATE TABLE IF NOT EXISTS evento_redes_sociales (
    id_evento TEXT NOT NULL,
    id_red_social INTEGER NOT NULL,
    link TEXT,
    PRIMARY KEY (id_evento, id_red_social),
    FOREIGN KEY (id_evento) REFERENCES evento(id_evento) ON DELETE CASCADE,
    FOREIGN KEY (id_red_social) REFERENCES redes_sociales(id_red_social)
  );
  ```
- **Se elimina la tabla `torneo_redes_sociales`** (`DROP TABLE IF EXISTS torneo_redes_sociales;`), ya que las redes pertenecen al evento.

#### C. Nueva tabla `evento_clubes_invitados`
```sql
CREATE TABLE IF NOT EXISTS evento_clubes_invitados (
  id_evento TEXT NOT NULL,
  id_club TEXT,
  nombre_club_manual TEXT,
  email TEXT,
  telefono TEXT,
  FOREIGN KEY (id_evento) REFERENCES evento(id_evento) ON DELETE CASCADE,
  FOREIGN KEY (id_club) REFERENCES club(id_club)
);
```

#### D. Refactorización de la tabla `torneo`
Se eliminan los campos redundantes que ahora residen exclusivamente en `evento`:
- ❌ `nombre` (eliminado de torneo)
- ❌ `localizacion` (eliminado de torneo)
- ❌ `fecha_torneo` (eliminado de torneo)
- ❌ `fecha_cierre_inscripcion` (eliminado de torneo)
- ❌ `id_organizador` (eliminado de torneo)
- ❌ `imagen` (eliminado de torneo)
- ❌ `id_reglamento` (eliminado de torneo)

La tabla `torneo` quedará reducida y normalizada a sus aspectos deportivos y de acceso:
```sql
CREATE TABLE IF NOT EXISTS torneo (
  id_torneo TEXT PRIMARY KEY,                       -- UUID v4
  id_evento TEXT NOT NULL,                          -- FK a evento(id_evento)
  id_modalidad INTEGER NOT NULL,                    -- FK a modalidad(id_modalidad)
  id_categoria INTEGER NOT NULL,                    -- FK a categoria(id_categoria, id_modalidad)
  id_genero INTEGER NOT NULL,                       -- FK a genero(id_genero)
  id_tipo_torneo INTEGER NULL,                      -- Opcional (NULL en creación, se define según inscriptos)
  password TEXT NOT NULL,                           -- OTP único del torneo (6 caracteres alfanuméricos)
  estado TEXT DEFAULT 'Pendiente',                  -- Pendiente / En curso / Finalizado
  FOREIGN KEY (id_evento) REFERENCES evento(id_evento) ON DELETE CASCADE,
  FOREIGN KEY (id_modalidad) REFERENCES modalidad(id_modalidad),
  FOREIGN KEY (id_categoria, id_modalidad) REFERENCES categoria(id_categoria, id_modalidad),
  FOREIGN KEY (id_genero) REFERENCES genero(id_genero),
  FOREIGN KEY (id_tipo_torneo) REFERENCES tipo_torneo(id_tipo_torneo)
);
```

---

### 2.2 Endpoints en la API (`argentinian-buhurt-api`)

1. **`GET /api/v1/utils/generate-otp`**:
   - Genera una cadena aleatoria de **6 caracteres alfanuméricos** `[A-Z0-9]` (sin caracteres especiales).
   - Verifica en una sola consulta que no exista ni en `evento.password` ni en `torneo.password`.
   - Si existiera colisión, genera otro automáticamente en bucle hasta que sea 100% único y lo retorna `{ otp: "K8B2X9" }`.

2. **`GET /api/v1/events`**:
   - Listado de eventos con conteo de categorías/torneos incluidos y resumen de modalidades para las cards.

3. **`GET /api/v1/events/:id`**:
   - Detalle público: datos del evento, redes, clubes y array de torneos asociados con nombres resueltos de modalidad, categoría y género.

4. **`GET /api/v1/events/:id/admin`**:
   - Detalle completo para la vista de edición administrativa (incluye IDs foráneos, OTP del evento y OTPs de cada torneo).

5. **`POST /api/v1/events`**:
   - Endpoint transaccional:
     - Crea el registro en `evento` con UUID generado.
     - Inserta los registros en `evento_redes_sociales` y `evento_clubes_invitados`.
     - En bucle, inserta cada torneo en `torneo` vinculado a `id_evento`, con `id_tipo_torneo = null` (o el indicado si viniera).

6. **`PUT /api/v1/events/:id`**:
   - Actualiza datos del evento, redes y clubes.
   - Sincroniza torneos asociados (agrega nuevos, actualiza existentes o remueve los eliminados).

7. **`DELETE /api/v1/events/:id`**:
   - Eliminación en cascada del evento y sus torneos/relaciones.

8. **`POST /api/v1/events/:id/validate-otp`**:
   - Validación de OTP a nivel evento para que el organizador ingrese a gestionar su evento.

---

## 3. Fase 2: Capa de Servicios Frontend (`argentinian-buhurt-app`)

En `src/services/apiService.js`:
- `generateUniqueOtp()`: Solicita un nuevo OTP alfanumérico único.
- `fetchEvents()`: Listado de eventos.
- `fetchEvent(id)`: Detalle público del evento y sus torneos.
- `fetchEventForAdmin(id)`: Detalle para edición.
- `createEvent(payload)`: Creación conjunta de evento y torneos.
- `updateEvent(id, payload)`: Modificación de evento y torneos.
- `deleteEvent(id)`: Eliminación de evento.
- `validateEventOtp(idEvento, otp)`: Acceso de organizador vía OTP del evento.

---

## 4. Fase 3: ABM de Eventos y Formularios Administrativos

### 4.1 Pantalla Principal del ABM: `src/pages/admin/events/index.jsx`
- Reemplaza la antigua gestión en `/admin/tournaments`.
- Encabezado con título "Gestión de Eventos" y botón destacado **"Nuevo Evento"** (redirige a `/admin/events/nuevo`).
- **DataTable de Eventos**:
  - Columnas: Banner / Imagen | Nombre del Evento | Localización | Fecha del Evento | Cierre Inscripción | Cantidad de Categorías | Estado | Acciones.
  - **Acciones por fila**:
    - **Editar**: Redirige a la página completa `/admin/events/[id]/editar`.
    - **Gestionar Combates / Inscripciones**: Acceso directo a las llaves y combates de las categorías del evento.
    - **Eliminar**: Modal de confirmación para borrar el evento y sus categorías.

### 4.2 Nueva Página: `src/pages/admin/events/nuevo.jsx`
Página completa dedicada (sin modales contenedores) con el formulario `EventForm`:
- **Sección 1: Información Principal del Evento**:
  - Nombre (InputText, requerido)
  - Localización (InputText, requerido)
  - Fecha del Evento y Fecha de Cierre de Inscripción (fechas, requeridas)
  - Reglamento base del evento (Dropdown, requerido)
  - Banner / Imagen (ImageUpload)
  - Link de transmisión en vivo (InputText)
  - Redes Sociales del Evento (SocialLinksInput)
  - **Password / OTP del Evento**: Input deshabilitado que se carga automáticamente con un OTP alfanumérico único generado al montar el formulario (con botón de refresco opcional por si el usuario desea regenerarlo).
- **Sección 2: Clubes Invitados**:
  - AutoComplete buscador de clubes + modal para registrar clubes nuevos.
  - Tabla de clubes invitados con botón para remover.
- **Sección 3: Torneos / Categorías de la Fecha**:
  - **Fila de adición rápida**:
    - `Modalidad` (Dropdown: Buhurt, Duelo, Profight).
    - `Categoría` (Dropdown dependiente: 5v5, 3v3, Espada y Escudo, Espada Larga, etc.).
    - `Género` (Dropdown: Masculino, Femenino, Mixto).
    - *Nota*: **No se exige formato de torneo** (`id_tipo_torneo`), queda en blanco / null para ser definido más adelante según la cantidad de inscriptos.
    - `OTP del Torneo`: Se genera un OTP alfanumérico único para cada categoría agregada y se muestra deshabilitado.
    - Botón **"+ Agregar Categoría"**.
  - **DataTable de Categorías Agregadas**:
    - Columnas: Modalidad | Categoría | Género | OTP Asignado | Acciones (Eliminar).
    - Validación: Requiere tener al menos 1 categoría agregada para poder guardar.
- **Botón de Guardado**:
  - Botón `"Crear Evento y Torneos"` (con indicador de carga).

### 4.3 Página de Edición: `src/pages/admin/events/[id]/editar.jsx`
- Misma estructura de formulario, pre-cargada con los datos del evento, sus redes, clubes y la lista de torneos existentes para editarlos o agregar nuevas categorías.

---

## 5. Fase 4: Cartelera Pública y Navegación

### 5.1 Cartelera de Eventos (`src/pages/events/index.jsx`)
- Grid de cards de eventos con afiche, nombre, fecha, lugar y badges con las categorías/modalidades disputadas.
- Barra de navegación principal actualizada para apuntar a **Eventos** en lugar de Torneos.

### 5.2 Detalle del Evento y Categorías (`src/pages/events/[id].jsx`)
- Cabecera con banner, información general, transmisión en vivo y clubes participantes.
- Selector visual de categorías (Tabs / Chips) para alternar entre los torneos del evento.
- Al seleccionar una categoría, se despliegan sus fixtures, combates, brackets y posiciones.

### 5.3 Deprecación de `/tournaments`
- La ruta `/tournaments` queda deprecada: se implementa una redirección permanente (`redirect: { destination: '/events' }`) para no romper enlaces guardados.

---

## 6. Plan de Pasos Secuenciales

| Paso | Área | Tarea Concreta |
|---|---|---|
| **1** | Backend / DB | Modificar `schema.js`: crear `evento`, `evento_redes_sociales`, `evento_clubes_invitados`, refactorizar `torneo` (eliminar columnas redundantes) y eliminar `torneo_redes_sociales`. |
| **2** | Backend / API | Crear endpoint generador de OTP alfanumérico único `/api/v1/utils/generate-otp`. |
| **3** | Backend / API | Crear controller y routes para `/api/v1/events` (`GET`, `POST`, `PUT`, `DELETE`, `validate-otp`). |
| **4** | Frontend / API | Implementar métodos de eventos en `apiService.js`. |
| **5** | Frontend / Admin | Construir la vista de listado ABM `/admin/events/index.jsx`. |
| **6** | Frontend / Admin | Crear componente `EventForm` y la página `/admin/events/nuevo.jsx`. |
| **7** | Frontend / Admin | Crear página de edición `/admin/events/[id]/editar.jsx`. |
| **8** | Frontend / Public | Crear páginas públicas `/events/index.jsx` y `/events/[id].jsx`. |
| **9** | Frontend / Nav | Actualizar barra de navegación y configurar redirección de `/tournaments` a `/events`. |
| **10** | Verificación | Pruebas integrales de flujo (creación evento multitorneo, unicidad de OTP, edición, build de producción). |
