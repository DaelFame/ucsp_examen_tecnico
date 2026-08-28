# MISSION — demanda_UCSP

| Campo | Valor |
| ----- | ----- |
| Proyecto | demanda_UCSP |
| Documento | Misión del dashboard |
| Estado | Vigente desde la FASE 0 |
| Fuente de requisitos | Enunciado original de la prueba técnica (fuente de verdad) |

## 1. Misión del dashboard

Analizar la evolución de la **oferta académica (ingresantes)** y la **matrícula
(matriculados)** por **Universidad** y **Programa Profesional de Pregrado**, con
capacidad de comparar a la UCSP frente a otras universidades de su región y a nivel
nacional.

## 2. Problema de negocio

Se carece de una visión integrada y comparable de la demanda académica (ingresantes) y
la matrícula (matriculados) por universidad y programa profesional. En particular, no
existe un punto de referencia que permita ubicar a la UCSP frente al resto de
universidades de su región y del país, ni identificar los programas con mayor y menor
demanda por año.

## 3. Objetivo analítico

Proporcionar un dashboard que responda de forma clara y trazable:

1. Cómo ha evolucionado la oferta académica y la matrícula de la UCSP por programa.
2. Cómo se compara la UCSP frente a otras universidades de su región o a nivel nacional.
3. Cuáles son los 5 programas con mayor y menor ingreso / matrícula por año.

## 4. Usuario objetivo

- Dirección y planificación académica de la UCSP.
- Usuarios interesados en la posición competitiva de la universidad (regional y nacional).
- Analistas que requieren filtrar por Departamento, Nivel sur del país y Gestión de la
  universidad.

## 5. Preguntas obligatorias

### Pregunta 1 — Benchmark de demanda

> ¿Cómo ha evolucionado la oferta académica y la matrícula por programa de la UCSP y
> cómo se compara frente a otras universidades de su región o a nivel nacional?

### Pregunta 2 — Demanda por Programa Profesional

> ¿Cuáles son los 5 programas con mayor y menor ingreso / matrícula por año?

## 6. Filtros obligatorios

- **Departamento**
- **Nivel sur del país**
- **Gestión de la universidad: privada / pública**

Estos filtros son obligatorios y deben estar disponibles en el reporte final.

## 7. Alcance

- Análisis de **ingresantes** (oferta académica) y **matriculados** (matrícula).
- Nivel de análisis: **Universidad** y **Programa Profesional de Pregrado**.
- Comparativa UCSP vs otras universidades de su región y nivel nacional.
- Ranking de los 5 programas con mayor y menor ingreso / matrícula por año.
- Filtros obligatorios: Departamento, Nivel sur, Gestión (privada/pública).

## 8. Fuera de alcance

- Análisis de postgrado, maestrías o doctorados.
- Análisis de docencia, infraestructura o recursos humanos.
- Análisis financiero de las universidades.
- Visuales personalizados o de terceros (ver `TECH_STACK.md`).
- Cualquier tema no respaldado por el enunciado.

## 9. Clasificación de requisitos

### REQUISITOS OBLIGATORIOS

Derivan directamente del enunciado:

| ID | Requisito | Trazabilidad |
| -- | --------- | ------------ |
| R1 | Analizar la evolución de la oferta académica (ingresantes) por universidad y programa profesional de pregrado. | Enunciado. |
| R2 | Analizar la evolución de la matrícula (matriculados) por universidad y programa profesional de pregrado. | Enunciado. |
| R3 | Responder el Benchmark de demanda: evolución de la UCSP por programa y comparación frente a otras universidades de su región o a nivel nacional. | Pregunta obligatoria 1. |
| R4 | Responder la Demanda por Programa Profesional: 5 programas con mayor y menor ingreso / matrícula por año. | Pregunta obligatoria 2. |
| R5 | Disponer del filtro obligatorio **Departamento**. | Enunciado. |
| R6 | Disponer del filtro obligatorio **Nivel sur del país**. | Enunciado. |
| R7 | Disponer del filtro obligatorio **Gestión de la universidad: privada / pública**. | Enunciado. |

### REQUISITOS DERIVADOS

Apoyan el cumplimiento de los obligatorios y se confirman en fases posteriores:

| ID | Requisito | Justificación |
| -- | --------- | ------------- |
| RD1 | Modelo semántico en arquitectura Star Schema con dimensiones y hechos separados. | Base técnica para R1–R4. |
| RD2 | Contrato de datos que valide esquema, claves, integridad y cobertura de los Parquet. | FASE 1 — Data Quality Audit. |
| RD3 | Indicadores base de ingresantes y matriculados con evolución anual. | Soporte de R1–R4. |
| RD4 | Indicador de comparación regional y nacional de la UCSP. | Soporte de R3. |
| RD5 | Ranking anual Top/Bottom 5 de programas por ingreso y matrícula. | Soporte de R4. |
| RD6 | Filtros de reporte alineados a los filtros obligatorios (Departamento, Nivel sur, Gestión). | Soporte de R5–R7. |

### MEJORAS OPCIONALES

No exigidas por el enunciado; solo se incorporan si no comprometen lo obligatorio:

| ID | Mejora | Nota |
| -- | ------ | ---- |
| M1 | Desglose por sexo y rango de edad. | Las tablas contienen `SEXO` y `RANGO_EDAD` [POR VALIDAR en FASE 1]; uso opcional. |
| M2 | Análisis por local / sede de la universidad. | `dim_local` disponible; alcance de su uso por decidir. |
| M3 | Semestre como nivel temporal adicional. | `dim_periodo` contiene `SEMESTRE`; utilidad a evaluar. |

> Nota: los indicadores sugeridos por el enunciado se tratan como potenciales y **no**
> se convierten automáticamente en requisitos obligatorios (Regla documental 9).

## 10. Indicadores potenciales

- Ingresantes por año / por programa / por universidad.
- Matriculados por año / por programa / por universidad.
- Evolución anual (ingresantes y matriculados).
- Participación o posición de la UCSP frente a su región y al país.
- Top/Bottom 5 programas por ingreso y por matrícula por año.

Los indicadores definitivos se definen en fases posteriores (FASE 3 — Core Metrics)
sobre la base del contrato de datos validado.

## 11. Definición de éxito

El dashboard se considera exitoso si:

1. Responde las **dos preguntas obligatorias** de forma directa y trazable.
2. Los **tres filtros obligatorios** (Departamento, Nivel sur, Gestión) funcionan y
   afectan correctamente los visuales.
3. Los indicadores son técnicamente correctos (validados en FASE 7 — Validation / QA).
4. La comparativa UCSP vs región vs nacional es clara e interpretable.
5. El reporte es mantenible y su modelo cumple los principios de `MODELING_PRINCIPLES.md`.

## 12. Estado de este documento

- Estado: **Vigente desde la FASE 0**.
- Cualquier cambio de alcance requiere confirmación explícita y trazabilidad al enunciado.