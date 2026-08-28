/* ============================================================
   H02 — Executive Scorecard
   html/components/ranking.js — Ranking UCSP + Líder/Brecha
   Expone: H02.ranking
   ============================================================ */

(function (global) {
  'use strict';

  var NS = (global.H02 = global.H02 || {});
  var guards = NS.guards;
  var dom = NS.dom;
  var fmt = NS.formatters;

  /**
   * Valor de texto para un campo, respetando valores especiales.
   * @param {*} v
   * @returns {string}
   */
  function txt(v) {
    if (guards.isBlank(v)) return '—';
    if (guards.isConditionalD003(v)) return 'Condicional — D003';
    return String(v);
  }

  /**
   * Renderiza la sección de ranking (posición UCSP + líder/brecha).
   * @param {object} data
   * @param {HTMLElement} mount
   * @returns {HTMLElement}
   */
  function render(data, mount) {
    dom.removeChildren(mount);
    var rk = data.RANKING || {};

    var card = dom.createElement('article', { className: 'rank-card', attrs: { 'aria-label': 'Ranking por matrículas' } });
    card.appendChild(dom.createElement('h3', { className: 'card-title', text: 'Ranking por matrículas' }));

    var pos = dom.createElement('div', { className: 'rank-posicion' });
    var posNum = dom.createElement('span', { className: 'rank-posicion-num', text: txt(rk.posicion_ucsp) });
    var posTotal = dom.createElement('span', {
      className: 'rank-posicion-total',
      text: guards.isNumber(rk.total_universidades) ? ('de ' + rk.total_universidades + ' universidades') : ''
    });
    pos.appendChild(posNum);
    pos.appendChild(posTotal);
    card.appendChild(pos);

    var lider = dom.createElement('div', { className: 'rank-lider' });
    lider.appendChild(dom.createElement('span', { className: 'rank-lider-label', text: 'Universidad líder' }));
    lider.appendChild(dom.createElement('span', { className: 'rank-lider-name', text: txt(rk.lider) }));
    if (guards.isNumber(rk.matriculas_lider)) {
      lider.appendChild(dom.createElement('span', {
        className: 'rank-lider-matriculas',
        text: fmt.formatNumber(rk.matriculas_lider) + ' matrículas'
      }));
    }
    card.appendChild(lider);

    var brecha = dom.createElement('div', { className: 'rank-brecha' });
    brecha.appendChild(dom.createElement('span', { className: 'rank-brecha-label', text: 'Brecha vs líder' }));
    brecha.appendChild(dom.createElement('span', {
      className: 'rank-brecha-value',
      text: guards.isNumber(rk.brecha_vs_lider) ? fmt.formatNumber(rk.brecha_vs_lider) : txt(rk.brecha_vs_lider)
    }));
    card.appendChild(brecha);

    mount.appendChild(card);
    return mount;
  }

  NS.ranking = { render: render };
})(window);