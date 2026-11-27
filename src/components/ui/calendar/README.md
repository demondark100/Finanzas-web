# Calendar & DatePicker (`@/components/ui/calendar`)

Componente de calendario reutilizable, **Mobile-First**, sin dependencias externas y adaptado automáticamente a **Modo Claro / Modo Oscuro** mediante los tokens de `src/app/globals.css`.

Soporta selección de **una sola fecha**, **rangos** (con atajos rápidos) y **múltiples fechas**, además de un selector desplegable `DatePicker` integrado con el `Modal` (*Bottom Sheet*).

---

## Importación

```tsx
import { Calendar, DatePicker, type DateRange } from "@/components/ui/calendar";
```

---

## Ejemplos de Uso

### 1. Una sola fecha (`mode="single"`)
Ideal para elegir la fecha de un gasto, ingreso o vencimiento de préstamo:

```tsx
const [date, setDate] = useState<Date | null>(new Date());

<Calendar
  mode="single"
  value={date}
  onChange={setDate}
  maxDate={new Date()}
  allowClear
/>
```

### 2. Rango de fechas (`mode="range"`)
Ideal para filtrar historiales, reportes o resúmenes por período:

```tsx
const [range, setRange] = useState<DateRange>({ from: null, to: null });

<Calendar
  mode="range"
  rangeValue={range}
  onRangeChange={setRange}
  showPresets
  allowClear
/>
```

> Si el usuario toca primero el día final y luego el inicial, el rango se ordena automáticamente.

### 3. Múltiples fechas (`mode="multiple"`)

```tsx
const [dates, setDates] = useState<Date[]>([]);

<Calendar
  mode="multiple"
  multipleValue={dates}
  onMultipleChange={setDates}
  allowClear
/>
```

### 4. Campo táctil con Bottom Sheet (`<DatePicker />`)
Abre el calendario en un modal móvil al tocar el botón y se cierra automáticamente al completar la fecha o el rango:

```tsx
<DatePicker
  label="Filtrar por fechas"
  placeholder="Elegir rango de fechas"
  mode="range"
  rangeValue={range}
  onRangeChange={setRange}
  maxDate={new Date()}
  allowClear
/>
```

### 5. Días marcados con indicadores (`markedDates`)
Útil para señalar días con pagos, préstamos o movimientos:

```tsx
<Calendar
  mode="single"
  value={date}
  onChange={setDate}
  markedDates={[
    { date: new Date(2026, 10, 15), tone: "income" },
    { date: new Date(2026, 10, 20), tone: "expense" },
    { date: new Date(2026, 10, 28), tone: "warning" },
  ]}
/>
```

---

## Referencia de Props (`CalendarProps`)

| Prop | Tipo | Por defecto | Descripción |
| :--- | :--- | :--- | :--- |
| `mode` | `"single" \| "range" \| "multiple"` | `"single"` | Modo de selección. |
| `value` | `Date \| null` | `undefined` | Fecha seleccionada (modo `"single"` controlado). |
| `onChange` | `(date: Date \| null) => void` | `undefined` | Callback al cambiar en modo `"single"`. |
| `rangeValue` | `{ from: Date \| null; to: Date \| null }` | `undefined` | Rango seleccionado (modo `"range"` controlado). |
| `onRangeChange` | `(range: DateRange) => void` | `undefined` | Callback al cambiar en modo `"range"`. |
| `multipleValue` | `Date[]` | `undefined` | Fechas seleccionadas (modo `"multiple"` controlado). |
| `onMultipleChange` | `(dates: Date[]) => void` | `undefined` | Callback al cambiar en modo `"multiple"`. |
| `minDate` | `Date` | `undefined` | Fecha mínima permitida (inclusive). |
| `maxDate` | `Date` | `undefined` | Fecha máxima permitida (inclusive). |
| `disabledDates` | `Date[]` | `undefined` | Lista puntual de fechas deshabilitadas. |
| `isDateDisabled` | `(date: Date) => boolean` | `undefined` | Regla personalizada para deshabilitar días (ej. fines de semana). |
| `markedDates` | `{ date: Date; tone?: "primary" \| "income" \| "expense" \| "warning" }[]` | `undefined` | Muestra un punto de color debajo de los días indicados. |
| `weekStartsOn` | `0 \| 1` | `1` | Primer día de la semana (`1` = Lunes, `0` = Domingo). |
| `locale` | `"es" \| "en"` | `"es"` | Idioma para meses, días y botones. |
| `showPresets` | `boolean` | `true` en `"range"` | Muestra atajos (*Hoy*, *7 días*, *Este mes*, *Mes pasado*). |
| `presets` | `CalendarPreset[]` | Presets por defecto | Lista personalizada de chips rápidos. |
| `showTodayButton` | `boolean` | `true` | Muestra botón **Hoy** en el pie del calendario. |
| `allowClear` | `boolean` | `false` | Muestra botón **Limpiar** cuando hay selección. |
| `defaultMonth` | `Date` | Hoy / fecha activa | Mes inicial visible cuando no hay valor previo. |
| `className` | `string` | `""` | Clase CSS adicional para el contenedor raíz. |

`DatePicker` acepta todas las props de `CalendarProps` más `label?: string` y `placeholder?: string`.

---

## Arquitectura Interna (`modular-orchestrator-solid`)

- `index.tsx` — Orquestador público (`Calendar` y `DatePicker`).
- `types/` — Tipos TypeScript (`CalendarProps`, `DateRange`, `CalendarPreset`, etc.).
- `helpers/` — Lógica pura de fechas (`date-utils.ts`), matriz mensual (`grid-builder.ts`) y estado visual de celdas (`cell-state.ts`).
- `handlers/` — Hook `useCalendarSelection` para selección controlada o interna.
- `components/` — Subcomponentes (`CalendarHeader`, `CalendarMonthYear`, `CalendarPresets`, `CalendarGrid`, `DatePickerField`).
- `styles/` — CSS Modules puros con Design Tokens.
