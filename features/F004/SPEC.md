# F004 — Sistema de Filtros y Contexto Temporal/Geográfico — SPEC

| Campo | Valor |
| --- | --- |
| Feature ID | F004 |
| Nombre | Sistema de Filtros y Contexto Temporal/Geográfico |
| Estado | PLAN APROBADO → BUILD DOCUMENTAL |
| Fase asociada | FASE 4 — Information Architecture / UX (Roadmap) |
| Tipo | Fundación documental (no implementa TMDL/HTML) |
| Alcance | Diseñar el sistema de 5 filtros base y las reglas temporales/geográficas para 6–7 HTML de storytelling |

## 1. Propósito
Establecer el diseño del **contexto común de filtros** que consumirán los 6–7 componentes HTML, respetando las granularidades y reglas de negocio ya decididas, sin crear aún tablas, medidas ni HTML.

## 2. Alcance funcional

### 2.1 Filtros base objetivo (5)

| # | Filtro | Origen dimensional | Regla |
|---|---|---|---|
| 1 | Período | `dim_periodo` (ANIO, SEMESTRE, LABEL_PERIODO, TIPO_PERIODO) | Año + Nivel (Año completo / Semestre I / II) — ver §4 |
| 2 | Zona | Derivado de `dim_ubicacion` | Norte / Centro / Sur — derivado, ver §5 |
| 3 | Región | `dim_ubicacion.DEPARTAMENTO` / `Region_Sur` | Departamento; Sur ya existe (23/98), Norte/Centro pendiente |
| 4 | Universidad | `dim_universidad` (NOMBRE_ENTIDAD, TIPO_GESTION, CODIGO_INEI) | Catálogo universidades |
| 5 | Programa | `dim_programa` (NOMBRE_PROGRAMA, CODIGO_SIU_PROGRAMA) | Catálogo programas |

### 2.2 Contexto común
Los 5 filtros constituyen el **filter context** que todo HTML recibe vía `filter`/`slicer` de Power BI. Ningún HTML implementa lógica de filtrado propia.

## 3. Reglas semánticas de período

### 3.1 Regla principal
El filtro permite `Año + Nivel`:
- `2022 — Año completo`
- `2022 — Semestre I`
- `2022 — Semestre II`

Cuando se selecciona un semestre, las métricas con granularidad semestral respetan dicho semestre:

- `2022 — Semestre I → Matriculados = matriculados del Semestre I de 2022`
- `2022 — Semestre II → Matriculados = matriculados del Semestre II de 2022`

### 3.2 Excepción anual — Ingresantes
`fact_ingresantes_dashboard` **solo posee granularidad anual** (6 períodos ANUAL, 0 semestrales). Por tanto:

- `2022 — Año completo → Ingresantes = ingresantes de 2022`
- `2022 — Semestre I → Ingresantes = ingresantes de 2022 completo` (mismo valor anual)
- `2022 — Semestre II → Ingresantes = ingresantes de 2022 completo`

**Resolución:** Capa semántica/DAX (medida condicional o cálculo que ignora SEMESTRE para ingresantes), **nunca** HTML/JS.

## 4. Arquitectura geográfica — Zona → Región → Universidad → Programa

```
Zona (Norte/Centro/Sur)  [derivado, D004]
 └→ Región / Departamento (dim_ubicacion.DEPARTAMENTO) [25 valores, ej. Arequipa, Cusco…]
     └→ Universidad (dim_universidad) [177 entidades, TIPO_GESTION]
         └→ Programa (dim_programa) [537 programas, NIVEL_ACADEMICO]
              └→ Hechos (fact_ingresantes / fact_matriculados vía FK)
```

### Diseño conceptual
- **Zona:** atributo derivado de `DEPARTAMENTO` (no existe aún). Opción recomendada (D004): columna calculada o tabla de mapeo `ZonaMap[DEPARTAMENTO, Zona]` con cardinalidad 25:3.
- **Región/Departamento:** ya existe en `dim_ubicacion`.
- **Documentación:** El mapeo `Departamento → Zona` debe quedar tabulado en SPEC anexo y validado contra D004. **No asumir** valores norte/centro no confirmados. Marcar `D004 PENDING`.

## 5. Dependencias con D002, D004, D005

| Decisión | Estado | Impacto en F004 |
|---|---|---|
| D002 — Granularidad (anual ingresantes / semestral matriculados) | CONFIRMED | Base de la excepción anual |
| D002 — Semántica SUM (técnico aditivo / semántico pendiente) | CONFIRMED parcial | "Año completo = S1+S2" para matriculados debe tratarse como suma técnica, no personas únicas |
| D004 — Zona Norte/Centro/Sur | PENDING | Bloquea implementación completa de filtro Zona (solo Sur implementable) |
| D005 — Pregrado ↔ CARRERA PROFESIONAL | PENDING | No afecta filtros base, pero afecta futuros filtros académicos |
| D003 — Selector Año/Periodo | Selector = UX (dim_periodo es fuente de verdad) | F004 respeta dim_periodo como dimensión única |

## 6. Inventario de medidas DAX a auditar

**Actual en `Medidas.tmdl` (18 medidas, tabla `Medidas` oculta):**

| Grupo | Medida | Hecho | Agregación | Temporalidad |
|---|---|---|---|---|
| Base | Total Ingresantes | fact_ingresantes | SUM(Conteo) | Anual |
| Base | Total Matriculados | fact_matriculados | SUM | Semestral |
| Base | Ingresantes Año Anterior (oculta) | fact_ingresantes | CALCULATE | Anual |
| Base | Variación % Ingresantes YoY | - | DIVIDE | Anual |
| Base | Total Matriculados Semestre Anterior (oculta) | fact_matriculados | CALCULATE | Semestral |
| Base | Variación % Matriculados Semestre | - | DIVIDE | Semestral |
| QA | QA - Filas Ingresantes | fact_ingresantes | COUNTROWS | — |
| QA | QA - SUM Ingresantes | fact_ingresantes | SUM | — |
| QA | QA - Filas Matriculados | fact_matriculados | COUNTROWS | — |
| QA | QA - SUM Matriculados | fact_matriculados | SUM | — |
| Benchmark | Total Ingresantes UCSP | fact_ingresantes | CALCULATE + FILTER CODIGO_INEI | Anual |
| Benchmark | Total Matriculados UCSP | fact_matriculados | CALCULATE + FILTER | Semestral |
| Demanda | Rango Programas Ingresantes | fact_ingresantes | RANKX | Anual |
| Demanda | Top 5 Programas por Ingresantes | fact_ingresantes | TOPN 5 | Anual |
| Demanda | Bottom 5 ... Ingresantes | fact_ingresantes | TOPN 5 | Anual |
| Demanda | Rango Programas Matriculados | fact_matriculados | RANKX | Semestral |
| Demanda | Top 5 Programas por Matriculados | fact_matriculados | TOPN 5 | Semestral |
| Demanda | Bottom 5 Programas por Matriculados | fact_matriculados | TOPN 5 | Semestral |

**Auditoría F004:**
- ¿Cuáles funcionan correctamente con filtro Año completo / S1 / S2? → Base y UCSP anual deben ignorar SEMESTRE (excepción).
- ¿Cuáles deben respetar semestre? → Matriculados, variaciones semestrales, Top5 matriculados.
- ¿Cuáles mantienen granularidad anual? → Ingresantes y sus Top5.
- ¿Cuáles requieren adaptación? → Variación % y Top5 si se usa Año completo en matriculados (requiere S1+S2).
- ¿Cuáles faltan? → Medida `Total Matriculados (Año completo)` explícita si se quiere exponer Año completo como métrica independiente; `Total Ingresantes (Año completo explícito)` redundante (ya es anual).
- ¿Cuáles permanecen condicionadas/bloqueadas? → Ninguna nueva; las 18 se mantienen según D002/D004/D005 (ninguna bloqueada por nueva regla).

## 7. Auditoría QA — Medida potencialmente eliminada

### Hallazgo (read-only, 2026-08-28)

| Fuente | Evidencia |
|---|---|
| `Medidas.tmdl` actual | 18 medidas (4 QA: Filas Ingresantes, SUM Ingresantes, Filas Matriculados, SUM Matriculados) |
| Backups `Medidas.tmdl.bak2/bak3/bak4` | 18 medidas idénticas (4 QA) |
| `backup_demanda_UCSP_20260828_001846` | Sin `Medidas.tmdl` (previo a su creación) |
| `backup_SM_f3_20260828_012313` | Sin `Medidas.tmdl` |
| `git log --follow` | Archivo **untracked** (`??`), sin historial; `git diff HEAD` vacío |
| `definition/tables/Medidas.tmdl` git status | `??` (sin commits) |

**Conclusión:** **No existe evidencia inequívoca de medida QA eliminada.** Los 4 QA actuales están presentes de forma idéntica en los 3 backups disponibles y no hay historial git que muestre una 5ª QA previa. **No se propone restauración.** Tarea documentada como **AUDITADA — sin eliminación detectada**. Si se esperaba una 5ª QA (ej. `QA - Distinct Programas`), falta evidencia; se deja como `PENDING — evidencia insuficiente` solo si se aporta nombre/definición esperado.

## 8. Criterios de aceptación (F004 documental)

- [ ] SPEC/PLAN/TASKS creados con reglas de período, excepción anual, arquitectura Zona→Programa, dependencias D002/D004/D005, inventario auditado y QA auditado
- [ ] Sin TMDL/HTML/Parquet modificados
- [ ] Sin nuevo ID de decisión creado sin auditar (ver §9)
- [ ] 5 filtros documentados como contexto común para HTML

## 9. Decisión: ¿Nuevo ID D?

**Auditoría DECISION_REGISTER (D001-D007):**
- D001 (Granularidad), D002 (Métricas), D003 (Selector temporal), D004 (Geografía), D005 (Dominios), D006 (Tipos), D007 (Relaciones) ya cubren el dominio.
- El **sistema de 5 filtros como contexto común para HTML** y la **excepción anual como regla semántica** son **composición** de D001+D003+D004+D007, no una nueva dimensión ontológica aislada.
- **Recomendación:** **No crear nuevo ID de decisión** en esta etapa. Documentar la composición en F004 SPEC §4-§6 y referenciar D001/D003/D004. Si en implementación se requiere una tabla `ZonaMap` física o medida `Total Matriculados (Año completo)` con semántica distinta, entonces crear `D008 — Zona Mapping Implementation` o `D009 — Año Completo Semantics`.

## 10. Archivos protegidos (no tocar en F004)

`dashboard/*.pbip`, `*.tmdl`, `*.pbir`, `*.pbism`, Parquet (`data/Dashboard_parquet/*.parquet`), Power Query (`M`), `src/*.py` (solo lectura si se audita). Esta FEATURE no toca Semantic Model.

## 11. Orden de implementación

`PLAN (este SPEC) → BUILD DOCUMENTAL (SPEC/PLAN/TASKS) → REVIEW (consistencia) → APPLY/BUILD TÉCNICO` (creación de `Filtered Measures`/`ZonaMap` y ajuste TMDL, solo tras aprobación explícita y GATE 2/3).

## 12. HTML fuera de alcance

La creación de los 6–7 HTML de storytelling queda **explícitamente fuera** de F004. F004 solo entrega el **contexto de filtros + matriz temporal + inventario auditado** que los HTML consumirán.

## 13. Trazabilidad

MISSION → R5-R7 (filtros obligatorios) + R1/R2 (preguntas) → D001-D007 → F004 (filtros + excepción + Zona) → Futuros HTML (6–7) → QA (D002)

## 14. Estado

PLAN APROBADO → BUILD DOCUMENTAL autorizado. F004 no crea código ni HTML.
