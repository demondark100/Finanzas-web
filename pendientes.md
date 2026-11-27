# Bitácora y Hoja de Ruta: Finanzas-web

Este archivo es la **fuente única de la verdad del proyecto**. Cualquier desarrollador o modelo de IA que continúe este proyecto en un nuevo chat debe leer este documento para entender la filosofía, las reglas obligatorias de código y el estado actual del desarrollo.

---

## 1. Visión y Filosofía del Producto

* **Objetivo:** Aplicación web de control financiero personal y gestión de préstamos/deudas.
* **Privacidad individual:** Cada usuario tiene su propia cuenta con datos 100% aislados y seguros en Supabase (PostgreSQL). No hay intervención ni administración de datos ajenos.
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
  * `services/`: Consultas a base de datos, llamadas de red.
  * `helpers/`: Validaciones, cálculos matemáticos, formateo de fechas y monedas.
  * `components/`: Subcomponentes visuales.
  * `handlers/`: Server Actions, manejadores de eventos, forms y submits.

### B. Sistema de Diseño Propio y Cero Estilos en Línea (`frontend-design-system-and-dry`)
* **Prohibición absoluta:** **NO se utiliza Tailwind CSS** ni estilos en línea (`style={{ ... }}` está prohibido).
* **CSS Puro:** Todos los estilos residen exclusivamente en archivos `.css` o *CSS Modules* (`.module.css`).
* **Design Tokens (`:root`):** Colores, tipografías, sombras y radios centralizados en variables CSS globales (`src/app/globals.css`).
* **Temas Claro y Oscuro:** Soporte nativo gobernado por variables CSS mediante `[data-theme="light"]` y `[data-theme="dark"]`, con contraste perfecto (texto claro sobre fondos oscuros).
* **Componentes UI atómicos:** Botones, inputs, tarjetas, modales y toasts aislados y reutilizables en `src/components/ui/`.

### C. Soporte Multi-idioma (i18n)
* Arquitectura preparada desde el inicio para **Español (por defecto)** e **Inglés**.
* Textos centralizados en diccionarios (`src/i18n/dictionaries/es.json`, `en.json`) desacoplados de la lógica visual.

### D. Stack Tecnológico y Entorno
* **Framework:** Next.js 16 (App Router, enfoque monolítico con Server Actions y API integradas).
* **Lenguaje:** TypeScript estricto.
* **Base de Datos y ORM:** PostgreSQL en **Supabase** (Proyecto ID: `kgfgowvzjkavpqwfwzys`, región `us-west-2`) + **Drizzle ORM**.
* **Autenticación:** Sesión segura persistente (30 días) en cookies `HttpOnly` y encriptación ligera con `jose` (sin librerías externas pesadas).
* **Estilos:** CSS Puro / CSS Modules con Design Tokens centralizados.

---

## 3. Hoja de Ruta y Estado de los Pendientes

```text
[x] Paso 1: Autenticación e Inicio de Sesión Persistente con PIN tipo Yape (COMPLETADO)
[x] Paso 2: Shell Base, Sistema de Diseño Móvil, Bottom Navigation, Claro/Oscuro e i18n (COMPLETADO)
[x] Paso 3: Módulo de Inicio (Dinero Disponible Real + Botones de Acción Rápida) (COMPLETADO)
[x] Paso 4: Módulo de Movimientos (Registro de Ingresos/Gastos e Historial con Filtros) (COMPLETADO)
[x] Paso 5: Módulo de Préstamos y Deudas ("Me deben" / "Debo" con Abonos Parciales) (COMPLETADO)
[x] Paso 6: Módulo de Ajustes (Cambio de Idioma, Tema, Moneda y Perfil) (COMPLETADO)
```

---

## 4. Detalle de los Pasos Completados

### ✅ Paso 1: Autenticación con PIN tipo Yape y Supabase (COMPLETADO)
* **Base de datos:** Tabla `users` creada en Supabase con campos `id`, `name`, `email`, `password_hash`, `pin_hash`, `preferred_currency`, `preferred_language`, `preferred_theme`.
* **Registro guiado en 2 pasos:**
  1. Paso 1: Nombre, correo y contraseña maestra.
  2. Paso 2: Pantalla táctil de PIN de 6 dígitos con teclado numérico `PinPad` y confirmación para evitar errores de tipeo.
* **Login estándar y limpio:** Correo + Contraseña maestra con botón de ver contraseña (ojito 👁️/🙈), botón de borrado rápido (✕) y avisos de error directos debajo de los campos.
* **Blindaje de Bloqueo por Inactividad (`SecurityLock`):**
  * Cuando el usuario deja la app inactiva (2 minutos) o sale de la app y regresa, la aplicación se bloquea automáticamente a nivel de servidor y cliente.
  * Muestra la pantalla de PIN de 6 dígitos con el nombre del usuario.
  * **Inmune a recargas (F5):** Protegido con cookie `finanzas_locked` en el servidor; si se recarga, el servidor no entrega los datos del dashboard hasta validar el PIN.
  * Al iniciar sesión con contraseña o registrarse, se limpia cualquier residuo previo para entrar directo al inicio.

### ✅ Paso 2: Shell Base, Navegación Móvil (BottomNav), Temas e i18n (COMPLETADO)
* **Barra de Navegación Inferior Fija (`BottomNav`):** Siempre accesible al pulgar con 4 pestañas:
  1. 🏠 **Inicio** (`/`)
  2. 📄 **Movimientos** (`/movimientos`)
  3. 🤝 **Préstamos** (`/deudas`)
  4. ⚙️ **Ajustes** (`/ajustes`)
* **Modo Claro y Modo Oscuro:** `ThemeProvider` con persistencia en `localStorage`, sin parpadeos y con alto contraste (`#f8fafc` en oscuro).
* **Arquitectura i18n:** Diccionarios tipados `es.json` y `en.json`.
* **Cero estilos en línea:** Se migraron todos los estilos a archivos CSS Modules dedicados (`dashboard.module.css`, `settings.module.css`, `movimientos.module.css`, `deudas.module.css`).

### ✅ Paso 3: Módulo de Inicio (Dinero Disponible Real + Acciones Rápidas) (COMPLETADO)
* **Base de datos:** Tabla `transactions` creada y sincronizada en Supabase con índice compuesto `(user_id, occurred_at DESC)` y validaciones `CHECK`.
* **Módulo `src/modules/transactions/`:** Servicio de saldo real y resumen mensual (`availableBalance`, `monthlyIncome`, `monthlyExpense`), últimos 5 movimientos y Server Actions (`addIncomeAction`, `addExpenseAction`).
* **UI Móvil:** Tarjeta de saldo real con resumen mensual sutil, *Bottom Sheet* rápido (`Modal` + `Toast`) con teclado numérico directo, chips de 1 toque y concepto opcional por defecto.

### ✅ Paso 4: Módulo de Movimientos + Calendario Reutilizable (COMPLETADO)
* **Componente Universal `Calendar` & `DatePicker` (`src/components/ui/calendar/`):** Arquitectura modular SOLID (< 120 líneas), modos `single` / `range` / `multiple`, presets, marcadores, selector de mes/año y `README.md`.
* **Historial `/movimientos`:** Filtros por tipo (`Todos`, `Ingresos`, `Gastos`), períodos rápidos + rango personalizado con calendario, búsqueda instantánea por texto, acciones rápidas `+ Recibí` / `- Gasté` y edición/eliminación con confirmación.

### ✅ Paso 5: Módulo de Préstamos y Deudas Centrado en Personas (COMPLETADO)
* **Base de datos (`src/lib/db/schema/debts.ts`):** Tablas `debt_contacts` y `debt_entries` con enlace opcional a `transactions`.
* **Interfaz:** Resumen global + lista por persona (`/deudas`) y contexto exclusivo por persona (`/deudas/[id]`) con 4 acciones (`Le presté`, `Me abonó`, `Me prestó`, `Le aboné`).

### ✅ Paso 6: Módulo de Ajustes, i18n Global y Modernización UI/UX (COMPLETADO)
* **Preferencias reales en Supabase:** Nombre de perfil, idioma (`es`/`en` global en toda la app), moneda (`PEN`/`USD`/`EUR`), tema (`light`/`dark`), cambio de PIN con `PinPad` y bloqueo inmediato.
* **Modernización Fintech (Fases 1–3):** Iconografía SVG `lucide-react`, `BottomNav` Material 3, portada Wallet con privacidad (`S/. ••••`), movimientos agrupados por fecha y pulido de `Calendar`, `/deudas` y `/ajustes`.

---

## 5. Próximo Paso Inmediato

### 📌 Paso 5: Módulo de Préstamos y Deudas ("Me deben" / "Debo" con Abonos Parciales)

**Objetivo:** Darle vida a `/deudas` para llevar el control claro de quién te debe o a quién le debes, cuánto falta por pagar/cobrar, fechas opcionales (usando nuestro `DatePicker`) y registro de abonos parciales hasta quedar saldado.

**Tareas a diseñar y validar en el Paso 5:**
1. **Esquema de Base de Datos (`debts` y `debt_payments`):**
   * Tabla `debts`: `id`, `userId`, `direction` (`RECEIVABLE` = me deben / `PAYABLE` = debo), `personName`, `totalAmount`, `paidAmount` (o calculado + abonos), `note`, `dueDate` (opcional), `status` (`PENDING` / `PAID`), `createdAt`.
   * Tabla `debt_payments`: historial de abonos parciales (`id`, `debtId`, `userId`, `amount`, `note`, `paidAt`).
2. **Módulo `src/modules/debts/` (< 120 líneas por archivo):**
   * Servicios para listar, crear, editar/eliminar deuda y registrar abonos parciales (actualizando el estado a `PAID` automáticamente al completar el total).
   * Server Actions seguras verificando sesión y propietario.
3. **Interfaz Mobile-First en `/deudas`:**
   * Resumen superior (*Total por cobrar* / *Total por pagar*), pestañas `Me deben` / `Debo` y filtro opcional de pendientes/saldados.
   * Tarjetas con barra de progreso visual, monto restante destacado, fecha límite opcional y botones de 1 toque para **Registrar abono** o **Marcar saldado**.

---

## 6. Comandos Clave del Proyecto

* **Iniciar servidor de desarrollo (Accesible en PC y móvil en la misma red Wi-Fi):**
  ```bash
  npm run dev
  ```
  * PC: `http://localhost:3000`
  * Móvil: `http://192.168.1.3:3000` (o la IP local del equipo)
* **Verificar compilación y TypeScript (Cero errores):**
  ```bash
  npx tsc --noEmit && npm run build
  ```
* **Sincronizar tablas con Supabase:**
  ```bash
  npx drizzle-kit push --force
  ```
