/* ============================================================
   H02 — Executive Scorecard
   html/components/trends.js — Tendencias (matrículas e ingresantes)
   Expone: H02.trends
   ============================================================ */

(function (global) {
  'use strict';

  var NS = (global.H02 = global.H02 || {});
  var guards = NS.guards;
  var dom = NS.dom;
  var charts = NS.charts;

  /**
   * Prepara puntos para el gráfico de matrículas (dual S1/S2).
   * @param {Array} series
   * @returns {Array} items { label, series1, series2 }
   */
  function toMatriculasPoints(series) {
    var map = {};
    var years = [];
    series.forEach(function (s) {
      if (!guards.isObject(s)) return;
      var key = String(s.anio);
      if (map[key] === undefined) {
        map[key] = { s1: null, s2: null, anio: s.anio };
        years.push(key);
      }
      if (s.semestre === 1) map[key].s1 = s.matriculas;
      else if (s.semestre === 2) map[key].s2 = s.matriculas;
    });
    years.sort();
    return years.map(function (y) {
      return { label: y, series1: map[y].s1, series2: map[y].s2 };
    });
  }

  /**
   * Renderiza las dos tendencias.
   * @param {object} data
   * @param {HTMLElement} mountMat
   * @param {HTMLElement} mountIng
   * @returns {void}
   */
  function render(data, mountMat, mountIng) {
    var tMat = data.TENDENCIA_MATRICULAS || [];
    var tIng = data.TENDENCIA_INGRESANTES || [];

    /* ---- Tendencia Matrículas (dual) ---- */
    dom.removeChildren(mountMat);
    var cardMat = dom.createElement('article', { className: 'trend-card', attrs: { 'aria-label': 'Tendencia de matrículas' } });
    cardMat.appendChild(dom.createElement('h3', { className: 'card-title', text: 'Tendencia de Matrículas' }));

    var legendMat = dom.createElement('div', { className: 'chart-legend' });
    legendMat.appendChild(dom.createElement('span', { className: 'legend-item legend-s1', text: 'Semestre 1' }));
    legendMat.appendChild(dom.createElement('span', { className: 'legend-item legend-s2', text: 'Semestre 2' }));
    cardMat.appendChild(legendMat);

    if (guards.isArray(tMat) && tMat.length > 0) {
      cardMat.appendChild(charts.lineChart(toMatriculasPoints(tMat), {
        width: 560, height: 220, dual: true,
        colorS1: '#4C9BE8', colorS2: '#E07A2F',
        labelS1: 'S1', labelS2: 'S2', title: 'Tendencia de matrículas por semestre'
      }));
    } else {
      cardMat.appendChild(dom.createElement('div', { className: 'empty-inline', text: 'Sin datos de tendencia de matrículas.' }));
    }
    mountMat.appendChild(cardMat);

    /* ---- Tendencia Ingresantes (simple) ---- */
    dom.removeChildren(mountIng);
    var cardIng = dom.createElement('article', { className: 'trend-card', attrs: { 'aria-label': 'Tendencia de ingresantes' } });
    cardIng.appendChild(dom.createElement('h3', { className: 'card-title', text: 'Tendencia de Ingresantes' }));

    if (guards.isArray(tIng) && tIng.length > 0) {
      var points = tIng.map(function (s) {
        return { label: String(s.anio), value: s.ingresantes };
      });
      cardIng.appendChild(charts.lineChart(points, {
        width: 560, height: 220, dual: false,
        colorS1: '#2E8B57', title: 'Tendencia de ingresantes por año'
      }));
    } else {
      cardIng.appendChild(dom.createElement('div', { className: 'empty-inline', text: 'Sin datos de tendencia de ingresantes.' }));
    }
    mountIng.appendChild(cardIng);
  }

  NS.trends = { render: render };
})(window);