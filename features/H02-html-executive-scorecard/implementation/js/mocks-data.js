/* ============================================================
   H02 — Executive Scorecard
   js/mocks-data.js — Datos de los 7 mocks embebidos (desarrollo).
   Espejo de /mocks/*.json (fuente de verdad del contrato).
   Exclusivamente para desarrollo/previsualización.
   Expone: H02.mockData
   ============================================================ */

(function (global) {
  'use strict';

  var NS = (global.H02 = global.H02 || {});

  var contextoSem = function (sem) {
    return {
      anio: 2025,
      semestre: sem,
      escala: sem ? 'SEMESTRAL' : 'ANUAL',
      programa: null,
      nivel_academico: null,
      gestion: null,
      departamento: null,
      provincia: null,
      region_sur: null,
      universidad_seleccionada: null
    };
  };

  var tendIng = [
    { anio: 2021, ingresantes: 2100 },
    { anio: 2022, ingresantes: 2350 },
    { anio: 2023, ingresantes: 2600 },
    { anio: 2024, ingresantes: 2750 },
    { anio: 2025, ingresantes: 2850 }
  ];

  var meta = function (warnings) {
    return {
      contract_version: '1.0',
      generated_at: '2026-08-28T10:00:00Z',
      source_measures_count: 31,
      warnings: warnings || []
    };
  };

  var D003 = 'CONDITIONAL — D003';
  var ND = 'N/D — Escala anual';

  NS.mockData = {
    full: {
      contexto: contextoSem(null),
      UCSP: {
        matriculas: 12450, matriculas_yoy: null, matriculas_yoy_valor: null,
        ingresantes: 2850, ingresantes_yoy: 0.12, ingresantes_yoy_valor: 305,
        market_share_matriculas: 0.124, market_share_ingresantes: 0.156
      },
      MERCADO: {
        matriculas: 100450, ingresantes: 18250, cantidad_universidades: 42, cantidad_programas: 185
      },
      RANKING: {
        posicion_ucsp: 4, total_universidades: 42,
        lider: 'UNIVERSIDAD NACIONAL MAYOR DE SAN MARCOS',
        matriculas_lider: 28900, brecha_vs_lider: -16450, universidad_lider_es_ucsp: false
      },
      TOP3_PLUS_UCSP: [
        { universidad: 'UNIVERSIDAD NACIONAL MAYOR DE SAN MARCOS', posicion: 1, matriculas: 28900, es_ucsp: false },
        { universidad: 'UNIVERSIDAD NACIONAL DE INGENIERÍA', posicion: 2, matriculas: 19800, es_ucsp: false },
        { universidad: 'UNIVERSIDAD CATÓLICA DEL PERÚ', posicion: 3, matriculas: 15600, es_ucsp: false },
        { universidad: 'UNIVERSIDAD CATÓLICA DE SANTA MARÍA', posicion: 4, matriculas: 12450, es_ucsp: true }
      ],
      TENDENCIA_MATRICULAS: [
        { anio: 2021, semestre: 1, matriculas: 8200 }, { anio: 2021, semestre: 2, matriculas: 8650 },
        { anio: 2022, semestre: 1, matriculas: 9100 }, { anio: 2022, semestre: 2, matriculas: 9550 },
        { anio: 2023, semestre: 1, matriculas: 10200 }, { anio: 2023, semestre: 2, matriculas: 10800 },
        { anio: 2024, semestre: 1, matriculas: 11400 }, { anio: 2024, semestre: 2, matriculas: 11950 },
        { anio: 2025, semestre: 1, matriculas: 12450 }
      ],
      TENDENCIA_INGRESANTES: tendIng,
      meta: meta([])
    },

    semestre1: {
      contexto: contextoSem(1),
      UCSP: {
        matriculas: 6200, matriculas_yoy: null, matriculas_yoy_valor: null,
        ingresantes: ND, ingresantes_yoy: null, ingresantes_yoy_valor: null,
        market_share_matriculas: 0.118, market_share_ingresantes: null
      },
      MERCADO: {
        matriculas: 52500, ingresantes: 18250, cantidad_universidades: 42, cantidad_programas: 185
      },
      RANKING: {
        posicion_ucsp: 5, total_universidades: 42,
        lider: 'UNIVERSIDAD NACIONAL MAYOR DE SAN MARCOS',
        matriculas_lider: 14300, brecha_vs_lider: -8100, universidad_lider_es_ucsp: false
      },
      TOP3_PLUS_UCSP: [
        { universidad: 'UNIVERSIDAD NACIONAL MAYOR DE SAN MARCOS', posicion: 1, matriculas: 14300, es_ucsp: false },
        { universidad: 'UNIVERSIDAD NACIONAL DE INGENIERÍA', posicion: 2, matriculas: 9900, es_ucsp: false },
        { universidad: 'UNIVERSIDAD CATÓLICA DEL PERÚ', posicion: 3, matriculas: 7800, es_ucsp: false },
        { universidad: 'UNIVERSIDAD CATÓLICA DE SANTA MARÍA', posicion: 5, matriculas: 6200, es_ucsp: true }
      ],
      TENDENCIA_MATRICULAS: [
        { anio: 2021, semestre: 1, matriculas: 4200 },
        { anio: 2022, semestre: 1, matriculas: 4600 },
        { anio: 2023, semestre: 1, matriculas: 5100 },
        { anio: 2024, semestre: 1, matriculas: 5700 },
        { anio: 2025, semestre: 1, matriculas: 6200 }
      ],
      TENDENCIA_INGRESANTES: tendIng,
      meta: meta([])
    },

    semestre2: {
      contexto: contextoSem(2),
      UCSP: {
        matriculas: 6550, matriculas_yoy: null, matriculas_yoy_valor: null,
        ingresantes: ND, ingresantes_yoy: null, ingresantes_yoy_valor: null,
        market_share_matriculas: 0.121, market_share_ingresantes: null
      },
      MERCADO: {
        matriculas: 54000, ingresantes: 18250, cantidad_universidades: 42, cantidad_programas: 185
      },
      RANKING: {
        posicion_ucsp: 4, total_universidades: 42,
        lider: 'UNIVERSIDAD NACIONAL MAYOR DE SAN MARCOS',
        matriculas_lider: 15200, brecha_vs_lider: -8650, universidad_lider_es_ucsp: false
      },
      TOP3_PLUS_UCSP: [
        { universidad: 'UNIVERSIDAD NACIONAL MAYOR DE SAN MARCOS', posicion: 1, matriculas: 15200, es_ucsp: false },
        { universidad: 'UNIVERSIDAD NACIONAL DE INGENIERÍA', posicion: 2, matriculas: 10300, es_ucsp: false },
        { universidad: 'UNIVERSIDAD CATÓLICA DEL PERÚ', posicion: 3, matriculas: 8100, es_ucsp: false },
        { universidad: 'UNIVERSIDAD CATÓLICA DE SANTA MARÍA', posicion: 4, matriculas: 6550, es_ucsp: true }
      ],
      TENDENCIA_MATRICULAS: [
        { anio: 2021, semestre: 2, matriculas: 4450 },
        { anio: 2022, semestre: 2, matriculas: 4800 },
        { anio: 2023, semestre: 2, matriculas: 5350 },
        { anio: 2024, semestre: 2, matriculas: 5950 },
        { anio: 2025, semestre: 2, matriculas: 6550 }
      ],
      TENDENCIA_INGRESANTES: tendIng,
      meta: meta([])
    },

    ucspEmpty: {
      contexto: contextoSem(null),
      UCSP: {
        matriculas: null, matriculas_yoy: null, matriculas_yoy_valor: null,
        ingresantes: null, ingresantes_yoy: null, ingresantes_yoy_valor: null,
        market_share_matriculas: null, market_share_ingresantes: null
      },
      MERCADO: {
        matriculas: 100450, ingresantes: 18250, cantidad_universidades: 42, cantidad_programas: 185
      },
      RANKING: {
        posicion_ucsp: null, total_universidades: 42,
        lider: 'UNIVERSIDAD NACIONAL MAYOR DE SAN MARCOS',
        matriculas_lider: 28900, brecha_vs_lider: null, universidad_lider_es_ucsp: false
      },
      TOP3_PLUS_UCSP: [
        { universidad: 'UNIVERSIDAD NACIONAL MAYOR DE SAN MARCOS', posicion: 1, matriculas: 28900, es_ucsp: false },
        { universidad: 'UNIVERSIDAD NACIONAL DE INGENIERÍA', posicion: 2, matriculas: 19800, es_ucsp: false },
        { universidad: 'UNIVERSIDAD CATÓLICA DEL PERÚ', posicion: 3, matriculas: 15600, es_ucsp: false }
      ],
      TENDENCIA_MATRICULAS: [],
      TENDENCIA_INGRESANTES: [],
      meta: meta(['UCSP sin datos en el contexto actual'])
    },

    mercadoEmpty: {
      contexto: contextoSem(null),
      UCSP: {
        matriculas: 12450, matriculas_yoy: null, matriculas_yoy_valor: null,
        ingresantes: 2850, ingresantes_yoy: 0.12, ingresantes_yoy_valor: 305,
        market_share_matriculas: null, market_share_ingresantes: null
      },
      MERCADO: {
        matriculas: 0, ingresantes: 0, cantidad_universidades: 0, cantidad_programas: 0
      },
      RANKING: {
        posicion_ucsp: null, total_universidades: 0,
        lider: null, matriculas_lider: null, brecha_vs_lider: null, universidad_lider_es_ucsp: false
      },
      TOP3_PLUS_UCSP: [],
      TENDENCIA_MATRICULAS: [
        { anio: 2021, semestre: 1, matriculas: 8200 },
        { anio: 2022, semestre: 1, matriculas: 9100 },
        { anio: 2023, semestre: 1, matriculas: 10200 },
        { anio: 2024, semestre: 1, matriculas: 11400 },
        { anio: 2025, semestre: 1, matriculas: 12450 }
      ],
      TENDENCIA_INGRESANTES: tendIng,
      meta: meta(['Mercado sin datos en el contexto actual'])
    },

    tieRanking: {
      contexto: contextoSem(null),
      UCSP: {
        matriculas: 15600, matriculas_yoy: null, matriculas_yoy_valor: null,
        ingresantes: 2850, ingresantes_yoy: 0.12, ingresantes_yoy_valor: 305,
        market_share_matriculas: 0.115, market_share_ingresantes: 0.156
      },
      MERCADO: {
        matriculas: 135300, ingresantes: 18250, cantidad_universidades: 42, cantidad_programas: 185
      },
      RANKING: {
        posicion_ucsp: 2, total_universidades: 42,
        lider: 'UNIVERSIDAD NACIONAL MAYOR DE SAN MARCOS',
        matriculas_lider: 28900, brecha_vs_lider: -13300, universidad_lider_es_ucsp: false
      },
      TOP3_PLUS_UCSP: [
        { universidad: 'UNIVERSIDAD NACIONAL MAYOR DE SAN MARCOS', posicion: 1, matriculas: 28900, es_ucsp: false },
        { universidad: 'UNIVERSIDAD CATÓLICA DEL PERÚ', posicion: 2, matriculas: 15600, es_ucsp: false },
        { universidad: 'UNIVERSIDAD NACIONAL DE INGENIERÍA', posicion: 2, matriculas: 15600, es_ucsp: false }
      ],
      TENDENCIA_MATRICULAS: [
        { anio: 2021, semestre: 1, matriculas: 8200 },
        { anio: 2022, semestre: 1, matriculas: 9100 },
        { anio: 2023, semestre: 1, matriculas: 10200 },
        { anio: 2024, semestre: 1, matriculas: 11400 },
        { anio: 2025, semestre: 1, matriculas: 12450 }
      ],
      TENDENCIA_INGRESANTES: tendIng,
      meta: meta(['Empate en posición 2 (ranking denso)'])
    },

    d003Conditional: {
      contexto: contextoSem(null),
      UCSP: {
        matriculas: D003, matriculas_yoy: D003, matriculas_yoy_valor: D003,
        ingresantes: 2850, ingresantes_yoy: 0.12, ingresantes_yoy_valor: 305,
        market_share_matriculas: D003, market_share_ingresantes: 0.156
      },
      MERCADO: {
        matriculas: D003, ingresantes: 18250, cantidad_universidades: 42, cantidad_programas: 185
      },
      RANKING: {
        posicion_ucsp: D003, total_universidades: 42,
        lider: 'UNIVERSIDAD NACIONAL MAYOR DE SAN MARCOS',
        matriculas_lider: D003, brecha_vs_lider: D003, universidad_lider_es_ucsp: false
      },
      TOP3_PLUS_UCSP: [
        { universidad: 'UNIVERSIDAD NACIONAL MAYOR DE SAN MARCOS', posicion: 1, matriculas: D003, es_ucsp: false },
        { universidad: 'UNIVERSIDAD NACIONAL DE INGENIERÍA', posicion: 2, matriculas: D003, es_ucsp: false },
        { universidad: 'UNIVERSIDAD CATÓLICA DEL PERÚ', posicion: 3, matriculas: D003, es_ucsp: false },
        { universidad: 'UNIVERSIDAD CATÓLICA DE SANTA MARÍA', posicion: 4, matriculas: D003, es_ucsp: true }
      ],
      TENDENCIA_MATRICULAS: [],
      TENDENCIA_INGRESANTES: tendIng,
      meta: meta([D003 + ': Medidas anuales de matrículas no disponibles'])
    }
  };
})(window);