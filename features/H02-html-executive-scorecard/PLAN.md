# H02 — HTML Executive Scorecard — PLAN

| Campo | Valor |
| ----- | ----- |
| Feature | H02 |
| Fase | Post-H01 Fases 1–3 / Pre-implementación |
| Modo | Plan de implementación |
| Estado | **Especificación — NO ejecutar hasta aprobación explícita** |

---

## 1. Declaración

**Este PLAN NO se ejecuta todavía.** La implementación (HTML/CSS/JS) solo procede tras la aprobación explícita del usuario. No se modifica el modelo semántico, TMDL, PBIR, PBIP, `dashboard/` ni Parquet.

---

## 2. Arquitectura de Implementación

### 2.1 Stack Tecnológico

| Capa | Tecnología | Justificación |
|------|------------|---------------|
| Estructura | HTML5 semántico | Accesibilidad, SEO, estándar |
| Estilos | CSS3 (Custom Properties, Grid, Flexbox) | Sin dependencias, performance, theming |
| Lógica | Vanilla ES6+ (Modules) | Sin build step, ligero, portable |
| Datos | JSON Contract (DataContract v1.0) | Tipado explícito, versionado |

### 2.2 Estructura de Archivos

```
features/
└── H02-html-executive-scorecard/
├── FEATURE_SPEC.md
├── DATA_CONTRACT.md
├── PLAN.md
├── TASKS.md
├── ACCEPTANCE_CRITERIA.md
└── implementation/
    ├── html/
    │   ├── index.html          # Entry point
    │   ├── components/
    │   │   ├── header-contexto.html
    │   │   ├── kpi-card.html
    │   │   ├── market-share.html
    │   │   ├── ranking-table.html
    │   │   ├── top3-plus-ucsp.html
    │   │   ├── trend-chart.html
    │   │   └── d003-banner.html
    │   └── partials/
    │       ├── loading.html
    │       ├── empty-state.html
    │       └── error-state.html
    ├── css/
    │   ├── tokens.css          # Design tokens (colors, spacing, typography)
    │   ├── layout.css          # Grid/Flex layouts
    │   ├── components.css      # Component styles
    │   ├── states.css          # Empty, loading, error, conditional
    │   └── themes.css          # Light/Dark mode (future)
    └── js/
        ├── main.js             # Bootstrap
        ├── contract/
        │   ├── validator.js    # JSON Schema validation
        │   ├── types.ts        # TypeScript types (reference)
        │   └── guards.js       # Type guards
        ├── components/
        │   ├── HeaderContexto.js
        │   ├── KPICard.js
        │   ├── MarketShare.js
        │   ├── RankingTable.js
        │   ├── Top3PlusUCSP.js
        │   ├── TrendChart.js
        │   └── D003Banner.js
        ├── utils/
        │   ├── formatters.js   # Number, percentage formatting
        │   ├── accessibility.js # ARIA, keyboard nav
        │   └── dom.js          # DOM helpers
        └── state/
            └── store.js        # Simple state management
```

---

## 3. Separación Conceptual (Mandatoria)

```
DAX (H01)                          HTML (H02)
─────────────────────────────────────────────────────
Cálculo totales          →          Render valor
Market Share             →          Render % + indicador
Ranking / Posición       →          Render tabla/posición
Líder / Brecha           →          Render nombre + valor
YoY / Variaciones        →          Render % + flecha
Granularidad temporal    →          Render etiqueta escala
Filtrado / Contexto      →          Recibe ya filtrado
─────────────────────────────────────────────────────
Renderizado / Layout                      ←  HTML
Formato números / %                       ←  HTML
Tooltips / Ayuda                          ←  HTML
Estados vacíos / edge cases               ←  HTML
Terminología UI ("Matrículas")            ←  HTML
```

**Regla de Oro:** Si el código JS contiene `DIVIDE`, `RANKX`, `CALCULATE`, `SUM`, `TOPN`, `FILTER`, `ALLSELECTED` → **VIOLACIÓN**. Mover a DAX.

---

## 4. Fases de Implementación

### FASE A — Foundation (Semana 1)

| Task | Descripción | Entregable |
|------|-------------|------------|
| A1 | Setup estructura carpetas + package.json (si aplica) | `implementation/` tree |
| A2 | `tokens.css` — Design tokens (colores, spacing, typo, breakpoints) | Tokens definidos |
| A3 | `layout.css` — Grid principal (header, grid KPIs, ranking, tendencias) | Layout responsive |
| A4 | `contract/validator.js` — Validación JSON Schema v1.0 | Contrato validado |
| A5 | `contract/guards.js` — Type guards para valores especiales | Guards funcionales |
| A6 | `utils/formatters.js` — `formatNumber`, `formatPercent`, `formatCompact` | Formateadores listos |
| A7 | `utils/accessibility.js` — ARIA helpers, focus management | A11y base |
| A8 | `state/store.js` — Estado simple (data, loading, error) | Store funcional |

**Criterio Done:** `npm run lint` (si existe) pasa; `validator.js` valida contrato mock.

---

### FASE B — Componentes Core (Semana 2)

| Task | Componente | Descripción |
|------|------------|-------------|
| B1 | `HeaderContexto` | Renderiza filtros activos: Año, Semestre, Programa, Nivel, Gestión, Depto, Provincia |
| B2 | `KPICard` (genérico) | Tarjeta reutilizable: label, valor, delta (YoY), tendencia, estado vacío |
| B3 | `MarketShare` | Donut/bar + % + label "Cuota de matrículas" / "Cuota de ingresantes" |
| B4 | `RankingTable` | Tabla: Posición, Universidad, Matrículas, Brecha vs líder; highlight UCSP |
| B5 | `Top3PlusUCSP` | Lista 3-4 items: Top 3 + UCSP forzada; badge "UCSP" |
| B6 | `TrendChart` (Matrículas) | Línea dual S1/S2 por año (Canvas/SVG simple o lib ligera) |
| B7 | `TrendChart` (Ingresantes) | Línea simple por año |
| B8 | `D003Banner` | Banner persistente: "Medidas anuales de matrículas pendientes validación D003" |

**Criterio Done:** Cada componente renderiza con datos mock; sin lógica de negocio; tests visuales pasan.

---

### FASE C — Integración y Estados (Semana 3)

| Task | Descripción |
|------|-------------|
| C1 | `main.js` — Bootstrap: fetch/recibe JSON, valida, distribuye a componentes |
| C2 | Estados: `loading` → `ready` / `empty` / `error` / `conditional-d003` |
| C3 | `EmptyState` component — "Sin datos en contexto actual" |
| C4 | `ErrorState` component — "Error cargando datos" |
| C5 | Keyboard navigation + ARIA labels en todos los componentes |
| C6 | Responsive: mobile (<768px), tablet (768-1024px), desktop (>1024px) |
| C7 | Print stylesheet (opcional) |

**Criterio Done:** Flujo completo funciona con contrato mock; estados cubiertos; accesibilidad AA.

---

### FASE D — QA y Documentación (Semana 4)

| Task | Descripción |
|------|-------------|
| D1 | Test matrix: 7 casos (A-G del Data Contract) con datos reales mock |
| D2 | Verificación terminología: 0 ocurrencias "Estudiantes" / "Matriculados" en UI |
| D3 | Verificación D003: Banner visible + campos `CONDITIONAL — D003` renderizados |
| D4 | Verificación D005-UI: Solo valores `NIVEL_ACADEMICO` nativos en slicers |
| D5 | Performance: Lighthouse > 90; render < 200ms |
| D6 | Cross-browser: Chrome, Firefox, Edge (últimas 2 versiones) |
| D7 | Documentación: `README.md` en `implementation/` con guía de uso |
| D8 | Handoff: Checklist final firmado |

---

## 5. Datos de Prueba (Mocks)

Crear `implementation/test/mocks/` con:

| Archivo | Escenario |
|---------|-----------|
| `mock-full.json` | Contexto completo: Año 2025, todos los KPIs poblados |
| `mock-semestre1.json` | Año 2025 + S1, Matrículas S1, Ingresantes N/D |
| `mock-semestre2.json` | Año 2025 + S2 |
| `mock-ucsp-empty.json` | UCSP sin datos (BLANK) |
| `mock-mercado-empty.json` | Mercado sin universidades |
| `mock-tie-ranking.json` | Empate en posición 2 (Dense) |
| `mock-d003-conditional.json` | Campos anuales = `CONDITIONAL — D003` |

---

## 6. Dependencias Externas (Mínimas)

| Dependencia | Propósito | Justificación |
|-------------|-----------|---------------|
| Ninguna obligatoria | — | Vanilla JS/CSS; zero-deps |
| Opcional: Chart.js / uPlot | `TrendChart` | Solo si línea nativa Canvas compleja; evaluar tamaño |
| Opcional: TypeScript | `contract/types.ts` | Solo tipos referencia; no compilar |

**Decisión:** Preferir implementación nativa Canvas/SVG para `TrendChart` antes que añadir dependencia.

---

## 7. Convenciones de Código

### 7.1 Naming
- **Archivos**: kebab-case (`kpi-card.js`)
- **Clases/Componentes**: PascalCase (`KPICard`)
- **Funciones/Variables**: camelCase (`formatNumber`)
- **Constantes/CSS Tokens**: UPPER_SNAKE_CASE (`--COLOR-PRIMARY`)

### 7.2 CSS
- Custom Properties para theming: `--color-primary`, `--spacing-md`, `--font-size-lg`
- BEM para componentes: `.kpi-card__value`, `.ranking-table__row--ucsp`
- Mobile-first: `@media (min-width: 768px)`

### 7.3 JS
- ESM modules: `import { formatNumber } from './utils/formatters.js'`
- IIFE solo para `main.js` entry point
- No `eval`, no `innerHTML` con datos no sanitizados
- `const`/`let`, no `var`

---

## 8. Criterios de Calidad (Quality Gates)

| Gate | Métrica | Umbral |
|------|---------|--------|
| **GATE 4.1 — Spec** | FEATURE_SPEC, DATA_CONTRACT, PLAN, ACCEPTANCE aprobados | ✅ Usuario aprueba |
| **GATE 4.2 — Code** | Lint (ESLint/Stylelint) | 0 errors, 0 warnings críticos |
| **GATE 4.3 — Contract** | Validator pasa con mocks | 7/7 mocks válidos |
| **GATE 4.4 — Logic** | 0 funciones DAX en JS | Grep: `DIVIDE\|RANKX\|CALCULATE\|SUM\|TOPN` = 0 |
| **GATE 4.5 — Terminology** | 0 "Estudiantes" / "Matriculados" en UI | Grep: `estudiante\|matriculado` = 0 |
| **GATE 4.6 — D003** | Banner + campos condicionales renderizan | Checklist manual |
| **GATE 4.7 — A11y** | Lighthouse Accessibility | ≥ 95 |
| **GATE 4.8 — Perf** | Lighthouse Performance | ≥ 90 |
| **GATE 4.9 — Done** | Checklist ACCEPTANCE_CRITERIA 100% | ✅ |

---

## 9. Rollback Strategy

- **Git**: Branch `feature/H02-html-executive-scorecard` con commits atómicos por fase
- **Tag**: `H02-spec-approved` antes de implementar
- **Rollback**: `git reset --hard H02-spec-approved` + limpiar `implementation/`

---

## 10. Comunicación y Aprobaciones

| Hito | Aprobador | Artefacto |
|------|-----------|-----------|
| Spec Complete | Usuario | FEATURE_SPEC.md, DATA_CONTRACT.md |
| Plan Approved | Usuario | PLAN.md, TASKS.md, ACCEPTANCE_CRITERIA.md |
| Phase A Done | Usuario | implementation/ foundation |
| Phase B Done | Usuario | Componentes core renderizando |
| Phase C Done | Usuario | Integración completa + estados |
| Phase D Done | Usuario | QA passed + GATE 4 |

---

## 11. Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Contrato cambia post-implementación | Media | Alto | Versionado contrato; changelog; no breaking changes sin v2.0 |
| D003 resuelto durante H02 | Baja | Medio | Contrato soporta `CONDITIONAL — D003`; fácil swap a valores reales |
| Performance tendencias 5 años | Baja | Medio | Virtual scroll / canvas; lazy load charts |
| Accesibilidad compleja en ranking | Media | Alto | ARIA table roles; keyboard nav desde día 1 |
| Cambios visuales tardíos | Media | Bajo | Design tokens centralizados; CSS variables |

---

## 12. Definición de "Done" (Feature Complete)

- [ ] FEATURE_SPEC.md, DATA_CONTRACT.md, PLAN.md, ACCEPTANCE_CRITERIA.md aprobados
- [ ] `implementation/` completa (HTML/CSS/JS)
- [ ] 7 mocks validados contra contrato
- [ ] 0 lógica DAX en JS verificado
- [ ] 0 terminología prohibida verificado
- [ ] D003 banner + campos condicionales funcionando
- [ ] D005-UI valores nativos solamente
- [ ] D006-Cross no implementado (confirmado)
- [ ] Lighthouse: Perf ≥ 90, A11y ≥ 95, Best Practices ≥ 90
- [ ] Cross-browser OK
- [ ] README.md con guía de uso
- [ ] Usuario aprueba GATE 4