/* ============================================================
   H02 — Executive Scorecard
   utils/formatters.js — Solo formateo de valores del contrato.
   NO realiza cálculos (no porcentaje, no YoY, no brechas, no suma).
   Expone: H02.formatters
   ============================================================ */

(function (global) {
  'use strict';

  var NS = (global.H02 = global.H02 || {});
  var guards = NS.guards;

  /**
   * Formatea un número con separador de miles y coma decimal.
   * No formatea null/undefined/NaN.
   * @param {number|null} n
   * @returns {string}
   */
  function formatNumber(n) {
    if (guards.isNullish(n) || !guards.isNumber(n)) {
      return '';
    }
    return n.toLocaleString('es-PE', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  }

  /**
   * Formatea un ratio (0.124 => "12,4 %").
   * Espera el valor ya expresado como fracción (0..1). No convierte.
   * @param {number|null} ratio
   * @param {number} [decimals=1]
   * @returns {string}
   */
  function formatPercent(ratio, decimals) {
    if (guards.isNullish(ratio) || !guards.isNumber(ratio)) {
      return '';
    }
    var d = (typeof decimals === 'number' && decimals >= 0) ? decimals : 1;
    return ratio.toLocaleString('es-PE', {
      style: 'percent',
      minimumFractionDigits: d,
      maximumFractionDigits: d
    });
  }

  /**
   * Formatea un número en forma compacta (12450 => "12,5 mil", 1000000 => "1 M").
   * @param {number|null} n
   * @returns {string}
   */
  function formatCompact(n) {
    if (guards.isNullish(n) || !guards.isNumber(n)) {
      return '';
    }
    var abs = Math.abs(n);
    if (abs >= 1e6) {
      return (n / 1e6).toLocaleString('es-PE', { maximumFractionDigits: 1 }) + ' M';
    }
    if (abs >= 1e3) {
      return (n / 1e3).toLocaleString('es-PE', { maximumFractionDigits: 1 }) + ' mil';
    }
    return String(n);
  }

  /**
   * Formatea un delta (variación) con signo. Solo presenta el valor recibido.
   * El delta ya viene calculado en el contrato; aquí solo se le da formato.
   * @param {number|null} delta
   * @returns {string}
   */
  function formatDelta(delta) {
    if (guards.isNullish(delta) || !guards.isNumber(delta)) {
      return '';
    }
    var sign = delta > 0 ? '+' : '';
    return sign + formatNumber(delta);
  }

  NS.formatters = {
    formatNumber: formatNumber,
    formatPercent: formatPercent,
    formatCompact: formatCompact,
    formatDelta: formatDelta
  };
})(window);