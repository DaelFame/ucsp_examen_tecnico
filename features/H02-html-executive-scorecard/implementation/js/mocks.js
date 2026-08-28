/* ============================================================
   H02 — Executive Scorecard
   js/mocks.js — Mocks de desarrollo embebidos (no para producción).
   Permite abrir index.html directo desde el sistema de archivos
   sin servidor (evita restricciones CORS de fetch a file://).
   Expone: H02.mocks
   ============================================================ */

(function (global) {
  'use strict';

  var NS = (global.H02 = global.H02 || {});

  NS.mocks = {
    full: {
      key: 'full',
      label: 'Full',
      data: null
    },
    semestre1: {
      key: 'semestre1',
      label: 'Semestre 1',
      data: null
    },
    semestre2: {
      key: 'semestre2',
      label: 'Semestre 2',
      data: null
    },
    ucspEmpty: {
      key: 'ucspEmpty',
      label: 'UCSP sin datos',
      data: null
    },
    mercadoEmpty: {
      key: 'mercadoEmpty',
      label: 'Mercado vacío',
      data: null
    },
    tieRanking: {
      key: 'tieRanking',
      label: 'Empate ranking',
      data: null
    },
    d003Conditional: {
      key: 'd003Conditional',
      label: 'D003 conditional',
      data: null
    }
  };

  var MOCK_KEYS = [
    'full', 'semestre1', 'semestre2', 'ucspEmpty', 'mercadoEmpty', 'tieRanking', 'd003Conditional'
  ];

  /**
   * Devuelve la lista de mocks para el selector (dev).
   * @returns {Array<{key:string,label:string}>}
   */
  function list() {
    return MOCK_KEYS.map(function (k) {
      return { key: NS.mocks[k].key, label: NS.mocks[k].label };
    });
  }

  NS.mocks.list = list;
})(window);