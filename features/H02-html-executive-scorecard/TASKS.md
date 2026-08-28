# H02 — HTML Executive Scorecard — TASKS

| Campo | Valor |
| ----- | ----- |
| Feature | H02 |
| Fase | Post-H01 Fases 1–3 / Pre-implementación |
| Formato | Checklist `[ ]` pendiente / `[x]` completada |

---

## Análisis y Especificación

- [x] Leer `H01 — FINAL TECHNICAL SPECIFICATION`
- [x] Leer `H01 — Period & Program Semantic Validation v1`
- [x] Leer `H01 — Blocking Decisions Report v1`
- [x] Leer `Medidas.tmdl` (31 medidas)
- [x] Leer `spec/MODELING_PRINCIPLES.md`
- [x] Leer `spec/MISSION.md`
- [x] Definir objetivo y alcance H02
- [x] Inventariar medidas H01 consumidas (Matrículas, Ingresantes, Mercado, Market Share, Ranking, Líder/Brecha, Tendencias)
- [x] Definir Data Contract DAX → HTML (v1.0)
- [x] Proponer componentes visuales del Scorecard
- [x] Definir estados de UI (7 casos edge)
- [x] Documentar terminología obligatoria (Matrículas, Volumen de matrículas, Cuota de matrículas, Ranking por matrículas)
- [x] Documentar separación responsabilidades (DAX = negocio, HTML = presentación)
- [x] Proponer estructura feature (adaptada a convención proyecto)
- [x] Definir criterios de aceptación
- [x] Mantener dependencias bloqueadas fuera (D003, D005-UI, D006-Cross)
- [x] Crear FEATURE_SPEC.md
- [x] Crear DATA_CONTRACT.md
- [x] Crear PLAN.md
- [ ] Crear TASKS.md (este archivo)
- [ ] Crear ACCEPTANCE_CRITERIA.md

---

## Implementación — FASE A: Foundation

- [x] A1: Setup estructura carpetas `implementation/html/components`, `implementation/css`, `implementation/js`
- [x] A2: `tokens.css` — Design tokens (colores, spacing, tipografía, breakpoints, z-index)
- [x] A3: `layout.css` — Grid principal (header, grid KPIs 2x2, ranking, tendencias, banner D003)
- [x] A4: `contract/validator.js` — Validación JSON Schema v1.0 (required sections, types, special values)
- [x] A5: `contract/guards.js` — Type guards: `isBlank`, `isConditionalD003`, `isNotApplicable`, `isNumber`
- [x] A6: `utils/formatters.js` — `formatNumber(n)`, `formatPercent(n, decimals)`, `formatCompact(n)`, `formatDelta(delta)`
- [x] A7: `utils/accessibility.js` — `setAriaLive`, `manageFocus`, `trapFocus`, `announceToScreenReader`
- [x] A8: `state/store.js` — Simple store: `{ data, status: 'loading'|'ready'|'empty'|'error'|'conditional', error }`
- [x] A9: `utils/dom.js` — `createElement`, `appendChildren`, `removeChildren`, `toggleClass`
- [ ] A10: Lint config (ESLint + Stylelint) + `npm run lint` script (si aplica)

---

## Implementación — FASE B: Componentes Core

- [x] B1: `HeaderContexto` — Render: Año, Semestre (badge), Programa, Nivel Académico, Gestión, Departamento, Provincia, Region_Sur
- [x] B2: `KPICard` (genérico) — Props: `label`, `value`, `delta`, `deltaLabel`, `trend`, `unit`, `state` (normal/empty/conditional)
- [x] B3: `KPIMatriculasUCSP` — Usa `KPICard` + `UCSP.matriculas` + `UCSP.matriculas_yoy` + sparkline opcional
- [x] B4: `KPIngresantesUCSP` — Usa `KPICard` + `UCSP.ingresantes` + `UCSP.ingresantes_yoy`
- [x] B5: `MarketShare` — Donut SVG/Canvas + `%` grande + label "Cuota de matrículas" / "Cuota de ingresantes"
- [x] B6: `RankingTable` — Tabla: Posición, Universidad, Matrículas, Brecha vs líder; fila UCSP highlighted + badge
- [x] B7: `Top3PlusUCSP` — Lista 3-4 items; Top 3 ordenados + UCSP forzada; badge "UCSP" en su fila
- [x] B8: `TrendChartMatriculas` — Línea dual S1 (azul) / S2 (naranja) por año; tooltip con valores; responsive
- [x] B9: `TrendChartIngresantes` — Línea simple (verde) por año; tooltip; responsive
- [x] B10: `D003Banner` — Banner fijo top/bottom: "⚠ Medidas anuales de matrículas pendientes validación D003"; link a decisión
- [ ] B11: `EmptyState` — "Sin datos en contexto actual" + icono + acción "Limpiar filtros"
- [ ] B12: `ErrorState` — "Error cargando datos" + botón "Reintentar"
- [x] B13: `LoadingState` — Skeleton loaders para cada componente

---

## Implementación — FASE C: Integración y Estados

- [x] C1: `main.js` — Bootstrap: recibe JSON (postMessage / prop / fetch), valida con `validator.js`, setea store, monta componentes
- [x] C2: Estado `loading` → muestra `LoadingState` en cada slot
- [x] C3: Estado `ready` → renderiza componentes con datos
- [x] C4: Estado `empty` (UCSP sin datos) → muestra `EmptyState` en KPIs UCSP, Ranking, Top3
- [x] C5: Estado `conditional` (D003) → `D003Banner` visible + campos `CONDITIONAL — D003` con tooltip explicativo
- [x] C6: Estado `error` → muestra `ErrorState` global + log consola
- [ ] C7: Navegación teclado: Tab order lógico, Enter/Space en botones, Escape cierra modales
- [x] C7b: ARIA: `role="region" aria-live="polite"` en KPIs; `role="table"` en ranking; `aria-label` en charts
- [x] C8: Responsive breakpoints: mobile (<640px) stack 1-col; tablet (640-1024px) 2-col; desktop (>1024px) 4-col KPIs
- [x] C9: Print stylesheet: oculta banner D003, skeleton, botones; muestra solo datos

---

## Implementación — FASE D: QA y Documentación

- [x] D1: Test Matrix — Ejecutar 7 mocks contra contrato:
  - [x] `mock-full.json` (contexto completo)
  - [x] `mock-semestre1.json` (Año + S1)
  - [x] `mock-semestre2.json` (Año + S2)
  - [x] `mock-ucsp-empty.json` (UCSP sin datos)
  - [x] `mock-mercado-empty.json` (Mercado vacío)
  - [x] `mock-tie-ranking.json` (Empate posición 2)
  - [x] `mock-d003-conditional.json` (Campos `CONDITIONAL — D003`)
- [ ] D2: Verificación terminología — Grep en `implementation/`:
  - [ ] 0 ocurrencias "estudiante" / "estudiantes"
  - [ ] 0 ocurrencias "matriculado" / "matriculados"
  - [ ] 100% "Matrículas" / "Volumen de matrículas" / "Cuota de matrículas" / "Ranking por matrículas"
- [ ] D3: Verificación D003 — Banner visible + campos anuales matrículas = `CONDITIONAL — D003`
- [ ] D4: Verificación D005-UI — Slicers nivel académico usan solo: MAESTRIA, CARRERA PROFESIONAL, SEGUNDA ESPECIALIDAD, DOCTORADO
- [ ] D5: Verificación D006-Cross — No campo `tasa_conversion` / `conversion_rate` en contrato ni UI
- [ ] D6: Performance — Lighthouse Performance ≥ 90; render < 200ms (mock full)
- [ ] D7: Accesibilidad — Lighthouse Accessibility ≥ 95; axe-core 0 violations
- [ ] D8: Cross-browser — Chrome, Firefox, Edge (últimas 2 versiones)
- [ ] D9: `README.md` en `implementation/` con: instalación, uso, contrato, componentes, extensibilidad
- [ ] D10: Checklist ACCEPTANCE_CRITERIA.md 100% completado
- [ ] D11: Usuario aprueba GATE 4 — Feature Complete

---

## Validación Técnica Continua (por PR/Commit)

- [ ] `npm run lint` pasa (0 errors, 0 warnings críticos)
- [ ] `validator.js` valida 7/7 mocks sin errores
- [ ] Grep `DIVIDE|RANKX|CALCULATE|SUM|TOPN|FILTER|ALLSELECTED` en `implementation/js/` = 0 resultados
- [ ] Grep `estudiante|matriculado` en `implementation/` = 0 resultados
- [ ] TypeScript types (referencia) actualizados si cambia contrato

---

## Notas de Implementación

> **Regla de Oro**: Si dudas si algo va en DAX o HTML → **DAX**. HTML solo presenta.
>
> **Terminología**: Nunca "Estudiantes matriculados", "Alumnos", "Student Count". Siempre "Matrículas", "Volumen de matrículas", "Cuota de matrículas".
>
> **Valores especiales**: `null` = sin dato; `BLANK` = UCSP sin datos; `"N/D — Escala anual"` = semestre en Ingresantes; `"CONDITIONAL — D003"` = medidas anuales matrículas.
>
> **Estados**: Loading → Ready / Empty / Error / Conditional. Cada componente maneja su estado local + store global.
>
> **Accesibilidad**: No es opcional. ARIA live regions en KPIs; tabla semántica en ranking; focus visible siempre.

---

## Handoff Checklist (Pre-GATE 4)

- [ ] FEATURE_SPEC.md aprobado
- [ ] DATA_CONTRACT.md aprobado
- [ ] PLAN.md aprobado
- [ ] ACCEPTANCE_CRITERIA.md aprobado
- [ ] TASKS.md actualizado con progreso real
- [ ] `implementation/` completa y funcional
- [ ] 7 mocks validados
- [ ] 0 lógica DAX en JS
- [ ] 0 terminología prohibida
- [ ] D003 / D005-UI / D006-Cross respetados
- [ ] Lighthouse ≥ 90/95/90
- [ ] Cross-browser OK
- [ ] README.md escrito
- [ ] Usuario firma GATE 4