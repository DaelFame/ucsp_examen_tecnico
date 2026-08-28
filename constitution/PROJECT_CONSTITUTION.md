# PROJECT CONSTITUTION — demanda_UCSP

## 1. Identidad del documento

| Campo | Valor |
| ----- | ----- |
| Proyecto | demanda_UCSP |
| Documento | Constitución del proyecto |
| Tipo | Reglas permanentes de gobernanza |
| Alcance | Aplica a todas las fases, features y tareas del proyecto |
| Fuente de verdad funcional | Enunciado original de la prueba técnica (fuente primaria de requisitos) |

La Constitución es el conjunto de reglas **permanentes** del proyecto. Es anterior y
superior a cualquier decisión específica de implementación. Ninguna fase o feature puede
violar estas reglas.

## 2. Propósito

Establecer las reglas operativas que gobiernan todo el ciclo de vida del proyecto:

1. Cómo se verifica la realidad antes de actuar.
2. Qué herramienta puede tocar qué artefacto.
3. Qué está prohibido por defecto.
4. Cómo se manejan errores.
5. Cómo se protege el trabajo ya construido.

## 3. Reglas permanentes

### Regla 1 — Verificación previa del esquema real

Antes de crear, modificar o eliminar cualquier objeto (tabla, columna, medida,
relación, visual, página, filtro, bookmark), se debe **verificar mediante una
operación de lectura** el estado real del esquema objetivo.

- No se crea sobre suposiciones.
- No se asume que un objeto existe o no existe sin comprobarlo.

### Regla 2 — Separación estricta de responsabilidades por herramienta

- `powerbi-modeling-mcp` → **Semantic Model** (tablas, columnas, relaciones, medidas,
  columnas calculadas, jerarquías, roles).
- `powerbi-report-mcp` → **Report** (páginas, visuales, filtros, slicers, bookmarks, temas).

Esta separación es estricta:

- Ninguna herramienta puede realizar tareas correspondientes a la otra.
- No existe solapamiento de responsabilidades.

### Regla 3 — Prohibición de custom visuals / third-party visuals vía MCP

No se crean ni registran visuales personalizados ni de terceros mediante MCP.

Si un visual requerido no existe en el catálogo nativo, se documenta la necesidad y se
propone una alternativa; no se importan paquetes externos por herramienta de modelado.

### Regla 4 — Backup obligatorio antes de bloques de cambios estructurales

Antes de un bloque de cambios estructurales (modelo, reporte, relaciones, medidas,
páginas), se realiza una copia de seguridad del estado actual.

- La copia es condición previa, no una opción.
- Aplica a cambios por lotes y a cambios que afecten la integridad del proyecto.

### Regla 5 — Detención inmediata ante errores

Ante cualquier error:

- Se detiene la ejecución **inmediatamente**.
- Se muestra el error completo.
- Se explica qué operación se estaba intentando realizar.
- **No se reintenta**.
- **No se modifica nada** hasta resolver la causa.

### Regla 6 — Prohibición de reintentos automáticos

Está prohibido reintentar automáticamente una operación que falló.

- Un reintento solo procede después de diagnosticar la causa y con confirmación.
- Los reintentos automáticos pueden enmascarar un problema estructural.

### Regla 7 — Prohibición de workarounds silenciosos

Está prohibido aplicar soluciones provisionales sin documentarlas.

- Todo workaround debe:
  1. Quedar registrado con su causa raíz.
  2. Tener un fix definitivo asociado.
  3. Ser aprobado antes de aplicarse.

### Regla 8 — Confirmación explícita antes de operaciones de alto riesgo

Se requiere confirmación explícita del usuario antes de:

- Bloques de cambios estructurales.
- Eliminación de objetos.
- Cambios que afecten a múltiples artefactos.
- Cualquier operación destructiva.

Nunca se continúa automáticamente a una fase posterior sin confirmación.

### Regla 9 — Slicers sin preselección por defecto

Los slicers se configuran **sin preselección** por defecto.

- El estado inicial no debe ocultar datos de forma involuntaria.
- Las preselecciones solo proceden si el análisis lo justifica y se documenta.

### Regla 10 — Verificación de listas completas ante truncamiento

Si una herramienta puede devolver resultados truncados (listas, inventarios):

- Se detecta el truncamiento.
- Se realizan las lecturas adicionales necesarias.
- No se da por completo un inventario que pudo ser recortado.

### Regla 11 — No asumir nombres, tipos, relaciones ni estructuras

Toda afirmación sobre nombres de tablas, columnas, tipos, relaciones o medidas debe
estar respaldada por una operación real de lectura.

- No se asume la existencia de objetos.
- No se asume la validez de claves sin validación.

### Regla 12 — Ritmo estricto tras corrupción o crash

Después de una corrupción o un crash:

- Se retoma con el **ritmo de ejecución más estricto**.
- Se verifica la integridad del proyecto antes de cualquier cambio.
- Se confirma el estado real con lecturas antes de continuar.

### Regla 13 — El enunciado es la fuente de verdad

El enunciado original de la prueba técnica es la fuente de verdad de los **requisitos
funcionales**.

- Ningún requisito agregado puede contradecir el enunciado.
- Los requisitos no respaldados por el enunciado no son obligatorios.

### Regla 14 — Clasificación de ítems

Todo ítem de trabajo se clasifica explícitamente en una de estas categorías:

| Categoría | Definición |
| --------- | ---------- |
| Requisito | Exigido por el enunciado; obligatorio. |
| Decisión de diseño | Elección técnica adoptada para cumplir requisitos; documentada y justificada. |
| Implementación | Concreción técnica de una decisión de diseño en el modelo/reporte. |
| Mejora opcional | Valor agregado no exigido; solo se incluye si no compromete lo obligatorio. |

Esta clasificación evita que mejoras opcionales se traten como obligatorias.

## 4. Ciclo de trazabilidad

La documentación del proyecto mantiene la cadena:

```
ENUNCIADO
→ REQUISITOS
→ MISIÓN
→ ROADMAP
→ CONTRATO DE DATOS
→ PRINCIPIOS DE MODELADO
→ QUALITY GATES
→ FEATURE
→ SPEC
→ PLAN
→ TASKS
→ IMPLEMENTACIÓN
→ VALIDACIÓN
```

Cada fase y cada feature debe poder trazarse hacia un requisito del enunciado.

## 5. Jerarquía documental

| Nivel | Documento | Contenido |
| ----- | --------- | --------- |
| Gobernanza | `constitution/PROJECT_CONSTITUTION.md` | Reglas permanentes del proyecto. |
| Estrategia | `spec/MISSION.md` | Misión, alcance y requisitos. |
| Planeación | `spec/ROADMAP.md` | Fases y features. |
| Técnica | `spec/TECH_STACK.md` | Herramientas y responsabilidades. |
| Datos | `spec/DATA_CONTRACT.md` | Contrato de datos. |
| Modelado | `spec/MODELING_PRINCIPLES.md` | Principios de modelado. |
| Control | `spec/QUALITY_GATES.md` | Gates formales de calidad. |
| Ejecución | `features/` (futuro) | SPEC, PLAN y TASKS por feature. |

## 6. Estado de este documento

- Estado: **Vigente desde la FASE 0**.
- Cualquier enmienda a esta Constitución requiere confirmación explícita.
- Las reglas no se relajan sin documentar la excepción.