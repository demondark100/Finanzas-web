# Bitácora y Hoja de Ruta: Finanzas-web

Este archivo es la **fuente de la verdad del proyecto**. Cualquier desarrollador o modelo de IA que continúe este proyecto en un nuevo chat debe leer este documento para entender la filosofía, las reglas obligatorias de código y el estado actual del desarrollo.

---

## 1. Visión y Filosofía del Producto

* **Objetivo:** Aplicación web de control financiero personal y gestión de préstamos/deudas.
* **Privacidad individual:** Cada usuario tiene su propia cuenta con datos 100% aislados y seguros. No hay intervención ni administración de datos ajenos.
* **Público objetivo y UX:** **Mobile-First** y diseñado con extrema simplicidad para **personas no tecnológicas (como nuestros padres)**:
  * Botones grandes y cómodos (zonas táctiles de mínimo 48px).
  * Lenguaje cotidiano y cercano (ej. *"Dinero disponible"*, *"Recibí dinero"*, *"Hice un gasto"*, *"Me deben"*, *"Debo"*).
  * Cero jerga financiera confusa.
  * Flujos de 1 o 2 toques como máximo para las acciones más frecuentes.
* **Metodología de trabajo:** **Paso a paso estricto**. No se programa nada sin antes haberlo diseñado, validado y acordado con el usuario. Las fases se profundizan conforme se vayan abordando.

---

## 2. Reglas Técnicas y Arquitectónicas Obligatorias

### A. Regla de Límite de 120 Líneas y Modularidad SOLID (`modular-orchestrator-solid`)
* **Límite estricto:** Ningún archivo de código de lógica debe superar las **120 líneas de código**.
* Si un archivo crece, se divide aplicando Responsabilidad Única (SRP).
* **Estructura por feature:** Todo módulo o componente vive en su propia carpeta con un orquestador ligero (`index.ts`) y subcarpetas especializadas:
  * `services/`: Consultas a base de datos, server actions, llamadas de red.
  * `helpers/`: Validaciones, cálculos matemáticos, formateo de fechas y monedas.
  * `components/`: Subcomponentes visuales.
  * `handlers/`: Manejadores de eventos, forms y submits.

### B. Sistema de Diseño Propio y Cero Duplicidad (`frontend-design-system-and-dry`)
* **Prohibición:** **NO se utiliza Tailwind CSS** ni estilos inyectados dentro de JavaScript/TypeScript.
* **CSS Puro:** Todos los estilos residen en archivos `.css` o *CSS Modules*.
* **Design Tokens (`:root`):** Colores, tipografías, sombras y radios centralizados en variables CSS globales.
* **Temas Claro y Oscuro:** Soporte nativo gobernado por variables CSS mediante `[data-theme="light"]` y `[data-theme="dark"]`.
* **Componentes UI atómicos:** Botones, inputs, tarjetas, modales y toasts aislados y reutilizables en `src/components/ui/`.

### C. Soporte Multi-idioma (i18n)
* Arquitectura preparada desde el inicio para **Español (por defecto)** e **Inglés**.
* Textos centralizados en diccionarios (`es.json`, `en.json`) desacoplados de la lógica visual.

### D. Stack Tecnológico
* **Framework:** Next.js (App Router, enfoque monolítico con API / Server Actions integradas).
* **Lenguaje:** TypeScript estricto.
* **Base de Datos:** PostgreSQL.
* **Estilos:** CSS Puro / CSS Modules con Design Tokens.

---

## 3. Hoja de Ruta y Estado de los Pendientes

```text
[ ] Paso 1: Autenticación e Inicio de Sesión Persistente (EN CURSO)
[ ] Paso 2: Shell Base, Sistema de Diseño Móvil (Tokens CSS, Claro/Oscuro, i18n) y Bottom Navigation
[ ] Paso 3: Módulo de Inicio (Dinero Disponible + Botones de Acción Rápida)
[ ] Paso 4: Módulo de Movimientos (Registro de Ingresos/Gastos e Historial con Filtros)
[ ] Paso 5: Módulo de Préstamos y Deudas ("Me deben" / "Debo" con Abonos Parciales)
[ ] Paso 6: Módulo de Ajustes (Cambio de Idioma, Tema, Moneda y Perfil)
```

---

## 4. Detalle del Paso Actual

### 📌 Paso 1: Autenticación e Inicio de Sesión Persistente
* **Meta:** Implementar un sistema de registro e inicio de sesión seguro, simple y persistente (para que el usuario no tenga que iniciar sesión cada vez que entra desde su celular).
* **Requisitos:**
  1. Formulario ultra simple (correo y contraseña) con textos claros y botón grande.
  2. Manejo de sesión persistente segura en cookies HttpOnly.
  3. Aislamiento total de usuario (`user_id` vinculado a todas sus operaciones).
  4. Rutas protegidas (si no está logueado, redirige a login; si ya lo está, va directo al Inicio).
  5. Base extensible para futuras opciones de acceso (OAuth Google, links mágicos, etc.).
