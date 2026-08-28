/* ============================================================
   H02 — Executive Scorecard
   html/components/charts.js — Gráficos SVG (vanilla, sin librerías)
   Expone: H02.charts
   ----------
   SOLO dibuja los datos recibidos. No agrega series, no calcula
   escalas de negocio ni porcentajes. El eje se calcula únicamente
   a partir del rango de valores proporcionados (escalado visual).
   ============================================================ */

(function (global) {
  'use strict';

  var NS = (global.H02 = global.H02 || {});
  var guards = NS.guards;
  var fmt = NS.formatters;

  var SVG_NS = 'http://www.w3.org/2000/svg';

  /**
   * Crea un elemento SVG.
   * @param {string} tag
   * @param {Object} attrs
   * @returns {SVGElement}
   */
  function svgEl(tag, attrs) {
    var el = document.createElementNS(SVG_NS, tag);
    Object.keys(attrs || {}).forEach(function (k) {
      el.setAttribute(k, attrs[k]);
    });
    return el;
  }

  /**
   * Calcula el valor máximo del eje (solo para escalado visual).
   * @param {Array<{value:number|null}>} points
   * @returns {number}
   */
  function computeMax(points) {
    var max = 0;
    points.forEach(function (p) {
      if (guards.isNumber(p.value) && p.value > max) max = p.value;
    });
    return max > 0 ? max : 1;
  }

  /**
   * Dibuja una línea SVG simple o dual (dos series).
   * @param {Array} points - items con { label, series1, series2?, value? }
   * @param {Object} [opts]
   * @param {number} [opts.width=600]
   * @param {number} [opts.height=200]
   * @param {string} [opts.colorS1]
   * @param {string} [opts.colorS2]
   * @param {string} [opts.labelS1='Matrículas']
   * @param {string} [opts.labelS2='Semestre 2']
   * @param {boolean} [opts.dual=false]
   * @returns {SVGSVGElement}
   */
  function lineChart(points, opts) {
    var o = opts || {};
    var W = o.width || 600;
    var H = o.height || 200;
    var padL = 40;
    var padR = 12;
    var padT = 16;
    var padB = 28;
    var iw = W - padL - padR;
    var ih = H - padT - padB;

    var svg = svgEl('svg', {
      viewBox: '0 0 ' + W + ' ' + H,
      class: 'chart-svg',
      role: 'img'
    });

    var n = points.length;
    if (n === 0) {
      svg.setAttribute('aria-label', 'Sin datos para gráfico');
      return svg;
    }

    var series = o.dual ? 'series1' : 'value';
    var series2 = o.dual ? 'series2' : null;

    var max = computeMax(points);
    var stepX = n > 1 ? iw / (n - 1) : 0;

    /**
     * Devuelve la coordenada X de un índice.
     * @param {number} i
     * @returns {number}
     */
    function x(i) {
      return padL + (n > 1 ? i * stepX : iw / 2);
    }

    /**
     * Devuelve la coordenada Y de un valor.
     * @param {number} v
     * @returns {number}
     */
    function y(v) {
      return padT + ih - (v / max) * ih;
    }

    // ---- Grid horizontal (líneas de referencia) ----
    [0, 0.5, 1].forEach(function (f) {
      var gy = padT + ih - f * ih;
      svg.appendChild(svgEl('line', {
        x1: padL, x2: W - padR, y1: gy, y2: gy,
        class: 'chart-grid',
        stroke: 'currentColor', 'stroke-opacity': 0.15, 'stroke-width': 1
      }));
    });

    /**
     * Dibuja una serie como polyline.
     * @param {string} field
     * @param {string} color
     * @returns {void}
     */
    function drawSeries(field, color) {
      var coords = [];
      points.forEach(function (p, i) {
        if (guards.isNumber(p[field])) {
          coords.push(x(i) + ',' + y(p[field]));
        }
      });
      if (coords.length < 2) return;
      var polyline = svgEl('polyline', {
        points: coords.join(' '),
        fill: 'none',
        stroke: color,
        'stroke-width': 2.5,
        'stroke-linejoin': 'round',
        'stroke-linecap': 'round'
      });
      svg.appendChild(polyline);
    }

    // ---- Dibujar serie(s) ----
    if (series2 && o.dual) {
      drawSeries(series2, o.colorS2 || '#E07A2F');
    }
    drawSeries(series, o.colorS1 || '#4C9BE8');

    // ---- Puntos y tooltips ----
    points.forEach(function (p, i) {
      var val = p[series];
      if (!guards.isNumber(val)) return;
      var cx = x(i);
      var cy = y(val);
      var circle = svgEl('circle', {
        cx: cx, cy: cy, r: 4, class: 'chart-dot',
        fill: o.colorS1 || '#4C9BE8'
      });
      var title = svgEl('title');
      var labelTxt = p.label;
      var tip = labelTxt + ': ' + fmt.formatNumber(val);
      if (o.dual && guards.isNumber(p.series2)) {
        tip += ' | ' + (o.labelS2 || 'S2') + ': ' + fmt.formatNumber(p.series2);
      }
      title.textContent = tip;
      circle.appendChild(title);
      svg.appendChild(circle);
    });

    // ---- Etiquetas del eje X ----
    var shown = n > 6 ? 2 : 1;
    points.forEach(function (p, i) {
      if (i % shown !== 0 && i !== n - 1) return;
      svg.appendChild(svgEl('text', {
        x: x(i), y: H - 8, 'text-anchor': 'middle', class: 'chart-axis-label'
      })).textContent = p.label;
    });

    svg.setAttribute('aria-label', (o.title || 'Gráfico de tendencia') + ' en ' + fmt.formatNumber(max));
    return svg;
  }

  NS.charts = {
    lineChart: lineChart
  };
})(window);