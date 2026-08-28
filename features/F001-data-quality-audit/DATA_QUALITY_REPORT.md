# F001 — Data Quality Report

| Campo | Valor |
| ----- | ----- |
| Proyecto | demanda_UCSP |
| Feature | F001 — Data Quality Audit |
| Fase | FASE 1 |
| Script | `src/audits/audit_data_quality.py` (solo lectura) |
| Fuente de datos | `data/Dashboard_parquet/` |
| Ejecución | Última ejecución exitosa (2 correcciones previas registradas en §12) |
| Re-ejecución | Post-reorganización desde `src/audits/audit_data_quality.py`: resultados idénticos a F001 |

## 1. Executive Summary

**Resultado: PASS WITH WARNINGS**

La integridad referencial es **perfecta**: todas las SK son únicas y sin nulos, y todas
las FK de ambos hechos tienen 100% de validez y 0 huérfanos. Sin embargo, existen
**advertencias** que deben resolverse antes del modelado:

1. Desajuste de tipos entre Parquet y TMDL: SK/FK son `uint32` en Parquet vs `int64`
   declarado en TMDL; `SEMESTRE` es `float64` con 33.33% de nulos vs `int64` en TMDL.
2. `dim_periodo.SEMESTRE` tiene 6 nulos de 18 (períodos anuales sin semestre).
3. `TIPO_GESTION` usa valores `PRIVADO` / `PUBLICO` (no `Privada`/`Pública`).
4. `NIVEL_ACADEMICO` no contiene el literal "Pregrado"; la equivalencia
   Pregrado ↔ `CARRERA PROFESIONAL` es una decisión pendiente.
5. La UCSP está registrada como `UNIVERSIDAD CATOLICA SAN PABLO` (sin tilde en "Ó").
6. Hechos con distinta granularidad temporal aparente: ingresantes usa períodos
   anuales (6), matriculados usa períodos semestrales (12).

## 2. Dataset Inventory

| Dataset | Filas | Columnas | Columnas | Tipos |
| ------- | ----- | -------- | -------- | ----- |
| dim_local.parquet | 65 | 7 | SK_Local(uint32), CODIGO_LOCAL(str), DEPARTAMENTO_LOCAL(str), PROVINCIA_LOCAL(str), DISTRITO_LOCAL(str), ES_LOCAL_PRINCIPAL(str), CODIGO_UBIGEO_INEI_LOCAL(int64) | |
| dim_periodo.parquet | 18 | 5 | SK_Periodo(uint32), ANIO(int64), SEMESTRE(float64), LABEL_PERIODO(str), TIPO_PERIODO(str) | |
| dim_programa.parquet | 537 | 8 | SK_Programa(uint32), CODIGO_SIU_PROGRAMA(int64), NOMBRE_PROGRAMA(str), CODIGO_GRUPO_1(float64), NOMBRE_GRUPO_1(str), CODIGO_GRUPO_3(float64), NOMBRE_GRUPO_3(str), NIVEL_ACADEMICO(str) | |
| dim_ubicacion.parquet | 98 | 4 | SK_Ubicacion(uint32), DEPARTAMENTO(str), PROVINCIA(str), Region_Sur(bool) | |
| dim_universidad.parquet | 177 | 7 | SK_Universidad(uint32), CODIGO_INEI(str), NOMBRE_ENTIDAD(str), TIPO_ENTIDAD(str), TIPO_GESTION(str), TIPO_CONSTITUCION(str), ESTADO_LICENCIAMIENTO(str) | |
| fact_ingresantes_dashboard.parquet | 166666 | 7 | FK_Universidad(uint32), FK_Programa(uint32), FK_Periodo(uint32), FK_Ubicacion(uint32), SEXO(str), RANGO_EDAD(str), Conteo_Ingresantes(uint32) | |
| fact_matriculados_dashboard.parquet | 450448 | 8 | FK_Universidad(uint32), FK_Programa(uint32), FK_Periodo(uint32), FK_Ubicacion(uint32), FK_Local(uint32), SEXO(str), RANGO_EDAD(str), Conteo_Matriculados(uint32) | |

- Total de filas: dimensiones 895; hechos 617,114.
- 7/7 archivos esperados presentes; 0 archivos inesperados; 0 faltantes.

## 3. Schema Findings

| Dataset | Columna | Tipo Parquet | Tipo TMDL | Estado |
| ------- | ------- | ------------ | --------- | ------ |
| Todas las dimensiones | SK_* | uint32 | int64 | DESAJUSTE |
| Ambos hechos | FK_* | uint32 | int64 | DESAJUSTE |
| dim_periodo | SEMESTRE | float64 (6 nulos) | int64 | DESAJUSTE + nulos |
| dim_programa | CODIGO_GRUPO_1 / CODIGO_GRUPO_3 | float64 | double | Consistente |
| dim_local | CODIGO_UBIGEO_INEI_LOCAL | int64 | int64 | Consistente |
| Resto de columnas | — | str | string | Consistente |

**Advertencia:** los tipos `uint32` (SK/FK) y `float64` (SEMESTRE) difieren de las
declaraciones TMDL (`int64`). Power BI puede manejar la conversión implícita, pero la
decisión de alinear los TMDL con los tipos reales es una **decisión pendiente** de
modelado (no se resuelve en F001).

## 4. Primary Key / SK Findings

| Dimensión | SK | Total | SK NULL | Únicos | Duplicados | Estado |
| --------- | -- | ----- | ------- | ------ | ---------- | ------ |
| dim_local | SK_Local | 65 | 0 | 65 | 0 | OK |
| dim_periodo | SK_Periodo | 18 | 0 | 18 | 0 | OK |
| dim_programa | SK_Programa | 537 | 0 | 537 | 0 | OK |
| dim_ubicacion | SK_Ubicacion | 98 | 0 | 98 | 0 | OK |
| dim_universidad | SK_Universidad | 177 | 0 | 177 | 0 | OK |

Todas las SK son **únicas, sin nulos y sin duplicados** → válidas como claves
candidatas (PK) para las relaciones.

## 5. Foreign Key / Referential Integrity Findings

### fact_ingresantes_dashboard (166,666 filas)

| FK | Dimensión destino | FK NULL | Válida | Huérfana | Integridad |
| -- | ----------------- | ------- | ------ | -------- | ---------- |
| FK_Universidad | dim_universidad.SK_Universidad | 0 | 166666 | 0 | 100% |
| FK_Programa | dim_programa.SK_Programa | 0 | 166666 | 0 | 100% |
| FK_Periodo | dim_periodo.SK_Periodo | 0 | 166666 | 0 | 100% |
| FK_Ubicacion | dim_ubicacion.SK_Ubicacion | 0 | 166666 | 0 | 100% |

### fact_matriculados_dashboard (450,448 filas)

| FK | Dimensión destino | FK NULL | Válida | Huérfana | Integridad |
| -- | ----------------- | ------- | ------ | -------- | ---------- |
| FK_Universidad | dim_universidad.SK_Universidad | 0 | 450448 | 0 | 100% |
| FK_Programa | dim_programa.SK_Programa | 0 | 450448 | 0 | 100% |
| FK_Periodo | dim_periodo.SK_Periodo | 0 | 450448 | 0 | 100% |
| FK_Ubicacion | dim_ubicacion.SK_Ubicacion | 0 | 450448 | 0 | 100% |
| FK_Local | dim_local.SK_Local | 0 | 450448 | 0 | 100% |

**Integridad referencial completa: 0 huérfanos, 0 nulos, 100% de validez** en las 9
relaciones FK → SK. Evidencia suficiente para cardinalidad **muchos-a-uno** (1:N).

## 6. Null Findings

- **Única columna con nulos:** `dim_periodo.SEMESTRE` → 6 nulos / 18 filas (33.33%).
- Todas las demás columnas de dimensiones y hechos: **0 nulos**.
- Interpretación observada: las 6 filas sin semestre corresponden a períodos anuales
  (una fila por año sin desglose semestral). Confirmar con `LABEL_PERIODO`/`TIPO_PERIODO`.

## 7. UCSP University Validation

Búsqueda sobre `dim_universidad[NOMBRE_ENTIDAD]` (177 entidades):

| Métrica | Resultado |
| ------- | --------- |
| Coincidencia exacta (`UNIVERSIDAD CATÓLICA SAN PABLO`) | 0 |
| Coincidencia insensible a mayúsculas/minúsculas | 0 |
| Coincidencia normalizada (sin tildes, mayúsculas, sin espacios externos) | 1 |
| Coincidencia en mayúsculas completas | 1 |

**Hallazgo:** la UCSP está presente como **`UNIVERSIDAD CATOLICA SAN PABLO`**
(sin tilde en la "Ó"). No se detectaron otras variantes de la UCSP. La normalización de
ese string para identificarla es una **decisión pendiente** (no se corrige en F001).

## 8. Categorical Domain Findings

### TIPO_GESTION (dim_universidad, 177)

| Valor | Cantidad | % |
| ----- | -------- | -- |
| PRIVADO | 90 | 50.85% |
| PUBLICO | 87 | 49.15% |
| NULL | 0 | 0% |

**Hallazgo:** los valores son `PRIVADO`/`PUBLICO`. El filtro obligatorio del enunciado
es "privada / pública". No se convierte automáticamente al dominio contractual; el
mapeo es **decisión pendiente** de modelado.

### Region_Sur (dim_ubicacion, 98)

| Valor | Cantidad | % |
| ----- | -------- | -- |
| False | 75 | 76.53% |
| True | 23 | 23.47% |
| NULL | 0 | 0% |

Sin nulos. 23 registros marcados como sur. La definición de "Nivel sur" queda validada
como disponible, pero su interpretación de negocio se confirma en modelado.

### NIVEL_ACADEMICO (dim_programa, 537)

| Valor | Cantidad | % |
| ----- | -------- | -- |
| MAESTRIA | 249 | 46.37% |
| CARRERA PROFESIONAL | 131 | 24.39% |
| SEGUNDA ESPECIALIDAD | 125 | 23.28% |
| DOCTORADO | 32 | 5.96% |
| NULL | 0 | 0% |

- No existe el literal "Pregrado" (`pregrado_presence = false`, `pregrado_count = 0`).
- El filtro del enunciado exige "Programa Profesional de Pregrado". La equivalencia
  **Pregrado ↔ `CARRERA PROFESIONAL`** es una **decisión pendiente** (no se asume en F001).

## 9. Temporal Coverage

### dim_periodo (18 filas)

- Años: 2020, 2021, 2022, 2023, 2024, 2025.
- Semestres observados: 1, 2 (en 12 filas); 6 filas sin semestre (anuales).
- Períodos (año, semestre): 2020-1..2025-2 (12 combinaciones) + 6 anuales.

### fact_ingresantes_dashboard

- 6 claves de período distintas; años 2020-2025.
- Claves de período en dimensión ausentes en el hecho: 12 (las semestrales).
- Claves de período en hecho ausentes en dimensión: 0.

### fact_matriculados_dashboard

- 12 claves de período distintas; años 2020-2025.
- Claves de período en dimensión ausentes en el hecho: 6 (las anuales).
- Claves de período en hecho ausentes en dimensión: 0.

**Hallazgo:** aparente diferencia de granularidad temporal: ingresantes con períodos
anuales (6) y matriculados con períodos semestrales (12). Sin huérfanos en ningún
sentido. Validar contra `LABEL_PERIODO` en modelado.

## 10. Metric Findings

### Conteo_Ingresantes

| Métrica | Valor |
| ------- | ----- |
| dtype | uint32 |
| NULL | 0 (0%) |
| Mínimo | 1 |
| Máximo | 2255 |
| Ceros | 0 |
| Negativos | 0 |
| Cardinalidad | 715 |
| Filas = 1 | 35,381 (21.23%) |
| ¿Todas las filas = 1? | No |

### Conteo_Matriculados

| Métrica | Valor |
| ------- | ----- |
| dtype | uint32 |
| NULL | 0 (0%) |
| Mínimo | 1 |
| Máximo | 3460 |
| Ceros | 0 |
| Negativos | 0 |
| Cardinalidad | 1631 |
| Filas = 1 | 82,983 (18.42%) |
| ¿Todas las filas = 1? | No |

**Conclusión:** las métricas no son indicadores "1 por fila" (solo ~21% y ~18% de filas
valen 1). Los valores > 1 sugieren **conteos pre-agregados**. No se determina aquí
SUM/COUNT/AVG: la **semántica de agregación permanece [POR VALIDAR]**, sujeta a validación
de granularidad en modelado.

## 11. Anomalies

| # | Anomalía | Severidad |
| - | -------- | --------- |
| A1 | Desajuste de tipos SK/FK (`uint32` vs TMDL `int64`) | Media |
| A2 | `SEMESTRE` `float64` con 6 nulos (TMDL `int64`) | Media |
| A3 | `TIPO_GESTION` `PRIVADO`/`PUBLICO` vs dominio esperado privada/pública | Media |
| A4 | Ausencia de literal "Pregrado" en `NIVEL_ACADEMICO` | Media |
| A5 | UCSP sin tilde: `UNIVERSIDAD CATOLICA SAN PABLO` | Baja |
| A6 | Diferencia de granularidad temporal ingresantes (anual) vs matriculados (semestral) | Media |

No se detectaron duplicados de SK, FK huérfanas, nulos en claves ni valores negativos
en métricas.

## 12. Risks

- **R1 — Tipos de datos:** cargar en Power BI con conversión implícita puede ocultar
  diferencias; alinear TMDL a tipos reales antes de FASE 2.
- **R2 — SEMESTRE nulos:** los períodos anuales sin semestre deben manejarse
  explícitamente (decisión de modelado).
- **R3 — Dominios categóricos:** `TIPO_GESTION` y `NIVEL_ACADEMICO` requieren mapeo a
  dominio contractual (privada/pública; Pregrado) antes de construir filtros.
- **R4 — UCSP:** identificar por string normalizado evita falsos negativos en el
  benchmark.
- **R5 — Granularidad temporal desigual:** comparar ingresantes (anual) y matriculados
  (semestral) requiere nivel temporal compatible.

## 13. Recommendations

1. **FASE 2:** alinear tipos TMDL con el schema real (`uint32` → int64 convertible;
   `SEMESTRE` float64/int64 según decisión).
2. Definir regla de negocio para el mapeo `TIPO_GESTION`: `PRIVADO`→Privada,
   `PUBLICO`→Pública (decisión de diseño, no corrección de datos).
3. Definir mapeo Pregrado ↔ `CARRERA PROFESIONAL` para el filtro del enunciado.
4. Identificar UCSP mediante valor normalizado (`UNIVERSIDAD CATOLICA SAN PABLO`).
5. Definir nivel temporal de comparación (anual vs semestral) para las preguntas
   obligatorias.
6. Mantener la semántica de agregación de las métricas como `[POR VALIDAR]` hasta
   validar granularidad.

## 14. Quality Gate Decision

**GATE 1 — Data Quality: PASS WITH WARNINGS**

- Base sólida para modelar: SK únicas, FK 100% íntegras, sin nulos en claves ni
  métricas, sin huérfanos.
- Advertencias (tipos, dominios, UCSP, granularidad temporal) no bloquean el inicio de
  FASE 2, pero **deben resolverse como decisiones de diseño antes de crear relaciones y
  medidas**.
- Semántica de agregación de métricas: **permanece [POR VALIDAR]** (no determinada por
  esta auditoría).

---
### Incidencias de ejecución (registradas)

| Intento | Resultado | Causa | Acción |
| ------- | --------- | ----- | ------ |
| 1 | Fallo | `IntCastingNaNError` en `SEMESTRE.astype("int64")` (columna con nulos, tipo real float64) | Corregido script: manejo nulo-seguro con `pd.to_numeric` + `dropna`. |
| 2 | Fallo | `Object of type Series is not JSON serializable` (bug `valid / non_null` en integridad FK) | Corregido script: `valid / len(non_null)`. |
| 3 | Éxito | — | Resultado de esta auditoría. |

Ningún Parquet, dashboard, MCP ni Power BI fue modificado durante la auditoría.