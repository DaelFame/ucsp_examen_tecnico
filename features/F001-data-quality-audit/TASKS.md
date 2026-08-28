# F001 — Data Quality Audit — TASKS

| Campo | Valor |
| ----- | ----- |
| Feature | F001 |
| Fase | FASE 1 |
| Formato | Checklist `[ ]` pendiente / `[x]` completada |

## Reorganización de código (post-F001)

- [x] Mover `audit_data_quality.py` a `src/audits/audit_data_quality.py`.
- [x] Crear `src/audits/__init__.py` (paquete consistente con `src/`).
- [x] Eliminar el script de `features/F001-data-quality-audit/` (sin duplicados).
- [x] Actualizar referencias documentales al script (SPEC, PLAN, DATA_CONTRACT, reporte).
- [x] Documentar decisiones pendientes de FASE 2 (geográfica, temporal, granularidad).

## Preparación

- [x] Inspeccionar repositorio y confirmar ausencia de `features/`.
- [x] Confirmar existencia de los 7 Parquet en `data/Dashboard_parquet/`.
- [x] Ajustar `spec/DATA_CONTRACT.md` (`Conteo_*` → "Métrica fuente").
- [x] Ajustar `spec/MODELING_PRINCIPLES.md` (Display Folders + estrategia HTML).
- [x] Crear `features/` y `features/F001-data-quality-audit/`.

## Documentación de la feature

- [x] Crear `FEATURE_SPEC.md`.
- [x] Crear `PLAN.md`.
- [x] Crear `TASKS.md` (este archivo).

## Script de auditoría

- [x] Crear `src/audits/audit_data_quality.py` (solo lectura).
- [x] Implementar inventario de datasets.
- [x] Implementar lectura de schema.
- [x] Implementar unicidad de SK.
- [x] Implementar análisis de nulos.
- [x] Implementar integridad FK → SK.
- [x] Implementar detección de huérfanos.
- [x] Implementar dominios categóricos.
- [x] Implementar validación de UCSP.
- [x] Implementar cobertura temporal.
- [x] Implementar inspección de métricas fuente.

## Ejecución

- [x] Ejecutar `src/audits/audit_data_quality.py`.
- [x] Revisar salida de ejecución (2 intentos fallidos corregidos; ver DATA_QUALITY_REPORT §12).
- [x] Re-ejecutar el script desde su nueva ubicación (`src/audits/`) y confirmar resultados idénticos.

## Reporte

- [x] Generar `DATA_QUALITY_REPORT.md`.
- [x] Actualizar `DATA_CONTRACT.md` con evidencia objetiva.
- [x] Verificar consistencia final (constitución, spec, feature).

## Verificación final

- [x] Confirmar que `dashboard/` no fue modificado.
- [x] Confirmar que ningún Parquet fue modificado.
- [x] Ejecutar diff del repositorio.
- [x] Presentar F001 COMPLETION REPORT.