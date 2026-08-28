# H02 — HTML Executive Scorecard — FEATURE SPEC

| Campo | Valor |
| ----- | ----- |
| Proyecto | demanda_UCSP |
| Feature ID | H02 |
| Nombre | HTML Executive Scorecard |
| Fase | Post-H01 Fases 1-3 / Pre-implementación HTML |
| Quality Gate | GATE 4 — UI / Presentación |
| Estado | Especificación y plan — Implementación PENDING |

---

## 1. Declaración Explícita

**H02 NO implementa lógica de negocio.**

- No crea medidas DAX, ni modifica TMDL, PBIR, PBIP, `dashboard/` ni Parquet.
- No recalcula: Market Share, Ranking, Posición, Líder, Brecha, Totales, YoY, reglas de granularidad temporal.
- Todas las reglas de negocio provienen **exclusivamente** de las medidas DAX de H01.
- H02 es **solo capa de presentación**: recibe datos vía contrato JSON y renderiza.

---

## 2. Propósito

Diseñar y documentar la arquitectura de la capa HTML que consumirá las medidas ya implementadas en H01 (Fases 1-3), definiendo:

- Contrato formal de datos DAX → HTML
- Componentes visuales del Scorecard ejecutivo
- Estados de UI y comportamientos edge-case
- Separación estricta de responsabilidades (DAX = negocio, HTML = presentación)
- Criterios de aceptación verificables

---

## 3. Alcance (In-Scope)

- **Contrato de datos** JSON que recibirá el HTML desde Power BI (vía visual personalizado o embedded)
- **Especificación de componentes** visuales (KPIs, ranking, tendencias, top 3+UCSP, market share)
- **Estados de UI** para todos los casos: sin datos, UCSP sin datos, filtro semestre, granularidad mismatches, D003 bloqueado
- **Terminología obligatoria** (Matrículas, Volumen de matrículas, Cuota de matrículas, Ranking por matrículas)
- **Estructura de implementación** (HTML/CSS/JS modular, sin lógica de negocio)
- **Criterios de aceptación** y plan de implementación por fases

---

## 4. Fuera de Alcance (Out-of-Scope)

- Implementar medidas DAX nuevas o modificar existentes
- Resolver D003 (Matrículas Año = S1+S2 como KPI oficial)
- Resolver D005-UI (alias "Pregrado" → CARRERA PROFESIONAL)
- Resolver D006-Cross (normalización cross-fact Ingresantes vs Matrículas)
- Crear columnas calculadas, relaciones, o modificar el modelo semántico
- Diseño visual definitivo (colores, tipografía, branding) — se define en implementación
- Backend / servidor / API — el HTML consume datos ya calculados por Power BI

---

## 5. Entradas (Inputs)

| Fuente | Qué aporta |
|--------|------------|
| `H01 — FINAL TECHNICAL SPECIFICATION` | Inventario de medidas, DAX, dependencias, matriz de filtros, semántica temporal |
| `H01 — Period & Program Semantic Validation v1` | Reglas de granularidad, riesgo doble conteo, comportamiento semestre |
| `H01 — Blocking Decisions Report v1` | Decisiones cerradas D002-C, D004, D005, D006 |
| `Medidas.tmdl` (31 medidas) | Medidas base, UCSP, Mercado, derivadas implementadas |
| `spec/MODELING_PRINCIPLES.md` | Principios P1–P16 (separación DAX/HTML, naming, etc.) |
| `spec/MISSION.md` | R1–R4 requisitos de negocio originales |

---

## 6. Decisiones H01 que Condicionan H02

| Decisión | Estado | Impacto en H02 |
|----------|--------|----------------|
| **D002-C** | CERRADA | Matrículas = **volumen**, no estudiantes únicos. UI debe etiquetar "Matrículas", "Cuota de matrículas". Nunca "Estudiantes". |
| **D004** | CERRADA | Solo `Region_Sur` nativo. Norte/Centro no disponibles. UI no ofrece slicers Norte/Centro. |
| **D005** | CERRADA | Solo `NIVEL_ACADEMICO` nativo (4 valores). No existe "Pregrado" en datos. UI usa valores nativos. |
| **D006** | CERRADA | Ingresantes = ANUAL nativo; Matrículas = SEMESTRAL nativo. UI respeta granularidad. |
| **D003** | BLOQUEADA | Medidas anuales de Matrículas NO existen. UI muestra `CONDITIONAL — D003` donde aplique. |
| **D005-UI** | BLOQUEADA | No alias "Pregrado". UI usa `NIVEL_ACADEMICO` nativo. |
| **D006-Cross** | BLOQUEADA | No lógica cross-fact Ingr/Matr en HTML. Solo DAX puede proveer. |

---

## 7. Medidas H01 Consumidas por H02

### Matrículas (Semestral nativa)
| Medida | Tipo | Display Folder | Estado |
|--------|------|----------------|--------|
| `Total Matrículas` | Base | — | ✅ Implementada |
| `Total Matrículas UCSP` | UCSP | — | ✅ Implementada |
| `Total Matrículas Mercado` | Mercado | — | ✅ Implementada |
| `Market Share Matrículas` | Derivada | — | ✅ Implementada |
| `Ranking Matrículas` | Derivada | — | ✅ Implementada |
| `Posición UCSP Matrículas` | Derivada | — | ✅ Implementada (corregida) |
| `Total Universidades` | Derivada | — | ✅ Implementada |
| `Universidad Líder Matrículas` | Derivada | — | ✅ Implementada |
| `Matrículas Líder` | Derivada | — | ✅ Implementada |
| `Brecha Matrículas vs Líder` | Derivada | — | ✅ Implementada |

### Ingresantes (Anual nativa)
| Medida | Tipo | Display Folder | Estado |
|--------|------|----------------|--------|
| `Total Ingresantes` | Base | — | ✅ Existente |
| `Total Ingresantes (Año)` | Base | — | ✅ Existente |
| `Total Ingresantes UCSP` | UCSP | — | ✅ Existente |
| `Total Ingresantes Mercado` | Mercado | — | ✅ Implementada |
| `Market Share Ingresantes` | Derivada | — | ✅ Implementada |
| `Ingresantes Año Anterior` | Helper | — | ✅ Existente |
| `Variación % Ingresantes YoY` | Derivada | — | ✅ Existente |

### Tendencias
| Medida | Granularidad | Estado |
|--------|--------------|--------|
| `Tendencia Matrículas` | Año + Semestre | ✅ Especificada (DAX) |
| `Tendencia Ingresantes` | Año | ✅ Especificada (DAX) |

### Medidas NO Disponibles (Bloqueadas D003)
| Medida | Motivo | UI debe mostrar |
|--------|--------|-----------------|
| `Total Matrículas Año` | D003 pendiente | `CONDITIONAL — D003` |
| `Total Matrículas Año UCSP` | D003 pendiente | `CONDITIONAL — D003` |
| `Total Matrículas Año Mercado` | D003 pendiente | `CONDITIONAL — D003` |
| `Market Share Matrículas Año` | D003 pendiente | `CONDITIONAL — D003` |
| `Ranking Matrículas Año` | D003 pendiente | `CONDITIONAL — D003` |
| `Posición UCSP Matrículas Año` | D003 pendiente | `CONDITIONAL — D003` |
| `Variación % Matrículas Año` | D003 pendiente | `CONDITIONAL — D003` |

---

## 8. Contrato de Datos DAX → HTML (Resumen)

El HTML recibe un **único objeto JSON** con esta estructura principal:

```json
{
  "contexto": { "anio": 2025, "semestre": null, "escala": "ANUAL", ... },
  "UCSP": { "matriculas": 12450, "ingresantes": 2850, ... },
  "MERCADO": { "matriculas": 100450, "cantidad_universidades": 42 },
  "RANKING": { "posicion_ucsp": 4, "total_universidades": 42, "lider": "...", "matriculas_lider": 28900, "brecha_vs_lider": -16450 },
  "TOP3_PLUS_UCSP": [ { "universidad": "...", "posicion": 1, "matriculas": 28900, "es_ucsp": false }, ... ],
  "TENDENCIA_MATRICULAS": [ { "anio": 2023, "semestre": 1, "matriculas": 9800 }, ... ],
  "TENDENCIA_INGRESANTES": [ { "anio": 2021, "ingresantes": 2100 }, ... ]
}
```

**Valores especiales soportados:**
- `null` — sin dato / no aplicable
- `"N/D — Escala anual"` — Matrículas en contexto Ingresantes semestral
- `"CONDITIONAL — D003"` — Medidas anuales Matrículas bloqueadas
- `BLANK` — UCSP sin datos en contexto

Ver `DATA_CONTRACT.md` para especificación completa.

---

## 9. Componentes Visuales Propuestos

| Componente | Medidas Fuente | Descripción |
|------------|----------------|-------------|
| **Header Contexto** | `contexto` | Año, Semestre, Programa, Nivel, Gestión, Depto, Provincia |
| **KPI Matrículas UCSP** | `UCSP.matriculas`, `UCSP.matriculas_yoy` | Tarjeta principal con YoY si disponible |
| **KPI Ingresantes UCSP** | `UCSP.ingresantes`, `UCSP.ingresantes_yoy` | Tarjeta principal anual |
| **Market Share Matrículas** | `UCSP.market_share_matriculas` | % con indicador visual |
| **Market Share Ingresantes** | `UCSP.market_share_ingresantes` | % anual |
| **Ranking + Posición UCSP** | `RANKING.*` | Tabla/gráfico: posición UCSP, total univs, líder, brecha |
| **Top 3 + UCSP** | `TOP3_PLUS_UCSP` | 4 filas: Top 3 + UCSP forzada |
| **Tendencia Matrículas** | `TENDENCIA_MATRICULAS` | Línea dual S1/S2 por año |
| **Tendencia Ingresantes** | `TENDENCIA_INGRESANTES` | Línea simple por año |
| **Estado D003** | — | Banner/infotip: "Medidas anuales de matrículas pendientes validación D003" |

---

## 10. Separación de Responsabilidades (Mandatoria)

| Responsabilidad | DAX (H01) | HTML (H02) |
|-----------------|-----------|------------|
| Cálculo de totales | ✅ | ❌ |
| Market Share | ✅ | ❌ |
| Ranking / Posición | ✅ | ❌ |
| Líder / Brecha | ✅ | ❌ |
| YoY / Variaciones | ✅ | ❌ |
| Granularidad temporal | ✅ | ❌ |
| Filtrado / Contexto | ✅ | ❌ (recibe ya filtrado) |
| Renderizado / Layout | ❌ | ✅ |
| Formato números / % | ❌ (opcional formato string) | ✅ |
| Tooltips / Ayuda | ❌ | ✅ |
| Estados vacíos / edge cases | ❌ (devuelve BLANK/null) | ✅ |
| Terminología UI | ❌ | ✅ (obliga "Matrículas") |

---

## 11. Riesgos

| Riesgo | Mitigación |
|--------|------------|
| HTML recalcula Market Share/Ranking | Contrato explícito: solo lectura; revisión de código |
| Terminología "Estudiantes" en UI | Checklist obligatorio: solo "Matrículas", "Volumen de matrículas" |
| D003 se filtra a UI sin aviso | Banner persistente + valores `CONDITIONAL — D003` en contrato |
| Filtro Semestre en Ingresantes | UI deshabilita slicer; muestra `N/D — Escala anual` |
| Empates en ranking | DAX usa `Dense`; HTML solo renderiza posición numérica |
| UCSP sin datos en contexto | Contrato devuelve `BLANK`; UI muestra estado vacío |

---

## 12. Criterios de Aceptación (Resumen)

1. **Contrato cumplido**: HTML consume exactamente el JSON especificado sin campos extra
2. **Cero lógica de negocio**: No hay `DIVIDE`, `RANKX`, `CALCULATE`, `SUM`, `TOPN` en JS
3. **Terminología correcta**: 100% "Matrículas" / "Cuota de matrículas" / "Ranking por matrículas"
4. **Estados edge cubiertos**: 7 casos (sin datos, UCSP sin datos, semestre en Ingr, D003, vacío, empate, BLANK)
5. **Granularidad respetada**: Ingr=Anual, Matr=Semestral; no mezcla en un mismo componente
6. **Decisiones bloqueadas visibles**: D003, D005-UI, D006-Cross señaladas en UI
7. **Performance**: Render < 200ms con dataset completo (Top 3 + tendencias 5 años)
8. **Accesibilidad**: Contraste AA, navegación teclado, ARIA labels

---

## 13. Gate de Salida

- Especificación aprobada (FEATURE_SPEC, DATA_CONTRACT, PLAN, ACCEPTANCE_CRITERIA)
- Plan de implementación aprobado por usuario
- Implementación HTML/CSS/JS autorizada
- GATE 4 aplicado al cierre de implementación