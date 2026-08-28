# F004 — Sistema de Filtros y Contexto Temporal/Geográfico — PLAN

## 1. Objetivo del PLAN

Establecer el orden de trabajo documental para F004 sin tocar el Semantic Model.

## 2. Alcance planificado

- Diseñar los 5 filtros base como contexto común.
- Formalizar reglas de período (Año completo / S1 / S2) y excepción anual de Ingresantes.
- Esbozar arquitectura Zona → Región → Universidad → Programa.
- Auditar las 18 medidas existentes frente al nuevo contexto temporal.
- Auditar la medida QA potencialmente eliminada (sin restaurar aún).

### Fuera de alcance

- Crear DAX/TMDL/tablas/relaciones/HTML.
- Modificar Parquet/Power Query/PBIR/PBIP.
- Resolver D004 (Norte/Centro) o implementar ZonaMap físico.

## 3. Secuencia de trabajo (F004)

1. **Auditoría DECISION_REGISTER** — Verificar D001-D007; concluir que no se requiere nuevo ID (F004 compone decisiones existentes).
2. **Auditoría QA** — Comparar `Medidas.tmdl` actual vs backups `bak2/3/4` y `git log`; registrar hallazgo.
3. **Diseño filtro Período** — Documentar Año + Nivel y excepción anual (DAX conceptual, no código).
4. **Diseño filtro Zona/Región** — Documentar jerarquía y mapear Zona como derivado pendiente.
5. **Inventario medidas** — Tabla de 18 medidas vs contexto temporal (qué respeta semestre, qué mantiene anual, qué requiere adaptación, qué falta, qué queda condicionada/bloqueada).
6. **Validación cruzada** — Revisar SPEC ↔ DECISION_REGISTER ↔ DATA_CONTRACT ↔ MODELING_PRINCIPLES.
7. **Entrega PLAN → BUILD DOCUMENTAL** — Crear SPEC/PLAN/TASKS; REVIEW; luego APPLY/BUILD TÉCNICO tras aprobación.

## 4. Orden de implementación técnica (futuro, tras aprobación)

`PLAN → BUILD DOCUMENTAL (este PLAN) → REVIEW → APPLY/BUILD TÉCNICO`

Fase APPLY solo tras `APROBADO` explícito:

- Crear `ZonaMap` (si se aprueba) o columna calculada Zona.
- Crear medidas filtradas `Total Ingresantes (Año)` / `Total Matriculados (Semestre)` con lógica de excepción anual.
- Crear medida `Total Matriculados (Año completo)` solo si D002 semántico se resuelve (actualmente CONDICIONADA).
- Validar con `validate_tmdl` / `validate_dax` / `ConnectFolder`.

## 5. Validación

- Checklist SPEC §8.
- Confirmar 0 archivos protegidos modificados (`git status`).
- Confirmar no hay `displayFolder`/`isHidden` pendientes.

## 6. Riesgos

- Duplicar lógica anual/semestral en HTML en lugar de DAX → filtros inconsistentes.
- Inventar mapeo Norte/Centro sin D004 → storytelling geográfico erróneo.
- Restaurar QA sin evidencia → medida fantasma.
