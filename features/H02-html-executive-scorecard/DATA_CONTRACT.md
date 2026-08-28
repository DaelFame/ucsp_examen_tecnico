# H02 — Data Contract DAX → HTML

**Versión:** 1.0  
**Fecha:** 2026-08-28  
**Estado:** Especificación — Implementación PENDING  
**Fuente:** H01 Fases 1-3 (31 medidas en `Medidas.tmdl`)

---

## 1. Principios del Contrato

1. **Unidireccional**: DAX → HTML (nunca al revés)
2. **Inmutable en runtime**: HTML no modifica, no calcula, no filtra
3. **Explícito**: Todos los campos documentados, sin campos "mágicos"
4. **Versionado**: Cambios requieren bump de versión y aprobación
5. **Valores especiales**: `null`, `BLANK`, `"N/D — Escala anual"`, `"CONDITIONAL — D003"`

---

## 2. Estructura Raíz del JSON

```json
{
  "version": "1.0",
  "timestamp": "2026-08-28T10:00:00Z",
  "contexto": { ... },
  "UCSP": { ... },
  "MERCADO": { ... },
  "RANKING": { ... },
  "TOP3_PLUS_UCSP": [ ... ],
  "TENDENCIA_MATRICULAS": [ ... ],
  "TENDENCIA_INGRESANTES": [ ... ],
  "meta": { ... }
}
```

---

## 3. Esquema Detallado por Sección

### 3.1 `contexto` — Contexto de Filtros Aplicados

```json
{
  "contexto": {
    "anio": 2025,
    "semestre": null,
    "escala": "ANUAL",
    "programa": null,
    "nivel_academico": null,
    "gestion": null,
    "departamento": null,
    "provincia": null,
    "region_sur": null,
    "universidad_seleccionada": null
  }
}
```

| Campo | Tipo | Valores | Descripción |
|-------|------|---------|-------------|
| `anio` | integer | 2020-2025 | Año seleccionado (obligatorio) |
| `semestre` | integer\|null | 1, 2, null | Semestre si aplica; `null` = año completo |
| `escala` | string | `"ANUAL"`, `"SEMESTRAL"` | Granularidad activa |
| `programa` | string\|null | Nombre programa | Filtro programa activo |
| `nivel_academico` | string\|null | `"MAESTRIA"`, `"CARRERA PROFESIONAL"`, `"SEGUNDA ESPECIALIDAD"`, `"DOCTORADO"` | Filtro nivel |
| `gestion` | string\|null | `"PUBLICA"`, `"PRIVADA"` | Filtro gestión |
| `departamento` | string\|null | Nombre departamento | Filtro geográfico |
| `provincia` | string\|null | Nombre provincia | Filtro geográfico |
| `region_sur` | boolean\|null | true, false, null | Filtro Region_Sur |
| `universidad_seleccionada` | string\|null | Nombre universidad | Universidad en slicer (ignora UCSP) |

**Reglas:**
- `escala = "ANUAL"` cuando `semestre = null`
- `escala = "SEMESTRAL"` cuando `semestre = 1 o 2`
- En contexto Ingresantes: `semestre` siempre `null`, `escala` siempre `"ANUAL"`

---

### 3.2 `UCSP` — KPIs de la Universidad Católica de Santa María

```json
{
  "UCSP": {
    "matriculas": 12450,
    "matriculas_yoy": 0.08,
    "matriculas_yoy_valor": 920,
    "ingresantes": 2850,
    "ingresantes_yoy": 0.12,
    "ingresantes_yoy_valor": 305,
    "market_share_matriculas": 0.124,
    "market_share_ingresantes": 0.156
  }
}
```

| Campo | Tipo | Valores Especiales | Descripción |
|-------|------|-------------------|-------------|
| `matriculas` | integer\|null | `null`, `BLANK` | Volumen matrículas UCSP (semestral o S1+S2 según contexto) |
| `matriculas_yoy` | number\|null | `null`, `BLANK` | Variación % YoY matrículas (si D003 resuelto) |
| `matriculas_yoy_valor` | integer\|null | `null`, `BLANK` | Diferencia absoluta YoY |
| `ingresantes` | integer\|null | `null`, `BLANK` | Ingresantes UCSP (siempre anual) |
| `ingresantes_yoy` | number\|null | `null`, `BLANK` | Variación % YoY ingresantes (existente) |
| `ingresantes_yoy_valor` | integer\|null | `null`, `BLANK` | Diferencia absoluta YoY |
| `market_share_matriculas` | number\|null | `null`, `BLANK` | Cuota % matrículas (semestral) |
| `market_share_ingresantes` | number\|null | `null`, `BLANK` | Cuota % ingresantes (anual) |

**Notas:**
- `matriculas_yoy` y `matriculas_yoy_valor`: `null` con `"CONDITIONAL — D003"` mientras D003 no resuelto
- `market_share_*`: `null` si `MERCADO.matriculas = 0` o `BLANK`

---

### 3.3 `MERCADO` — Agregados del Mercado

```json
{
  "MERCADO": {
    "matriculas": 100450,
    "ingresantes": 18250,
    "cantidad_universidades": 42,
    "cantidad_programas": 185
  }
}
```

| Campo | Tipo | Valores Especiales | Descripción |
|-------|------|-------------------|-------------|
| `matriculas` | integer\|null | `null`, `BLANK` | Total matrículas mercado (respeta ALLSELECTED) |
| `ingresantes` | integer\|null | `null`, `BLANK` | Total ingresantes mercado (respeta ALLSELECTED) |
| `cantidad_universidades` | integer | ≥0 | Universidades con datos en contexto (ALLSELECTED) |
| `cantidad_programas` | integer | ≥0 | Programas con datos en contexto |

---

### 3.4 `RANKING` — Posición Competitiva

```json
{
  "RANKING": {
    "posicion_ucsp": 4,
    "total_universidades": 42,
    "lider": "UNIVERSIDAD NACIONAL MAYOR DE SAN MARCOS",
    "matriculas_lider": 28900,
    "brecha_vs_lider": -16450,
    "universidad_lider_es_ucsp": false
  }
}
```

| Campo | Tipo | Valores Especiales | Descripción |
|-------|------|-------------------|-------------|
| `posicion_ucsp` | integer\|null | `null`, `BLANK` | Posición UCSP (1 = líder). `BLANK` si UCSP sin datos |
| `total_universidades` | integer | ≥1 | Total universidades en universo ALLSELECTED |
| `lider` | string\|null | `null`, `BLANK` | Nombre universidad #1 |
| `matriculas_lider` | integer\|null | `null`, `BLANK` | Matrículas del líder |
| `brecha_vs_lider` | integer\|null | `null`, `BLANK` | `matriculas_ucsp - matriculas_lider` (0 = líder, <0 = debajo) |
| `universidad_lider_es_ucsp` | boolean | — | `true` si UCSP es líder |

---

### 3.5 `TOP3_PLUS_UCSP` — Dataset Top 3 + UCSP

```json
{
  "TOP3_PLUS_UCSP": [
    { "universidad": "UNIVERSIDAD NACIONAL MAYOR DE SAN MARCOS", "posicion": 1, "matriculas": 28900, "es_ucsp": false },
    { "universidad": "UNIVERSIDAD NACIONAL DE INGENIERÍA", "posicion": 2, "matriculas": 19800, "es_ucsp": false },
    { "universidad": "UNIVERSIDAD CATÓLICA DEL PERÚ", "posicion": 3, "matriculas": 15600, "es_ucsp": false },
    { "universidad": "UNIVERSIDAD CATÓLICA DE SANTA MARÍA", "posicion": 4, "matriculas": 12450, "es_ucsp": true }
  ]
}
```

**Reglas:**
- Siempre 3-4 elementos (Top 3 + UCSP si no está en Top 3)
- Si UCSP en Top 3: 3 elementos, UCSP con `es_ucsp: true` en su posición
- Si UCSP fuera de Top 3: 4 elementos, UCSP añadida al final con su posición real
- `matriculas` = volumen matrículas en contexto actual (semestral o S1+S2)
- Orden: por `posicion` ascendente

---

### 3.6 `TENDENCIA_MATRICULAS` — Serie Temporal Matrículas

```json
{
  "TENDENCIA_MATRICULAS": [
    { "anio": 2021, "semestre": 1, "matriculas": 8200 },
    { "anio": 2021, "semestre": 2, "matriculas": 8650 },
    { "anio": 2022, "semestre": 1, "matriculas": 9100 },
    { "anio": 2022, "semestre": 2, "matriculas": 9550 },
    { "anio": 2023, "semestre": 1, "matriculas": 10200 },
    { "anio": 2023, "semestre": 2, "matriculas": 10800 },
    { "anio": 2024, "semestre": 1, "matriculas": 11400 },
    { "anio": 2024, "semestre": 2, "matriculas": 11950 },
    { "anio": 2025, "semestre": 1, "matriculas": 12450 }
  ]
}
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `anio` | integer | Año |
| `semestre` | integer | 1 o 2 |
| `matriculas` | integer\|null | Volumen matrículas UCSP en ese semestre |

**Reglas:**
- Solo semestres con datos (granularidad nativa SEMESTRAL)
- Máximo 5 años históricos (según datos disponibles)
- Si contexto filtra Programa/Depto: serie filtrada

---

### 3.7 `TENDENCIA_INGRESANTES` — Serie Temporal Ingresantes

```json
{
  "TENDENCIA_INGRESANTES": [
    { "anio": 2021, "ingresantes": 2100 },
    { "anio": 2022, "ingresantes": 2350 },
    { "anio": 2023, "ingresantes": 2600 },
    { "anio": 2024, "ingresantes": 2750 },
    { "anio": 2025, "ingresantes": 2850 }
  ]
}
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `anio` | integer | Año |
| `ingresantes` | integer\|null | Ingresantes UCSP en ese año |

**Reglas:**
- Granularidad ANUAL nativa (no hay semestres)
- Máximo 5 años históricos
- Si contexto filtra Programa/Depto: serie filtrada

---

### 3.8 `meta` — Metadatos del Contrato

```json
{
  "meta": {
    "contract_version": "1.0",
    "generated_at": "2026-08-28T10:00:00Z",
    "source_measures_count": 31,
    "warnings": [
      "CONDITIONAL — D003: Medidas anuales de matrículas no disponibles",
      "D005-UI: Nivel académico usa valores nativos (sin alias Pregrado)"
    ]
  }
}
```

---

## 4. Mapeo Medidas H01 → Campos Contrato

| Medida H01 | Campo Contrato | Transformación |
|------------|----------------|----------------|
| `Total Matrículas UCSP` | `UCSP.matriculas` | Directo |
| `Total Matrículas Mercado` | `MERCADO.matriculas` | Directo |
| `Market Share Matrículas` | `UCSP.market_share_matriculas` | Directo (ya %) |
| `Total Ingresantes UCSP` | `UCSP.ingresantes` | Directo |
| `Total Ingresantes Mercado` | `MERCADO.ingresantes` | Directo |
| `Market Share Ingresantes` | `UCSP.market_share_ingresantes` | Directo (ya %) |
| `Variación % Ingresantes YoY` | `UCSP.ingresantes_yoy` | Directo |
| `Ranking Matrículas` (eval UCSP) | `RANKING.posicion_ucsp` | RANKX sobre UCSP |
| `Total Universidades` | `RANKING.total_universidades` | Directo |
| `Universidad Líder Matrículas` | `RANKING.lider` | Directo |
| `Matrículas Líder` | `RANKING.matriculas_lider` | Directo |
| `Brecha Matrículas vs Líder` | `RANKING.brecha_vs_lider` | Directo |
| `Top 3 + UCSP Dataset` | `TOP3_PLUS_UCSP` | Directo (array) |
| `Tendencia Matrículas` | `TENDENCIA_MATRICULAS` | Directo (array) |
| `Tendencia Ingresantes` | `TENDENCIA_INGRESANTES` | Directo (array) |

**Medidas NO mapeadas (D003):**
- `Total Matrículas Año` → `UCSP.matriculas` (anual) — **CONDITIONAL — D003**
- `Market Share Matrículas Año` → `UCSP.market_share_matriculas` (anual) — **CONDITIONAL — D003**
- `Ranking Matrículas Año` → `RANKING.posicion_ucsp` (anual) — **CONDITIONAL — D003**

---

## 5. Manejo de Valores Especiales

### 5.1 `null` vs `BLANK`
| Situación | Valor en JSON | Significado |
|-----------|---------------|-------------|
| Medida devuelve BLANK en DAX | `null` | Sin datos en contexto |
| UCSP sin datos | `BLANK` string | Explícito: UCSP no existe en contexto |
| Mercado vacío | `null` | Universo ALLSELECTED sin resultados |

### 5.2 `"N/D — Escala anual"`
| Componente | Cuándo aparece |
|------------|----------------|
| KPI Matrículas en contexto semestre | Usuario selecciona Semestre=1 pero visual es Ingresantes |
| Tendencia Matrículas | Usuario visualiza Ingresantes + Matrículas juntos |

### 5.3 `"CONDITIONAL — D003"`
| Campo | Cuándo aparece |
|-------|----------------|
| `UCSP.matriculas_yoy` | Siempre mientras D003 no resuelto |
| `UCSP.market_share_matriculas` (anual) | Contexto anual solicitado |
| `RANKING.posicion_ucsp` (anual) | Contexto anual solicitado |
| Cualquier campo derivado de medidas anuales Matrículas | — |

---

## 6. Estados de UI por Contexto

| Contexto Usuario | `contexto.escala` | `UCSP.matriculas` | `UCSP.ingresantes` | `RANKING` | `TOP3_PLUS_UCSP` | `TENDENCIA_MATRICULAS` | `TENDENCIA_INGRESANTES` |
|------------------|-------------------|-------------------|-------------------|-----------|------------------|------------------------|------------------------|
| Año solo (2025) | ANUAL | S1+S2 | Año | Semestral* | Semestral* | S1/S2 histórico | Año histórico |
| Año + S1 | SEMESTRAL | S1 | N/D — Escala anual | S1 | S1 | S1 histórico | Año histórico |
| Año + S2 | SEMESTRAL | S2 | N/D — Escala anual | S2 | S2 | S2 histórico | Año histórico |
| Año + Programa | ANUAL | S1+S2 filtro | Año filtro | Semestral filtro | Semestral filtro | S1/S2 filtro | Año filtro |
| Sin selección | ANUAL (último) | S1+S2 último | Año último | Semestral último | Semestral último | S1/S2 último | Año último |

*En contexto "Año solo", Ranking/Top3 usan granularidad semestral (S1+S2) porque Matrículas no tiene medida anual validada (D003). Ver Sección 8.

---

## 7. Validación del Contrato

### 7.1 Checks Obligatorios (HTML Side)
```javascript
// 1. Version check
if (data.version !== "1.0") throw new Error("Contract version mismatch");

// 2. Required sections
const required = ["contexto", "UCSP", "MERCADO", "RANKING", "TOP3_PLUS_UCSP", "TENDENCIA_MATRICULAS", "TENDENCIA_INGRESANTES"];
required.forEach(key => { if (!data[key]) throw new Error(`Missing section: ${key}`); });

// 3. UCSP exists check
if (data.UCSP.matriculas === null && data.UCSP.ingresantes === null) {
  // UI: mostrar estado "UCSP sin datos en contexto actual"
}

// 4. Market share validity
if (data.MERCADO.matriculas === 0 || data.MERCADO.matriculas === null) {
  // UI: market_share_matriculas = "N/D — Mercado sin datos"
}
```

### 7.2 Type Guards
```typescript
interface DataContract {
  version: string;
  contexto: Contexto;
  UCSP: UCSPKPIs;
  MERCADO: MercadoKPIs;
  RANKING: RankingData;
  TOP3_PLUS_UCSP: Top3Item[];
  TENDENCIA_MATRICULAS: TendenciaMatricula[];
  TENDENCIA_INGRESANTES: TendenciaIngresante[];
  meta: Meta;
}
```

---

## 8. Dependencias Bloqueadas (Fuera de Contrato v1.0)

| Dependencia | Impacto en Contrato | Acción |
|-------------|---------------------|--------|
| **D003** | Campos `*_anual` Matrículas = `CONDITIONAL — D003` | No implementar hasta resolución |
| **D005-UI** | `contexto.nivel_academico` usa valores nativos | No alias "Pregrado" |
| **D006-Cross** | No hay campo `tasa_conversion_ingresantes_matriculas` | No cross-fact en v1.0 |

---

## 9. Changelog

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 1.0 | 2026-08-28 | Contrato inicial basado en H01 Fases 1-3 |