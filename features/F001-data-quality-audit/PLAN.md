# F001 — Data Quality Audit — PLAN

| Campo | Valor |
| ----- | ----- |
| Feature | F001 |
| Fase | FASE 1 |
| Script | `audit_data_quality.py` |
| Modo | Solo lectura |

## Pruebas que ejecutará Python

### 1. Inventario de datasets

- Descubrir los 7 Parquet en `data/Dashboard_parquet/`.
- Para cada uno: nombre, número de filas, número de columnas, nombres de columnas y
  tipos de datos.

### 2. Schema

- Leer el schema real de cada Parquet.
- Identificar columnas SK (`SK_*`) y FK (`FK_*`) por convención de nombres.
- Registrar tipos de datos por columna.

### 3. Unicidad de SK

- Para cada dimensión con columna SK: total de filas, valores únicos, SK NULL,
  SK duplicadas.
- Determinar si la SK es usable como clave primaria.

### 4. Nulos

- Para cada columna de cada dataset: cantidad y porcentaje de nulos.
- Destacar columnas con nulos significativos.

### 5. Integridad FK → SK

- Para cada hecho, mapear cada FK con la SK correspondiente de la dimensión.
- Calcular FK NULL, FK válida, FK huérfana y porcentaje de integridad.

### 6. Huérfanos

- Identificar registros de hechos cuya FK no existe en la dimensión correspondiente.

### 7. Dominios categóricos

- `dim_universidad[TIPO_GESTION]`: valores y frecuencias.
- `dim_ubicacion[Region_Sur]`: True / False / NULL y porcentajes.
- `dim_programa[NIVEL_ACADEMICO]`: valores distintos, frecuencias, NULL, presencia de
  Pregrado y conteo.

### 8. Validación de UCSP

- Buscar `UNIVERSIDAD CATÓLICA SAN PABLO` en `dim_universidad[NOMBRE_ENTIDAD]`.
- Evaluar coincidencia exacta, mayúsculas/minúsculas, tildes, espacios y variantes.
- No corregir ninguna variante.

### 9. Cobertura temporal

- Comparar `dim_periodo` contra ambos hechos.
- Años existentes, semestres/períodos existentes.
- Períodos en dimensión ausentes en hechos y viceversa.

### 10. Métricas fuente

- `Conteo_Ingresantes` y `Conteo_Matriculados`: dtype, nulos, mínimo, máximo, ceros,
  negativos, cardinalidad y granularidad aparente.
- No determinar SUM/COUNT/AVERAGE sin análisis de granularidad.

## Restricciones de ejecución

- No modificar ningún Parquet.
- No modificar `dashboard/`, MCP ni Power BI.
- Resultados reproducibles y claros.