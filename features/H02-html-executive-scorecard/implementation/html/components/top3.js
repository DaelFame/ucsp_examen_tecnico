/* ============================================================
   H02 — Executive Scorecard
   html/components/top3.js — Top 3 + UCSP (dataset directo)
   Expone: H02.top3
   ============================================================ */

(function (global) {
  'use strict';

  var NS = (global.H02 = global.H02 || {});
  var guards = NS.guards;
  var dom = NS.dom;
  var fmt = NS.formatters;

  /**
   * Renderiza la lista Top 3 + UCSP tal como llega en el contrato.
   * No recalcula posiciones.
   * @param {object} data
   * @param {HTMLElement} mount
   * @returns {HTMLElement}
   */
  function render(data, mount) {
    dom.removeChildren(mount);
    var list = data.TOP3_PLUS_UCSP || [];

    var card = dom.createElement('article', { className: 'top3-card', attrs: { 'aria-label': 'Top 3 y UCSP' } });
    card.appendChild(dom.createElement('h3', { className: 'card-title', text: 'Top 3 y UCSP' }));

    if (!guards.isArray(list) || list.length === 0) {
      card.appendChild(dom.createElement('div', { className: 'empty-inline', text: 'Sin datos de ranking disponible.' }));
      mount.appendChild(card);
      return mount;
    }

    var rows = dom.createElement('div', { className: 'top3-list', attrs: { role: 'list' } });

    list.forEach(function (item) {
      var row = dom.createElement('div', {
        className: 'top3-item' + (item.es_ucsp ? ' top3-item--ucsp' : ''),
        attrs: { role: 'listitem' }
      });

      var pos = dom.createElement('span', { className: 'top3-pos', text: String(item.posicion) });
      row.appendChild(pos);

      var nameWrap = dom.createElement('div', { className: 'top3-info' });
      nameWrap.appendChild(dom.createElement('span', { className: 'top3-name', text: item.universidad || '—' }));
      if (item.es_ucsp) {
        nameWrap.appendChild(dom.createElement('span', { className: 'badge-ucsp', text: 'UCSP' }));
      }
      row.appendChild(nameWrap);

      var mat = dom.createElement('span', {
        className: 'top3-mat',
        text: guards.isNumber(item.matriculas) ? fmt.formatNumber(item.matriculas) : (guards.isConditionalD003(item.matriculas) ? 'Condicional — D003' : '—')
      });
      row.appendChild(mat);

      rows.appendChild(row);
    });

    card.appendChild(rows);
    mount.appendChild(card);
    return mount;
  }

  NS.top3 = { render: render };
})(window);