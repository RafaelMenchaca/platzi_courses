# Platziflix — Memoria del Proyecto (Multi-plataforma)

Plataforma de cursos online estilo Netflix. **Monorepo con 4 aplicaciones independientes** que se
acoplan únicamente por el **contrato REST del Backend** (no comparten código). El Backend es la
**única fuente de verdad**; los 3 clientes (web + 2 móviles) consumen los mismos endpoints HTTP/JSON.

```
                    ┌──────────────────────────┐
                    │   Backend (FastAPI)       │
                    │   PostgreSQL  :8000       │  ← única fuente de datos
                    └────────────┬─────────────┘
                                 │ HTTP/JSON (REST)
            ┌────────────────────┼────────────────────┐
   ┌────────▼───────┐   ┌────────▼────────┐   ┌────────▼────────┐
   │ Frontend       │   │ Android (Kotlin)│   │ iOS (Swift)     │
   │ Next.js 15 :3000│  │ Compose + MVVM  │   │ SwiftUI + MVVM  │
   └────────────────┘   └─────────────────┘   └─────────────────┘
```

> Implicación clave: cambiar un endpoint impacta a 3 clientes a la vez. El acoplamiento es por
> contrato (forma del JSON), no por código.

## Estructura del repositorio

```
claude-code/
├── Backend/    # API FastAPI + PostgreSQL  (núcleo)
├── Frontend/   # Next.js 15 App Router
└── Mobile/
    ├── PlatziFlixAndroid/  # Kotlin + Jetpack Compose
    └── PlatziFlixiOS/      # Swift + SwiftUI
```

## Estado de madurez (importante para priorizar)

El backend va por delante de los clientes. **No asumir paridad de features:**

| Feature                | Backend | Frontend | Android | iOS |
|------------------------|:------:|:--------:|:-------:|:---:|
| Catálogo de cursos     |   ✅   |    ✅    |   ✅    | ✅  |
| Detalle de curso (slug)|   ✅   |    ✅    |   ❌    | ✅  |
| Reproductor de clase   |   ✅   |    ✅    |   ❌    | ❌  |
| Sistema de ratings     |   ✅   |    ✅    |   ❌    | ❌  |

---

# Backend — FastAPI (el núcleo)

**Stack:** FastAPI · PostgreSQL 15 · SQLAlchemy 2.0 · Alembic · UV · Docker Compose · puerto **8000**.

**Patrón:** Service Layer + Dependency Injection. La capa HTTP es delgada; **toda la lógica de
negocio vive en el Service**, no en los endpoints.

### Archivos clave
- `app/main.py` — define endpoints. Traduce excepciones de dominio (`ValueError`) a HTTP
  (`404` si el mensaje contiene `"not found"`, si no `400`). Inyecta el service con
  `Depends(get_course_service)`.
- `app/services/course_service.py` — **toda la lógica de negocio** (cursos + ratings).
  Las agregaciones de ratings (avg, count, distribución) se hacen a nivel SQL (`func.avg`, `func.count`,
  `group_by`) por eficiencia, no en Python.
- `app/models/` — entidades SQLAlchemy.
- `app/schemas/` — Pydantic (request/response de ratings).
- `app/alembic/versions/` — migraciones.
- `app/core/config.py` — settings.

### Modelo de datos
`BaseModel` (abstracto, en `models/base.py`) da a **todas** las entidades:
`id`, `created_at`, `updated_at`, `deleted_at`.

**Soft delete universal:** nada se borra físicamente. Toda query de lectura debe filtrar
`deleted_at.is_(None)`. Respetar este patrón en cualquier query nueva.

| Entidad        | Relaciones |
|----------------|------------|
| `Course`       | ↔ `Teacher` (Many-to-Many vía `course_teachers`); → `Lesson` (One-to-Many, cascade); → `CourseRating` (One-to-Many) |
| `Teacher`      | ↔ `Course` (Many-to-Many) |
| `Lesson`       | → `Course` (Many-to-One). Campos: `name`, `description`, `slug`, `video_url` |
| `CourseRating` | → `Course` (Many-to-One). Campos: `course_id`, `user_id` (sin FK aún), `rating` (1–5) |

> ⚠️ **Divergencia doc/código:** el modelo de datos histórico hablaba de una entidad `Class`.
> En el código real **no existe `Class`**: lo que el API llama "clase" es el modelo `Lesson`.
> El endpoint `GET /classes/{class_id}` consulta `Lesson` y mapea `name → title`, `video_url → video`.

### Endpoints REST
```
GET    /                                         Bienvenida
GET    /health                                    Status + conectividad DB (cuenta courses)
GET    /courses                                   Lista cursos (+ average_rating, total_ratings)
GET    /courses/{slug}                            Detalle (teachers, classes=lessons, rating stats)
GET    /classes/{class_id}                        Detalle de lección/clase (incluye video)

POST   /courses/{course_id}/ratings               Crear o ACTUALIZAR rating (upsert) → 201
GET    /courses/{course_id}/ratings               Lista ratings activos (desc por fecha)
GET    /courses/{course_id}/ratings/stats         Promedio + total + distribución 1–5
GET    /courses/{course_id}/ratings/user/{user_id} Rating de un usuario (204 si no existe)
PUT    /courses/{course_id}/ratings/{user_id}     Actualiza (404 si no existe). user_id body==path
DELETE /courses/{course_id}/ratings/{user_id}     Soft delete → 204
```

### Reglas de negocio de ratings
- Rango 1–5, validado **a nivel app y DB** (`CheckConstraint ck_course_ratings_rating_range`).
- **Un rating activo por usuario/curso.** `POST` hace upsert (crea o actualiza el activo).
  `PUT` exige que exista (si no, 404). `DELETE` es soft delete.
- Para mostrar UI de rating, consultar primero `/ratings/user/{user_id}` (204 = no ha calificado).

### Comandos (todo dentro del contenedor Docker `api`)
> **Regla:** cualquier comando de Backend se ejecuta **dentro del contenedor Docker API**.
> Antes de ejecutar, verificar que el contenedor está arriba y consultar el `Makefile` para usar
> el comando que ya existe (no inventar comandos).

```bash
cd Backend
make start            # Levanta Docker Compose (DB + API)
make stop             # Detiene contenedores
make migrate          # Aplica migraciones Alembic
make create-migration # Crea nueva migración
make seed             # Puebla datos de prueba
make seed-fresh       # Reset completo de datos
make logs             # Logs de todos los servicios
```

### Configuración DB (Docker)
Usuario `platziflix_user` · Pass `platziflix_password` · DB `platziflix_db` · puerto `5432`.

---

# Frontend — Next.js 15 (App Router)

**Stack:** Next.js 15 · React 19 · TypeScript (strict) · SCSS + CSS Modules · Vitest + RTL ·
fuentes Geist · puerto **3000**.

### Dos formas distintas de hablar con la API (no mezclar)
1. **Server Components** (páginas) — `fetch('http://localhost:8000/...')` directo desde el
   servidor con `cache: "no-store"`. Ej.: `app/course/[slug]/page.tsx`.
2. **Capa de servicios client-side** — `src/services/ratingsApi.ts`: cliente HTTP robusto con
   timeout (`AbortController`), errores tipados (`ApiError`) y degradación elegante
   (404 → stats vacías / array vacío / null). Usa `process.env.NEXT_PUBLIC_API_URL` con fallback a
   `http://localhost:8000`.

### Estructura
- `src/app/` — rutas: `/` (catálogo), `/course/[slug]` (detalle), `/classes/[class_id]` (player).
  Cada ruta de curso tiene archivos especiales de App Router: `loading.tsx`, `error.tsx`, `not-found.tsx`.
- `src/components/` — componentes co-localizados con su `.module.scss` y su test
  (`Course`, `CourseDetail`, `VideoPlayer`, `StarRating`).
- `src/types/` — tipos que espejan los DTOs del backend (`Course`, `CourseDetail`, `Class`, rating).
- `src/styles/` — `reset.scss`, `vars.scss`.

> ⚠️ **Bug latente conocido:** `app/course/[slug]/page.tsx → generateMetadata` usa `courseData.title`,
> pero el tipo `Course` define `name` (no `title`). El backend devuelve `name`. Revisar al tocar SEO.

### Comandos
```bash
cd Frontend
yarn dev    # Desarrollo
yarn build  # Producción
yarn test   # Vitest
yarn lint   # Linter
```

---

# Mobile — Android e iOS (arquitectura espejada)

Ambas apps implementan **Clean Architecture + MVVM** con capas equivalentes; solo cambia
lenguaje/framework. **Patrón central compartido:** `DTO (red) → Mapper → Domain Model (UI)`, para
desacoplar la forma del JSON del modelo que consume la vista.

| Capa          | Android (Kotlin)                                   | iOS (Swift)                                      |
|---------------|----------------------------------------------------|--------------------------------------------------|
| Domain        | `domain/models`, `domain/repositories` (interfaces)| `Domain/Models`, `Domain/Repositories` (protocols)|
| Data          | `data/entities` (DTO), `data/mappers`, `data/repositories` | `Data/Entities` (DTO), `Data/Mapper`, `Data/Repositories` |
| Network       | Retrofit (`ApiService`, `NetworkModule`)           | `NetworkManager`/`NetworkService` + `APIEndpoint`|
| Presentation  | Jetpack Compose + `ViewModel` + `UiState`          | SwiftUI + `CourseListViewModel`                  |
| DI            | `di/AppModule`                                     | Inicialización manual                            |

- Package Android: `com.espaciotiago.platziflixandroid`.
- Ambas apuntan a `http://localhost:8000` **hardcodeado**.
- **Android:** tiene `RemoteCourseRepository` y `MockCourseRepository` (permite desarrollar UI sin
  backend). Solo consume `GET /courses`.
- **iOS:** patrón endpoint-enum (`CourseAPIEndpoints`) sobre el protocol `APIEndpoint`. Consume
  `GET /courses` y `GET /courses/{slug}`.
- Ninguna app móvil implementa ratings aún.

---

# Convenciones y reglas de desarrollo

1. **Docker obligatorio** para el Backend (DB + API). Comandos de Backend → dentro del contenedor,
   vía `Makefile`.
2. **Soft delete:** toda query nueva en Backend filtra `deleted_at IS NULL`.
3. **Lógica de negocio en el Service Layer**, no en los endpoints de `main.py`.
4. **TypeScript strict** en Frontend; testing requerido para nuevas funcionalidades (los tests se
   co-localizan junto al código en los 3 proyectos).
5. **API REST como única fuente de datos** para todos los clientes. Al cambiar un endpoint,
   considerar el impacto en Frontend + Android + iOS.
6. **Naming:** `snake_case` (Python), `camelCase` (JS/TS), `PascalCase`/`camelCase` (Swift/Kotlin).
7. `localhost:8000` está hardcodeado en varios clientes (parcialmente parametrizado en Frontend) →
   tenerlo presente para entornos no-locales.

## URLs
- Backend API: http://localhost:8000 · Docs (Swagger): http://localhost:8000/docs
- Frontend Web: http://localhost:3000

## Arranque rápido
```bash
cd Backend && make start   # Backend (DB + API)
cd Frontend && yarn dev    # Frontend
```
