# MODELING_PRINCIPLES — demanda_UCSP

| Campo | Valor |
| ----- | ----- |
| Proyecto | demanda_UCSP |
| Documento | Principios de modelado |
| Estado | Vigente desde la FASE 0 — principios, no implementación |

## 1. Propósito

Este documento define **principios** que gobernarán el modelado del Semantic Model.

**No establece medidas concretas, ni relaciones concretas, ni tablas nuevas.**

Toda decisión específica se definirá y justificará en la feature correspondiente
(SPEC/PLAN) y se validará en su Quality Gate.

## 2. Principios

### P1 — Arquitectura Star Schema

- El modelo seguirá una arquitectura Star Schema.
- **Dimensiones** (tablas descriptivas) rodeando **hechos** (tablas de medida).
- Estructura esperada del proyecto: 5 dimensiones (`dim_local`, `dim_periodo`,
  `dim_programa`, `dim_ubicacion`, `dim_universidad`) y 2 hechos
  (`fact_ingresantes_dashboard`, `fact_matriculados_dashboard`).

### P2 — Separación entre dimensiones y hechos

- Dimensiones y hechos permanecen en tablas separadas.
- No se mezclan atributos descriptivos en tablas de hechos.
- No se duplican atributos descriptivos entre dimensiones sin justificación.

### P3 — Relaciones dimensión → hecho

- Las relaciones conectarán dimensiones hacia hechos (dimensión en el lado "uno",
  hecho en el lado "muchos").
- La cardinalidad y dirección se validarán antes de crearlas (Regla de validación
  previa).

### P4 — Single Direction como configuración preferente

- La dirección de filtro preferente es **Single Direction** (de dimensión a hecho).
- La bidireccionalidad solo se usará con justificación documentada.

### P5 — Uso de SK/FK condicionado a validación

- Las claves `SK_*` (dimensiones) y `FK_*` (hechos) se usarán como base de relaciones
  **solo cuando la FASE 1 confirme su integridad** (unicidad, ausencia de huérfanos,
  integridad referencial).
- Hasta entonces, la validez de las claves es [POR VALIDAR].

### P6 — Evitar relaciones innecesarias

- Solo se crean relaciones que el análisis requiere.
- Cada relación debe responder a una necesidad de filtrado o agrupación real.
- No se crean relaciones por inercia.

### P7 — Evitar bidireccionalidad salvo justificación

- La bidireccionalidad se evita por defecto.
- Toda excepción debe documentarse con su motivo y su impacto.

### P8 — Evitar columnas calculadas cuando una medida es la solución

- La lógica analítica se implementa con **medidas**, no con columnas calculadas.
- Una columna calculada solo se justifica cuando es estrictamente necesaria (p. ej.
  atributo derivado para segmentación sin alternativa razonable).

### P9 — Preferir medidas para lógica analítica

- Los indicadores (totales, comparaciones, rankings, variaciones) se implementan como
  medidas DAX.
- Esto favorece el contexto de filtro y la reutilización.

### P10 — Nomenclatura consistente

- Nombres claros, descriptivos y consistentes.
- Tablas y columnas con los nombres exactos del proyecto.
- Las medidas seguirán una convención única definida en su feature antes de crearse.

### P11 — DAX mantenible

- Expresiones claras y con una sola responsabilidad.
- Se documenta la intención de cada medida.
- Se evita DAX anidado innecesariamente complejo.

### P12 — Validación previa de cardinalidad

- Antes de crear una relación se valida la cardinalidad real entre las claves.
- Una cardinalidad asumida sin evidencia es una violación del contrato.

### P13 — Organización de medidas mediante Display Folders

- Las medidas se organizarán mediante Display Folders:
  - `00 - Base`
  - `01 - Página Benchmark`
  - `02 - Página Demanda`
  - `99 - QA`
- La asignación de cada medida a su carpeta se definirá en la feature correspondiente
  y se mantendrá consistente en todo el modelo.

### P14 — Estrategia de Presentación HTML

- Estrategia de Presentación HTML: **evaluativa; no obligatoria por defecto**.
- Solo se adoptará si aporta valor demostrable a las preguntas obligatorias del
  enunciado, y siempre documentada en su Feature SPEC.

## 3. Patrón conceptual: FIJO vs DINÁMICO

### Definición

Cuando exista un **sujeto de análisis fijo** (por ejemplo, la UCSP) frente a un
**universo dinámico** (todas las demás universidades, la región, el país), podrá
evaluarse el uso de `ALL()` para aislar la métrica del sujeto fijo y compararla con el
universo en su contexto de filtro.

### Reglas de aplicación

- El patrón **no se asume automáticamente** para todos los KPIs.
- Cada KPI que lo requiera debe justificar su aplicación en su **Feature SPEC**.
- `ALL()` se usará solo cuando el contexto de filtro del universo deba conservarse.
- Cualquier uso de `ALL()`/`ALLSELECTED()` se documenta con su propósito y su efecto.

### Ejemplo conceptual (no implementado)

```
Comparativa UCSP vs universo:
  - Métrica UCSP: aislar la dimensión de universidad en el valor de la UCSP.
  - Universo: total del contexto (región o país) según filtros.
```

Este ejemplo es solo ilustrativo; no constituye una medida ni una decisión de diseño
aprobada.

## 4. Decisiones que NO se toman en este documento

- Medidas concretas y sus expresiones DAX → FASE 3.
- Relaciones concretas y su cardinalidad → FASE 2 (tras FASE 1).
- Tablas nuevas o columnas nuevas → según auditoría de FASE 1.
- Aplicación del patrón FIJO vs DINÁMICO a KPIs específicos → cada Feature SPEC.

## 5. Estado de este documento

- Estado: **Vigente desde la FASE 0**.
- Se revisa al inicio de cada fase de modelado sin perder vigencia de los principios.