# TECH_STACK — demanda_UCSP

| Campo | Valor |
| ----- | ----- |
| Proyecto | demanda_UCSP |
| Documento | Stack tecnológico y responsabilidades |
| Estado | Vigente desde la FASE 0 |

## 1. Principio de separación de responsabilidades

La regla central de este stack es la **separación estricta**:

```
powerbi-modeling-mcp  →  Semantic Model
powerbi-report-mcp    →  Report
```

- No existe solapamiento de responsabilidades.
- Ninguna herramienta realiza tareas asignadas a otra.
- Los visuales personalizados o de terceros **no se crean mediante MCP**.

## 2. Herramientas previstas

### 2.1 Power BI Desktop

| Campo | Detalle |
| ----- | ------- |
| Propósito | Entorno de diseño y ejecución del proyecto PBIP (modelo + reporte). |
| Responsabilidad | Hospedar el proyecto `demanda_UCSP.pbip`; ejecutar y renderizar el dashboard. |
| Cuándo utilizarla | Apertura y vista del proyecto; operaciones que requieran el motor de Desktop (refresco, render). |
| Qué puede modificar | El proyecto abierto en Desktop (modelo y reporte) si se opera manualmente. |
| Qué no debe modificar | No debe usarse para ediciones masivas/automatizadas por MCP sin control. |
| Riesgos | Sobrescribir artefactos TMDL/PBIR si se guarda sin control; sesiones "Sin título" que no reflejan el proyecto. |

### 2.2 PBIP (Power BI Project)

| Campo | Detalle |
| ----- | ------- |
| Propósito | Formato de proyecto en archivos (`demanda_UCSP.pbip`). |
| Responsabilidad | Declarar los artefactos del proyecto (reporte y referencia al modelo). |
| Cuándo utilizarla | Como estructura raíz del proyecto; referencia oficial del Report. |
| Qué puede modificar | La declaración de artefactos del proyecto. |
| Qué no debe modificar | El contenido TMDL/PBIR (se gestiona en sus propios artefactos). |
| Riesgos | Desincronización entre `.pbip` y sus artefactos. |

### 2.3 TMDL (Tabular Model Definition Language)

| Campo | Detalle |
| ----- | ------- |
| Propósito | Definición del modelo semántico (tablas, columnas, particiones, relaciones, medidas). |
| Responsabilidad | Ser la fuente canónica del Semantic Model. |
| Cuándo utilizarla | Definir y revisar la estructura del modelo. |
| Qué puede modificar | El contenido del Semantic Model. |
| Qué no debe modificar | El reporte (PBIR). |
| Riesgos | Ediciones manuales inconsistentes con el modelo abierto en Desktop. |

### 2.4 PBIR (Power BI Report definition)

| Campo | Detalle |
| ----- | ------- |
| Propósito | Definición del reporte (páginas, visuales, filtros, temas). |
| Responsabilidad | Ser la fuente canónica del Report. |
| Cuándo utilizarla | Definir y revisar la estructura del reporte. |
| Qué puede modificar | El contenido del Report. |
| Qué no debe modificar | El modelo semántico (TMDL). |
| Riesgos | Referencias rotas al Semantic Model si cambia la ruta. |

### 2.5 powerbi-modeling-mcp

| Campo | Detalle |
| ----- | ------- |
| Propósito | Operar el Semantic Model (lectura y construcción). |
| Responsabilidad | Tablas, columnas, relaciones, medidas, columnas calculadas, jerarquías, roles. |
| Cuándo utilizarla | Modelado semántico (FASE 2 en adelante). |
| Qué puede modificar | Únicamente el Semantic Model. |
| Qué no puede modificar | Report, PBIR, temas, visuales, páginas. |
| Riesgos | Conexión a una instancia de Desktop equivocada (p. ej. "Sin título"); dependencia de Desktop abierto vía XMLA. |

### 2.6 powerbi-report-mcp

| Campo | Detalle |
| ----- | ------- |
| Propósito | Operar el Report (lectura y construcción). |
| Responsabilidad | Páginas, visuales, filtros, slicers, bookmarks, temas. |
| Cuándo utilizarla | Construcción del reporte (FASE 4 en adelante). |
| Qué puede modificar | Únicamente el Report. |
| Qué no puede modificar | Modelo semántico, TMDL, medidas de modelo. |
| Riesgos | Ruta de reporte mal configurada; apuntar a un reporte inexistente. |

### 2.7 Parquet

| Campo | Detalle |
| ----- | ------- |
| Propósito | Almacenamiento físico de datos fuente. |
| Responsabilidad | Contener los datos crudos por tabla. |
| Cuándo utilizarla | Como origen de datos del modelo (modo import). |
| Qué puede modificar | Nada (es fuente, no se edita). |
| Qué no debe modificar | No debe editarse en esta fase. |
| Riesgos | Esquema o tipos distintos a los declarados en TMDL [POR VALIDAR]. |

### 2.8 Python

| Campo | Detalle |
| ----- | ------- |
| Propósito | Auditoría programática de los Parquet (FASE 1). |
| Responsabilidad | Validar esquema, claves, integridad, nulos, cobertura, etc. |
| Cuándo utilizarla | FASE 1 — Data Quality Audit. |
| Qué puede modificar | Nada del dashboard; solo genera informes/evidencias. |
| Qué no debe modificar | TMDL, PBIR, PBIP. |
| Riesgos | Lecturas con memoria insuficiente según tamaño de datos. |

### 2.9 Pandas o Polars (decisión pendiente)

| Campo | Detalle |
| ----- | ------- |
| Propósito | Procesamiento de Parquet en la auditoría de FASE 1. |
| Responsabilidad | Cargas, validaciones y métricas de calidad. |
| Cuándo utilizarla | FASE 1 — Data Quality Audit. |
| Qué puede modificar | Nada del dashboard. |
| Qué no debe modificar | TMDL, PBIR, PBIP. |
| Riesgos | Elección de librería sin confirmar; diferencias de rendimiento según volumen. |
| Estado | **DECISIÓN PENDIENTE** — Pandas o Polars se decide al iniciar FASE 1. |

### 2.10 Documentación Markdown

| Campo | Detalle |
| ----- | ------- |
| Propósito | Gobernanza y trazabilidad del proyecto. |
| Responsabilidad | Constitución, spec, features (SPEC/PLAN/TASKS), evidencias. |
| Cuándo utilizarla | En todas las fases. |
| Qué puede modificar | Únicamente documentos Markdown. |
| Qué no debe modificar | Dashboard, modelo, datos. |
| Riesgos | Documentación desactualizada respecto a decisiones reales. |

## 3. Resumen de responsabilidad por artefacto

| Artefacto | Herramienta autorizada |
| --------- | ---------------------- |
| Semantic Model (TMDL) | powerbi-modeling-mcp |
| Report (PBIR) | powerbi-report-mcp |
| Datos Parquet | Python (solo lectura/auditoría) |
| Documentación | Markdown |

## 4. Prohibiciones explícitas

- **No** crear custom visuals o third-party visuals mediante MCP.
- **No** usar `powerbi-modeling-mcp` para tareas de reporte.
- **No** usar `powerbi-report-mcp` para tareas de modelado.
- **No** editar manualmente JSON/PBIR/TMDL/PBIP sin el flujo correspondiente.
- **No** ejecutar herramientas de construcción durante esta fase.

## 5. Estado de este documento

- Estado: **Vigente desde la FASE 0**.
- La elección Pandas/Polars permanece **DECISIÓN PENDIENTE** hasta FASE 1.