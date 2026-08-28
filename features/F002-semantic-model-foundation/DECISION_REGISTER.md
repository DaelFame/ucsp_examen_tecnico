# F002 — Semantic Model Foundation — DECISION REGISTER

| Campo | Valor |
| ----- | ----- |
| Proyecto | demanda_UCSP |
| Feature | F002 — Semantic Model Foundation |
| Fase | Previa a FASE 2 (fundación documental) |
| Quality Gate objetivo | GATE 2 — Semantic Model |
| Estado | Documentación de decisión; **sin implementación** |
| Estados permitidos | PROPOSED / CONFIRMED / PENDING |

## 1. Propósito

Registrar las decisiones técnicas resultantes de F001 y de la resolución de requisitos
pendientes, de modo que FASE 2 pueda iniciar sin ambigüedad.

**Nada de lo aquí documentado implica implementación.** No se crean relaciones, medidas,
tablas ni columnas. No se modifican Parquet, TMDL, PBIR ni PBIP.

Convención de estados:
- **CONFIRMED** — decisión respaldada por evidencia objetiva (auditoría) y aceptada como
  base para FASE 2.
- **PROPOSED** — alternativa recomendada, pendiente de aceptación/implementación.
- **PENDING** — requiere validación de negocio o información adicional antes de decidir.

---

## D001 — Granularidad de los hechos

- **Contexto:** F001 observó diferencia temporal anual/semestral. Antes de FASE 2 debe
  definirse explícitamente qué representa una fila de cada hecho.
- **Evidencia (F001 + análisis read-only):**
  - `fact_ingresantes_dashboard`: 166,666 filas; **0 filas duplicadas completas**;
    23,672 grupos (FK_Universidad + FK_Programa + FK_Periodo), hasta 130 filas por
    grupo; usa únicamente **6 períodos anuales** (TIPO_PERIODO=ANUAL, SEMESTRE nulo).
  - `fact_matriculados_dashboard`: 450,448 filas; **0 filas duplicadas completas**;
    49,690 grupos, hasta 178 filas por grupo; usa **12 períodos semestrales**.
  - Desagregación por: `SEXO`, `RANGO_EDAD` (ambos hechos); `FK_Ubicacion` (ambos);
    `FK_Local` (solo matriculados).
- **Opciones:** no aplica opciones — es un hallazgo observacional; se define la
  granularidad contractual.
- **Recomendación:**
  - Una fila de `fact_ingresantes_dashboard` = conteo de ingresantes de
    (universidad, programa, período **anual**, ubicación, SEXO, RANGO_EDAD).
  - Una fila de `fact_matriculados_dashboard` = conteo de matriculados de
    (universidad, programa, período **semestral**, ubicación, local, SEXO, RANGO_EDAD).
  - Las medidas deben respetar estas granularidades: SUM sobre las dimensiones de
    desagregación (SEXO, RANGO_EDAD, ubicación, local) = total por programa y período.
- **Estado:** **CONFIRMED** (evidencia técnica). Nota: la semántica de negocio (qué
  constituye exactamente un "ingresante"/"matriculado") queda **PENDING** (validación de
  negocio).

---

## D002 — Semántica de las métricas (`Conteo_Ingresantes`, `Conteo_Matriculados`)

- **Contexto:** resolver la semántica de agregación de las métricas fuente.
- **Evidencia confirmada (F001 + análisis read-only sobre los Parquet del Semantic
  Model):**
  - Son **métricas numéricas preagregadas** (no "1 por fila": ~21.2% de filas = 1 en
    ingresantes; ~18.4% en matriculados).
  - 0 ceros, 0 negativos, 0 nulos; mínimo 1; máximo 2255 (ingresantes) y 3460
    (matriculados); 0 filas duplicadas de la clave completa.
  - Granularidad observable: fila = bucket (scope + SEXO + RANGO_EDAD) único.
  - SEXO: 2 valores (FEMENINO/MASCULINO); RANGO_EDAD: 7 buckets disjuntos
    (`<18`, `18-25`, `26-35`, `36-45`, `46-55`, `56+`, `"Sin dato"`); 0 nulos.
  - Matriculados: existen S1 y S2 por año (2020-2025) con suma por (año, semestre)
    coherente.
- **CONFIRMED (parcial) — componente técnico de `SUM()`:**
  - `SUM()` es **técnicamente aditivo y consistente** sobre los conteos almacenados.
  - **No existen duplicados** de la clave completa (scope + SEXO + RANGO_EDAD).
  - Los buckets SEXO/RANGO_EDAD son **estructuralmente disjuntos** (cada conteo en un
    único bucket).
  - La agregación presenta **consistencia jerárquica** en los niveles evaluados
    (SUM idéntico por universidad, por programa y por período; 0 grupos con suma 0).
- **PENDING — componente semántico de negocio:**
  - **Definición de la unidad de negocio** de `Conteo_Ingresantes` /
    `Conteo_Matriculados` (persona vs registro/matrícula).
  - **Verificación de doble conteo entre S1 y S2** para matriculados (no verificable
    desde el agregado; requiere persona-nivel o regla de negocio).
  - **Confirmación de que `Año completo = S1 + S2`** representa la semántica de negocio
    requerida (puede sobrecontar personas en ambos semestres).
  - **Tratamiento de `RANGO_EDAD = "Sin dato"`** según regla de negocio.
- **Distinción conceptual obligatoria:** **"SUM técnicamente aditivo" NO equivale a
  "conteo de personas únicas".**
- **Recomendación:** usar `SUM` como base técnica de medidas (aditividad confirmada);
  mantener `[POR VALIDAR]` en `DATA_CONTRACT.md` para la semántica de negocio; validar en
  FASE 2/3 con datos a nivel persona o regla de negocio antes de definir medidas base que
  dependan de la interpretación semántica (p. ej. total anual de matriculados).
- **Estado:** **CONFIRMED (parcial) — técnico** + **PENDING — semántico**.

---

## D003 — Selector temporal (Año + Nivel temporal)

- **Contexto:** requisito funcional: seleccionar `Año` y nivel temporal
  `[Año completo | Semestre I | Semestre II]`.
- **Evidencia (F001):** `dim_periodo` contiene 6 períodos ANUAL y 12 SEMESTRAL;
  `fact_ingresantes_dashboard` usa solo períodos anuales (6); `fact_matriculados_dashboard`
  usa solo períodos semestrales (12). 0 huérfanos de período.
- **Comportamiento requerido (regla):**
  - INGRESANTES: solo información **anual**. Semestre I/II **no existen** en la fuente;
    **no fabricar** datos semestrales.
  - MATRICULADOS: información **semestral**. "Año completo" se evalúa a partir de sus
    períodos semestrales (agregado de niveles existentes, sin fabricar datos).
- **Opciones de implementación conceptual:**
  - **A. Una única dimensión de período** (`dim_periodo` existente, con `ANIO` y
    `LABEL_PERIODO`).
    - Ventajas: reutiliza la dimensión real; relaciones directas; mínimo mantenimiento.
    - Desventajas: coexisten niveles ANUAL y SEMESTRAL; debe respetarse la granularidad
      por hecho (ingresantes solo Año completo).
    - DAX: agregación de 2 semestres para "Año completo" de matriculados; sin fabricar
      semestres para ingresantes.
    - Filtro: por `ANIO` / `LABEL_PERIODO`.
    - Riesgo de resultados engañosos: bajo si se respeta la granularidad por hecho.
    - Mantenimiento: bajo.
  - **B. Dimensión calendario + atributos de granularidad:** más estructura, mayor
    complejidad; útil solo si se requieren niveles calendario adicionales (no requerido).
  - **C. Tabla auxiliar / slicer desconectada:** UX estable, pero DAX más complejo y
    mayor riesgo de resultados engañosos si el contexto de filtro no se maneja con
    cuidado.
  - **D. Otra alternativa:** no se identifica una superior a A para este caso.
- **Recomendación:** **Opción A** — una única `dim_periodo` como fuente temporal; el
  selector "Año + Nivel" respeta la granularidad real de cada hecho. La implementación
  técnica del selector (parámetro DAX vs jerarquía vs slicer) se define en FASE 4 /
  Feature SPEC correspondiente.
- **Distinción explícita:**
  - **`dim_periodo` = dimensión temporal de datos** (fuente de verdad de la granularidad
    real: 6 períodos ANUAL + 12 SEMESTRAL).
  - **Selector Año/Periodo = comportamiento de UX/semántica**, no un objeto del modelo.
  - La implementación del selector (parámetro DAX, slicer desconectada u otra)
    permanece **pendiente**; en esta etapa **no** se crea tabla, parámetro, medida ni
    columna para resolverlo. La decisión técnica final pertenece a la etapa de
    implementación correspondiente.
- **Estado:** regla de respeto de granularidad **CONFIRMED**; arquitectura del selector
  **PROPOSED** (Opción A recomendada).

---

## D004 — Clasificación geográfica Norte / Centro / Sur

- **Contexto:** requisito funcional Norte/Centro/Sur. `dim_ubicacion` solo dispone de
  `Region_Sur` (True/False).
- **Evidencia (read-only):**
  - La regla de **Sur** está documentada en el código fuente:
    `REGION_SUR = {AREQUIPA, CUSCO, TACNA, PUNO, MOQUEGUA, APURIMAC}`
    (`src/process_ingresantes.py`, `src/process_matriculados.py`); coincide con los 23
    registros `Region_Sur=True` observados en `dim_ubicacion`.
  - 25 departamentos, 98 provincias en `dim_ubicacion`.
  - **Norte y Centro no están definidos** en el repositorio.
- **Conclusión:** la clasificación completa Norte/Centro/Sur requiere una
  **regla de negocio** aún no documentada.
- **Opciones arquitectónicas:**
  1. **Atributo en `dim_ubicacion`** (p. ej. `ZONA_GEOGRAFICA` / `REGION_NCS`):
     1:1 con departamento, baja cardinalidad, filtrado simple.
  2. **Dimensión independiente** de zona geográfica: útil si se requieren múltiples
     agrupaciones o atributos de zona.
  3. **Tabla de mapeo** departamento → zona: útil si el mapeo es dinámico/externo.
- **Recomendación:** opción 1 — atributo en `dim_ubicacion`; opción 2 como alternativa
  si se requieren varias agrupaciones; opción 3 solo si el mapeo es externo/dinámico.
- **Distinción explícita:**
  - **Sur** → regla **existente y evidenciada** (`REGION_SUR` en `src/`; 23 registros
    `Region_Sur=True`).
  - **Norte / Centro** → regla de negocio todavía **no definida**.
  - **No se propone ni se inventa** la asignación de departamentos a Norte/Centro. La
    opción arquitectónica (atributo `ZONA_GEOGRAFICA` en `dim_ubicacion`) se aplicará
    únicamente cuando la regla de negocio sea provista.
- **Estado:** **PENDING** (regla de negocio requerida para Norte/Centro; no se inventa la
  lista de departamentos por zona). Sur: CONFIRMED como hecho (regla existente). Opción
  arquitectónica **PROPOSED**.

---

## D005 — Dominios de negocio y presentación

- **Contexto:** `TIPO_GESTION`, `NIVEL_ACADEMICO` y el nombre de la UCSP presentan
  valores que difieren de los términos del enunciado.
- **Evidencia (F001):** `PRIVADO` (90) / `PUBLICO` (87); `NIVEL_ACADEMICO` sin literal
  "Pregrado" (CARRERA PROFESIONAL 131, MAESTRIA 249, SEGUNDA ESPECIALIDAD 125,
  DOCTORADO 32); UCSP registrada como `UNIVERSIDAD CATOLICA SAN PABLO`
  (CODIGO_INEI=260000062).
- **Clasificación:**
  - `TIPO_GESTION` PRIVADO/PUBLICO → **regla de presentación/mapeo** (no corrección de
    fuente). Mapeo propuesto: PRIVADO → Privada, PUBLICO → Pública.
  - `NIVEL_ACADEMICO` → hipótesis de mapeo **CARRERA PROFESIONAL ≡ Pregrado** (regla de
    negocio a confirmar); no corrección de fuente.
  - UCSP → **identificación estable por `CODIGO_INEI`** (no por string); la adición de
    tilde es solo presentación.
- **Recomendación para el Semantic Model (FASE 2):** conservar los valores fuente y
  materializar los mapeos como atributos de presentación / tablas de mapeo en el modelo.
  Nunca modificar Parquet.
- **Estado:** estrategia de mapeo **CONFIRMED**; equivalencia
  Pregrado ↔ CARRERA PROFESIONAL **PENDING** (validación de negocio).

---

## D006 — Tipos de datos Parquet vs TMDL

- **Contexto:** Parquet almacena SK/FK como `uint32`; TMDL declara `int64`. `SEMESTRE`
  es `float64` con 6 nulos en Parquet; TMDL declara `int64`.
- **Evidencia (F001):** 0 nulos en claves; integridad 100%.
- **Clasificación:** **no** es un problema de calidad ni de compatibilidad funcional; es
  una **decisión de modelado** (representación de tipos).
- **Recomendación para FASE 2:** declarar `int64` en TMDL para SK/FK (el rango de
  `uint32` cabe en `int64`); no modificar Parquet. Para `SEMESTRE`, manejar los nulos
  como período ANUAL (identificado por `TIPO_PERIODO`), no como error.
- **Estado:** **CONFIRMED** (decisión de modelado; tratamiento recomendado).

---

## D007 — Relaciones candidatas del modelo

- **Contexto:** diseñar las relaciones del modelo sin crearlas todavía.
- **Nivel 1 — Integridad referencial: CONFIRMADA por F001.** 5 SK únicas y sin nulos;
  9 FK con 100% de validez, 0 huérfanos, 0 nulas.
- **Nivel 2 — Relaciones candidatas: técnicamente validadas por la evidencia de F001.**
  La integridad referencial soporta la hipótesis de cardinalidad **muchos-a-uno (1:N)**.
- **Nivel 3 — Cardinalidad, dirección y actividad: decisión de modelado PROPOSED,
  pendiente de implementación y validación en FASE 2.** Se recomienda: dirección de
  filtro **Single Direction** (dimensión → hecho), relaciones **activas** por defecto,
  sin bidireccionalidad. Esto es una propuesta de modelado; **no** implica relaciones
  aprobadas ni implementadas.

| Fact | FK | Dimensión | SK | Cardinalidad candidata (PROPOSED) | Dirección recomendada (PROPOSED) | Justificación |
| ---- | -- | --------- | -- | ---------------------- | --------------------- | ------------- |
| fact_ingresantes_dashboard | FK_Universidad | dim_universidad | SK_Universidad | Muchos-a-uno (1:N) | Single (dim → fact) | Universidad = sujeto del análisis (UCSP vs universo). |
| fact_ingresantes_dashboard | FK_Programa | dim_programa | SK_Programa | Muchos-a-uno (1:N) | Single (dim → fact) | Programa = unidad de análisis (Pregunta 2). |
| fact_ingresantes_dashboard | FK_Periodo | dim_periodo | SK_Periodo | Muchos-a-uno (1:N) | Single (dim → fact) | Período anual; base del eje temporal. |
| fact_ingresantes_dashboard | FK_Ubicacion | dim_ubicacion | SK_Ubicacion | Muchos-a-uno (1:N) | Single (dim → fact) | Filtros Departamento / Nivel sur. |
| fact_matriculados_dashboard | FK_Universidad | dim_universidad | SK_Universidad | Muchos-a-uno (1:N) | Single (dim → fact) | Universidad = sujeto del análisis. |
| fact_matriculados_dashboard | FK_Programa | dim_programa | SK_Programa | Muchos-a-uno (1:N) | Single (dim → fact) | Programa = unidad de análisis (Pregunta 2). |
| fact_matriculados_dashboard | FK_Periodo | dim_periodo | SK_Periodo | Muchos-a-uno (1:N) | Single (dim → fact) | Período semestral; base del eje temporal. |
| fact_matriculados_dashboard | FK_Ubicacion | dim_ubicacion | SK_Ubicacion | Muchos-a-uno (1:N) | Single (dim → fact) | Filtros Departamento / Nivel sur. |
| fact_matriculados_dashboard | FK_Local | dim_local | SK_Local | Muchos-a-uno (1:N) | Single (dim → fact) | Local/sede (atributo auxiliar; uso: mejora opcional M2). |

- **Notas:** `dim_local` solo conecta a matriculados (ingresantes no tiene `FK_Local`).
  `dim_ubicacion` conecta a ambos hechos (un solo rol de filtro; sin role-playing).
- **Estado:** integridad referencial **CONFIRMADA (F001)**; relaciones **candidatas
  técnicamente validadas**; cardinalidad/dirección/actividad = **decisión de modelado
  PROPOSED, pendiente de implementación y validación en FASE 2**. NO se declaran
  relaciones aprobadas ni implementadas.

---

## 2. Resumen de estados

| Decisión | Tema | Estado |
| -------- | ---- | ------ |
| D001 | Granularidad de hechos | CONFIRMED (técnica); semántica de negocio PENDING |
| D002 | Semántica de métricas / SUM | **CONFIRMED (parcial)** — SUM aditivo/técnico; **PENDING** — unidad de negocio, S1/S2, Año completo, "Sin dato" |
| D003 | Selector temporal | Regla CONFIRMED; arquitectura PROPOSED (Opción A) |
| D004 | Clasificación geográfica | PENDING (regla Norte/Centro requerida); opción PROPOSED |
| D005 | Dominios y presentación | Estrategia CONFIRMED; equivalencia Pregrado PENDING |
| D006 | Tipos Parquet vs TMDL | CONFIRMED (decisión de modelado) |
| D007 | Relaciones candidatas | Integridad CONFIRMADA (F001); candidatas validadas; cardinalidad/dirección/actividad PROPOSED (pendiente) |

## 3. Requisitos de negocio pendientes (inputs externos)

1. Clasificación Norte / Centro / Sur por departamento (D004).
2. Confirmación de que "CARRERA PROFESIONAL" equivale a "Pregrado" (D005).
3. Definición de negocio de "ingresante" y "matriculado" para la validación semántica
   (D001/D002).
4. Validación **SEMÁNTICA** de D002 (pendiente): definición de la unidad de negocio
   (persona vs registro), doble conteo S1/S2 de matriculados, confirmación de
   "Año completo = S1+S2" y tratamiento de `RANGO_EDAD = "Sin dato"`. (La aditividad
   técnica de SUM está CONFIRMADA.)

## 4. Estado de este documento

- Estado: **Vigente como fundación documental de F002 (previa a FASE 2)**.
- No constituye implementación del modelo.
- Se revisará al iniciar FASE 2 y se actualizará conforme se cierren las decisiones
  PENDING.