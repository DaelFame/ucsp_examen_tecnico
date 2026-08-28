# F003 — Semantic Measures Foundation — PLAN (actualizado)

| Campo | Valor |
| ----- | ----- |
| Feature | F003 |
| Fase | FASE 3 — implementación (prevista por bloques) |
| Modo | Plan de implementación |
| Estado | **En revisión — NO ejecutar hasta aprobación explícita** |

## 1. Declaración

**Este PLAN NO se ejecuta todavía.** La implementación (creación de la tabla `Medidas` y
de las medidas) solo procede tras la aprobación explícita del usuario. No se modifica
TMDL, PBIR, PBIP, `dashboard/` ni Parquet hasta entonces.

## 2. Arquitectura de ubicación de medidas (aprobada por el usuario)

- Crear una **tabla dedicada de medidas**: `Medidas`.
- La tabla es **técnica/semántica**, destinada exclusivamente a medidas DAX.
- Debe quedar **oculta** para el usuario final (si la arquitectura lo permite).
- **Sin relaciones** con otras tablas.
- **Sin columnas de negocio ni datos**; se implementa como tabla calculada técnica con
  una columna mínima oculta (detalle de sintaxis TMDL se valida en implementación).
- Todas las medidas se cuelgan de la tabla `Medidas`.

## 3. Display Folders definitivos (dentro de `Medidas`)

```text
00 - Base
├── 01 - Ingresantes
├── 02 - Matriculados
└── 99 - QA

01 - P1 - Benchmark
├── 01 - UCSP
├── 02 - Comparación
└── 03 - Variación

02 - P2 - Demanda
├── 01 - Ingresantes
└── 02 - Matriculados
```

- En TMDL, la ruta del `DisplayFolder` usa `\` (p. ej.
  `"01 - P1 - Benchmark\01 - UCSP"`).
- Los IDs documentales M01–M14 / V01–V03 **no forman parte del nombre visible**; quedan
  solo como trazabilidad documental.

## 4. Separación conceptual

```
MEDIDA BASE
    ↓
MEDIDA DERIVADA
    ↓
VISUAL
```

- **Base:** `[Total Ingresantes]`, `[Total Matriculados]`.
- **Derivada:** `[Variación % Ingresantes YoY]` (← base), rankings (← base).
- **No se crean medidas monolíticas** que mezclen agregación, ranking y presentación.

## 5. `dim_periodo` — validación para variación temporal (V01/V03)

- `dim_periodo` **NO tiene columna `Date`**; solo: `ANIO` (int), `SEMESTRE` (float; 6
  nulos = períodos ANUALES), `LABEL_PERIODO` (str), `TIPO_PERIODO` (ANUAL/SEMESTRAL).
- **No usar time-intelligence clásico** (PREVIOUSYEAR/SAMEPERIODLASTYEAR) sin una tabla de
  fechas. La lógica usa **aritmética sobre `ANIO`/`SEMESTRE`**.
- La lógica respeta `SEMANTIC_BEHAVIOR_MATRIX`: ingresantes solo anual; matriculados solo
  semestral; nunca fabricar semestres de ingresantes; no interpretar `S1+S2` como personas.

## 6. BLOQUE 1 — Base (`00 - Base`)

| Nombre visible | ID | Propósito | Fuente | DAX propuesto | Display Folder | Estado | Criterio QA |
| -------------- | -- | --------- | ------ | ------------- | -------------- | ------ | ----------- |
| Total Ingresantes | M01 | Total ingresantes (conteo almacenado) | fact_ingresantes[Conteo_Ingresantes] | `SUM('fact_ingresantes_dashboard'[Conteo_Ingresantes])` | `00 - Base\01 - Ingresantes` | IMPLEMENTABLE | SUM = 3,119,994; filas = 166,666 |
| Total Matriculados | M02 | Total matriculados (conteo, nivel semestre) | fact_matriculados[Conteo_Matriculados] | `SUM('fact_matriculados_dashboard'[Conteo_Matriculados])` | `00 - Base\02 - Matriculados` | IMPLEMENTABLE | SUM = 17,361,782; filas = 450,448 |
| QA – Filas Ingresantes | M14a | Control QA | fact_ingresantes | `COUNTROWS('fact_ingresantes_dashboard')` | `00 - Base\99 - QA` | IMPLEMENTABLE | = 166,666 |
| QA – SUM Ingresantes | M14b | Control QA | fact_ingresantes[Conteo_Ingresantes] | `SUM('fact_ingresantes_dashboard'[Conteo_Ingresantes])` | `00 - Base\99 - QA` | IMPLEMENTABLE | = 3,119,994 |
| QA – Filas Matriculados | M14c | Control QA | fact_matriculados | `COUNTROWS('fact_matriculados_dashboard')` | `00 - Base\99 - QA` | IMPLEMENTABLE | = 450,448 |
| QA – SUM Matriculados | M14d | Control QA | fact_matriculados[Conteo_Matriculados] | `SUM('fact_matriculados_dashboard'[Conteo_Matriculados])` | `00 - Base\99 - QA` | IMPLEMENTABLE | = 17,361,782 |

## 7. BLOQUE 2 — P1 Benchmark (`01 - P1 - Benchmark`)

| Nombre visible | ID | Propósito | Fuente | DAX propuesto | Display Folder | Estado | Criterio QA |
| -------------- | -- | --------- | ------ | ------------- | -------------- | ------ | ----------- |
| Total Ingresantes UCSP | M04 | Ingresantes UCSP | fact_ingresantes + dim_universidad | `CALCULATE([Total Ingresantes], 'dim_universidad'[CODIGO_INEI] = "260000062")` | `01 - P1 - Benchmark\01 - UCSP` | IMPLEMENTABLE | = filtrar SK_Universidad=115 |
| Total Matriculados UCSP | M05 | Matriculados UCSP (semestre) | fact_matriculados + dim_universidad | `CALCULATE([Total Matriculados], 'dim_universidad'[CODIGO_INEI] = "260000062")` | `01 - P1 - Benchmark\01 - UCSP` | IMPLEMENTABLE | = filtrar SK_Universidad=115 |
| Ingresantes Año Anterior *(oculta)* | V01h | Helper YoY | fact_ingresantes + dim_periodo | `CALCULATE([Total Ingresantes], 'dim_periodo'[ANIO] = MAX('dim_periodo'[ANIO]) - 1)` | `01 - P1 - Benchmark\03 - Variación` | IMPLEMENTABLE | 2020 → BLANK |
| Variación % Ingresantes YoY | V01 | Variación anual | — | `DIVIDE([Total Ingresantes] - [Ingresantes Año Anterior], [Ingresantes Año Anterior])` | `01 - P1 - Benchmark\03 - Variación` | IMPLEMENTABLE | verificable por año; 2020 BLANK |
| Total Matriculados Semestre Anterior *(oculta)* | V03h | Helper variación semestral | fact_matriculados + dim_periodo | `CALCULATE([Total Matriculados], 'dim_periodo'[ANIO] = MAX('dim_periodo'[ANIO]) - IF(MAX('dim_periodo'[SEMESTRE])=1,1,0), 'dim_periodo'[SEMESTRE] = IF(MAX('dim_periodo'[SEMESTRE])=1,2,MAX('dim_periodo'[SEMESTRE])-1))` | `01 - P1 - Benchmark\03 - Variación` | IMPLEMENTABLE | 2020-S1 → BLANK |
| Variación % Matriculados (Semestre) | V03 | Variación semestre a semestre | — | `DIVIDE([Total Matriculados] - [Total Matriculados Semestre Anterior], [Total Matriculados Semestre Anterior])` | `01 - P1 - Benchmark\03 - Variación` | IMPLEMENTABLE | solo contexto semestre |

**No se implementan M06/M07** (universo/región pendiente).

## 8. BLOQUE 3 — P2 Demanda — Revisión del diseño DAX de rankings

Análisis previo a implementar M08–M11 (no se ejecuta automáticamente el TOPN/RANKX
anterior):

- **Medida base:** `[Total Ingresantes]` (M08/M09) y `[Total Matriculados]` (M10/M11).
- **Contexto de año (ingresantes):** `dim_periodo[ANIO]` vía relación FK_Periodo →
  SK_Periodo; se conserva.
- **Contexto de año × semestre (matriculados):** `dim_periodo[ANIO]` + `dim_periodo[SEMESTRE]`; se conserva.
- **Eliminar SOLO el filtro de programa:** `ALLSELECTED('dim_programa'[SK_Programa])` —
  quita el filtro de programa respetando las selecciones del usuario (slicer de programa).
- **Conservar el resto de filtros** (año, semestre, departamento, gestión, otros): la
  eliminación se limita a la columna de programa; no se usan `ALL()` globales.
- **Rango por fila (para tabla/gráfico):**
  `Rango = RANKX(ALLSELECTED('dim_programa'[SK_Programa]), [Base], , DESC, Dense)` (bottom: ASC).
- **Top N total (para tarjeta):**
  `TopN = CALCULATE([Base], TOPN(5, ALLSELECTED('dim_programa'[SK_Programa]), [Base], DESC))` (bottom: ASC).
- **Empates:** `Dense` asigna el mismo rango a valores iguales; `TOPN` incluye todos los
  empatados en el corte (puede superar 5); se documenta este comportamiento.
- **BLANK / 0:** los programas sin datos en el contexto evalúan BLANK; se excluyen del
  ranking (filtro `ISBLANK`/`>0` en el visual o en QA). El rango de BLANK queda al final en
  orden DESC.
- **Uso:** tabla (columna Rango + filtro `<=5` o Top N nativo), gráfico de barras (Top N),
  tarjeta (medida TopN).

| Nombre visible | ID | Fuente | DAX propuesto (rango + topn) | Display Folder | Estado | Criterio QA |
| -------------- | -- | ------ | ---------------------------- | -------------- | ------ | ----------- |
| Top 5 Programas por Ingresantes | M08 | fact_ingresantes | `Rango DESC` + `CALCULATE([Total Ingresantes], TOPN(5, ALLSELECTED('dim_programa'[SK_Programa]), [Total Ingresantes], DESC))` | `02 - P2 - Demanda\01 - Ingresantes` | IMPLEMENTABLE | 5 mayores por año; sin filtros externos removidos |
| Bottom 5 Programas por Ingresantes | M09 | fact_ingresantes | `Rango ASC` + `CALCULATE(..., TOPN(5, ALLSELECTED(...), [Total Ingresantes], ASC))` | `02 - P2 - Demanda\01 - Ingresantes` | IMPLEMENTABLE | 5 menores por año |
| Top 5 Programas por Matriculados | M10 | fact_matriculados | `Rango DESC` + `CALCULATE([Total Matriculados], TOPN(5, ALLSELECTED(...), [Total Matriculados], DESC))` | `02 - P2 - Demanda\02 - Matriculados` | IMPLEMENTABLE | 5 mayores por año×semestre |
| Bottom 5 Programas por Matriculados | M11 | fact_matriculados | `Rango ASC` + `CALCULATE(..., TOPN(5, ALLSELECTED(...), [Total Matriculados], ASC))` | `02 - P2 - Demanda\02 - Matriculados` | IMPLEMENTABLE | 5 menores por año×semestre |

## 9. BLOQUE 4 — Medidas que permanecen BLOQUEADAS (NO crear)

- M03 (Año completo matriculados) — D002 semántico.
- M12 (Top/Bottom matriculados por año) — D002 semántico.
- V02 (Variación % Matriculados YoY año) — D002 semántico.
- M06 (benchmark regional) — universo/región pendiente.
- M07 (benchmark nacional) — universo/alcance académico pendiente.
- M13 (variantes Pregrado) — D005 PENDIENTE.

**`S1 + S2` NO se interpreta como personas únicas.**

## 10. QA y control por bloque

1. **Backup** del `SemanticModel/definition` (TMDL) en temp antes de cada bloque.
2. Implementar **únicamente** las medidas aprobadas del bloque (tabla `Medidas` + folder).
3. Validar **DAX** (sintaxis; sin time-intelligence no soportado).
4. Validar **resultados contra el hecho/Parquet** (valores esperados por lectura read-only).
5. Validar **contexto de filtros** (UCSP, año, semestre, departamento, gestión).
6. Validar **relaciones** (que la tabla `Medidas` no tenga relaciones; las 9 existentes intactas).
7. Registrar resultado.
8. Confirmar que **ninguna medida condicionada fue creada**.

## 11. Documentación

- Se creará `features/F003-semantic-measures-foundation/IMPLEMENTATION_LOG.md` durante la
  implementación, registrando por medida: ID documental, nombre visible, tabla `Medidas`,
  Display Folder, DAX final, propósito, pregunta que responde, dependencias, fecha de
  implementación, resultado QA y estado. También las medidas **no implementadas** y la razón.

## 12. Estrategia de rollback

- **Backup previo** del TMDL antes de cada bloque.
- Si una medida falla QA, **eliminarla** y documentar la causa.
- Nunca implementar medidas condicionadas/bloqueadas sin resolver su decisión.

## 13. Criterios para GATE 3

- Medidas base correctas y trazables a requisitos.
- Sin medidas condicionadas/bloqueadas implementadas.
- Validación QA superada.
- Sin contradicciones con la MATRIX ni con DATA_CONTRACT.
- Semántica de negocio (D002) y Pregrado (D005) no inventadas.