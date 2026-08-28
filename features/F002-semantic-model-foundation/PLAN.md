# F002 — Semantic Model Foundation — PLAN

| Campo | Valor |
| ----- | ----- |
| Feature | F002 |
| Fase | Previa a FASE 2 (fundación documental) |
| Modo | Documentación únicamente |
| Estado | Fundación documental COMPLETADA; implementación PENDING |

## 1. Fases de trabajo de F002

1. **Auditoría documental** — leer `spec/`, F001 y el estado de F002; identificar
   existencia, duplicados y contradicciones.
2. **Normalización de estructura** — garantizar la estructura mínima de feature
   (FEATURE_SPEC / PLAN / TASKS).
3. **Resolución documental D001–D007** — convertir hallazgos de F001 en decisiones.
4. **Decision Register** — registrar D001–D007 con Contexto/Evidencia/Opciones/
   Recomendación/Estado.
5. **Semantic Behavior Matrix** — definir comportamiento temporal esperado por hecho y
   por visualización.
6. **Validación de consistencia** — verificar coherencia entre `spec/`, F001 y F002.
7. **Actualización de ROADMAP** — reflejar el estado de F002.
8. **Verificación final** — confirmar archivos protegidos intactos y ausencia de código
   Python en `features/`.
9. **Gate de salida de F002** — dejar F002 documentalmente completa.

## 2. Orden de resolución de decisiones

D001 → D002 → D003 → D004 → D005 → D006 → D007

La granularidad (D001) informa a las métricas (D002) y a la temporalidad (D003); D007 se
apoya en la evidencia de integridad de F001.

## 3. Evidencias requeridas

- F001: `DATA_QUALITY_REPORT.md` y `audit_output.json`.
- Parquet (solo lectura): esquemas, períodos, dominios y granularidad.
- Regla `REGION_SUR` en `src/process_*.py`.
- `spec/DATA_CONTRACT.md` y `spec/MODELING_PRINCIPLES.md`.

## 4. Validaciones previas a implementación (para FASE 2)

- **D002 (SUM) — validaciones SEMÁNTICAS pendientes** (la aditividad técnica está
  CONFIRMADA): definición de la unidad de negocio (persona vs registro/matrícula);
  verificación de doble conteo entre S1/S2 de matriculados; confirmación de
  "Año completo = S1 + S2"; tratamiento de `RANGO_EDAD = "Sin dato"`.
- **D004:** regla de negocio Norte/Centro/Sur por departamento.
- **D005:** equivalencia Pregrado ↔ CARRERA PROFESIONAL.
- **D001/D002:** definición de negocio de "ingresante" y "matriculado".

## 5. Estrategia de transición hacia FASE 2

- F002 cierra como **fundación documental** (sin implementación).
- FASE 2 inicia solo con **aprobación explícita**.
- La implementación respetará la granularidad real de cada hecho, no fabricará datos y
  usará las SK/FK validadas por F001.
- El selector temporal y la clasificación geográfica Norte/Centro/Sur se implementarán
  únicamente después de resolver sus reglas de negocio pendientes.

## 6. Prohibiciones de esta etapa

- **NO modificar** `dashboard/`, Parquet, TMDL, PBIR ni PBIP.
- **NO crear** relaciones, medidas, columnas calculadas, tablas auxiliares ni
  parámetros.
- **NO implementar** el selector temporal ni la clasificación geográfica.
- **NO iniciar** FASE 2.

## 7. Criterio de salida de F002

Estructura mínima completa, Decision Register y Semantic Behavior Matrix consistentes,
ROADMAP actualizado, archivos protegidos intactos y sin contradicciones documentales.