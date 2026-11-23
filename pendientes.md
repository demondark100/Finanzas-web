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
[ ] Paso 3: Módulo de Inicio (Dinero Disponible Real + Botones de Acción Rápida) (SIGUIENTE PASO)
[ ] Paso 4: Módulo de Movimientos (Registro de Ingresos/Gastos e Historial con Filtros)
[ ] Paso 5: Módulo de Préstamos y Deudas ("Me deben" / "Debo" con Abonos Parciales)
[ ] Paso 6: Módulo de Ajustes (Cambio de Idioma, Tema, Moneda y Perfil)
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

---

## 5. Próximo Paso Inmediato para el Nuevo Chat

### 📌 Paso 3: Módulo de Inicio (Dinero Disponible Real + Acciones Rápidas)

**Objetivo:** Hacer que la pantalla principal muestre el saldo real del usuario y permita registrar ingresos y gastos con 1 solo toque.

**Tareas a ejecutar en el Paso 3:**
1. **Esquema de Base de Datos para Transacciones:**
   * Crear la tabla `transactions` en `src/lib/db/schema/transactions.ts`:
     * `id`: uuid primary key
     * `userId`: uuid (foreign key a `users.id`)
     * `type`: enum o text (`INCOME` / `EXPENSE`)
     * `amount`: numeric / decimal no nulo
     * `concept`: text no nulo (lenguaje cotidiano: *"Sueldo"*, *"Almuerzo"*, *"Luz"*)
     * `category`: text (opcional o icono sugerido)
     * `date`: date / timestamp (por defecto hoy)
     * `createdAt`: timestamp
   * Correr `npx drizzle-kit push --force` para sincronizar la tabla con Supabase.
2. **Servicio y Server Actions de Transacciones (`src/modules/transactions/`):**
   * Estructura modular (< 120 líneas por archivo):
     * `services/transaction-service.ts`: Consultas de saldo actual (`sum(incomes) - sum(expenses)`) y últimos 5 movimientos del usuario.
     * `handlers/transaction-actions.ts`: Server actions `addIncomeAction` y `addExpenseAction`.
3. **Modales / Bottom Sheets Rápidos (Mobile First):**
   * Modal `+ Recibí Dinero`: Monto grande + ¿De qué fue? + Botón "Guardar Ingreso".
   * Modal `- Hice un Gasto`: Monto grande + ¿En qué gastaste? + Botón "Guardar Gasto".
4. **Tarjeta de Saldo Dinámica:**
   * Mostrar el dinero disponible real calculado desde la base de datos con formato de moneda (`S/. 1,250.00`).
5. **Lista de Últimos Movimientos:**
   * Renderizar en la tarjeta de inicio los últimos 3 a 5 movimientos con su monto en verde/rojo y fecha.

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
