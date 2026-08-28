# F001 — Data Quality Audit — FEATURE SPEC

| Campo | Valor |
| ----- | ----- |
| Proyecto | demanda_UCSP |
| Feature ID | F001 |
| Nombre | Data Quality Audit |
| Fase | FASE 1 |
| Quality Gate | GATE 1 — Data Quality |
| Estado | Completada (GATE 1: PASS WITH WARNINGS) |

## 1. Objetivo

Auditar programáticamente, en modo estrictamente de **solo lectura**, los 7 archivos
Parquet del proyecto y validar el contrato de datos antes de cualquier modelado.

## 2. Contexto

El Semantic Model TMDL define 7 tablas (5 dimensiones, 2 hechos) cuyas particiones
apuntan a Parquet en `data/Dashboard_parquet/`. El contrato de datos (`DATA_CONTRACT.md`)
marca múltiples elementos como `[POR VALIDAR]` (unicidad de SK, integridad FK,
cardinalidad, nulos, huérfanos, granularidad, cobertura temporal). Esta feature resuelve
esos estados con evidencia objetiva, sin modificar ninguna fuente.

## 3. Alcance

- Inventario completo de los 7 Parquet (filas, columnas, tipos).
- Validación de SK de las 5 dimensiones.
- Validación de FK de los 2 hechos (integridad referencial contra SK).
- Validación de la universidad UCSP (`UNIVERSIDAD CATÓLICA SAN PABLO`).
- Dominios categóricos relevantes (`TIPO_GESTION`, `Region_Sur`, `NIVEL_ACADEMICO`).
- Cobertura temporal (`dim_periodo` vs hechos).
- Inspección de métricas fuente (`Conteo_Ingresantes`, `Conteo_Matriculados`).
- Generación de `DATA_QUALITY_REPORT.md` y actualización justificada de
  `DATA_CONTRACT.md`.

## 4. Fuera de alcance

- Modificar Parquet, TMDL, PBIR, PBIP o el Semantic Model.
- Crear medidas DAX, relaciones, tablas o columnas.
- Corregir valores fuente o transformar permanentemente los datasets.
- Construcción del modelo (FASE 2).
- Determinación de la semántica de agregación (SUM/COUNT/AVG) sin análisis de
  granularidad.

## 5. Datasets involucrados

| Dataset | Rol |
| ------- | --- |
| dim_local.parquet | Dimensión |
| dim_periodo.parquet | Dimensión |
| dim_programa.parquet | Dimensión |
| dim_ubicacion.parquet | Dimensión |
| dim_universidad.parquet | Dimensión |
| fact_ingresantes_dashboard.parquet | Hecho |
| fact_matriculados_dashboard.parquet | Hecho |

## 6. Reglas de validación

1. **No asumir** nombres de columnas, tipos ni relaciones: inspeccionar el schema real
   de cada Parquet.
2. Identificar columnas SK por convención (`SK_*`) y FK (`FK_*`) tras inspeccionar el
   schema.
3. Cada relación FK → SK se valida únicamente cuando el schema lo permita.
4. No convertir automáticamente valores observados en dominio contractual.
5. No corregir variantes de texto (UCSP, TIPO_GESTION, etc.).
6. La semántica de agregación de las métricas fuente permanece `[POR VALIDAR]` si la
   auditoría no permite determinarla con seguridad.

## 7. Entradas

- Parquet en `D:\Proyectos\A.Prueba Tecnica UCSP\data\Dashboard_parquet\`.
- `spec/DATA_CONTRACT.md` (estados actuales).
- `spec/TECH_STACK.md` (entorno Python).

## 8. Salidas

- Código de implementación: `src/audits/audit_data_quality.py` (script de solo lectura,
  reproducible).
- Evidencia: `audit_output.json` (en `features/F001-data-quality-audit/`).
- Reporte: `features/F001-data-quality-audit/DATA_QUALITY_REPORT.md`.
- `DATA_CONTRACT.md` actualizado (solo con evidencia objetiva).

## 9. Criterios de aceptación

1. El script (`src/audits/audit_data_quality.py`) es de solo lectura y reproducible
   desde la raíz del proyecto.
2. Se reporta inventario, schema, SK, FK, nulos, huérfanos, dominios, cobertura
   temporal y métricas fuente.
3. Cada conclusión del reporte está respaldada por resultados de ejecución
   (evidencia en `audit_output.json`).
4. `DATA_CONTRACT.md` se actualiza únicamente donde la evidencia lo permite, sin
   conversiones automáticas de `[POR VALIDAR]`.

## 10. Quality Gate

**GATE 1 — Data Quality**: PASS / PASS WITH WARNINGS / FAIL según los resultados.
Si FAIL: DETENER → DOCUMENTAR → ANALIZAR → PROPONER FIX → ESPERAR CONFIRMACIÓN.