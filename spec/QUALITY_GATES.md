# QUALITY_GATES — demanda_UCSP

| Campo | Valor |
| ----- | ----- |
| Proyecto | demanda_UCSP |
| Documento | Quality Gates |
| Estado | Vigente desde la FASE 0 |

## 1. Regla fundamental

Si un gate falla:

```
DETENER
→ DOCUMENTAR
→ ANALIZAR
→ PROPONER FIX
→ ESPERAR CONFIRMACIÓN
```

**Nunca se continúa automáticamente** tras un fallo.

## 2. Estructura de cada gate

Cada gate define:

| Elemento | Descripción |
| -------- | ----------- |
| Objetivo | Qué se asegura con este gate. |
| Prerequisitos | Condiciones previas necesarias. |
| Controles | Comprobaciones a ejecutar. |
| Evidencia requerida | Artefactos que demuestran el cumplimiento. |
| PASS | Criterios para considerar el gate superado. |
| FAIL | Criterios que activan la detención. |
| Acción ante FAIL | Procedimiento obligatorio al fallar. |

## 3. GATES

### GATE 0 — Project / Documentation Integrity

| Elemento | Detalle |
| -------- | ------- |
| Objetivo | Verificar que la documentación y la estructura del proyecto son coherentes y trazables. |
| Prerequisitos | Enunciado disponible; proyecto PBIP confirmado. |
| Controles | Existencia de `constitution/` y `spec/` con los 7 documentos; trazabilidad ENUNCIADO → REQUISITOS; nombres exactos del proyecto; estados CONFIRMADO/[POR VALIDAR] correctos. |
| Evidencia requerida | Listado de documentos creados; referencias cruzadas entre documentos. |
| PASS | 7 documentos presentes y coherentes; requisitos trazables al enunciado; sin afirmaciones no verificadas. |
| FAIL | Documentos faltantes, incoherentes o con requisitos inventados. |
| Acción ante FAIL | DETENER → DOCUMENTAR → ANALIZAR → PROPONER FIX → ESPERAR CONFIRMACIÓN. |

### GATE 1 — Data Quality

| Elemento | Detalle |
| -------- | ------- |
| Objetivo | Asegurar que el contrato de datos está validado antes de modelar. |
| Prerequisitos | GATE 0 aprobado; Parquet accesibles. |
| Controles | Esquema, tipos, registros, nulos, duplicados, unicidad de SK, integridad FK→PK, huérfanos, cobertura temporal, categóricos, consistencia dim↔fact, granularidad. |
| Evidencia requerida | Informe de auditoría de FASE 1; contrato de datos actualizado con estados resueltos. |
| PASS | Cada elemento [POR VALIDAR] resuelto o con decisión explícita; sin claves asumidas. |
| FAIL | Claves no únicas, huérfanos, granularidad ambigua o inconsistencias sin resolver. |
| Acción ante FAIL | DETENER → DOCUMENTAR → ANALIZAR → PROPONER FIX → ESPERAR CONFIRMACIÓN. |

### GATE 2 — Semantic Model

| Elemento | Detalle |
| -------- | ------- |
| Objetivo | Asegurar un modelo semántico correcto, limpio y alineado a los principios. |
| Prerequisitos | GATE 1 aprobado; `MODELING_PRINCIPLES.md` vigente. |
| Controles | Relaciones validadas; Star Schema; Single Direction preferente; sin relaciones innecesarias; nomenclatura consistente; TMDL coherente con el modelo abierto. |
| Evidencia requerida | Inventario de relaciones y tablas; verificación por lectura del esquema real. |
| PASS | Modelo sin ambigüedades de filtrado; relaciones con cardinalidad validada. |
| FAIL | Relaciones sin validar, bidireccionalidad injustificada u objetos inconsistentes. |
| Acción ante FAIL | DETENER → DOCUMENTAR → ANALIZAR → PROPONER FIX → ESPERAR CONFIRMACIÓN. |

### GATE 3 — Metrics / DAX

| Elemento | Detalle |
| -------- | ------- |
| Objetivo | Asegurar medidas DAX correctas, mantenibles y trazables a requisitos. |
| Prerequisitos | GATE 2 aprobado. |
| Controles | Corrección de resultados; DAX mantenible; uso de medidas sobre columnas calculadas; patrón FIJO vs DINÁMICO justificado por SPEC. |
| Evidencia requerida | Medidas documentadas; pruebas de resultados. |
| PASS | Medidas validadas y documentadas; sin DAX innecesariamente complejo. |
| FAIL | Medidas con resultados incorrectos o sin trazabilidad. |
| Acción ante FAIL | DETENER → DOCUMENTAR → ANALIZAR → PROPONER FIX → ESPERAR CONFIRMACIÓN. |

### GATE 4 — Report Structure

| Elemento | Detalle |
| -------- | ------- |
| Objetivo | Asegurar la estructura del reporte (páginas, filtros, navegación) antes de construir visuales de análisis. |
| Prerequisitos | GATE 3 aprobado; arquitectura definida en FASE 4. |
| Controles | Páginas definidas; filtros obligatorios (Departamento, Nivel sur, Gestión) previstos; slicers sin preselección por defecto. |
| Evidencia requerida | Arquitectura de páginas aprobada; mapeo de filtros a dimensiones. |
| PASS | Estructura aprobada y trazable a requisitos. |
| FAIL | Estructura confusa, filtros obligatorios ausentes o preselección indebida. |
| Acción ante FAIL | DETENER → DOCUMENTAR → ANALIZAR → PROPONER FIX → ESPERAR CONFIRMACIÓN. |

### GATE 5 — Functional Validation

| Elemento | Detalle |
| -------- | ------- |
| Objetivo | Validar que el reporte responde las dos preguntas obligatorias con los tres filtros obligatorios. |
| Prerequisitos | GATE 4 aprobado; visuales de FASE 5 y FASE 6 construidos. |
| Controles | Pregunta 1 (Benchmark) funcional; Pregunta 2 (Top/Bottom 5) funcional; filtros Departamento, Nivel sur y Gestión afectan correctamente los visuales. |
| Evidencia requerida | Validación funcional por pregunta y por filtro. |
| PASS | Ambas preguntas respondidas; los tres filtros obligatorios funcionan. |
| FAIL | Alguna pregunta o filtro no funciona correctamente. |
| Acción ante FAIL | DETENER → DOCUMENTAR → ANALIZAR → PROPONER FIX → ESPERAR CONFIRMACIÓN. |

### GATE 6 — Final Delivery

| Elemento | Detalle |
| -------- | ------- |
| Objetivo | Asegurar una entrega completa, reproducible y documentada. |
| Prerequisitos | GATE 5 aprobado. |
| Controles | Paquete de entrega completo; documentación actualizada; artefactos sin residuales. |
| Evidencia requerida | Paquete de entrega y documentación consolidada. |
| PASS | Entrega completa y reproducible. |
| FAIL | Entregables incompletos o documentación desactualizada. |
| Acción ante FAIL | DETENER → DOCUMENTAR → ANALIZAR → PROPONER FIX → ESPERAR CONFIRMACIÓN. |

## 4. Mapeo GATE → FASE

| GATE | FASE de salida |
| ---- | -------------- |
| GATE 0 | FASE 0 — Foundation / Documentation |
| GATE 1 | FASE 1 — Data Quality Audit |
| GATE 2 | FASE 2 — Semantic Model |
| GATE 3 | FASE 3 — Core Metrics |
| GATE 4 | FASE 4 — Information Architecture / UX |
| GATE 5 | FASE 5, FASE 6 y FASE 7 — Benchmark / Program Demand / Validation |
| GATE 6 | FASE 8 — Final Delivery |

## 5. Estado de este documento

- Estado: **Vigente desde la FASE 0**.
- Los gates son de aplicación obligatoria en todas las fases.