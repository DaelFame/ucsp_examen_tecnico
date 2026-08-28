# H02 — HTML Executive Scorecard — ACCEPTANCE CRITERIA

**Versión:** 1.0  
**Fecha:** 2026-08-28  
**Estado:** Definición — Pendiente ejecución  
**Referencia:** FEATURE_SPEC.md, DATA_CONTRACT.md, PLAN.md, TASKS.md

---

## 1. Criterios de Contrato de Datos

| ID | Criterio | Verificación | Estado |
|----|----------|--------------|--------|
| AC-DC-01 | HTML recibe JSON exacto a `DATA_CONTRACT.md` v1.0 | `validator.js` valida 7/7 mocks sin errores | [ ] |
| AC-DC-02 | Sección `contexto` presente con todos los campos obligatorios | Check: `anio`, `semestre`, `escala`, `programa`, `nivel_academico`, `gestion`, `departamento`, `provincia`, `region_sur`, `universidad_seleccionada` | [ ] |
| AC-DC-03 | Sección `UCSP` con 8 campos definidos | Check: `matriculas`, `matriculas_yoy`, `matriculas_yoy_valor`, `ingresantes`, `ingresantes_yoy`, `ingresantes_yoy_valor`, `market_share_matriculas`, `market_share_ingresantes` | [ ] |
| AC-DC-04 | Sección `MERCADO` con 4 campos | Check: `matriculas`, `ingresantes`, `cantidad_universidades`, `cantidad_programas` | [ ] |
| AC-DC-05 | Sección `RANKING` con 6 campos | Check: `posicion_ucsp`, `total_universidades`, `lider`, `matriculas_lider`, `brecha_vs_lider`, `universidad_lider_es_ucsp` | [ ] |
| AC-DC-06 | `TOP3_PLUS_UCSP` array 3-4 items con estructura correcta | Check: cada item tiene `universidad`, `posicion`, `matriculas`, `es_ucsp` | [ ] |
| AC-DC-07 | `TENDENCIA_MATRICULAS` array items con `anio`, `semestre`, `matriculas` | Check: semestres 1/2, max 5 años | [ ] |
| AC-DC-08 | `TENDENCIA_INGRESANTES` array items con `anio`, `ingresantes` | Check: anual, max 5 años | [ ] |
| AC-DC-09 | Valores especiales soportados: `null`, `BLANK`, `"N/D — Escala anual"`, `"CONDITIONAL — D003"` | Guard functions `isBlank`, `isConditionalD003`, `isNotApplicable` pasan tests | [ ] |
| AC-DC-10 | `meta` presente con `contract_version`, `generated_at`, `warnings` | Check en JSON recibido | [ ] |

---

## 2. Criterios de Terminología Obligatoria

| ID | Criterio | Verificación | Estado |
|----|----------|--------------|--------|
| AC-TM-01 | **Cero** ocurrencias de "estudiante", "estudiantes", "alumno", "alumnos" en UI | `grep -ri "estudiante\|alumno" implementation/ \| wc -l` = 0 | [ ] |
| AC-TM-02 | **Cero** ocurrencias de "matriculado", "matriculados", "matriculada", "matriculadas" en UI | `grep -ri "matriculado" implementation/ \| wc -l` = 0 | [ ] |
| AC-TM-03 | **Cero** ocurrencias de "student", "students" en UI | `grep -ri "student" implementation/ \| wc -l` = 0 | [ ] |
| AC-TM-04 | KPI Matrículas usa label **"Matrículas"** o **"Volumen de matrículas"** | Visual inspection + grep "Matrículas" | [ ] |
| AC-TM-05 | Market Share usa label **"Cuota de matrículas"** o **"Cuota de ingresantes"** | Visual inspection + grep "Cuota de" | [ ] |
| AC-TM-06 | Ranking usa label **"Ranking por matrículas"** o **"Posición por matrículas"** | Visual inspection + grep "Ranking por" | [ ] |
| AC-TM-07 | Brecha usa label **"Brecha vs líder (matrículas)"** | Visual inspection | [ ] |
| AC-TM-08 | Tooltips/ayuda explican: "Volumen de matrículas (S1+S2). Un estudiante en ambos semestres se cuenta dos veces." | Visual inspection tooltips | [ ] |

---

## 3. Criterios de Separación de Responsabilidades

| ID | Criterio | Verificación | Estado |
|----|----------|--------------|--------|
| AC-SR-01 | **Cero** funciones DAX en código JS/HTML | `grep -r "DIVIDE\|RANKX\|CALCULATE\|SUM\|TOPN\|FILTER\|ALLSELECTED\|ALL\|REMOVEFILTERS" implementation/js/ \| wc -l` = 0 | [ ] |
| AC-SR-02 | HTML no filtra datos (recibe ya filtrado) | Code review: no `filter()`, `find()` sobre arrays de datos raw para lógica de negocio | [ ] |
| AC-SR-03 | HTML no agrega/suma datos | Code review: no `reduce()`, `forEach` sumando valores para KPIs | [ ] |
| AC-SR-04 | HTML no calcula porcentajes | Code review: no `value / total * 100` para market share | [ ] |
| AC-SR-05 | HTML no calcula rankings/posiciones | Code review: no `sort()`, `indexOf()` para posición | [ ] |
| AC-SR-05 | HTML no calcula YoY/deltas | Code review: no `(current - previous) / previous` | [ ] |
| AC-SR-06 | HTML solo formatea, renderiza, maneja estados | Code review: solo `formatNumber`, `formatPercent`, condicionales de UI | [ ] |

---

## 4. Criterios de Estados de UI (7 Casos Edge)

| ID | Caso | Comportamiento Esperado | Verificación | Estado |
|----|------|------------------------|--------------|--------|
| AC-UI-01 | **Sin datos globales** | `EmptyState` global: "Sin datos en contexto actual" + botón "Limpiar filtros" | Mock `mock-empty.json` | [ ] |
| AC-UI-02 | **UCSP sin datos** | KPIs UCSP = `EmptyState`; Ranking/Top3 muestran posición `—`; Brecha = `—`; Market Share = `—` | Mock `mock-ucsp-empty.json` | [ ] |
| AC-UI-03 | **Filtro Semestre en Ingresantes** | KPI Ingresantes muestra `"N/D — Escala anual"`; Semestre badge deshabilitado/oculto en sección Ingresantes | Mock `mock-semestre1.json` | [ ] |
| AC-UI-04 | **Ingresantes escala anual** | KPI Ingresantes muestra valor anual; NO hay sparkline semestral; Tendencia Ingresantes = línea simple | Mock `mock-full.json` | [ ] |
| AC-UI-05 | **Matrículas semestrales** | KPI Matrículas muestra valor semestre actual; Tendencia Matrículas = dual S1/S2; Ranking semestral | Mock `mock-semestre1.json` | [ ] |
| AC-UI-06 | **Contexto vacío (Mercado 0 univs)** | Market Share = `"N/D — Mercado sin datos"`; Ranking = `EmptyState`; Top3 = solo UCSP si tiene datos | Mock `mock-mercado-empty.json` | [ ] |
| AC-UI-07 | **Empate en Ranking (Dense)** | Posiciones: 1, 2, 2, 4 (no 1, 2, 2, 3); UI muestra número correcto | Mock `mock-tie-ranking.json` | [ ] |

---

## 5. Criterios de Decisiones Bloqueadas (Visible en UI)

| ID | Decisión | Comportamiento UI | Verificación | Estado |
|----|----------|-------------------|--------------|--------|
| AC-DB-01 | **D003** | Banner `D003Banner` visible siempre; campos anuales matrículas = `"CONDITIONAL — D003"` con tooltip | Mock `mock-d003-conditional.json` + visual | [ ] |
| AC-DB-02 | **D003** | `UCSP.matriculas_yoy` = `null` + tooltip "Pendiente validación D003" | Visual inspection | [ ] |
| AC-DB-03 | **D003** | `Market Share Matrículas (anual)` = `"CONDITIONAL — D003"` | Visual inspection | [ ] |
| AC-DB-04 | **D003** | `Ranking Matrículas (anual)` = `"CONDITIONAL — D003"` | Visual inspection | [ ] |
| AC-DB-05 | **D005-UI** | Slicer/selector Nivel Académico muestra **solo**: MAESTRIA, CARRERA PROFESIONAL, SEGUNDA ESPECIALIDAD, DOCTORADO | Visual inspection slicer | [ ] |
| AC-DB-06 | **D005-UI** | **Ningún** label "Pregrado" / "Postgrado" en UI | Grep "Pregrado\|Postgrado" = 0 | [ ] |
| AC-DB-07 | **D006-Cross** | **Ningún** campo `tasa_conversion`, `conversion_rate`, `ingresantes_por_matrícula` en contrato ni UI | Grep + visual | [ ] |

---

## 6. Criterios de Componentes Visuales

| ID | Componente | Requisitos | Verificación | Estado |
|----|------------|------------|--------------|--------|
| AC-CV-01 | **Header Contexto** | Muestra todos los filtros activos con badges removibles | Visual + interacción | [ ] |
| AC-CV-02 | **KPI Matrículas UCSP** | Valor principal + YoY (si disponible) + trend indicator + unidad "Matrículas" | Visual + datos | [ ] |
| AC-CV-03 | **KPI Ingresantes UCSP** | Valor principal + YoY + unidad "Ingresantes" | Visual + datos | [ ] |
| AC-CV-04 | **Market Share Matrículas** | Donut/bar visual + % grande (1 decimal) + label "Cuota de matrículas" | Visual + datos | [ ] |
| AC-CV-05 | **Market Share Ingresantes** | % grande + label "Cuota de ingresantes" | Visual + datos | [ ] |
| AC-CV-06 | **Ranking Table** | Columnas: Pos, Universidad, Matrículas, Brecha; fila UCSP highlighted; ordenable | Visual + datos | [ ] |
| AC-CV-07 | **Top 3 + UCSP** | 3-4 tarjetas/filas; Top 3 ordenadas + UCSP forzada; badge "UCSP" | Visual + datos | [ ] |
| AC-CV-08 | **Trend Matrículas** | Dual line S1/S2; tooltip por punto; leyenda; responsive | Visual + interacción | [ ] |
| AC-CV-09 | **Trend Ingresantes** | Single line; tooltip; responsive | Visual + interacción | [ ] |
| AC-CV-10 | **D003 Banner** | Fijo top/bottom; texto claro; no dismissible; link a decisión | Visual | [ ] |

---

## 7. Criterios de Accesibilidad (A11y)

| ID | Criterio | Estándar | Verificación | Estado |
|----|----------|----------|--------------|--------|
| AC-A11Y-01 | Contraste de texto | WCAG AA (4.5:1 normal, 3:1 large) | Lighthouse / axe-core | [ ] |
| AC-A11Y-02 | Navegación teclado completa | Tab order lógico; focus visible | Manual testing | [ ] |
| AC-A11Y-03 | ARIA live regions en KPIs | `aria-live="polite"` en valores que cambian | Code review | [ ] |
| AC-A11Y-04 | Tabla Ranking semántica | `<table>`, `<thead>`, `<th scope="col">`, `<tbody>` | Code review | [ ] |
| AC-A11Y-05 | Gráficos accesibles | `role="img" aria-label` + tabla datos alternativa | Code review | [ ] |
| AC-A11Y-06 | Focus visible en todos los interactivos | `:focus-visible` outline | Manual | [ ] |
| AC-A11Y-07 | Skip link principal | "Saltar al contenido principal" | Manual | [ ] |
| AC-A11Y-08 | Lighthouse Accessibility | ≥ 95 | Lighthouse CI | [ ] |

---

## 8. Criterios de Performance

| ID | Métrica | Umbral | Verificación | Estado |
|----|---------|--------|--------------|--------|
| AC-PF-01 | First Contentful Paint | < 1.5s | Lighthouse | [ ] |
| AC-PF-02 | Largest Contentful Paint | < 2.5s | Lighthouse | [ ] |
| AC-PF-03 | Total Blocking Time | < 200ms | Lighthouse | [ ] |
| AC-PF-04 | Cumulative Layout Shift | < 0.1 | Lighthouse | [ ] |
| AC-PF-05 | Render completo (mock full) | < 200ms | `performance.now()` en `main.js` | [ ] |
| AC-PF-06 | Bundle size (JS + CSS) | < 100 KB gzipped | Build output | [ ] |
| AC-PF-07 | Lighthouse Performance | ≥ 90 | Lighthouse CI | [ ] |

---

## 9. Criterios de Compatibilidad

| ID | Navegador / Entorno | Versiones | Verificación | Estado |
|----|---------------------|-----------|--------------|--------|
| AC-CB-01 | Chrome | Últimas 2 | Manual / BrowserStack | [ ] |
| AC-CB-02 | Firefox | Últimas 2 | Manual / BrowserStack | [ ] |
| AC-CB-03 | Edge | Últimas 2 | Manual / BrowserStack | [ ] |
| AC-CB-04 | Safari | Últimas 2 | Manual / BrowserStack | [ ] |
| AC-CB-05 | Mobile Chrome (Android) | Última | Manual | [ ] |
| AC-CB-06 | Mobile Safari (iOS) | Última | Manual | [ ] |

---

## 10. Criterios de Documentación y Entrega

| ID | Artefacto | Requisito | Verificación | Estado |
|----|-----------|-----------|--------------|--------|
| AC-DOC-01 | `README.md` en `implementation/` | Instalación, uso, contrato, componentes, extensibilidad | Existe + completo | [ ] |
| AC-DOC-02 | Comentarios JSDoc en JS público | Todas las funciones exportadas | Code review | [ ] |
| AC-DOC-03 | CSS Custom Properties documentadas | En `tokens.css` con comentarios | Code review | [ ] |
| AC-DOC-04 | `CHANGELOG.md` v1.0 | Versión, fecha, cambios | Existe | [ ] |

---

## 11. Matriz de Trazabilidad (Requisito → Criterio)

| Requisito (MISSION.md) | Criterios Asociados |
|------------------------|---------------------|
| R1: KPIs Ingresantes UCSP | AC-DC-03, AC-CV-03, AC-TM-04 |
| R2: KPIs Matrículas UCSP | AC-DC-03, AC-CV-02, AC-TM-04 |
| R3: Benchmark UCSP vs Mercado | AC-DC-02, AC-DC-03, AC-DC-04, AC-CV-04, AC-CV-05 |
| R4: Ranking + Top 5 | AC-DC-05, AC-DC-06, AC-CV-06, AC-CV-07 |
| R5: Tendencias | AC-DC-07, AC-DC-08, AC-CV-08, AC-CV-09 |
| RD3: Granularidad temporal | AC-UI-03, AC-UI-04, AC-UI-05 |
| D002-C: Matrículas ≠ Estudiantes | AC-TM-01 a AC-TM-08 |
| D003: Bloqueo medidas anuales | AC-DB-01 a AC-DB-04 |
| D005-UI: Sin alias Pregrado | AC-DB-05, AC-DB-06 |
| D006-Cross: Sin cross-fact | AC-DB-07 |

---

## 12. Definición de "Done" (Feature Complete)

La feature H02 se considera **COMPLETADA** cuando:

- [ ] Todos los criterios AC-DC-01 a AC-DC-10: **PASS**
- [ ] Todos los criterios AC-TM-01 a AC-TM-08: **PASS**
- [ ] Todos los criterios AC-SR-01 a AC-SR-06: **PASS**
- [ ] Todos los criterios AC-UI-01 a AC-UI-07: **PASS**
- [ ] Todos los criterios AC-DB-01 a AC-DB-07: **PASS**
- [ ] Todos los criterios AC-CV-01 a AC-CV-10: **PASS**
- [ ] Todos los criterios AC-A11Y-01 a AC-A11Y-08: **PASS**
- [ ] Todos los criterios AC-PF-01 a AC-PF-07: **PASS**
- [ ] Todos los criterios AC-CB-01 a AC-CB-06: **PASS**
- [ ] Todos los criterios AC-DOC-01 a AC-DOC-04: **PASS**
- [ ] TASKS.md 100% completado (checkboxes)
- [ ] GATE 4 aprobado por usuario

---

## 13. Registro de Ejecución (Para llenar durante QA)

| Criterio | Fecha | Ejecutor | Resultado | Evidencia | Firmado |
|----------|-------|----------|-----------|-----------|---------|
| AC-DC-01 | | | | | |
| AC-DC-02 | | | | | |
| ... | | | | | |
| AC-A11Y-08 | | | | | |
| AC-PF-07 | | | | | |
| AC-DOC-04 | | | | | |

**Firma final GATE 4:** _______________ Fecha: _______________