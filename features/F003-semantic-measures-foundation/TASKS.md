# F003 — Semantic Measures Foundation — TASKS

| Campo | Valor |
| ----- | ----- |
| Feature | F003 |
| Fase | Previa a FASE 3 (fundación documental) |
| Formato | Checklist `[ ]` pendiente / `[x]` completada |

## Análisis

- [x] Leer `spec/MISSION.md` (R1–R4, indicadores).
- [x] Leer `spec/ROADMAP.md`, `spec/DATA_CONTRACT.md`, `spec/MODELING_PRINCIPLES.md`.
- [x] Leer `features/F002-semantic-model-foundation/*` (DECISION_REGISTER, MATRIX, SPEC, PLAN, TASKS).
- [x] Confirmar estado del Semantic Model por lectura (7 tablas, 46 columnas, 9 relaciones, 0 medidas).

## Diseño

- [x] Clasificar medidas candidatas como IMPLEMENTABLE / CONDICIONADA / BLOQUEADA POR DECISIÓN.
- [x] Documentar cada medida (ID, nombre, requisito, hecho, columna, agregación, contexto
      temporal/dimensional, dependencias, clasificación, criterio de validación).
- [x] Respetar `SEMANTIC_BEHAVIOR_MATRIX.md` (ingresantes anual; matriculados semestre;
      "Año completo = S1+S2" condicionado).
- [x] Distinguir requisito / diseño conceptual / dependencia-decisión / estado de implementación.

## Validación

- [x] Revisión read-only de consistencia F003 ↔ DECISION_REGISTER ↔ SEMANTIC_BEHAVIOR_MATRIX
      ↔ DATA_CONTRACT ↔ MODELING_PRINCIPLES ↔ MISSION.
- [x] Confirmar que D002 = CONFIRMED (parcial) técnico + PENDING semántico; D005 Pregrado
      PENDING; D004 Norte/Centro PENDING.
- [x] Confirmar que ninguna medida condicionada/bloqueada quedó marcada como aprobada.

## Implementación futura (PENDING — NO ejecutar sin aprobación del PLAN de FASE 3)

- [ ] Implementar M01 (Total Ingresantes).
- [ ] Implementar M02 (Total Matriculados nivel semestre).
- [ ] Implementar M04 (Total Ingresantes UCSP).
- [ ] Implementar M05 (Total Matriculados UCSP semestre).
- [ ] Implementar M08/M09 (Top/Bottom 5 ingresantes por año).
- [ ] Implementar M10/M11 (Top/Bottom 5 matriculados por semestre).
- [ ] Implementar M14 (QA).
- [ ] M03/M12 (Año completo matriculados): bloqueadas por D002 semántico — NO implementar hasta resolverlo.
- [ ] M06/M07 (benchmarks): condicionadas por definición de universo/región — NO implementar.
- [ ] M13 (Pregrado): bloqueada por D005 — NO implementar.

## Cierre

- [ ] Aprobar el PLAN de FASE 3 para autorizar la implementación.
- [ ] Aplicar GATE 3 al cierre de la implementación (validación de medidas).