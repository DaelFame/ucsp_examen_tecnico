# F004 — TASKS

## Auditoría previa

- [x] Auditar `DECISION_REGISTER.md` (F002) — D001-D007 existentes cubren reglas; **no se crea nuevo ID D008** (F004 compone D001/D003/D004/D007). Documentado en SPEC §9.
- [x] Auditar medida QA — Comparar `Medidas.tmdl` (18 medidas) vs backups `bak2/3/4` (18) vs `git log` (untracked, sin historial de borrado). **Conclusión: No hay evidencia inequívoca de medida QA eliminada; 4 QA intactas.** No restaurar. Tarea registrada como AUDITADA.

## Diseño (BUILD DOCUMENTAL)

- [x] Crear `SPEC.md` — Reglas de período, excepción anual, arquitectura Zona→Programa, dependencias D002/D004/D005, inventario 18 medidas, QA, criterios, archivos protegidos.
- [x] Crear `PLAN.md` — Secuencia y orden técnico futuro.
- [x] Crear `TASKS.md` (este archivo) — Checklist trazable.
- [x] Validar SPEC ↔︎ PLAN ↔︎ DECISION_REGISTER consistencia.

## Implementación F004 ETAPA 2 — 2026-08-28

- [x] Crear `Total Ingresantes (Año)` (M19) — `CALCULATE([Total Ingresantes], REMOVEFILTERS('dim_periodo'[SEMESTRE]))` — **CREADA**
- [x] Modificar `Total Ingresantes UCSP` → usa `[Total Ingresantes (Año)]` — **MODIFICADA**
- [x] Modificar `Ingresantes Año Anterior` → usa `[Total Ingresantes (Año)]` — **MODIFICADA**
- [x] Modificar `Variación % Ingresantes YoY` → usa `[Total Ingresantes (Año)]` — **MODIFICADA**
- [x] Modificar `Rango Programas Ingresantes` → usa `[Total Ingresantes (Año)]` — **MODIFICADA**
- [x] Modificar `Top 5 Programas por Ingresantes` → usa `[Total Ingresantes (Año)]` — **MODIFICADA**
- [x] Modificar `Bottom 5 Programas por Ingresantes` → usa `[Total Ingresantes (Año)]` — **MODIFICADA**
- [x] Validar `Total Matriculados`, `Rango/Top/Bottom Matriculados`, `Variación % Matriculados Semestre` — **NO modificadas** (ya correctas)
- [x] M20 `Total Matriculados (Año completo)` — **PENDING** (D002) — NO creada
- [x] Zona — **BLOQUEADA** (D004) — NO creado `ZonaMap`/columna/relaciones

## Implementación técnica (APPLY/BUILD TÉCNICO) — PENDIENTE / NO INICIAR (resto)

- [ ] Crear `ZonaMap` / columna Zona (requiere D004) — **BLOQUEADO**
- [ ] Crear `Total Matriculados (Año completo)` — **CONDICIONADA** por D002
- [ ] Validar `validate_tmdl` / `validate_dax` / `ConnectFolder` — ejecutado para M19 (ver abajo)

## QA y cierre

- [x] Validar `validate_tmdl` — isValid true, 0 errores
- [x] Validar `validate_dax` — M19 y rankings válidos
- [x] Validar `ConnectFolder` — 8 tablas, 19 medidas, 9 relaciones
- [x] Prueba Ingresantes 2022: Año=490566, S1=490566, S2=490566 (M19) — PASS
- [x] Prueba Rankings Ingresantes: Top5 y Rango equivalentes bajo Año/S1/S2 (M19) — PASS
- [x] Prueba UCSP y YoY: mantienen comportamiento anual bajo S1/S2 — PASS
- [x] No regresión Matriculados (Año=S1+S2, S1=S1, S2=S2) — PASS
- [x] No regresión QA (4 medidas intactas) — PASS
- [x] `git status` — único archivo modificado atribuible: `Medidas.tmdl` (+ .bak5)

## Gate

- [x] F004 ETAPA 2 implementada y validada — **DETENER** y presentar informe final
