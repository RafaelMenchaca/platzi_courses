---
name: mobile-base-url-divergence
description: Base URL del backend difiere entre Android (10.0.2.2) e iOS (localhost) — no es uniforme
metadata:
  type: project
---

El "localhost:8000 hardcodeado" no es uniforme entre las apps móviles:

- **Android** usa `http://10.0.2.2:8000/` (alias del emulador Android para el localhost del host) en `data/network/NetworkModule.kt`. Correcto en emulador.
- **iOS** usa `http://localhost:8000` (literal) en `Data/Repositories/CourseAPIEndpoints.swift`. Correcto en simulador, FALLA en dispositivo físico.

**Why:** Cada plataforma resuelve el host del host-dev de forma distinta; nadie centralizó la URL.

**How to apply:** Al añadir endpoints (p.ej. ratings) reutilizar la base URL existente de cada app, NO introducir otra. Centralizar la URL es deuda técnica opcional, no parte de features. Relacionado con [[user-id-mock-42]].
