# F002 — Semantic Model Foundation — TASKS

| Campo | Valor |
| ----- | ----- |
| Feature | F002 |
| Fase | Previa a FASE 2 (fundación documental) |
| Formato | Checklist `[ ]` pendiente / `[x]` completada |

## Auditoría documental

- [x] Leer `constitution/PROJECT_CONSTITUTION.md`.
- [x] Leer `spec/` (MISSION, ROADMAP, DATA_CONTRACT, MODELING_PRINCIPLES, QUALITY_GATES, TECH_STACK).
- [x] Leer `features/F001-data-quality-audit/*`.
- [x] Leer el estado previo de `features/F002-semantic-model-foundation/*`.
- [x] Determinar existencia, duplicados y contradicciones.

## Resolución D001–D007

- [x] D001 — Granularidad de hechos (anual ingresantes / semestral matriculados).
- [x] D002 — Semántica de métricas: validación read-only sobre los Parquet del Semantic
      Model; SUM CONFIRMED (parcial) técnico; semántica de negocio PENDING.
- [x] D003 — Selector temporal (dimensión de datos vs comportamiento UX).
- [x] D004 — Clasificación geográfica (Sur evidenciada; Norte/Centro pendiente).
- [x] D005 — Dominios y presentación.
- [x] D006 — Tipos Parquet vs TMDL.
- [x] D007 — Relaciones candidatas (integridad vs decisión de modelado).

## Decision Register

- [x] Crear `DECISION_REGISTER.md`.
- [x] Ajustar D007 (integridad / candidatas / decisión de modelado PROPOSED).
- [x] Ajustar D004 (no inventar Norte/Centro).
- [x] Ajustar D003 (dim_periodo vs selector UX; implementación pendiente).
- [x] Registrar D002 inicialmente como PROPOSED/PENDING (validación de SUM pendiente).

## Semantic Behavior Matrix

- [x] Crear `SEMANTIC_BEHAVIOR_MATRIX.md`.
- [x] Matriz base por hecho (Anual/Semestral × Año completo/S1/S2).
- [x] Matriz extendida (evolución, comparativa UCSP, Top/Bottom 5, filtros).
- [x] Reglas obligatorias (no fabricar datos semestrales; respetar granularidad).

## Estructura de la feature

- [x] Crear `FEATURE_SPEC.md`.
- [x] Crear `PLAN.md`.
- [x] Crear `TASKS.md` (este archivo).

## Consistencia y ROADMAP

- [x] Validar consistencia entre `DATA_CONTRACT.md`, `MODELING_PRINCIPLES.md`,
      `ROADMAP.md`, `DECISION_REGISTER.md`, `SEMANTIC_BEHAVIOR_MATRIX.md` y F001.
- [x] Actualizar `ROADMAP.md` (F002 fundación COMPLETADA; implementación PENDING).

## Verificación final de archivos protegidos

- [x] Confirmar que `dashboard/` no fue modificado.
- [x] Confirmar que ningún Parquet fue modificado.
- [x] Confirmar ausencia de `.py` en `features/F002-semantic-model-foundation/`.
- [x] Confirmar ausencia de `.py` en `features/F001-data-quality-audit/`.
- [x] Confirmar que el código de auditoría permanece en `src/audits/audit_data_quality.py`.
- [x] Confirmar que no se crearon relaciones, medidas, columnas calculadas, tablas
      auxiliares ni parámetros.
- [x] Confirmar que FASE 2 no fue iniciada.

## Validación D002 (post-fundación)

- [x] Validación read-only de D002 realizada sobre los Parquet del Semantic Model
      (`fact_ingresantes_dashboard`, `fact_matriculados_dashboard` y dimensiones).
- [x] `SUM()` registrado como **CONFIRMED (parcial) — técnico**: aditivo y consistente
      sobre los conteos almacenados; sin duplicados de la clave completa; buckets
      SEXO/RANGO_EDAD estructuralmente disjuntos; consistencia jerárquica en los niveles
      evaluados.
- [x] Semántica de negocio permanece **PENDING**: unidad de negocio (persona vs
      registro/matrícula), posible doble conteo S1/S2, interpretación de
      "Año completo = S1 + S2" y tratamiento de `RANGO_EDAD = "Sin dato"`.
- [x] Confirmar que **NO** se utilizó Gold/Silver y que **NO** se requirió pipeline.
- [x] Confirmar que **NO** se implementaron medidas ni `Año completo = S1 + S2`.

## Gate de salida de F002

- [x] Fundación documental de F002 COMPLETADA (estructura mínima + artefactos).
- [x] Presentar reporte final y esperar aprobación explícita.