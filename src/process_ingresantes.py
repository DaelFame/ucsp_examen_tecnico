"""Procesamiento atómico del dataset INGRESANTES de TUNI.pe.

Lee el contrato de esquema generado por el notebook de exploración
(data/schemas/ingresantes_schema.json), concatena los CSVs de la capa Bronce,
aplica limpieza estándar y guarda el resultado en capa Silver (Parquet).

Contrato de esquema (NO hay listas de columnas hardcodeadas):
    - columnas, dtypes, columna_periodo, separador y encoding se leen del JSON.
    - clave_candidata (granularidad) se lee del JSON para el filtrado de nulos.

Uso:
    python src/process_ingresantes.py
"""

from __future__ import annotations

import json
import logging
import sys
from pathlib import Path

import pandas as pd

# ---------------------------------------------------------------------------
# Rutas (robustas: se derivan de la ubicación de este archivo, no del cwd)
# ---------------------------------------------------------------------------
PROJECT_ROOT = Path(__file__).resolve().parents[1]

DEFAULT_SCHEMA_PATH = PROJECT_ROOT / "data" / "schemas" / "ingresantes_schema.json"
DEFAULT_RAW_DIR = PROJECT_ROOT / "data" / "Bronce" / "ingresantes_raw"
DEFAULT_OUTPUT_PATH = PROJECT_ROOT / "data" / "Silver" / "ingresantes_clean.parquet"

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
logger = logging.getLogger("process_ingresantes")

SCHEMA_KEYS_REQUERIDOS = (
    "dataset",
    "encoding",
    "separador",
    "columna_periodo",
    "columnas",
    "dtypes",
    "granularidad",
)


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

    Se fuerza dtype 'object' porque el dtype 'str' de pandas 3 usa un backend
    Arrow (pyarrow) cuya regex no soporta escapes \\u (p. ej. [\\u0300-\\u036f]).
    Con dtype object, pandas usa el motor regex de Python y todo funciona.
    """
    for col in columnas:
        df[col] = (
            df[col]
            .astype(object)
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


# ---------------------------------------------------------------------------
# Pipeline principal
# ---------------------------------------------------------------------------
def main(
    schema_path: Path = DEFAULT_SCHEMA_PATH,
    raw_dir: Path = DEFAULT_RAW_DIR,
    output_path: Path = DEFAULT_OUTPUT_PATH,
) -> pd.DataFrame:
    # 1) Cargar y validar el contrato de esquema
    logger.info("Cargando esquema: %s", schema_path)
    schema = load_schema(schema_path)
    validate_schema(schema)

    col_periodo = schema["columna_periodo"]
    clave_candidata = schema["granularidad"]["clave_candidata"]
    encoding = schema["encoding"]
    separador = schema["separador"]

    logger.info(
        "Esquema OK: %d columnas | periodo=%s | clave=%s | encoding=%s | sep=%r",
        len(schema["columnas"]),
        col_periodo,
        "+".join(clave_candidata),
        encoding,
        separador,
    )

    # 2) Concatenar CSVs de la capa Bronce
    if not raw_dir.exists():
        raise FileNotFoundError(f"No existe la carpeta de origen: {raw_dir}")
    archivos = sorted(raw_dir.glob("*.csv"))
    if not archivos:
        raise FileNotFoundError(f"No se encontraron CSVs en: {raw_dir}")

    logger.info("%d archivos encontrados en %s", len(archivos), raw_dir)
    lista = [
        pd.read_csv(f, sep=separador, encoding=encoding, low_memory=False)
        for f in archivos
    ]
    df = pd.concat(lista, ignore_index=True)
    del lista
    filas_iniciales = len(df)
    logger.info("Filas iniciales tras concatenar: %s", f"{filas_iniciales:,}")

    # 3) Guardrail: columnas cargadas vs contrato
    validar_columnas(df, schema["columnas"])
    logger.info("Validación de columnas vs esquema: OK")

    # 4) Limpieza de textos (solo columnas string, detectadas dinámicamente)
    cols_str = detectar_columnas_str(df)
    logger.info("Columnas string a normalizar: %d", len(cols_str))
    normalizar_textos(df, cols_str)

    # 5) Eliminar duplicados exactos
    antes = len(df)
    df = df.drop_duplicates().reset_index(drop=True)
    dupes = antes - len(df)
    logger.info("Duplicados exactos eliminados: %s", f"{dupes:,}")

    # 6) Eliminar nulos en periodo y clave candidata
    subset = [col_periodo] + clave_candidata
    faltan = [c for c in subset if c not in df.columns]
    if faltan:
        raise ValueError(
            "Faltan columnas requeridas para el filtrado de nulos: "
            f"{faltan}. Revise el contrato de esquema."
        )
    antes = len(df)
    df = df.dropna(subset=subset).reset_index(drop=True)
    nulos = antes - len(df)
    logger.info("Filas eliminadas por nulos en periodo/clave: %s", f"{nulos:,}")

    # 7) Región Sur (booleana)
    col_dept = detectar_col_departamento(df)
    df["Region_Sur"] = df[col_dept].isin(REGION_SUR).astype(bool)
    logger.info(
        "Región Sur creada (columna de departamento detectada: %s): %s filas True",
        col_dept,
        f"{int(df['Region_Sur'].sum()):,}",
    )

    # 8) Guardar en Silver (Parquet)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    df.to_parquet(output_path, index=False)
    logger.info("Guardado en: %s", output_path)
    logger.info(
        "RESUMEN FINAL: iniciales=%s | duplicados_eliminados=%s | "
        "nulos_eliminados=%s | finales=%s",
        f"{filas_iniciales:,}",
        f"{dupes:,}",
        f"{nulos:,}",
        f"{len(df):,}",
    )

    return df


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:  # noqa: BLE001
        logger.error("ERROR: %s", exc)
        sys.exit(1)