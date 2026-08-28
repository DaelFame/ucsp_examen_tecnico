"""Procesamiento atómico del dataset MATRICULADOS de TUNI.pe.

Lee el contrato de esquema generado por el notebook de exploración
(data/schemas/matriculados_schema.json), concatena los 12 CSVs de la capa
Bronce, aplica limpieza estándar y guarda el resultado en capa Silver (Parquet).

EFICIENCIA EN MEMORIA (16 GB RAM): los archivos se procesan UNO A UNO:
    1. Cada CSV se lee con dtype del contrato y motor pyarrow, se normaliza y se
       deduplica con la clave validada (PERIODO_ESTANDARIZADO incluido).
    2. Cada archivo limpio se guarda como Parquet intermedio en
       data/Silver/temp_matriculados/ y se libera memoria (del + gc.collect()).
    3. Los Parquets intermedios (compactos) se concatenan en un solo DataFrame
       manejable; ahí se aplican las transformaciones globales (dropna dinámico,
       Region_Sur) y se guarda el Parquet final.

Contrato de esquema (NO hay listas de columnas hardcodeadas):
    - columnas, dtypes, columna_periodo, separador y encoding se leen del JSON.
    - Clave de deduplicación = [columna_periodo] + clave_candidata (experimento
      notebooks/02_experimento_matriculados_duplicados.ipynb). Cada archivo es
      un semestre (PERIODO_ESTANDARIZADO constante dentro de él), por lo que la
      deduplicación por archivo equivale a la global.

IMPORTANTE (dropna): la clave candidata incluye CODIGO_GRUPO_1/CODIGO_GRUPO_3,
con ~3,5M de nulos LEGÍTIMOS (programas sin clasificación de grupo). dropna solo
se aplica sobre [columna_periodo] + las columnas de la clave que el contrato
reporta con 0 nulos (calidad.nulos_por_columna).

Uso:
    python src/process_matriculados.py
"""

from __future__ import annotations

import gc
import json
import logging
import os
import resource
import shutil
import sys
import time
from pathlib import Path

import pandas as pd
import pyarrow.parquet as pq

# ---------------------------------------------------------------------------
# Rutas (robustas: se derivan de la ubicación de este archivo, no del cwd)
# ---------------------------------------------------------------------------
PROJECT_ROOT = Path(__file__).resolve().parents[1]

DEFAULT_SCHEMA_PATH = PROJECT_ROOT / "data" / "schemas" / "matriculados_schema.json"
DEFAULT_RAW_DIR = PROJECT_ROOT / "data" / "Bronce" / "matriculados_raw"
DEFAULT_OUTPUT_PATH = PROJECT_ROOT / "data" / "Silver" / "matriculados_clean.parquet"
TEMP_DIR = PROJECT_ROOT / "data" / "Silver" / "temp_matriculados"

# ---------------------------------------------------------------------------
# Lógica de negocio: departamentos de la Región Sur.
# Definida YA normalizada (mayúsculas, sin tildes) para coincidir con los
# textos limpios generados por la etapa de normalización.
# ---------------------------------------------------------------------------
REGION_SUR = {"AREQUIPA", "CUSCO", "TACNA", "PUNO", "MOQUEGUA", "APURIMAC"}

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("process_matriculados")

SCHEMA_KEYS_REQUERIDOS = (
    "dataset",
    "encoding",
    "separador",
    "columna_periodo",
    "columnas",
    "dtypes",
    "granularidad",
)

TIPOS_PANDAS = {"str": "str", "int64": "int64", "float64": "float64"}


# ---------------------------------------------------------------------------
# Validación del esquema
# ---------------------------------------------------------------------------
def load_schema(path: Path) -> dict:
    """Carga el JSON de esquema; falla con mensaje claro si no existe."""
    if not path.exists():
        raise FileNotFoundError(
            f"No se encontró el contrato de esquema: {path}. "
            "Ejecuta primero el notebook 01_exploracion_esquemas.ipynb "
            "para generarlo."
        )
    with path.open("r", encoding="utf-8") as fh:
        return json.load(fh)


def validate_schema(schema: dict) -> None:
    """Valida que el JSON tenga todas las claves requeridas."""
    faltantes = [k for k in SCHEMA_KEYS_REQUERIDOS if k not in schema]
    if faltantes:
        raise ValueError(f"El esquema no contiene las claves requeridas: {faltantes}")

    gran = schema.get("granularidad", {})
    if not isinstance(gran, dict) or "clave_candidata" not in gran:
        raise ValueError(
            "El esquema no contiene 'granularidad.clave_candidata'. "
            "Regenera el esquema con el notebook de exploración."
        )

    columnas = schema.get("columnas")
    if not isinstance(columnas, list) or not columnas:
        raise ValueError("El esquema no contiene una lista válida en 'columnas'.")


# ---------------------------------------------------------------------------
# Helpers dinámicos (sin nombres de columna fijos)
# ---------------------------------------------------------------------------
def detectar_columnas_str(df: pd.DataFrame) -> list[str]:
    """Detecta dinámicamente las columnas de texto del DataFrame."""
    return list(df.select_dtypes(include=["object", "string"]).columns)


def detectar_col_departamento(df: pd.DataFrame) -> str:
    """Detecta la columna de departamento; prefiere la del FILIAL/LOCAL."""
    candidatas = [c for c in df.columns if "DEPARTAMENTO" in c.upper()]
    if not candidatas:
        raise ValueError(
            "No se encontró ninguna columna de departamento en el DataFrame."
        )
    preferidas = [
        c for c in candidatas
        if ("FILIAL" in c.upper()) or ("LOCAL" in c.upper())
    ]
    return preferidas[0] if preferidas else candidatas[0]


def normalizar_textos(df: pd.DataFrame, columnas: list[str]) -> None:
    """strip -> MAYÚSCULAS -> quitar tildes/acentos (sin instalar nada).

    Vía Arrow (dtype 'str' de pandas 3): las operaciones se ejecutan con
    compute de pyarrow sobre arrays compactos, SIN crear millones de strings
    Python (objeto). Es la clave para no disparar el RSS en datasets grandes:
    NFD descompone (ej. Á -> A + diacrítico) y el regex RE2 \\p{Mn} borra todos
    los caracteres combinantes (los acentos) en un solo paso.

    Fallback a dtype 'object' (motor regex de Python) si la columna no es
    arrow-backed (p. ej. ya convertida a object por otro paso).
    """
    for col in columnas:
        serie = df[col]
        if isinstance(serie.dtype, pd.StringDtype):
            df[col] = (
                serie.str.strip()
                .str.upper()
                .str.normalize("NFD")
                .str.replace(r"\p{Mn}", "", regex=True)
            )
        else:
            df[col] = (
                serie.astype(object)
                .str.strip()
                .str.upper()
                .str.normalize("NFD")
                .str.replace(r"[\u0300-\u036f]", "", regex=True)
            )


def validar_columnas(df: pd.DataFrame, schema_columnas: list[str]) -> None:
    """Guardrail: las columnas cargadas deben coincidir con el contrato."""
    cargadas, esperadas = set(df.columns), set(schema_columnas)
    if cargadas != esperadas:
        faltan = sorted(esperadas - cargadas)
        sobran = sorted(cargadas - esperadas)
        raise ValueError(
            "Las columnas cargadas no coinciden con el esquema. "
            f"Faltan: {faltan}. Sobran: {sobran}."
        )


def claves_dropna(schema: dict) -> list[str]:
    """Subset para dropna: [columna_periodo] + claves SIN nulos (según contrato).

    La clave candidata de matriculados incluye CODIGO_GRUPO_1/3 con millones de
    nulos legítimos; dropna sobre la clave completa borraría ~20% de los datos.
    Solo se exigen las columnas que el contrato reporta con 0 nulos.
    """
    col_periodo = schema["columna_periodo"]
    clave = schema["granularidad"]["clave_candidata"]
    nulos_por_columna = schema.get("calidad", {}).get("nulos_por_columna", {})

    if not nulos_por_columna:
        logger.warning(
            "El contrato no reporta 'calidad.nulos_por_columna': dropna solo "
            "sobre [%s].",
            col_periodo,
        )
        return [col_periodo]

    obligatorias = [c for c in clave if nulos_por_columna.get(c, 0) == 0]
    excluidas = [c for c in clave if c not in obligatorias]
    subset = [col_periodo] + obligatorias

    logger.info(
        "Subset dropna: %s | claves excluidas por nulos legítimos: %s",
        subset,
        excluidas or "ninguna",
    )
    return subset


def pico_memoria_gb() -> float:
    """Pico de memoria RSS del proceso en GB (Linux/macOS)."""
    return resource.getrusage(resource.RUSAGE_SELF).ru_maxrss / 1024 / 1024


def rss_actual_gb() -> float:
    """RSS actual del proceso en GB (Linux, /proc/self/statm)."""
    try:
        with open("/proc/self/statm", encoding="utf-8") as fh:
            paginas = int(fh.read().split()[1])
        return paginas * os.sysconf("SC_PAGE_SIZE") / (1024**3)
    except (OSError, ValueError, IndexError):
        return float("nan")


# ---------------------------------------------------------------------------
# Pipeline principal
# ---------------------------------------------------------------------------
def main(
    schema_path: Path = DEFAULT_SCHEMA_PATH,
    raw_dir: Path = DEFAULT_RAW_DIR,
    output_path: Path = DEFAULT_OUTPUT_PATH,
) -> pd.DataFrame:
    t_inicio = time.monotonic()

    # 1) Cargar y validar el contrato de esquema
    logger.info("Cargando esquema: %s", schema_path)
    schema = load_schema(schema_path)
    validate_schema(schema)

    col_periodo = schema["columna_periodo"]
    clave_candidata = schema["granularidad"]["clave_candidata"]
    clave_matriculados = [col_periodo] + clave_candidata
    encoding = schema["encoding"]
    separador = schema["separador"]
    dtype_map = {
        k: TIPOS_PANDAS[v]
        for k, v in schema.get("dtypes", {}).items()
        if v in TIPOS_PANDAS
    }

    logger.info(
        "Esquema OK: %d columnas | periodo=%s | clave(%d)=%s | encoding=%s | sep=%r",
        len(schema["columnas"]),
        col_periodo,
        len(clave_matriculados),
        "+".join(clave_matriculados),
        encoding,
        separador,
    )
    logger.info("dtypes del contrato aplicados a la lectura: %d columnas", len(dtype_map))

    # ======================================================================
    # 2) Procesar archivo por archivo (escritura intermedia en Parquet)
    # ======================================================================
    if not raw_dir.exists():
        raise FileNotFoundError(f"No existe la carpeta de origen: {raw_dir}")
    archivos = sorted(raw_dir.glob("*.csv"))
    if not archivos:
        raise FileNotFoundError(f"No se encontraron CSVs en: {raw_dir}")
    logger.info("%d archivos encontrados en %s", len(archivos), raw_dir)

    temp_dir = TEMP_DIR
    temp_dir.mkdir(parents=True, exist_ok=True)

    filas_totales = 0
    duplicados_totales = 0

    for idx, archivo in enumerate(archivos, 1):
        logger.info("Procesando archivo %d/%d: %s", idx, len(archivos), archivo.name)
        try:
            df = pd.read_csv(
                archivo,
                sep=separador,
                encoding=encoding,
                dtype=dtype_map,
                engine="pyarrow",
            )
        except (ValueError, TypeError) as exc:
            logger.warning(
                "Motor pyarrow no disponible/falló para %s (%s); reintento con motor C.",
                archivo.name,
                exc,
            )
            df = pd.read_csv(
                archivo,
                sep=separador,
                encoding=encoding,
                low_memory=False,
                dtype=dtype_map,
            )

        filas_archivo = len(df)
        filas_totales += filas_archivo
        logger.info("  Filas leídas: %s | RSS: %.2f GB", f"{filas_archivo:,}", rss_actual_gb())

        # Limpieza por archivo (normalización de textos)
        cols_str = detectar_columnas_str(df)
        normalizar_textos(df, cols_str)

        # Deduplicación por archivo (clave con PERIODO_ESTANDARIZADO).
        # Seguro: cada archivo es un semestre, PERIODO es constante en él.
        antes = len(df)
        df = df.drop_duplicates(subset=clave_matriculados).reset_index(drop=True)
        dupes_archivo = antes - len(df)
        duplicados_totales += dupes_archivo
        logger.info("  Dedup OK: %s duplicados eliminados | RSS: %.2f GB",
                    f"{dupes_archivo:,}", rss_actual_gb())

        # Guardar Parquet intermedio (compacto) y liberar memoria
        temp_path = temp_dir / f"{archivo.stem}.parquet"
        df.to_parquet(temp_path, index=False, engine="pyarrow")
        logger.info("  Guardado intermedio: %s | RSS: %.2f GB", temp_path, rss_actual_gb())

        del df
        gc.collect()

    logger.info(
        "Procesamiento individual completado. Filas totales leídas: %s",
        f"{filas_totales:,}",
    )
    logger.info("Duplicados totales eliminados: %s", f"{duplicados_totales:,}")

    # ======================================================================
    # 3) Unir los Parquets intermedios (memoria manejable)
    # ======================================================================
    logger.info("Uniendo Parquets intermedios...")
    temp_files = sorted(temp_dir.glob("*.parquet"))
    if len(temp_files) != len(archivos):
        raise RuntimeError(
            f"Se esperaban {len(archivos)} Parquets intermedios y hay {len(temp_files)}. "
            "No se continuará con datos parciales."
        )

    # Lectura en UNA sola copia vía pyarrow: evita el doble consumo de la fase
    # "12 DataFrames + concat". to_pandas(types_mapper=ArrowDtype) conserva
    # dtypes compactos (strings Arrow) como pd.read_parquet de pandas 3.
    tbl = pq.read_table(temp_files, use_threads=True)
    df = tbl.to_pandas(types_mapper=pd.ArrowDtype)
    del tbl
    gc.collect()
    logger.info("Concat final: %s filas | RSS: %.2f GB", f"{len(df):,}", rss_actual_gb())

    # Guardrail final: columnas vs contrato
    validar_columnas(df, schema["columnas"])
    logger.info("Validación de columnas vs esquema (post-concat): OK")

    # Verificación: no deben quedar duplicados bajo la clave
    residual = len(df) - len(df.drop_duplicates(subset=clave_matriculados))
    logger.info("Verificación de duplicados: RSS %.2f GB", rss_actual_gb())
    if residual:
        logger.warning("ADVERTENCIA: quedan %s duplicados bajo la clave tras dedup.", residual)
    else:
        logger.info("Verificación: 0 duplicados residuales bajo la clave ✅")

    # ======================================================================
    # 4) Transformaciones globales
    # ======================================================================
    # dropna dinámico: [columna_periodo] + claves con 0 nulos (según contrato)
    subset = claves_dropna(schema)
    faltan = [c for c in subset if c not in df.columns]
    if faltan:
        raise ValueError(
            "Faltan columnas requeridas para el filtrado de nulos: "
            f"{faltan}. Revise el contrato de esquema."
        )
    antes = len(df)
    df = df.dropna(subset=subset).reset_index(drop=True)
    nulos = antes - len(df)
    logger.info("Filas eliminadas por nulos en periodo/clave: %s | RSS: %.2f GB",
                f"{nulos:,}", rss_actual_gb())

    # Región Sur (booleana) sobre la columna de departamento detectada
    col_dept = detectar_col_departamento(df)
    df["Region_Sur"] = df[col_dept].isin(REGION_SUR).astype(bool)
    logger.info(
        "Región Sur creada (columna detectada: %s): %s filas True | RSS: %.2f GB",
        col_dept,
        f"{int(df['Region_Sur'].sum()):,}",
        rss_actual_gb(),
    )

    # ======================================================================
    # 5) Guardar Parquet final en Silver y limpiar temporales
    # ======================================================================
    output_path.parent.mkdir(parents=True, exist_ok=True)
    df.to_parquet(output_path, index=False, engine="pyarrow")
    logger.info("Guardado en: %s | RSS: %.2f GB", output_path, rss_actual_gb())

    if os.environ.get("KEEP_TEMP") == "1":
        logger.info("KEEP_TEMP=1: se conservan los temporales en %s", temp_dir)
    else:
        shutil.rmtree(temp_dir, ignore_errors=True)
        logger.info("Temporales eliminados: %s", temp_dir)

    duracion_min = (time.monotonic() - t_inicio) / 60
    logger.info(
        "RESUMEN FINAL:\n"
        "  - Filas totales leídas: %s\n"
        "  - Duplicados eliminados (clave con periodo): %s\n"
        "  - Nulos eliminados (periodo + claves sin nulos): %s\n"
        "  - Filas finales: %s\n"
        "  - Tiempo de ejecución: %.1f minutos\n"
        "  - Uso de memoria pico: %.2f GB",
        f"{filas_totales:,}",
        f"{duplicados_totales:,}",
        f"{nulos:,}",
        f"{len(df):,}",
        duracion_min,
        pico_memoria_gb(),
    )

    return df


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:  # noqa: BLE001
        logger.error("ERROR: %s", exc)
        sys.exit(1)