---
name: user-id-mock-42
description: Decisión de identidad para ratings sin auth — user_id mock fijo = 42 en todos los clientes
metadata:
  type: project
---

El feature de ratings no tiene autenticación ni tabla `users` (el `user_id` del backend es Integer SIN FK). La decisión de producto/arquitectura es usar un **`user_id` mock fijo = 42** en todos los clientes, con un `// TODO: real auth`.

- Frontend ya lo implementó en `src/config/user.ts`.
- En móvil (Android/iOS) debe replicarse como constante de config (`mockUserId = 42`).

**Why:** No existe sistema de auth todavía; se necesita una identidad para que el upsert de ratings (1 rating activo por usuario/curso, POST hace create-or-update) funcione en demo.

**How to apply:** Al implementar ratings en cualquier cliente nuevo, reutilizar 42, no inventar otro id. Consecuencia conocida: todos los dispositivos comparten user 42 y sobreescriben el mismo rating. Relacionado con [[mobile-base-url-divergence]].
