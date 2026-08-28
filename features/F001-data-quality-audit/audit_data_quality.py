#!/usr/bin/env python
"""F001 - Data Quality Audit for demanda_UCSP.

Strictly READ-ONLY script. It discovers and reads the 7 Parquet files under
data/Dashboard_parquet/ and produces a reproducible structured audit report.
It never modifies any source file.
"""

from __future__ import annotations

import json
import unicodedata
from pathlib import Path

import pandas as pd

PROJECT_ROOT = Path(__file__).resolve().parents[2]
DATA_DIR = PROJECT_ROOT / "data" / "Dashboard_parquet"
OUT_DIR = PROJECT_ROOT / "features" / "F001-data-quality-audit"

DIMENSIONS = [
    "dim_local",
    "dim_periodo",
    "dim_programa",
    "dim_ubicacion",
    "dim_universidad",
]

FACTS = [
    "fact_ingresantes_dashboard",
    "fact_matriculados_dashboard",
]

EXPECTED_FILES = [
    "dim_local.parquet",
    "dim_periodo.parquet",
    "dim_programa.parquet",
    "dim_ubicacion.parquet",
    "dim_universidad.parquet",
    "fact_ingresantes_dashboard.parquet",
    "fact_matriculados_dashboard.parquet",
]

UCSP_EXACT = "UNIVERSIDAD CATÓLICA SAN PABLO"


def has_col(df: pd.DataFrame, col: str) -> bool:
    return col in df.columns


def null_stats(s: pd.Series) -> dict:
    total = len(s)
    nulls = int(s.isna().sum())
    return {
        "total": total,
        "null": nulls,
        "null_pct": round(nulls / total * 100, 4) if total else 0.0,
    }


def normalize_text(v: str) -> str:
    if v is None:
        return ""
    v = unicodedata.normalize("NFKD", str(v))
    v = "".join(c for c in v if not unicodedata.combining(c))
    return v.upper().strip()


def value_freq(s: pd.Series) -> dict:
    vc = s.value_counts(dropna=False)
    total = len(s)
    out = {}
    for k, v in vc.items():
        key = "NULL" if k is None or (isinstance(k, float) and pd.isna(k)) else str(k)
        out[key] = {"count": int(v), "pct": round(v / total * 100, 4) if total else 0.0}
    return out


def main() -> None:
    result: dict = {}

    # ---- 0. File discovery ----
    available = sorted(p.name for p in DATA_DIR.glob("*.parquet"))
    missing = [f for f in EXPECTED_FILES if f not in available]
    unexpected = [f for f in available if f not in EXPECTED_FILES]
    result["file_discovery"] = {
        "data_dir": str(DATA_DIR),
        "expected": EXPECTED_FILES,
        "available": available,
        "missing": missing,
        "unexpected": unexpected,
    }

    # ---- 1. Inventory + schema ----
    frames: dict[str, pd.DataFrame] = {}
    inventory = {}
    for name in EXPECTED_FILES:
        path = DATA_DIR / name
        if not path.exists():
            inventory[name] = {"error": "file_not_found"}
            continue
        df = pd.read_parquet(path)
        frames[name] = df
        inventory[name] = {
            "rows": int(len(df)),
            "columns": int(df.shape[1]),
            "schema": {col: str(dt) for col, dt in df.dtypes.items()},
        }
    result["inventory"] = inventory

    # ---- 2. Dimensions: SK validation ----
    dim_results = {}
    sk_index: dict[str, str] = {}
    for dim in DIMENSIONS:
        fname = f"{dim}.parquet"
        if fname not in frames:
            dim_results[dim] = {"error": "not_loaded"}
            continue
        df = frames[fname]
        sk_cols = [c for c in df.columns if c.startswith("SK_")]
        entry: dict = {"sk_columns_found": sk_cols}
        if len(sk_cols) == 1:
            sk = sk_cols[0]
            sk_index[dim] = sk
            st = null_stats(df[sk])
            uniq = df[sk].nunique(dropna=True)
            entry["sk"] = sk
            entry["nulls"] = st
            entry["unique"] = int(uniq)
            entry["duplicate"] = int(st["total"] - st["null"] - uniq)
        else:
            entry["sk"] = None
        dim_results[dim] = entry
    result["dimensions"] = dim_results

    # ---- 3. Facts: FK -> SK integrity ----
    fact_results = {}
    for fact in FACTS:
        fname = f"{fact}.parquet"
        if fname not in frames:
            fact_results[fact] = {"error": "not_loaded"}
            continue
        df = frames[fname]
        fk_cols = [c for c in df.columns if c.startswith("FK_")]
        fk_entry = {}
        for fk in fk_cols:
            entity = fk[len("FK_"):]
            target_sk = "SK_" + entity
            target_dim = None
            for dim, skcol in sk_index.items():
                if skcol == target_sk:
                    target_dim = dim
                    break
            if target_dim is None:
                fk_entry[fk] = {"target": None, "note": "no dimension with matching SK"}
                continue
            fk_series = df[fk]
            dim_df = frames[f"{target_dim}.parquet"]
            sk_series = dim_df[sk_index[target_dim]]
            sk_set = set(sk_series.dropna().astype("int64").tolist())
            total = len(fk_series)
            nulls = int(fk_series.isna().sum())
            non_null = fk_series.dropna().astype("int64")
            valid = int(non_null.isin(sk_set).sum())
            orphan = int((~non_null.isin(sk_set)).sum())
            integrity_of_non_null = round(valid / len(non_null) * 100, 4) if len(non_null) else 0.0
            integrity_of_total = round(valid / total * 100, 4) if total else 0.0
            fk_entry[fk] = {
                "target_dim": target_dim,
                "target_sk": target_sk,
                "total": total,
                "null": nulls,
                "valid": valid,
                "orphan": orphan,
                "integrity_pct_non_null": integrity_of_non_null,
                "integrity_pct_total": integrity_of_total,
            }
        fact_results[fact] = {"fk_columns": fk_cols, "fk_integrity": fk_entry}
    result["facts"] = fact_results

    # ---- 4. Null findings (all columns, all files) ----
    null_findings = {}
    for name, df in frames.items():
        null_findings[name] = {
            col: null_stats(df[col])
            for col in df.columns
        }
    result["nulls"] = null_findings

    # ---- 5. UCSP validation ----
    uf = frames.get("dim_universidad.parquet")
    if uf is not None and has_col(uf, "NOMBRE_ENTIDAD"):
        col = uf["NOMBRE_ENTIDAD"]
        norm = col.map(normalize_text)
        ucsp_norm = normalize_text(UCSP_EXACT)
        exact = int((col == UCSP_EXACT).sum())
        case_insensitive = int((col.str.upper() == UCSP_EXACT.upper()).sum())
        normalized = int((norm == ucsp_norm).sum())
        full_upper = int((col.astype(str).str.upper() == ucsp_norm).sum())
        # variants: distinct names containing any fragment
        mask = norm.str.contains("CATOLICA", na=False) | norm.str.contains("SAN PABLO", na=False)
        variants = sorted(set(col[mask].dropna().astype(str).tolist()))
        result["ucsp"] = {
            "searched": UCSP_EXACT,
            "exact_match_count": exact,
            "case_insensitive_match_count": case_insensitive,
            "normalized_match_count": normalized,
            "full_upper_match_count": full_upper,
            "variants_found": variants,
            "total_entities": int(len(col)),
        }
    else:
        result["ucsp"] = {"error": "NOMBRE_ENTIDAD not present"}

    # ---- 6. TIPO_GESTION ----
    if uf is not None and has_col(uf, "TIPO_GESTION"):
        result["tipo_gestion"] = value_freq(uf["TIPO_GESTION"])
    else:
        result["tipo_gestion"] = {"error": "TIPO_GESTION not present"}

    # ---- 7. Region_Sur ----
    ub = frames.get("dim_ubicacion.parquet")
    if ub is not None and has_col(ub, "Region_Sur"):
        result["region_sur"] = value_freq(ub["Region_Sur"])
    else:
        result["region_sur"] = {"error": "Region_Sur not present"}

    # ---- 8. NIVEL_ACADEMICO ----
    pg = frames.get("dim_programa.parquet")
    if pg is not None and has_col(pg, "NIVEL_ACADEMICO"):
        col = pg["NIVEL_ACADEMICO"]
        pregrado_mask = col.astype(str).str.contains("PREGRA", case=False, na=False)
        result["nivel_academico"] = {
            "distinct_values": sorted(
                {str(v) for v in col.dropna().astype(str).tolist()}
            ),
            "frequencies": value_freq(col),
            "pregrado_presence": bool(pregrado_mask.any()),
            "pregrado_count": int(pregrado_mask.sum()),
        }
    else:
        result["nivel_academico"] = {"error": "NIVEL_ACADEMICO not present"}

    # ---- 9. Temporal coverage ----
    dp = frames.get("dim_periodo.parquet")
    temporal: dict = {}
    if dp is not None:
        has_anio = has_col(dp, "ANIO")
        has_sem = has_col(dp, "SEMESTRE")
        has_label = has_col(dp, "LABEL_PERIODO")
        has_sk = has_col(dp, "SK_Periodo")

        anio_num = pd.to_numeric(dp["ANIO"], errors="coerce") if has_anio else None
        sem_num = pd.to_numeric(dp["SEMESTRE"], errors="coerce") if has_sem else None

        years = sorted(
            anio_num.dropna().astype("int64").unique().tolist()
        ) if anio_num is not None else []
        semesters = sorted(
            sem_num.dropna().astype("int64").unique().tolist()
        ) if sem_num is not None else []
        sem_null = int(sem_num.isna().sum()) if sem_num is not None else None

        periods = []
        if anio_num is not None and sem_num is not None:
            mask = anio_num.notna() & sem_num.notna()
            if mask.any():
                periods = sorted(
                    set(
                        zip(
                            anio_num[mask].astype("int64"),
                            sem_num[mask].astype("int64"),
                        )
                    )
                )
        temporal["dim_periodo"] = {
            "rows": int(len(dp)),
            "years": years,
            "semesters": semesters,
            "semester_null": sem_null,
            "periods_anio_semestre": [list(p) for p in periods],
            "has_sk_periodo": has_sk,
        }
        # facts referencing periods
        sk_map = {}
        if has_sk and anio_num is not None:
            sk_num = pd.to_numeric(dp["SK_Periodo"], errors="coerce")
            for sk, an in zip(sk_num, anio_num):
                if pd.notna(sk) and pd.notna(an):
                    sk_map[int(sk)] = int(an)
        for fact in FACTS:
            fdf = frames.get(f"{fact}.parquet")
            if fdf is None or not has_col(fdf, "FK_Periodo"):
                temporal[fact] = {"error": "FK_Periodo not present"}
                continue
            fk_period = fdf["FK_Periodo"]
            fk_set = set(fk_period.dropna().astype("int64").tolist())
            dim_sk_set = set(sk_map.keys())
            fact_years = sorted(
                {sk_map[k] for k in fk_set if k in sk_map}
            ) if has_anio else []
            in_fact_not_dim = sorted(fk_set - dim_sk_set)
            in_dim_not_fact = sorted(dim_sk_set - fk_set)
            temporal[fact] = {
                "fk_period_total": int(len(fk_period)),
                "fk_period_null": int(fk_period.isna().sum()),
                "distinct_fk_period": int(fk_period.nunique(dropna=True)),
                "years_in_fact": fact_years,
                "period_keys_in_fact_not_in_dim": in_fact_not_dim,
                "period_keys_in_dim_not_in_fact": in_dim_not_fact,
                "period_keys_in_dim_not_in_fact_count": len(in_dim_not_fact),
            }
    else:
        temporal = {"error": "dim_periodo not loaded"}
    result["temporal_coverage"] = temporal

    # ---- 10. Metrics ----
    metrics = {}
    for fact, metric_col in [
        ("fact_ingresantes_dashboard", "Conteo_Ingresantes"),
        ("fact_matriculados_dashboard", "Conteo_Matriculados"),
    ]:
        fdf = frames.get(f"{fact}.parquet")
        if fdf is None or not has_col(fdf, metric_col):
            metrics[metric_col] = {"error": f"column {metric_col} not present"}
            continue
        s = fdf[metric_col]
        num = pd.to_numeric(s, errors="coerce")
        metrics[metric_col] = {
            "dtype": str(s.dtype),
            "null": null_stats(s),
            "min": None if num.dropna().empty else float(num.min()),
            "max": None if num.dropna().empty else float(num.max()),
            "zeros": int((num == 0).sum()),
            "negative": int((num < 0).sum()),
            "cardinality": int(s.nunique(dropna=True)),
            "all_rows_equal_one": bool((num.dropna() == 1).all()) if len(num.dropna()) else False,
            "rows_equal_one": int((num == 1).sum()),
            "rows_equal_one_pct": round((num == 1).sum() / len(s) * 100, 4) if len(s) else 0.0,
            "total_rows": int(len(s)),
        }
    result["metrics"] = metrics

    # ---- Output ----
    print(json.dumps(result, ensure_ascii=False, indent=2))

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    out_file = OUT_DIR / "audit_output.json"
    out_file.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\n[OUTPUT_SAVED] {out_file}")


if __name__ == "__main__":
    main()