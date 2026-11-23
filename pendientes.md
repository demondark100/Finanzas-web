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
[ ] Paso 2: Shell Base, Sistema de Diseño Móvil (Tokens CSS, Claro/Oscuro, i18n) y Bottom Navigation (SIGUIENTE PASO)
[ ] Paso 3: Módulo de Inicio (Dinero Disponible + Botones de Acción Rápida)
[ ] Paso 4: Módulo de Movimientos (Registro de Ingresos/Gastos e Historial con Filtros)
[ ] Paso 5: Módulo de Préstamos y Deudas ("Me deben" / "Debo" con Abonos Parciales)
[ ] Paso 6: Módulo de Ajustes (Cambio de Idioma, Tema, Moneda y Perfil)
```

---

## 4. Detalle del Paso Actual

### ✅ Paso 1: Autenticación e Inicio de Sesión Persistente (Flujo tipo Yape) - COMPLETADO
* **Estructura implementada:**
  * Base de datos: Esquema `users` con Drizzle ORM (contraseña y PIN hasheados con bcryptjs).
  * Sesión: Cookies `HttpOnly` seguras de 30 días con JWT encriptado (`jose`).
  * Interfaz:
    * Registro con Nombre, Correo, Contraseña Maestra y creación de PIN de 6 dígitos.
    * Teclado numérico táctil en pantalla (`PinPad`) tipo Yape para acceso ultrarrápido desde celular.
    * Alternador para iniciar sesión con contraseña tradicional si el usuario lo prefiere.
  * Cumplimiento estricto: Todos los archivos de lógica tienen menos de 90 líneas (< 120 líneas) y el CSS es 100% puro sin Tailwind.

---

### 📌 Paso 2: Shell Base, Sistema de Diseño Móvil y Bottom Navigation (SIGUIENTE)
* **Meta:** Implementar el cascarón móvil de la aplicación con la barra de navegación inferior fija (4 pestañas: Inicio, Movimientos, Deudas, Ajustes) y soporte para alternar temas (Claro/Oscuro) e idiomas (ES/EN).
