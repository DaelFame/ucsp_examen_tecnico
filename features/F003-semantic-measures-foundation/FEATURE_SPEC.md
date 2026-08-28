# F003 — Semantic Measures Foundation — FEATURE SPEC

| Campo | Valor |
| ----- | ----- |
| Proyecto | demanda_UCSP |
| Feature ID | F003 |
| Nombre | Semantic Measures Foundation |
| Fase | Previa a FASE 3 (fundación documental) |
| Quality Gate | GATE 3 — Metrics / DAX (aplicable a la implementación de FASE 3) |
| Estado | Fundación documental; **implementación PENDING** |

## 1. Declaración explícita

**F003 NO implementa medidas todavía.**

- No crea medidas DAX, ni modifica TMDL, PBIR, PBIP, `dashboard/` ni Parquet.
- No crea pipelines, no usa Gold/Silver, no agrega columnas ni tablas.
- La clasificación **IMPLEMENTABLE** de una medida **NO es una autorización para
  implementarla ahora**: significa únicamente que **no existe bloqueo documental
  conocido**. Toda implementación requiere aprobación posterior del PLAN de FASE 3.

## 2. Propósito

Diseñar y clasificar documentalmente las medidas candidatas de FASE 3, trazables al
enunciado (`MISSION.md` R1–R4), distinguiendo para cada una:

- **Requisito de negocio** (qué responde del enunciado).
- **Diseño conceptual de la medida** (hecho, columna, agregación, contexto).
- **Dependencia / decisión** (D001–D007) que la condiciona.
- **Estado de implementación** (clasificación).

## 3. Alcance

- Clasificar medidas como **IMPLEMENTABLE / CONDICIONADA / BLOQUEADA POR DECISIÓN**.
- Documentar cada medida con: ID, nombre, hecho, columna fuente, agregación, contexto
  temporal, contexto dimensional, dependencias, clasificación y criterio de validación.
- Organización por Display Folders (`MODELING_PRINCIPLES` P13):
  `00 - Base`, `01 - Página Benchmark`, `02 - Página Demanda`, `99 - QA`.
- Respetar `SEMANTIC_BEHAVIOR_MATRIX.md` como referencia obligatoria del comportamiento
  temporal.

## 4. Fuera de alcance

- Implementar medidas o DAX.
- Resolver D002 semántico, D004 Norte/Centro, D005 Pregrado, ni el selector UX D003.
- Definir la "región" de la UCSP, el universo nacional, la unidad (persona vs registro)
  o "Año completo = S1+S2" como personas únicas.
- Modificar `dashboard/`, TMDL, PBIR, PBIP o Parquet.
- Crear código dentro de `features/`.

## 5. Entradas

- `spec/MISSION.md` (R1–R4, indicadores potenciales).
- `spec/ROADMAP.md`, `spec/DATA_CONTRACT.md`, `spec/MODELING_PRINCIPLES.md`.
- `features/F002-semantic-model-foundation/DECISION_REGISTER.md` (D001–D007).
- `features/F002-semantic-model-foundation/SEMANTIC_BEHAVIOR_MATRIX.md`.
- Semantic Model actual (lectura): 7 tablas, 46 columnas, 9 relaciones, 0 medidas.

## 6. Estado de decisiones que condicionan medidas

| Decisión | Estado |
| -------- | ------ |
| D002 — SUM técnico | **CONFIRMED (parcial)** — aditivo/consistente sobre los conteos. |
| D002 — semántico | **PENDING** — unidad (persona vs registro), doble conteo S1/S2, "Año completo = S1+S2", `RANGO_EDAD="Sin dato"`. |
| D005 — Pregrado ↔ CARRERA PROFESIONAL | **PENDING** (no se asume). |
| D004 — Norte/Centro | **PENDING** (Sur definido; Norte/Centro sin regla). |
| D003 — selector UX Año/Periodo | No se implementa en F003 (comportamiento respetado vía MATRIX). |

## 7. Medidas candidatas

| ID | Nombre | Requisito | Hecho | Columna fuente | Agregación | Contexto temporal | Contexto dimensional | Dependencias | Clasificación | Criterio de validación |
| -- | ------ | --------- | ----- | -------------- | ---------- | ----------------- | --------------------- | ------------ | ------------- | ----------------------- |
| M01 | Total Ingresantes | RD3 / R1 | fact_ingresantes_dashboard | Conteo_Ingresantes | SUM | Año ≡ Año completo (único nivel anual); S1/S2 N/D (no fabricar) | universidad, programa, ubicación (SEXO/RANGO_EDAD opcional, M1) | D001, D002 (técnico), D007 | IMPLEMENTABLE | SUM idéntico por nivel (3,119,994); conciliar con DATA_CONTRACT; QA |
| M02 | Total Matriculados (nivel semestre) | RD3 / R2 | fact_matriculados_dashboard | Conteo_Matriculados | SUM | S1 y S2 disponibles (nivel semestre) | universidad, programa, ubicación, local (opcional) | D001, D002 (técnico), D007 | IMPLEMENTABLE | SUM por (año, semestre) consistente; QA |
| M03 | Total Matriculados (Año completo) | RD3 / R2 | fact_matriculados_dashboard | Conteo_Matriculados | SUM S1 + S2 | Año completo | ídem M02 | D001, D002 (semántico), D003 | CONDICIONADA | "Año completo = S1+S2" NO aprobado (D002 semántico PENDING); NO implementar |
| M04 | Total Ingresantes UCSP | R1 / R3 | fact_ingresantes_dashboard | Conteo_Ingresantes | SUM (filtro `dim_universidad[CODIGO_INEI]=260000062`) | Año | universidad (UCSP), programa, ubicación | D001, D002 (técnico), D005 (identificación UCSP confirmada), D007 | IMPLEMENTABLE | Filtra SK_Universidad=115 (1 entidad); QA |
| M05 | Total Matriculados UCSP (semestre) | R2 / R3 | fact_matriculados_dashboard | Conteo_Matriculados | SUM (filtro UCSP) | S1 / S2 | universidad (UCSP), programa, ubicación, local | D001, D002 (técnico), D005, D007 | IMPLEMENTABLE | Filtra SK_Universidad=115; QA |
| M06 | Benchmark regional UCSP | R3 / RD4 | ambos hechos | Conteo_Ingresantes / Conteo_Matriculados | SUM + contexto (FIJO vs DINÁMICO / ALL) — diseño conceptual | según hecho (ingresantes anual; matriculados semestre; anual condicionado) | universidad (UCSP vs universo regional), ubicación | D001, D002, D004 (Sur definido; alcance "región" a definir), D007 | CONDICIONADA | Requiere definir el universo/región del benchmark y el diseño FIJO vs DINÁMICO; NO implementar |
| M07 | Benchmark nacional UCSP | R3 / RD4 | ambos hechos | Conteo_* | SUM + universo nacional | según hecho | universidad (UCSP vs nacional), programa, ubicación | D001, D002, D005 (alcance académico/Pregrado), D007 | CONDICIONADA | Requiere definir el universo nacional (¿TIPO_ENTIDAD=UNIVERSIDAD?) y el alcance académico (D005); NO implementar |
| M08 | Top 5 programas por ingresantes por año | R4 / RD5 | fact_ingresantes_dashboard | Conteo_Ingresantes | SUM + RANKX/TopN | Año | programa × año | D001, D002 (técnico), D007 | IMPLEMENTABLE | Ranking 5 mayores por año; QA |
| M09 | Bottom 5 programas por ingresantes por año | R4 / RD5 | fact_ingresantes_dashboard | Conteo_Ingresantes | SUM + RANKX/TopN (bottom) | Año | programa × año | D001, D002 (técnico), D007 | IMPLEMENTABLE | Ranking 5 menores por año; QA |
| M10 | Top 5 programas por matriculados por semestre | R4 / RD5 | fact_matriculados_dashboard | Conteo_Matriculados | SUM + RANKX/TopN | S1 / S2 | programa × semestre | D001, D002 (técnico), D007 | IMPLEMENTABLE | Ranking 5 mayores por semestre; QA |
| M11 | Bottom 5 programas por matriculados por semestre | R4 / RD5 | fact_matriculados_dashboard | Conteo_Matriculados | SUM + RANKX/TopN (bottom) | S1 / S2 | programa × semestre | D001, D002 (técnico), D007 | IMPLEMENTABLE | Ranking 5 menores por semestre; QA |
| M12 | Top/Bottom 5 programas por matriculados por año | R4 / RD5 | fact_matriculados_dashboard | Conteo_Matriculados | SUM S1+S2 + RANKX/TopN | Año completo | programa × año | D001, D002 (semántico), D003 | CONDICIONADA | "Año completo" PENDING semántico; NO implementar |
| M13 | Variantes filtradas a Pregrado (M04–M12) | R1–R4 (Pregrado) | ambos hechos | Conteo_* | SUM (filtro Pregrado) | según hecho | programa (Pregrado) | D005 (mapeo Pregrado PENDING) | BLOQUEADA POR DECISIÓN | Requiere resolver D005; NO implementar |
| M14 | Medidas QA (contador filas / suma de control) | QA (RD) | ambos hechos | Conteo_* | COUNTROWS / SUM | cualquier | — | D001, D002 (técnico) | IMPLEMENTABLE | Coincidencia con inventario/hechos; 99-QA |

### Reglas de interpretación

- **IMPLEMENTABLE** = sin bloqueo documental conocido; **NO autoriza a implementar ahora**.
- **CONDICIONADA** = depende de una decisión pendiente (D002 semántico, universo/región
  del benchmark) o de un diseño a validar; **no implementar**.
- **BLOQUEADA POR DECISIÓN** = requiere resolver D005 (Pregrado); **no implementar**.
- **Nunca fabricar datos semestrales de ingresantes**; **"Año completo" de matriculados =
  S1+S2 NO está aprobado como personas únicas** (D002 semántico PENDING).

## 8. Dependencias D001–D007

- **D001** (granularidad) → base de todas las medidas.
- **D002** técnico → habilita M01, M02, M04, M05, M08–M11, M14; **semántico** → condiciona
  M03 y M12.
- **D003** → comportamiento temporal respetado (MATRIX); selector UX fuera de F003.
- **D004** → no bloquea medidas base; condiciona M06 (región).
- **D005** → identificación UCSP confirmada (M04/M05); mapeo Pregrado pendiente (bloquea M13;
  condiciona M07).
- **D006** → aplicado (int64 en TMDL); sin impacto en medidas.
- **D007** → las 9 relaciones soportan todas las medidas.

## 9. Decisiones de negocio pendientes (no resueltas en F003)

1. D002 semántico: unidad (persona vs registro/matrícula); doble conteo S1/S2;
   "Año completo = S1+S2"; `RANGO_EDAD="Sin dato"`.
2. D005: equivalencia Pregrado ↔ CARRERA PROFESIONAL.
3. Alcance "su región" de la UCSP para el benchmark regional.
4. Universo del benchmark nacional y alcance académico (¿TIPO_ENTIDAD=UNIVERSIDAD?).

## 10. Criterios de aceptación

1. Todas las medidas documentadas con los 10 atributos requeridos.
2. Clasificación conforme a D002/D004/D005 (sin sobre-confirmar).
3. Ninguna medida condicionada/bloqueada marcada como aprobada para implementar.
4. Coherencia con `SEMANTIC_BEHAVIOR_MATRIX.md` (granularidad por hecho respetada).
5. Sin implementación de medidas en esta etapa.

## 11. Riesgos

- Doble conteo anual de matriculados si se implementara M03/M12 sin resolver D002 semántico.
- Benchmark con universo mal definido (M06/M07).
- Rankings Pregrado incorrectos sin resolver D005 (M13).
- Medidas con "Año completo" que se interpreten como personas únicas.

## 12. Gate de salida

- Esta fundación es **insumo documental** de GATE 3.
- El gate se aplicará al cierre de la **implementación** de FASE 3, previa aprobación del
  PLAN y de las decisiones pendientes necesarias.