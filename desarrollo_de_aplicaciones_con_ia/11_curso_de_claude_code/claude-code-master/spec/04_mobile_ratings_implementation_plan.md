# Análisis de Impacto + Plan de Implementación — Sistema de Ratings (Platziflix)

## 0. Resumen ejecutivo

El backend expone 7 endpoints de ratings y ya inyecta `average_rating`/`total_ratings` en `GET /courses` y `GET /courses/{slug}`. El Frontend ya consume todo. **El trabajo restante es 100% móvil (Android + iOS)** y se divide en dos capacidades:

- **A. Rating read-only** (mostrar estrellas + promedio en card/detalle): barato, sin auth, solo propaga dos campos nuevos por la cadena DTO→Mapper→Domain→View.
- **B. Rating interactivo** (calificar): requiere endpoints POST/GET nuevos, método de repositorio, DTOs de request/response, estado en ViewModel e identidad mock `user_id = 42`. **Bloqueado por un prerequisito de navegación**: ninguna app móvil tiene hoy pantalla de detalle de curso con interacción (Android solo lista; iOS tiene `getCourseBySlug` implementado pero `selectCourse` es un TODO sin navegación).

| Componente | Estado | Esfuerzo restante |
|---|---|---|
| Backend | ✅ hecho (modelo, migración, service con upsert + stats SQL, 7 endpoints) | 0 |
| Frontend | ✅ hecho (tipos, `ratingsApi.ts`, `StarRating`, `RateCourse`, user_id=42) | 0 |
| Android | ❌ sin ratings, sin pantalla de detalle | Alto |
| iOS | ❌ sin ratings, con repo de detalle pero sin navegación a detalle | Medio-Alto |

---

## 1. Análisis de impacto por componente

### Backend — ✅ hecho
Modelo `CourseRating` (1–5 con CheckConstraint, soft delete), migración aplicada, `CourseService` con upsert + stats agregadas a nivel SQL, 7 endpoints REST funcionando, y `average_rating`/`total_ratings` ya inyectados en `GET /courses` y `GET /courses/{slug}`. Sin trabajo pendiente.

### Frontend — ✅ hecho
Tipos en `src/types/rating.ts`, cliente HTTP `src/services/ratingsApi.ts`, componentes `StarRating` y `RateCourse` (UI optimista + rollback), integrados en `CourseDetail`, identidad mock `user_id = 42` en `src/config/user.ts`, tests Vitest pasando. Sin trabajo pendiente.

### Android — ❌ en detalle

Paquete base: `com.espaciotiago.platziflixandroid`. Patrón confirmado: `DTO → Mapper(object) → Domain(data class) → Repository(Result<>) → ViewModel(StateFlow + UiState) → Compose`. DI manual en `AppModule` (singletons `by lazy`). Retrofit con `@GET` y `Response<T>`.

**Hallazgos que condicionan el plan:**
- `data/network/NetworkModule.kt` usa `BASE_URL = "http://10.0.2.2:8000/"` (alias del emulador para `localhost`), **no** el literal `localhost:8000`. Para POST hay que reutilizar el mismo `ApiService`/Retrofit — no introducir otra base URL.
- `ApiService.kt` solo declara `getAllCourses()`. No hay soporte POST ni endpoint de detalle.
- `CourseDTO`, `Course` (domain) y `CourseMapper` **no** tienen `average_rating`/`total_ratings`.
- No existe pantalla de detalle (`CourseListScreen` → `CourseCard`, fin). `CourseCard.onClick` se propaga pero no navega; no hay nav-graph (`MainActivity` monta `CourseListScreen` directo).

**Archivos a tocar / crear (Android):**

| Acción | Archivo | Detalle |
|---|---|---|
| Editar | `data/entities/CourseDTO.kt` | añadir `@SerializedName("average_rating") val averageRating: Double? = null` y `@SerializedName("total_ratings") val totalRatings: Int? = null` |
| Editar | `domain/models/Course.kt` | añadir `averageRating: Double`, `totalRatings: Int` (default 0.0/0) |
| Editar | `data/mappers/CourseMapper.kt` | mapear los dos campos con fallback (`?: 0.0` / `?: 0`) |
| Crear | `presentation/courses/components/StarRatingView.kt` | componente Compose de estrellas (read-only y modo interactivo) |
| Editar | `presentation/courses/components/CourseCard.kt` | añadir fila de estrellas read-only bajo la descripción |
| Crear | `data/entities/RatingDTO.kt` | `RatingRequestDTO(user_id, rating)`, `RatingResponseDTO`, `RatingStatsDTO(average_rating, total_ratings, rating_distribution)`, `UserRatingDTO` |
| Crear | `domain/models/RatingStats.kt`, `domain/models/UserRating.kt` | modelos de dominio |
| Crear | `data/mappers/RatingMapper.kt` | DTO↔Domain de ratings |
| Editar | `data/network/ApiService.kt` | `@POST("courses/{id}/ratings")`, `@GET(".../ratings/stats")`, `@GET(".../ratings/user/{userId}")` |
| Editar | `domain/repositories/CourseRepository.kt` | `submitRating`, `getUserRating`, `getRatingStats` (y `getCourseBySlug` para el detalle) |
| Editar | `data/repositories/RemoteCourseRepository.kt` + `MockCourseRepository.kt` | implementar nuevos métodos (Mock devuelve datos fijos) |
| Crear | `presentation/coursedetail/...` (state + viewmodel + screen) | **prerequisito**: pantalla de detalle |
| Editar | `MainActivity.kt` / navegación + `di/AppModule.kt` | navegación a detalle + provider del nuevo ViewModel; opcional `MOCK_USER_ID = 42` |

**Riesgo Android:** Medio-Alto. La parte read-only es trivial; la interactiva arrastra la creación de toda una pantalla de detalle y navegación que hoy no existe.

### iOS — ❌ en detalle

Patrón confirmado: `DTO(Codable) → CourseMapper(static func) → Course(struct) → CourseRepository(protocol, async throws) → @MainActor ObservableObject ViewModel → SwiftUI`. Red vía enum `CourseAPIEndpoints: APIEndpoint` + `NetworkManager.shared`.

**Hallazgos que condicionan el plan:**
- `Services/NetworkManager.swift` **ya** tiene `request<T,U>(_:body:responseType:)` con `JSONEncoder` y un `APIEndpointWithBody` privado → **la infraestructura POST ya existe y está sin usar**. No hay que tocar la capa de red para calificar.
- `CourseAPIEndpoints.swift` usa `baseURL = "http://localhost:8000"` (literal; OK en simulador, romperá en dispositivo físico).
- `CourseDTO`/`CourseDetailDTO`, `Course` y `CourseMapper` no tienen `average_rating`/`total_ratings`.
- **`getCourseBySlug` está implementado en el repo pero la UI nunca lo usa**: `CourseListView` llama `viewModel.selectCourse`, que es un `print` TODO. No hay `NavigationLink` a un detalle. → Prerequisito de navegación igual que Android, pero con el repo de detalle ya listo.

**Archivos a tocar / crear (iOS):**

| Acción | Archivo | Detalle |
|---|---|---|
| Editar | `Data/Entities/CourseDTO.swift` | añadir `averageRating: Double?` y `totalRatings: Int?` con `CodingKeys` (`average_rating`, `total_ratings`) en `CourseDTO` **y** `CourseDetailDTO` |
| Editar | `Domain/Models/Course.swift` | añadir `averageRating: Double`, `totalRatings: Int` (actualizar `mockCourses`) |
| Editar | `Data/Mapper/CourseMapper.swift` | mapear con `?? 0` en las 3 sobrecargas |
| Crear | `Presentation/Views/StarRatingView.swift` | estrellas SwiftUI (read-only + interactivo con tap) |
| Editar | `Presentation/Views/CourseCardView.swift` | fila de estrellas read-only |
| Crear | `Data/Entities/RatingDTO.swift` | `RatingRequestDTO`, `RatingResponseDTO`, `RatingStatsDTO`, `UserRatingDTO` (Codable) |
| Crear | `Domain/Models/RatingStats.swift`, `UserRating.swift` | modelos de dominio |
| Crear | `Data/Mapper/RatingMapper.swift` | DTO↔Domain |
| Editar | `Data/Repositories/CourseAPIEndpoints.swift` | casos `.submitRating(courseId,body)`, `.getRatingStats(courseId)`, `.getUserRating(courseId,userId)`; en `.submitRating` devolver `.POST` y `body` |
| Editar | `Domain/Repositories/CourseRepositoryProtocol.swift` + `Data/Repositories/RemoteCourseRepository.swift` | nuevos métodos `async throws` |
| Crear | `Presentation/ViewModels/CourseDetailViewModel.swift` + `Presentation/Views/CourseDetailView.swift` | **prerequisito**: pantalla de detalle |
| Editar | `Presentation/Views/CourseListView.swift` / `CourseListViewModel.selectCourse` | `NavigationLink`/navegación a detalle |
| Crear | `Config/AppConfig.swift` (o constante) | `mockUserId = 42` |

**Riesgo iOS:** Medio. La red para POST ya está resuelta y el repo de detalle ya existe; el principal faltante es la navegación + la vista de detalle.

---

## 2. Plan de implementación por fases

Notación: **[Req]** estrictamente necesario · **[Opt]** opcional. Cada fase es independiente por app.

### Fase 0 — Prerequisito: pantalla de detalle + navegación **[Req para B, no para A]**
Sin detalle no hay dónde colocar la UI interactiva de calificar. Read-only (Fase 1) **no** depende de esto: las estrellas read-only caben en la card del catálogo.
- **iOS** (más barato): envolver tarjetas en `NavigationLink` → `CourseDetailView`, cuyo `CourseDetailViewModel` llama al ya existente `getCourseBySlug`. Reemplazar el `print` de `selectCourse`.
- **Android**: introducir navegación (Navigation-Compose o un `when` de estado en `MainActivity`), crear `CourseDetailScreen` + `CourseDetailViewModel` + `UiState`, y un método `getCourseBySlug` en el repo (hoy no existe en Android; el endpoint backend sí).
- Dependencia: bloquea Fase 3. Puede hacerse en paralelo a Fase 1.

### Fase 1 — Rating read-only en catálogo **[Req]** · sin auth, sin prerequisito
1. Añadir `average_rating`/`total_ratings` a `CourseDTO` (ambos DTOs en iOS).
2. Propagar a `Course` (domain) y `CourseMapper` con fallback a 0 (cursos sin votos).
3. Crear `StarRatingView`/`StarRatingView.kt` en modo display (medias estrellas + texto `total_ratings`).
4. Insertar en `CourseCardView`/`CourseCard.kt`.
- Dependencias: ninguna. **Esta es la fase de mayor valor/menor riesgo; entregar primero.**
- Tests: unit test del Mapper verificando mapeo y fallback (`nil → 0`).

### Fase 2 — Infraestructura de datos de ratings **[Req]**
1. DTOs de rating (request/response/stats/user) — Codable / `@SerializedName`.
2. Modelos de dominio `RatingStats`, `UserRating` + `RatingMapper`.
3. Endpoints:
   - iOS: nuevos casos en `CourseAPIEndpoints` (reutilizar `NetworkManager.request(_:body:)` existente para POST).
   - Android: nuevos métodos `@POST`/`@GET` en `ApiService` (mismo Retrofit/base URL `10.0.2.2`).
4. Métodos en protocolo/interface de repo + impl remota: `submitRating`, `getUserRating`, `getRatingStats`. Actualizar mocks.
5. Constante de identidad `mockUserId = 42` (espejando Frontend).
- Dependencias: ninguna (puede ir en paralelo a Fase 1). No produce UI todavía.
- Tests: unit test del `RatingMapper` y del repo (con NetworkService/ApiService mock).

### Fase 3 — Rating interactivo en detalle **[Req]**
1. Estrellas interactivas (tap/drag iOS; tap + accesibilidad Android) en `StarRatingView`.
2. `CourseDetailViewModel`: al abrir, `getUserRating(courseId, 42)` para precargar voto (204 ⇒ sin voto). Al calificar, `submitRating` (upsert POST). Estado: `userRating`, `isSubmitting`, `submitError`; recargar stats tras éxito.
3. UI optimista + rollback en error (espejando `RateCourse` del Frontend) **[Opt pero recomendado]**.
4. Integrar en `CourseDetailView`/`CourseDetailScreen`.
- Dependencias: **Fase 0 + Fase 2**.
- Tests: unit test del ViewModel (precarga 204, éxito upsert, rollback en error) con repo mock.

### Fase 4 — Pulido **[Opt]**
- Distribución de ratings (histograma 1–5) usando `rating_distribution` de `/ratings/stats`.
- Animaciones, estados de carga finos, accesibilidad por voz en estrellas.

### Orden recomendado de entrega
1. **Fase 1 (read-only)** en ambas apps — máximo valor, cero riesgo, sin prerequisitos.
2. **Fase 2 (infra datos)** en paralelo.
3. **Fase 0 (detalle+navegación)** — empezar por iOS (repo de detalle ya listo).
4. **Fase 3 (interactivo)**.
5. **Fase 4** si hay tiempo.

---

## 3. Hallazgos no obvios (verificados en el código real)

1. **iOS ya tiene la infraestructura POST lista pero sin usar.** `Services/NetworkManager.swift` incluye un overload `request<T,U>(_:body:responseType:)` con `JSONEncoder` (estrategia `.iso8601`) y un struct privado `APIEndpointWithBody`. Para calificar (POST upsert) **no hay que tocar la capa de red**: basta añadir el caso al enum `CourseAPIEndpoints` y llamar a ese overload. Además, `getCourseBySlug` ya está implementado en el repo, pero `CourseListViewModel.selectCourse` es solo un `print` TODO sin navegación — iOS está más cerca de lo que parece.

2. **La base URL no es uniforme entre las apps móviles.** El "localhost hardcodeado" del CLAUDE.md no es literal en Android: `data/network/NetworkModule.kt` usa `http://10.0.2.2:8000/` (alias del emulador Android para el localhost del host). iOS sí usa el literal `http://localhost:8000` en `CourseAPIEndpoints.swift` (correcto en simulador, **falla en dispositivo físico**). Al añadir endpoints de rating, **reutilizar la base URL existente de cada app** — no introducir una nueva.

3. **Manejo de 204 "sin voto".** `GET /courses/{course_id}/ratings/user/{user_id}` responde **204 sin cuerpo** cuando el usuario no ha calificado. Hay que tratarlo explícitamente como "sin voto", no como error:
   - **iOS:** el `JSONDecoder` falla con cuerpo vacío → interceptar 204 antes de decodificar y devolver `nil`.
   - **Android:** `Response<T>` con 204 ⇒ `body() == null` → mapear a `null`/sin voto.

---

## 4. Consideraciones transversales

1. **`localhost` hardcodeado / base URL divergente.** No es uniforme (ver hallazgo 2). Para ratings, reutilizar la base URL existente de cada app. Centralizar la URL en config queda como deuda **[Opt]**, no como parte del feature.

2. **Ausencia de auth / FK de usuario.** Backend: `user_id` es Integer sin FK (no hay tabla users). Replicar la decisión del Frontend: **`mockUserId = 42` fijo**, en una constante de config por app, con `// TODO: real auth`. La regla "1 rating activo por usuario/curso" + upsert vía POST hace que un user fijo sea seguro para demo. Documentar que todos los dispositivos comparten user 42 (sobreescribirán el mismo rating).

3. **Contrato compartido.** `average_rating`/`total_ratings` ya viajan en `/courses` y `/courses/{slug}`; añadirlos a los DTO móviles es no-breaking (campos opcionales con fallback). No requiere cambio de backend.

4. **Testing (requerido por convención del repo).** Mínimo por plataforma: (a) Mapper de Course con los nuevos campos y fallback `null→0`; (b) RatingMapper; (c) ViewModel de detalle (precarga 204, upsert OK, rollback). Co-localizar tests según convención del proyecto (`PlatziFlixiOSTests`, `app/src/test` en Android).

5. **Manejo de 204 (sin voto).** Ver hallazgo 3: interceptar antes de decodificar en iOS; `body() == null` en Android.

---

## Archivos reales de referencia (rutas relativas)

**Android:**
- `Mobile/PlatziFlixAndroid/app/src/main/java/com/espaciotiago/platziflixandroid/data/entities/CourseDTO.kt`
- `.../data/mappers/CourseMapper.kt`
- `.../domain/models/Course.kt`
- `.../data/network/ApiService.kt`
- `.../data/network/NetworkModule.kt`
- `.../presentation/courses/components/CourseCard.kt`
- `.../di/AppModule.kt`

**iOS:**
- `Mobile/PlatziFlixiOS/PlatziFlixiOS/Data/Entities/CourseDTO.swift`
- `.../Data/Mapper/CourseMapper.swift`
- `.../Domain/Models/Course.swift`
- `.../Data/Repositories/CourseAPIEndpoints.swift`
- `.../Data/Repositories/RemoteCourseRepository.swift`
- `.../Services/NetworkManager.swift`
- `.../Presentation/ViewModels/CourseListViewModel.swift`
- `.../Presentation/Views/CourseCardView.swift`
- `.../Presentation/Views/CourseListView.swift`
