# ROADMAP — demanda_UCSP

| Campo | Valor |
| ----- | ----- |
| Proyecto | demanda_UCSP |
| Documento | Roadmap del proyecto |
| Estado | Vigente desde la FASE 0 |

## 1. Distinción conceptual: FASES vs FEATURES

Este proyecto utiliza **dos niveles de planificación independientes**:

| Nivel | Identificador | Naturaleza | Ejemplo |
| ----- | ------------- | ---------- | ------- |
| FASE | `FASE 0`, `FASE 1`, ... | Etapa de ciclo de vida del proyecto; define qué ocurre y en qué orden. | FASE 1 — Data Quality Audit |
| FEATURE | `F001`, `F002`, ... | Unidad de trabajo ejecutable con SPEC, PLAN y TASKS propios. | F001 — Data Quality Audit |

- Una **FASE** puede contener una o varias **FEATURES**.
- Una **FEATURE** se crea formalmente (carpeta `features/FXXX/` con `SPEC.md`,
  `PLAN.md` y `TASKS.md`) **solo cuando la fase que la contiene está autorizada a
  ejecutarse**.
- **Excepción de fundación documental (A5):** una feature de **fundación** (documentación
  únicamente: SPEC/PLAN/TASKS + artefactos de decisión, comportamiento o evidencia) puede
  crearse **antes** de autorizar la implementación de su fase, para preparar la base sin
  tocar el modelo ni el reporte. La implementación de la fase sigue requiriendo aprobación
  explícita (ej.: `F002` creada previo a FASE 2).
- En esta ejecución (FASE 0) **no se crea ninguna feature**.

### Mapeo FASE → FEATURE (planificado)

| FASE | FEATURE(s) planificadas | Estado de creación |
| ---- | ----------------------- | ------------------ |
| FASE 0 | — (documentación, no ejecutable) | Completa. Sin features. |
| FASE 1 | `F001 — Data Quality Audit` | Creada y completada (FASE 1; GATE 1 aprobado). |
| FASE 2 | `F002 — Semantic Model` [provisional] | Fundación documental COMPLETADA (Decision Register + Semantic Behavior Matrix + Feature Spec/Plan/Tasks); implementación PENDING. |
| FASE 3 | `F003 — Core Metrics` [provisional] | Por definir al aprobar FASE 2. |
| FASE 4 | `F004 — Information Architecture / UX` [provisional] | Por definir al aprobar FASE 3. |
| FASE 5 | `F005 — Benchmark Analysis` [provisional] | Por definir al aprobar FASE 4. |
| FASE 6 | `F006 — Program Demand Analysis` [provisional] | Por definir al aprobar FASE 5. |
| FASE 7 | `F007 — Validation / QA` [provisional] | Por definir al aprobar FASE 6. |
| FASE 8 | Entrega final (sin feature de construcción). | Por definir al aprobar FASE 7. |

> Los identificadores de feature `F002`–`F008` son **provisionales** y se confirmarán
> en el momento de crear cada feature. Solo `F001` está previsto explícitamente por esta
> FASE 1.

## 2. Principio de avance

El proyecto avanza **fase por fase**, con Quality Gate al cierre de cada una
(ver `QUALITY_GATES.md`).

- **GATE 0** — Project / Documentation Integrity (cierre de FASE 0).
- **GATE 1** — Data Quality (cierre de FASE 1).
- **GATE 2** — Semantic Model (cierre de FASE 2).
- **GATE 3** — Metrics / DAX (cierre de FASE 3).
- **GATE 4** — Report Structure (cierre de FASE 4).
- **GATE 5** — Functional Validation (cierre de FASE 7).
- **GATE 6** — Final Delivery (cierre de FASE 8).

Ninguna fase inicia sin aprobar el gate de la fase anterior.

## 3. Fases del roadmap

### FASE 0 — Foundation / Documentation

- **Objetivo:** establecer la arquitectura documental y de gobernanza del proyecto.
- **Entradas:** enunciado original; auditoría inicial (estructura PBIP, TMDL, Report,
  Parquet).
- **Entregables:**
  - `constitution/PROJECT_CONSTITUTION.md`
  - `spec/MISSION.md`
  - `spec/ROADMAP.md`
  - `spec/TECH_STACK.md`
  - `spec/DATA_CONTRACT.md`
  - `spec/MODELING_PRINCIPLES.md`
  - `spec/QUALITY_GATES.md`
- **Dependencias:** ninguna.
- **Riesgos:** alcance documental desalineado con el enunciado; requisitos inventados.
- **Criterio de entrada:** enunciado disponible; proyecto PBIP confirmado.
- **Criterio de salida:** 7 documentos vigentes; trazabilidad ENUNCIADO → REQUISITOS
  definida.
- **Quality Gate:** GATE 0 — Project / Documentation Integrity.

### FASE 1 — Data Quality Audit

- **Objetivo:** auditar programáticamente los archivos Parquet y validar el contrato de
  datos antes de modelar.
- **Entradas:** `spec/DATA_CONTRACT.md`; Parquet en
  `D:\Proyectos\A.Prueba Tecnica UCSP\data\Dashboard_parquet\`.
- **Entregables:**
  - Feature `F001 — Data Quality Audit` (SPEC, PLAN, TASKS).
  - Informe de calidad de datos por tabla.
  - Contrato de datos actualizado (estados CONFIRMADO / [POR VALIDAR]).
- **Dependencias:** FASE 0 aprobada.
- **Riesgos:** esquema o tipos inesperados en Parquet; claves no únicas; huérfanos;
  cobertura temporal insuficiente.
- **Criterio de entrada:** GATE 0 aprobado; Parquet accesibles.
- **Criterio de salida:** cada elemento del contrato con estado resuelto o con
  decisión explícita.
- **Quality Gate:** GATE 1 — Data Quality.

> **Alcance mínimo de la auditoría de FASE 1 (se ejecutará allí, no ahora):**
> esquema; tipos de datos; cantidad de registros; nulos; duplicados; unicidad de claves
> (SK); integridad FK → PK; registros huérfanos; cobertura temporal; valores categóricos
> relevantes; consistencia entre dimensiones y hechos; granularidad observable.

### FASE 2 — Semantic Model

- **Objetivo:** construir el modelo semántico (tablas, columnas, relaciones) sobre la
  base validada en FASE 1.
- **Entradas:** contrato de datos validado; `MODELING_PRINCIPLES.md`.
- **Entregables:** modelo semántico con relaciones dimensiones → hechos; TMDL coherente;
  feature `F002 — Semantic Model` (provisional).
- **Dependencias:** FASE 1 aprobada.
- **Riesgos:** cardinalidades mal definidas; relaciones innecesarias; bidireccionalidad
  injustificada.
- **Criterio de entrada:** GATE 1 aprobado; claves e integridad conocidas.
- **Criterio de salida:** modelo con relaciones verificadas y sin ambigüedades de
  filtrado.
- **Quality Gate:** GATE 2 — Semantic Model.

#### Decisiones pendientes de FASE 2 (incorporadas post-F001)

Estas necesidades **no están implementadas** y quedan registradas como
`DECISIÓN PENDIENTE / FASE 2`.

1. **Clasificación geográfica Norte / Centro / Sur.**
   `dim_ubicacion` solo dispone de `Region_Sur` (True/False), que identifica el Sur pero
   no proporciona una clasificación completa Norte/Centro/Sur. Antes de implementarla
   debe definirse y documentarse la **regla exacta de asignación geográfica**
   (Departamento / ubicación → clasificación → Norte / Centro / Sur). No se inventa
   todavía la lista de departamentos por zona.

2. **Selector temporal (Año + Nivel temporal).**
   La experiencia del usuario deberá permitir seleccionar `Año` y el nivel temporal
   `[Año completo | Semestre I | Semestre II]`, respetando estrictamente la granularidad
   de cada hecho (observada en F001):
   - INGRESANTES (`fact_ingresantes_dashboard`, períodos anuales): Año completo
     disponible; **Semestre I / II no existen** en la fuente → no fabricar datos
     semestrales.
   - MATRICULADOS (`fact_matriculados_dashboard`, períodos semestrales): Semestre I / II
     disponibles; Año completo evaluable a partir de sus períodos semestrales.
   No se asume todavía cómo se implementará técnicamente el selector.

3. **Granularidad temporal por hecho.**
   La diferencia anual/semestral **no se interpreta como error automáticamente**:
   - `fact_ingresantes_dashboard` → granularidad temporal observable **anual**.
   - `fact_matriculados_dashboard` → granularidad temporal observable **semestral**.
   La implementación futura respetará la granularidad real de cada fuente.

### FASE 3 — Core Metrics

- **Objetivo:** definir e implementar las medidas DAX base para ingresantes y
  matriculados.
- **Entradas:** modelo semántico aprobado; `MODELING_PRINCIPLES.md`.
- **Entregables:** medidas base (ingresantes, matriculados, evolución anual);
  feature `F003 — Core Metrics` (provisional).
- **Dependencias:** FASE 2 aprobada.
- **Riesgos:** DAX no mantenible; medidas que mezclan granularidades; patrón Fijo vs
  Dinámico aplicado sin justificación.
- **Criterio de entrada:** GATE 2 aprobado.
- **Criterio de salida:** medidas validadas y documentadas.
- **Quality Gate:** GATE 3 — Metrics / DAX.

### FASE 4 — Information Architecture / UX

- **Objetivo:** definir la estructura de páginas, filtros y navegación del reporte.
- **Entradas:** requisitos de `MISSION.md`; medidas base de FASE 3.
- **Entregables:** arquitectura de páginas; filtros/slicers obligatorios
  (Departamento, Nivel sur, Gestión); feature `F004` (provisional).
- **Dependencias:** FASE 3 aprobada.
- **Riesgos:** sobre-diseño de visuales; navegación confusa; filtros con preselección
  indebida.
- **Criterio de entrada:** GATE 3 aprobado.
- **Criterio de salida:** estructura de reporte aprobada antes de construir visuales de
  análisis.
- **Quality Gate:** GATE 4 — Report Structure.

### FASE 5 — Benchmark Analysis

- **Objetivo:** construir los visuales de la Pregunta 1 (Benchmark de demanda) y la
  comparativa UCSP vs región vs nacional.
- **Entradas:** arquitectura de reporte aprobada; medidas base.
- **Entregables:** visuales de evolución de UCSP por programa; comparativas regional y
  nacional; feature `F005` (provisional).
- **Dependencias:** FASE 4 aprobada.
- **Riesgos:** comparativas con universo mal definido (FIJO vs DINÁMICO); escala
  regional inexacta.
- **Criterio de entrada:** GATE 4 aprobado.
- **Criterio de salida:** visuales de benchmark funcionales y trazables a R3.
- **Quality Gate:** GATE 5 — Functional Validation (parcial).

### FASE 6 — Program Demand Analysis

- **Objetivo:** construir los visuales de la Pregunta 2 (Top/Bottom 5 programas por
  ingreso y matrícula por año).
- **Entradas:** arquitectura de reporte aprobada; medidas base.
- **Entregables:** rankings Top/Bottom 5 por año; feature `F006` (provisional).
- **Dependencias:** FASE 4 aprobada (y medidas de FASE 3).
- **Riesgos:** criterio de ranking ambiguo; granularidad temporal inconsistente.
- **Criterio de entrada:** GATE 4 aprobado.
- **Criterio de salida:** visuales de ranking funcionales y trazables a R4.
- **Quality Gate:** GATE 5 — Functional Validation (parcial).

### FASE 7 — Validation / QA

- **Objetivo:** validar funcional y técnicamente el reporte completo.
- **Entradas:** visuales de FASE 5 y FASE 6; `MISSION.md`.
- **Entregables:** validación de las dos preguntas obligatorias; validación de los tres
  filtros obligatorios; correcciones; feature `F007` (provisional).
- **Dependencias:** FASE 5 y FASE 6 aprobadas.
- **Riesgos:** filtros que no afectan correctamente los visuales; indicadores con
  resultados inconsistentes.
- **Criterio de entrada:** reporte completo construido.
- **Criterio de salida:** las dos preguntas obligatorias y los tres filtros obligatorios
  validados.
- **Quality Gate:** GATE 5 — Functional Validation.

### FASE 8 — Final Delivery

- **Objetivo:** entrega final del dashboard y documentación consolidada.
- **Entradas:** reporte validado; documentación del proyecto.
- **Entregables:** paquete de entrega (dashboard + documentación + evidencias).
- **Dependencias:** FASE 7 aprobada.
- **Riesgos:** documentación desactualizada; artefactos residuales.
- **Criterio de entrada:** GATE 5 aprobado.
- **Criterio de salida:** entrega completa y reproducible.
- **Quality Gate:** GATE 6 — Final Delivery.

## 4. Resumen de fases

| FASE | Nombre | Gate de salida | Estado |
| ---- | ------ | -------------- | ------ |
| FASE 0 | Foundation / Documentation | GATE 0 | Completada (GATE 0 aprobado) |
| FASE 1 | Data Quality Audit | GATE 1 | Completada (GATE 1 aprobado — PASS WITH WARNINGS) |
| FASE 2 | Semantic Model | GATE 2 | Planificada — fundación documental completada; implementación PENDING |
| FASE 3 | Core Metrics | GATE 3 | Planificada |
| FASE 4 | Information Architecture / UX | GATE 4 | Planificada |
| FASE 5 | Benchmark Analysis | GATE 5 | Planificada |
| FASE 6 | Program Demand Analysis | GATE 5 | Planificada |
| FASE 7 | Validation / QA | GATE 5 | Planificada |
| FASE 8 | Final Delivery | GATE 6 | Planificada |

## 5. Estado de este documento

- Estado: **Vigente desde la FASE 0**.
- Las features `F002`–`F008` son provisionales.
- `F002` fundación documental **COMPLETADA** en `features/F002-semantic-model-foundation/`
  (FEATURE_SPEC, PLAN, TASKS, DECISION_REGISTER D001–D007, SEMANTIC_BEHAVIOR_MATRIX);
  **implementación PENDING** — FASE 2 no iniciada.
- `F001` creada en `features/F001-data-quality-audit/` al iniciar FASE 1 (SPEC, PLAN,
  TASKS, script y reporte de calidad).