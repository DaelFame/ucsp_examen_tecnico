# F002 — Semantic Model Foundation — SEMANTIC BEHAVIOR MATRIX

| Campo | Valor |
| ----- | ----- |
| Proyecto | demanda_UCSP |
| Feature | F002 — Semantic Model Foundation |
| Propósito | Referencia funcional del comportamiento temporal esperado por hecho y por visualización |
| Estado | COMPLETADA (documental) |
| Referencias | DECISION_REGISTER D001 (granularidad), D003 (selector temporal) |

## 1. Propósito

Definir, de forma previa a la implementación, qué debe suceder semánticamente cuando una
visualización utiliza un hecho frente al selector temporal (Año + nivel). El objetivo es
**evitar que FASE 3 construya visualizaciones cuyo comportamiento temporal sea
semánticamente incorrecto**.

**IMPORTANTE:** esta matriz describe comportamiento semántico esperado. **NO crea
objetos del Semantic Model** (no crea tablas, columnas, medidas, parámetros ni
relaciones).

## 2. Matriz base (por hecho)

| Hecho | Granularidad | Año completo | Semestre I | Semestre II |
| ----- | ------------ | ------------ | ---------- | ----------- |
| fact_ingresantes_dashboard | Anual | Disponible | No disponible | No disponible |
| fact_matriculados_dashboard | Semestral | S1 + S2 | Disponible | Disponible |

> **(**) Para `fact_ingresantes_dashboard`, `Año` y `Año completo` son **equivalentes**:
> ambos representan el único nivel anual disponible (no existe desglose semestral). El
> selector UX no debe ofrecerlos como niveles independientes para ingresantes.

## 3. Matriz extendida (visualizaciones / requerimientos del enunciado)

| Requerimiento / Visualización | Hecho | Granularidad | Dimensiones relevantes | Año | Año completo | Semestre I | Semestre II |
| ----------------------------- | ----- | ------------ | ---------------------- | --- | ------------ | ---------- | ----------- |
| Evolución de ingresantes (P1) | fact_ingresantes_dashboard | Anual | dim_periodo (ANIO), dim_programa, dim_universidad | Disponible | Disponible (dato anual existente) | No disponible | No disponible |
| Evolución de matriculados (P1) | fact_matriculados_dashboard | Semestral | dim_periodo (ANIO/SEMESTRE), dim_programa, dim_universidad | Disponible | Agregado S1 + S2 (*) | Disponible | Disponible |
| Comparación UCSP vs región/nacional (P1) | ambos hechos (según indicador) | Anual / Semestral (por hecho) | dim_universidad, dim_ubicacion, dim_programa | Por hecho | Ingresantes: dato anual; Matriculados: S1 + S2 (*) | Ingresantes: N/D; Matriculados: disponible | Ingresantes: N/D; Matriculados: disponible |
| Top/Bottom 5 ingresantes (P2) | fact_ingresantes_dashboard | Anual | dim_programa, dim_periodo (ANIO) | Disponible | Disponible (dato anual existente) | No disponible | No disponible |
| Top/Bottom 5 matriculados (P2) | fact_matriculados_dashboard | Semestral | dim_programa, dim_periodo | Disponible | Agregado S1 + S2 (*) | Disponible | Disponible |
| Filtro Departamento | ambos hechos | — | dim_ubicacion (DEPARTAMENTO) | Aplica | Aplica | Aplica | Aplica |
| Filtro Zona Sur / Norte / Centro | ambos hechos | — | dim_ubicacion (Region_Sur; futuro ZONA_GEOGRAFICA, ver D004) | Aplica | Aplica | Aplica | Aplica |
| Filtro Gestión (privada / pública) | ambos hechos | — | dim_universidad (TIPO_GESTION) | Aplica | Aplica | Aplica | Aplica |
| Filtro Nivel académico | ambos hechos | — | dim_programa (NIVEL_ACADEMICO) | Aplica | Aplica | Aplica | Aplica |

> (**) La equivalencia **Pregrado ↔ CARRERA PROFESIONAL permanece PENDING (D005)**; no se
> asume en esta matriz. El filtro de "Pregrado" solo se materializará cuando el mapeo de
> negocio sea confirmado.

(*) **"Año completo" de matriculados = agregado S1 + S2** (técnicamente aditivo; D002
**CONFIRMED parcial**). La interpretación de ese total como "personas únicas del año" **no
está aprobada**: la validación **SEMÁNTICA** de D002 (unidad de negocio, doble conteo
S1/S2) continúa **PENDING**. No se trata de una decisión semántica definitivamente
aprobada.

## 4. Reglas obligatorias

1. **Nunca fabricar datos semestrales para ingresantes.** No existe dato semestral
   fuente; no se genera un valor artificial.
2. **Ingresantes:**
   - Año completo = dato anual existente.
   - S1 = N/D (no disponible).
   - S2 = N/D (no disponible).
3. **Matriculados:**
   - S1 = dato fuente.
   - S2 = dato fuente.
   - Año completo = agregado S1 + S2 (técnicamente aditivo; D002 CONFIRMED parcial). La
     semántica como "personas únicas" queda PENDING (D002) — no es una decisión aprobada.
4. **El selector temporal debe respetar la granularidad real del hecho.**
5. **Si un visual utiliza ingresantes y se selecciona S1/S2, no debe producir un valor
   artificial:** el resultado debe ser vacío explícito (o la opción deshabilitada),
   nunca un valor fabricado.
6. **No asumir todavía la implementación técnica del selector** (parámetro DAX, slicer
   desconectada u otra); es decisión de la etapa de implementación (ver D003).
7. **Referenciar D001 y D003** del `DECISION_REGISTER.md`.

## 5. Estado de este documento

- Estado: **COMPLETADA (documental)**.
- Describe comportamiento esperado; **no implementa** objetos del modelo.
- Se usará como referencia funcional en FASE 3 (medidas) y FASE 4 (UX/selector).