# F003 — Semantic Measures Foundation — IMPLEMENTATION LOG

| Campo | Valor |
| ----- | ----- |
| Feature | F003 |
| Fase | FASE 3 (implementación de Bloques 1–3) |
| Fecha de implementación | 2026-08-28 |
| Tabla de medidas | `Medidas` (oculta, sin relaciones, 1 columna técnica `_Medidas`) |
| Resultado | Bloques 1–3 implementados y validados; pendientes no implementados |

## 1. Resumen

Se implementaron **18 medidas** en la tabla dedicada `Medidas`, organizadas por Display
Folders según las preguntas reales de MISSION (Base / P1 Benchmark / P2 Demanda / QA).
Medidas auxiliares (`Ingresantes Año Anterior`, `Total Matriculados Semestre Anterior`)
quedaron ocultas. No se crearon medidas condicionadas ni bloqueadas. No se implementó
HTML.

## 2. Medidas implementadas

| ID | Nombre visible | Tabla | Display Folder | DAX final | Propósito | Pregunta | Dependencia | QA | Resultado | Estado |
| -- | -------------- | ----- | -------------- | --------- | --------- | -------- | ----------- | --- | --------- | ------ |
| M01 | Total Ingresantes | Medidas | `00 - Base\01 - Ingresantes` | `SUM('fact_ingresantes_dashboard'[Conteo_Ingresantes])` | Total de ingresantes (conteo almacenado) | Base (RD3/R1) | D001, D002(téc), D007 | DAX válido; SUM=3,119,994; filas=166,666 | PASS | Implementada |
| M02 | Total Matriculados | Medidas | `00 - Base\02 - Matriculados` | `SUM('fact_matriculados_dashboard'[Conteo_Matriculados])` | Total de matriculados (conteo, semestre) | Base (RD3/R2) | D001, D002(téc), D007 | DAX válido; SUM=17,361,782; filas=450,448 | PASS | Implementada |
| M14a | QA – Filas Ingresantes | Medidas | `00 - Base\99 - QA` | `COUNTROWS('fact_ingresantes_dashboard')` | Control QA | QA | D001, D002(téc) | =166,666 | PASS | Implementada |
| M14b | QA – SUM Ingresantes | Medidas | `00 - Base\99 - QA` | `SUM('fact_ingresantes_dashboard'[Conteo_Ingresantes])` | Control QA | QA | D001, D002(téc) | =3,119,994 | PASS | Implementada |
| M14c | QA – Filas Matriculados | Medidas | `00 - Base\99 - QA` | `COUNTROWS('fact_matriculados_dashboard')` | Control QA | QA | D001, D002(téc) | =450,448 | PASS | Implementada |
| M14d | QA – SUM Matriculados | Medidas | `00 - Base\99 - QA` | `SUM('fact_matriculados_dashboard'[Conteo_Matriculados])` | Control QA | QA | D001, D002(téc) | =17,361,782 | PASS | Implementada |
| M04 | Total Ingresantes UCSP | Medidas | `01 - P1 - Benchmark\01 - UCSP` | `CALCULATE([Total Ingresantes], 'dim_universidad'[CODIGO_INEI] = "260000062")` | Ingresantes UCSP | P1 (R1/R3) | D001, D002(téc), D005(id UCSP), D007 | =20,415 (SK=115) | PASS | Implementada |
| M05 | Total Matriculados UCSP | Medidas | `01 - P1 - Benchmark\01 - UCSP` | `CALCULATE([Total Matriculados], 'dim_universidad'[CODIGO_INEI] = "260000062")` | Matriculados UCSP (semestre) | P1 (R2/R3) | D001, D002(téc), D005, D007 | =107,412 (SK=115) | PASS | Implementada |
| V01h | Ingresantes Año Anterior *(oculta)* | Medidas | `01 - P1 - Benchmark\03 - Variación` | `CALCULATE([Total Ingresantes], 'dim_periodo'[ANIO] = MAX('dim_periodo'[ANIO]) - 1)` | Helper YoY | P1 | D001, D002(téc), D007 | 2020→BLANK | PASS | Implementada (oculta) |
| V01 | Variación % Ingresantes YoY | Medidas | `01 - P1 - Benchmark\03 - Variación` | `DIVIDE([Total Ingresantes] - [Ingresantes Año Anterior], [Ingresantes Año Anterior])` | Variación anual | P1 (R1) | D001, D002(téc), D007 | valores por año verificados | PASS | Implementada |
| V03h | Total Matriculados Semestre Anterior *(oculta)* | Medidas | `01 - P1 - Benchmark\03 - Variación` | `CALCULATE([Total Matriculados], 'dim_periodo'[ANIO] = MAX('dim_periodo'[ANIO]) - IF(MAX('dim_periodo'[SEMESTRE])=1,1,0), 'dim_periodo'[SEMESTRE] = IF(MAX('dim_periodo'[SEMESTRE])=1,2,MAX('dim_periodo'[SEMESTRE])-1))` | Helper variación semestral | P1 | D001, D002(téc), D007 | 2020-S1→BLANK | PASS | Implementada (oculta) |
| V03 | Variación % Matriculados Semestre | Medidas | `01 - P1 - Benchmark\03 - Variación` | `DIVIDE([Total Matriculados] - [Total Matriculados Semestre Anterior], [Total Matriculados Semestre Anterior])` | Variación semestre a semestre | P1 (R2) | D001, D002(téc), D007 | verificado por semestre | PASS | Implementada |
| — | Rango Programas Ingresantes | Medidas | `02 - P2 - Demanda\01 - Ingresantes` | `RANKX(ALLSELECTED('dim_programa'[SK_Programa]), [Total Ingresantes], , DESC, Dense)` | Rango de programas (apoyo al ranking) | P2 | D001, D002(téc), D007 | DAX válido | PASS | Implementada |
| M08 | Top 5 Programas por Ingresantes | Medidas | `02 - P2 - Demanda\01 - Ingresantes` | `CALCULATE([Total Ingresantes], TOPN(5, ALLSELECTED('dim_programa'[SK_Programa]), [Total Ingresantes], DESC))` | Ranking top-5 por año | P2 (R4) | D001, D002(téc), D007 | top-5 por año (ej. 2024=104,575) | PASS | Implementada |
| M09 | Bottom 5 Programas por Ingresantes | Medidas | `02 - P2 - Demanda\01 - Ingresantes` | `CALCULATE([Total Ingresantes], TOPN(5, ALLSELECTED('dim_programa'[SK_Programa]), [Total Ingresantes], ASC))` | Ranking bottom-5 por año | P2 (R4) | D001, D002(téc), D007 | bottom-5 por año | PASS | Implementada |
| — | Rango Programas Matriculados | Medidas | `02 - P2 - Demanda\02 - Matriculados` | `RANKX(ALLSELECTED('dim_programa'[SK_Programa]), [Total Matriculados], , DESC, Dense)` | Rango de programas (apoyo al ranking) | P2 | D001, D002(téc), D007 | DAX válido | PASS | Implementada |
| M10 | Top 5 Programas por Matriculados | Medidas | `02 - P2 - Demanda\02 - Matriculados` | `CALCULATE([Total Matriculados], TOPN(5, ALLSELECTED('dim_programa'[SK_Programa]), [Total Matriculados], DESC))` | Ranking top-5 por semestre | P2 (R4) | D001, D002(téc), D007 | top-5 por año×semestre | PASS | Implementada |
| M11 | Bottom 5 Programas por Matriculados | Medidas | `02 - P2 - Demanda\02 - Matriculados` | `CALCULATE([Total Matriculados], TOPN(5, ALLSELECTED('dim_programa'[SK_Programa]), [Total Matriculados], ASC))` | Ranking bottom-5 por semestre | P2 (R4) | D001, D002(téc), D007 | bottom-5 por año×semestre | PASS | Implementada |

## 3. Medidas NO implementadas (pendientes) y razón

| ID | Motivo de bloqueo | Estado |
| -- | ----------------- | ------ |
| M03 | "Año completo = S1+S2" NO aprobado como personas únicas (D002 semántico PENDING) | CONDICIONADA |
| M12 | "Año completo" de matriculados PENDING semántico (D002) | CONDICIONADA |
| V02 | Variación % Matriculados YoY (Año) — depende de Año completo (D002) | CONDICIONADA |
| M06 | Universo/región del benchmark pendiente de definir (D004) | CONDICIONADA |
| M07 | Universo nacional + alcance académico pendientes (D005) | CONDICIONADA |
| M13 | Mapeo Pregrado ↔ CARRERA PROFESIONAL pendiente (D005) | BLOQUEADA |

## 4. QA ejecutado

- **BLOQUE 1:** DAX válido; valores vs Parquet: Ingresantes 166,666 / 3,119,994; Matriculados 450,448 / 17,361,782. PASS.
- **BLOQUE 2:** DAX válido; UCSP Ingresantes=20,415, UCSP Matriculados=107,412; YoY y semestre anterior verificados (2022-S1=1,480,941 vs prev 1,377,517). PASS.
- **BLOQUE 3:** DAX válido (RANKX Dense + TOPN ALLSELECTED); rankings por año/semestre verificados. PASS.
- **Validación autoritativa TOM (ConnectFolder):** 8 tablas, 18 medidas, 9 relaciones cargadas; sin errores.
- **TMDL (pbip_validate_tmdl):** válido (solo 2 warnings preexistentes de `double` en dim_programa).
- Sin medidas condicionadas/bloqueadas implementadas.

## 5. Notas técnicas

- Tabla `Medidas` implementada como tabla técnica (columna `_Medidas` oculta), **sin relaciones**; las 9 relaciones existentes no fueron modificadas.
- Se usó aritmética sobre `ANIO`/`SEMESTRE` (no time-intelligence clásico; `dim_periodo` no tiene columna `Date`).
- Los rankings usan `ALLSELECTED` sobre programa (conserva filtros de año/semestre/departamento/gestión); BLANK/0 se excluyen en el visual.
- Nota de herramienta: `pbip-tools` no indexa la tabla oculta en sus contadores (limitación del tool); la validación autoritativa se realizó con el modeling MCP (ConnectFolder al modelo del proyecto).