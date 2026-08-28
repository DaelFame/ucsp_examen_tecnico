# F002 — Semantic Model Foundation — FEATURE SPEC

| Campo | Valor |
| ----- | ----- |
| Proyecto | demanda_UCSP |
| Feature ID | F002 |
| Nombre | Semantic Model Foundation |
| Fase | Previa a FASE 2 (fundación documental) |
| Quality Gate | GATE 2 — Semantic Model (aplicable a la implementación de FASE 2) |
| Estado | Fundación documental COMPLETADA; implementación PENDING |

## 1. Propósito

Preparar la base técnica y documental para que FASE 2 (implementación del Semantic
Model) pueda iniciar sin ambigüedad. F002 consolida: granularidad de los hechos,
semántica de métricas, comportamiento temporal, clasificación geográfica, dominios,
tipos y relaciones candidatas.

## 2. Declaración explícita

**F002 NO implementa todavía el Semantic Model.**

- No crea tablas, columnas, relaciones, medidas, columnas calculadas, tablas auxiliares
  ni parámetros.
- No modifica TMDL, PBIR, PBIP, `.SemanticModel`, `.Report` ni `dashboard/`.
- No modifica Parquet.
- Es una feature exclusivamente **documental**.

## 3. Alcance

- Resolución documental de las decisiones D001–D007.
- Creación del `DECISION_REGISTER.md`.
- Creación de la `SEMANTIC_BEHAVIOR_MATRIX.md` (referencia funcional temporal).
- Normalización de la estructura mínima de feature (FEATURE_SPEC / PLAN / TASKS).
- Consistencia y trazabilidad con F001, `spec/` y la constitución.

## 4. Fuera de alcance

- Implementación del modelo semántico (FASE 2).
- Crear relaciones, medidas, columnas calculadas, tablas auxiliares o parámetros.
- Modificar `dashboard/`, TMDL, PBIR, PBIP o Parquet.
- Clasificación geográfica Norte/Centro (regla de negocio pendiente).
- Implementación del selector temporal (UX).

## 5. Entradas / evidencia de F001

- `features/F001-data-quality-audit/DATA_QUALITY_REPORT.md` (integridad referencial,
  dominios, cobertura temporal, métricas).
- `features/F001-data-quality-audit/audit_output.json` (evidencia de ejecución).
- `spec/DATA_CONTRACT.md` (estados confirmados / por validar).
- `spec/MODELING_PRINCIPLES.md` (principios de modelado).
- Regla de negocio `REGION_SUR` en `src/process_ingresantes.py` y
  `src/process_matriculados.py`.

## 6. Decisiones D001–D007

| Decisión | Tema | Estado |
| -------- | ---- | ------ |
| D001 | Granularidad de hechos | CONFIRMED (técnica); semántica de negocio PENDING |
| D002 | Semántica de métricas / SUM | CONFIRMED (parcial) — SUM aditivo/técnico; PENDING — semántica de negocio |
| D003 | Selector temporal (dimensión vs UX) | Regla CONFIRMED; arquitectura PROPOSED (Opción A) |
| D004 | Clasificación geográfica Norte/Centro/Sur | PENDING (regla Norte/Centro requerida); opción PROPOSED |
| D005 | Dominios y presentación | Estrategia CONFIRMED; equivalencia Pregrado PENDING |
| D006 | Tipos Parquet vs TMDL | CONFIRMED (decisión de modelado) |
| D007 | Relaciones candidatas | Integridad CONFIRMADA (F001); candidatas validadas; cardinalidad/dirección/actividad PROPOSED |

## 7. Artefactos producidos

- `DECISION_REGISTER.md` — registro de decisiones D001–D007.
- `SEMANTIC_BEHAVIOR_MATRIX.md` — comportamiento temporal esperado por hecho y por
  visualización.
- `FEATURE_SPEC.md`, `PLAN.md`, `TASKS.md` — estructura mínima de la feature.

## 8. Criterios de aceptación

1. Estructura mínima de feature completa (SPEC/PLAN/TASKS).
2. Decisiones D001–D007 trazables a evidencia de F001.
3. Sin contradicciones entre `DATA_CONTRACT.md`, `MODELING_PRINCIPLES.md`,
   `ROADMAP.md`, `DECISION_REGISTER.md`, `SEMANTIC_BEHAVIOR_MATRIX.md` y el reporte F001.
4. D002: `SUM` confirmado **técnicamente** (aditivo/consistente sobre los conteos); la
   semántica de negocio (unidad, doble conteo S1/S2, "Año completo", "Sin dato")
   permanece **PENDING**; no declarado CONFIRMED total.
5. Sin implementación del Semantic Model.

## 9. Dependencias

- F001 aprobada como evidencia (GATE 1: PASS WITH WARNINGS).
- `spec/` (DATA_CONTRACT, MODELING_PRINCIPLES, ROADMAP, MISSION).
- Inputs de negocio pendientes: regla Norte/Centro/Sur; equivalencia
  Pregrado ↔ CARRERA PROFESIONAL; definición de negocio de ingresante/matriculado;
  validación de la semántica SUM.

## 10. Relación con GATE 2

F002 es el **insumo documental** de GATE 2. El gate se aplicará al cierre de la
**implementación** de FASE 2, no a esta fundación. La fundación reduce el riesgo de que
FASE 3 construya visualizaciones con comportamiento temporal semánticamente incorrecto.

## 11. Transición hacia FASE 2

- FASE 2 (implementación) inicia **solo con aprobación explícita**.
- Orden sugerido: resolver los inputs de negocio pendientes → validar D002 (semántica
  SUM) → implementar relaciones y medidas respetando granularidad y sin fabricar datos.
- La implementación usará SK/FK validadas (F001) y respetará la granularidad real de
  cada fuente.