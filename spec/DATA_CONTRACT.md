# DATA_CONTRACT — demanda_UCSP

| Campo | Valor |
| ----- | ----- |
| Proyecto | demanda_UCSP |
| Documento | Contrato de datos |
| Estado | Actualizado con evidencia de F001 (Data Quality Audit) — FASE 1 |

## 1. Propósito

Documentar el inventario **conocido** de tablas, columnas y claves del proyecto, según
la auditoría inicial.

**Importante:** este contrato **no declara** que las claves sean válidas como PK/FK. Esa
validación es responsabilidad de la FASE 1 — Data Quality Audit.

## 2. Ubicación física de los datos

Los datos fuente están en:

```
D:\Proyectos\A.Prueba Tecnica UCSP\data\Dashboard_parquet\
```

Los 7 archivos Parquet detectados:

| Archivo | Tabla asociada |
| ------- | -------------- |
| `dim_local.parquet` | dim_local |
| `dim_periodo.parquet` | dim_periodo |
| `dim_programa.parquet` | dim_programa |
| `dim_ubicacion.parquet` | dim_ubicacion |
| `dim_universidad.parquet` | dim_universidad |
| `fact_ingresantes_dashboard.parquet` | fact_ingresantes_dashboard |
| `fact_matriculados_dashboard.parquet` | fact_matriculados_dashboard |

Las particiones TMDL apuntan a estos archivos (modo import).

## 3. Convención de estados

| Estado | Significado |
| ------ | ----------- |
| CONFIRMADO | Verificado mediante lectura en la auditoría inicial. |
| [POR VALIDAR] | Requiere validación en FASE 1 (calidad de datos). |
| DECISIÓN PENDIENTE | No se ha decidido aún cómo tratar el elemento. |

### Evidencia (F001 — Data Quality Audit)

- Fuente: ejecución de `features/F001-data-quality-audit/audit_data_quality.py`.
- Detalle completo: `features/F001-data-quality-audit/DATA_QUALITY_REPORT.md`.
- Tipos observados en Parquet: SK/FK = `uint32`; `SEMESTRE` = `float64` (6 nulos);
  el resto coincide con TMDL. El TMDL declara SK/FK y SEMESTRE como `int64`.
  Alineación de tipos: **DECISIÓN PENDIENTE** (no resuelta en F001).

## 4. DIMENSIONES

### 4.1 dim_local

| Columna | Tipo | Estado |
| ------- | ---- | ------ |
| SK_Local | int64 | CONFIRMADO (existe). Unicidad: CONFIRMADO (0 nulos, 0 duplicados, F001). |
| CODIGO_LOCAL | string | CONFIRMADO (existe). |
| DEPARTAMENTO_LOCAL | string | CONFIRMADO (existe). |
| PROVINCIA_LOCAL | string | CONFIRMADO (existe). |
| DISTRITO_LOCAL | string | CONFIRMADO (existe). |
| ES_LOCAL_PRINCIPAL | string | CONFIRMADO (existe). |
| CODIGO_UBIGEO_INEI_LOCAL | int64 | CONFIRMADO (existe). |

- SK: `SK_Local`. Unicidad CONFIRMADA (0 nulos, 0 duplicados, F001); válida como clave candidata.
- Relación esperada: dim_local → fact_matriculados_dashboard (FK_Local) [POR VALIDAR].

### 4.2 dim_periodo

| Columna | Tipo | Estado |
| ------- | ---- | ------ |
| SK_Periodo | int64 | CONFIRMADO (existe). Unicidad: CONFIRMADO (0 nulos, 0 duplicados, F001). |
| ANIO | int64 | CONFIRMADO (existe). |
| SEMESTRE | int64 | CONFIRMADO (existe). |
| LABEL_PERIODO | string | CONFIRMADO (existe). |
| TIPO_PERIODO | string | CONFIRMADO (existe). |

- SK: `SK_Periodo`. Unicidad CONFIRMADA (0 nulos, 0 duplicados, F001); válida como clave candidata.
- Relación esperada: dim_periodo → hechos (FK_Periodo) [POR VALIDAR].
- Cobertura temporal: CONFIRMADO (2020-2025, F001). Detalle: 6 períodos anuales y 12
  semestrales en `dim_periodo`; ingresantes usa 6 períodos (anuales), matriculados usa 12
  (semestrales). Granularidad de comparación: DECISIÓN PENDIENTE.

### 4.3 dim_programa

| Columna | Tipo | Estado |
| ------- | ---- | ------ |
| SK_Programa | int64 | CONFIRMADO (existe). Unicidad: CONFIRMADO (0 nulos, 0 duplicados, F001). |
| CODIGO_SIU_PROGRAMA | int64 | CONFIRMADO (existe). |
| NOMBRE_PROGRAMA | string | CONFIRMADO (existe). |
| CODIGO_GRUPO_1 | double | CONFIRMADO (existe). |
| NOMBRE_GRUPO_1 | string | CONFIRMADO (existe). |
| CODIGO_GRUPO_3 | double | CONFIRMADO (existe). |
| NOMBRE_GRUPO_3 | string | CONFIRMADO (existe). |
| NIVEL_ACADEMICO | string | CONFIRMADO (existe). |

- SK: `SK_Programa`. Unicidad CONFIRMADA (0 nulos, 0 duplicados, F001); válida como clave candidata.
- Relación esperada: dim_programa → hechos (FK_Programa) [POR VALIDAR].
- Nivel de análisis objetivo: Programa Profesional de Pregrado. Filtrado por
  `NIVEL_ACADEMICO`: hecho observado (valores: CARRERA PROFESIONAL, MAESTRIA, SEGUNDA
  ESPECIALIDAD, DOCTORADO; sin literal "Pregrado"). Mapeo Pregrado ↔ CARRERA PROFESIONAL:
  DECISIÓN PENDIENTE.

### 4.4 dim_ubicacion

| Columna | Tipo | Estado |
| ------- | ---- | ------ |
| SK_Ubicacion | int64 | CONFIRMADO (existe). Unicidad: CONFIRMADO (0 nulos, 0 duplicados, F001). |
| DEPARTAMENTO | string | CONFIRMADO (existe). |
| PROVINCIA | string | CONFIRMADO (existe). |
| Region_Sur | boolean | CONFIRMADO (existe). |

- SK: `SK_Ubicacion`. Unicidad CONFIRMADA (0 nulos, 0 duplicados, F001); válida como clave candidata.
- Relación esperada: dim_ubicacion → hechos (FK_Ubicacion) [POR VALIDAR].
- `Region_Sur` (boolean) es la base del filtro obligatorio "Nivel sur del país":
  CONFIRMADO (True 23, False 75, 0 nulos, F001). Interpretación de negocio: DECISIÓN PENDIENTE.
- `DEPARTAMENTO` es la base del filtro obligatorio "Departamento": CONFIRMADO (98 valores
  sin nulos, F001).

### 4.5 dim_universidad

| Columna | Tipo | Estado |
| ------- | ---- | ------ |
| SK_Universidad | int64 | CONFIRMADO (existe). Unicidad: CONFIRMADO (0 nulos, 0 duplicados, F001). |
| CODIGO_INEI | string | CONFIRMADO (existe). |
| NOMBRE_ENTIDAD | string | CONFIRMADO (existe). |
| TIPO_ENTIDAD | string | CONFIRMADO (existe). |
| TIPO_GESTION | string | CONFIRMADO (existe). |
| TIPO_CONSTITUCION | string | CONFIRMADO (existe). |
| ESTADO_LICENCIAMIENTO | string | CONFIRMADO (existe). |

- SK: `SK_Universidad`. Unicidad CONFIRMADA (0 nulos, 0 duplicados, F001); válida como clave candidata.
- Relación esperada: dim_universidad → hechos (FK_Universidad) [POR VALIDAR].
- `TIPO_GESTION` es la base del filtro obligatorio "Gestión: privada / pública":
  hecho observado (PRIVADO 90, PUBLICO 87, 0 nulos, F001). Mapeo al dominio contractual
  privada/pública: DECISIÓN PENDIENTE.
- Identificación de la UCSP en `NOMBRE_ENTIDAD`: hecho observado
  (`UNIVERSIDAD CATOLICA SAN PABLO`, sin tilde; 1 coincidencia normalizada, F001).
  Normalización del string: DECISIÓN PENDIENTE.

## 5. HECHOS

### 5.1 fact_ingresantes_dashboard

| Columna | Tipo | Rol | Estado |
| ------- | ---- | --- | ------ |
| FK_Universidad | int64 | FK | CONFIRMADO (existe). Integridad: CONFIRMADO (100%, 0 huérfanos, F001). |
| FK_Programa | int64 | FK | CONFIRMADO (existe). Integridad: CONFIRMADO (100%, 0 huérfanos, F001). |
| FK_Periodo | int64 | FK | CONFIRMADO (existe). Integridad: CONFIRMADO (100%, 0 huérfanos, F001). |
| FK_Ubicacion | int64 | FK | CONFIRMADO (existe). Integridad: CONFIRMADO (100%, 0 huérfanos, F001). |
| SEXO | string | Atributo | CONFIRMADO (existe). |
| RANGO_EDAD | string | Atributo | CONFIRMADO (existe). |
| Conteo_Ingresantes | int64 | Métrica fuente | CONFIRMADO (existe). Semántica de agregación: [POR VALIDAR]. |

- Métrica fuente: `Conteo_Ingresantes`. Semántica de agregación: [POR VALIDAR]
  (depende de la granularidad y el significado de la métrica).
- Granularidad observable: [POR VALIDAR].
- Correspondencia con dimensiones: CONFIRMADO (100% integridad FK, F001).

### 5.2 fact_matriculados_dashboard

| Columna | Tipo | Rol | Estado |
| ------- | ---- | --- | ------ |
| FK_Universidad | int64 | FK | CONFIRMADO (existe). Integridad: CONFIRMADO (100%, 0 huérfanos, F001). |
| FK_Programa | int64 | FK | CONFIRMADO (existe). Integridad: CONFIRMADO (100%, 0 huérfanos, F001). |
| FK_Periodo | int64 | FK | CONFIRMADO (existe). Integridad: CONFIRMADO (100%, 0 huérfanos, F001). |
| FK_Ubicacion | int64 | FK | CONFIRMADO (existe). Integridad: CONFIRMADO (100%, 0 huérfanos, F001). |
| FK_Local | int64 | FK | CONFIRMADO (existe). Integridad: CONFIRMADO (100%, 0 huérfanos, F001). |
| SEXO | string | Atributo | CONFIRMADO (existe). |
| RANGO_EDAD | string | Atributo | CONFIRMADO (existe). |
| Conteo_Matriculados | int64 | Métrica fuente | CONFIRMADO (existe). Semántica de agregación: [POR VALIDAR]. |

- Métrica fuente: `Conteo_Matriculados`. Semántica de agregación: [POR VALIDAR]
  (depende de la granularidad y el significado de la métrica).
- Granularidad observable: [POR VALIDAR].
- Correspondencia con dimensiones: CONFIRMADO (100% integridad FK, F001).
- `FK_Local` conecta con dim_local: CONFIRMADO (100% integridad, 0 huérfanos, F001).

## 6. Relaciones (estado actual)

- Relaciones definidas en el modelo: **0** (auditoría inicial).
- Integridad FK → SK validada en F001: **100% en las 9 relaciones** (0 nulos, 0 huérfanos).
- Cardinalidad evidenciada: **muchos-a-uno (1:N)** (dimensión en lado "uno", hecho en lado
  "muchos").
- Relaciones esperadas (integridad confirmada por F001; a crear en FASE 2):

| Origen | Destino | Cardinalidad | Estado |
| ------ | ------- | ------------ | ------ |
| fact_ingresantes_dashboard (FK_Universidad) | dim_universidad (SK_Universidad) | CONFIRMADO (1:N) | Confirmada (F001) |
| fact_ingresantes_dashboard (FK_Programa) | dim_programa (SK_Programa) | CONFIRMADO (1:N) | Confirmada (F001) |
| fact_ingresantes_dashboard (FK_Periodo) | dim_periodo (SK_Periodo) | CONFIRMADO (1:N) | Confirmada (F001) |
| fact_ingresantes_dashboard (FK_Ubicacion) | dim_ubicacion (SK_Ubicacion) | CONFIRMADO (1:N) | Confirmada (F001) |
| fact_matriculados_dashboard (FK_Universidad) | dim_universidad (SK_Universidad) | CONFIRMADO (1:N) | Confirmada (F001) |
| fact_matriculados_dashboard (FK_Programa) | dim_programa (SK_Programa) | CONFIRMADO (1:N) | Confirmada (F001) |
| fact_matriculados_dashboard (FK_Periodo) | dim_periodo (SK_Periodo) | CONFIRMADO (1:N) | Confirmada (F001) |
| fact_matriculados_dashboard (FK_Ubicacion) | dim_ubicacion (SK_Ubicacion) | CONFIRMADO (1:N) | Confirmada (F001) |
| fact_matriculados_dashboard (FK_Local) | dim_local (SK_Local) | CONFIRMADO (1:N) | Confirmada (F001) |

## 7. Inventario de elementos [POR VALIDAR] y resueltos

### Resueltos por F001 (evidencia objetiva)

- Unicidad de SK en las 5 dimensiones: **CONFIRMADO** (0 nulos, 0 duplicados).
- Integridad de FK en los 2 hechos: **CONFIRMADO** (100%, 0 huérfanos).
- Cardinalidad de cada relación esperada: **CONFIRMADO** (1:N).
- Nulos en claves y métricas: **CONFIRMADO** (0 nulos). Única columna con nulos:
  `dim_periodo.SEMESTRE` (6/18 = 33.33%).
- Cobertura temporal (rango): **CONFIRMADO** (2020-2025, sin huérfanos de período).
- Correspondencia y consistencia entre dimensiones y hechos: **CONFIRMADO** (100%).
- Valores de `Region_Sur`: **CONFIRMADO** (True 23 / False 75 / 0 nulos).

### Hechos observados (no convertidos a regla contractual)

- `TIPO_GESTION`: valores observados `PRIVADO` / `PUBLICO`.
- `NIVEL_ACADEMICO`: sin literal "Pregrado" (valores CARRERA PROFESIONAL, MAESTRIA,
  SEGUNDA ESPECIALIDAD, DOCTORADO).
- Identificación UCSP: `UNIVERSIDAD CATOLICA SAN PABLO` (sin tilde).

### Permanecen [POR VALIDAR]

- Granularidad observable de cada hecho.
- Semántica de agregación de `Conteo_Ingresantes` y `Conteo_Matriculados`.
- Granularidad temporal de comparación (anual vs semestral) para las preguntas
  obligatorias.

## 8. Inventario de DECISIONES PENDIENTES

- Alineación de tipos Parquet vs TMDL (`uint32` SK/FK; `SEMESTRE` float64 con nulos).
- Manejo de los 6 nulos de `SEMESTRE` (períodos anuales sin semestre).
- Mapeo de `TIPO_GESTION` a dominio contractual (privada / pública).
- Mapeo de Pregrado en `NIVEL_ACADEMICO` (equivalencia con CARRERA PROFESIONAL).
- Normalización del string de identificación de la UCSP (sin tilde).
- Granularidad temporal de comparación para benchmark y rankings.
- Pandas vs Polars (resuelto para F001; ver `TECH_STACK.md` — esta auditoría se ejecutó
  con pandas).
- Uso analítico de `SEXO` y `RANGO_EDAD` (mejora opcional M1).
- Uso de `dim_local` y del atributo de local (mejora opcional M2).
- Uso de `SEMESTRE` como nivel temporal (mejora opcional M3).
- Definición definitiva de medidas base (FASE 3).
- Definición definitiva de relaciones y cardinalidades (FASE 2).

## 9. Estado de este documento

- Estado: **Actualizado con evidencia de F001 (FASE 1)**.
- Los estados CONFIRMADO reflejan hallazgos objetivos de la auditoría; los elementos
  sin evidencia suficiente permanecen `[POR VALIDAR]` o como `DECISIÓN PENDIENTE`.