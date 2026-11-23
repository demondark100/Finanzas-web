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
* **Framework:** Next.js (App Router, enfoque monolítico con Server Actions y API integradas).
* **Lenguaje:** TypeScript estricto.
* **Base de Datos y ORM:** PostgreSQL + **Drizzle ORM** (ultrarrápido, modular y ligero).
* **Autenticación:** Sesión propia segura con cookies HttpOnly y encriptación ligera (sin librerías pesadas externas).
* **Estilos:** CSS Puro / CSS Modules con Design Tokens centralizados (cero Tailwind).

---

## 3. Hoja de Ruta y Estado de los Pendientes

```text
[x] Paso 1: Autenticación e Inicio de Sesión Persistente con PIN tipo Yape (COMPLETADO)
[x] Paso 2: Shell Base, Sistema de Diseño Móvil, Bottom Navigation, Claro/Oscuro e i18n (COMPLETADO)
[ ] Paso 3: Módulo de Inicio (Dinero Disponible + Botones de Acción Rápida) (SIGUIENTE PASO)
[ ] Paso 4: Módulo de Movimientos (Registro de Ingresos/Gastos e Historial con Filtros)
[ ] Paso 5: Módulo de Préstamos y Deudas ("Me deben" / "Debo" con Abonos Parciales)
[ ] Paso 6: Módulo de Ajustes (Cambio de Idioma, Tema, Moneda y Perfil)
```

---

## 4. Detalle de los Pasos Implementados

### ✅ Paso 1: Autenticación con PIN tipo Yape y Supabase (COMPLETADO)
* Base de datos PostgreSQL en Supabase con Drizzle ORM.
* Flujo de registro guiado: credenciales y creación de PIN de 6 dígitos con teclado táctil `PinPad`.
* Login estándar con Correo y Contraseña maestra.
* Sesión persistente de 30 días con cookies `HttpOnly` y encriptación ligera `jose`.
* **Bloqueo por Inactividad tipo Yape (`SecurityLock`):** Cuando el usuario deja la app inactiva o sale y regresa, la app se bloquea automáticamente por seguridad mostrando la pantalla de PIN con su nombre para desbloqueo instantáneo con teclado numérico.
* Componentes de input con ojito para contraseñas, botón `✕` para borrado rápido y mensajes de error directos.

### ✅ Paso 2: Shell Base, Navegación Móvil (BottomNav), Temas e i18n (COMPLETADO)
* **Bottom Navigation Bar fija:** 4 pestañas accesibles con el pulgar:
  1. 🏠 **Inicio** (`/`)
  2. 📄 **Movimientos** (`/movimientos`)
  3. 🤝 **Préstamos** (`/deudas`)
  4. ⚙️ **Ajustes** (`/ajustes`)
* **Gestor de Temas (Claro / Oscuro):** Implementado con `ThemeProvider`, variables CSS semánticas y persistencia en `localStorage`.
* **Soporte Multi-idioma (i18n):** Diccionarios `es.json` y `en.json` listos para internacionalización.
* **Layout Móvil:** Safe-area inferior para evitar que la barra tape contenidos en teléfonos Android/iOS.
* **Cumplimiento estricto:** Todos los archivos respetan el límite de 120 líneas de código y cero Tailwind.

---

### 📌 Paso 3: Módulo de Inicio (SIGUIENTE PASO)
* **Meta:** Implementar el cálculo real del dinero disponible, tarjetas de saldo y los formularios de acción rápida (+ Recibí Dinero / - Hice un Gasto).
