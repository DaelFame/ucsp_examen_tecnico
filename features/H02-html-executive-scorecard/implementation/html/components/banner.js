/* ============================================================
   H02 — Executive Scorecard
   html/components/banner.js — Banner D003 (no dismissible)
   Expone: H02.banner
   ============================================================ */

(function (global) {
  'use strict';

  var NS = (global.H02 = global.H02 || {});
  var guards = NS.guards;
  var dom = NS.dom;

  /**
   * Determina si el contrato contiene marcadores D003.
   * @param {object} data
   * @returns {boolean}
   */
  function hasD003(data) {
    if (!guards.isObject(data)) return false;
    var walk = [data.UCSP, data.MERCADO, data.RANKING, data.TOP3_PLUS_UCSP];
    for (var i = 0; i < walk.length; i++) {
      var section = walk[i];
      if (!guards.isObject(section) && !guards.isArray(section)) continue;
      if (guards.isArray(section)) {
        for (var j = 0; j < section.length; j++) {
          if (guards.isConditionalD003(section[j] && section[j].matriculas)) return true;
        }
        continue;
      }
      var keys = Object.keys(section);
      for (var k = 0; k < keys.length; k++) {
        if (guards.isConditionalD003(section[keys[k]])) return true;
      }
    }
    if (guards.isArray(data.meta && data.meta.warnings)) {
      var wrn = data.meta.warnings.some(function (w) {
        return guards.isString(w) && w.indexOf(guards.STR_CONDITIONAL_D003) !== -1;
      });
      if (wrn) return true;
    }
    return false;
  }

  /**
   * Renderiza el banner D003 si corresponde.
   * @param {object} data
   * @param {HTMLElement} mount
   * @returns {HTMLElement|null}
   */
  function render(data, mount) {
    dom.removeChildren(mount);
    var active = hasD003(data);
    mount.hidden = !active;
    if (!active) return null;

    mount.classList.add('d003-banner--active');
    var icon = dom.createElement('span', { className: 'd003-icon', attrs: { 'aria-hidden': 'true' }, text: '⚠' });
    var txt = dom.createElement('span', {
      className: 'd003-text',
      text: 'Las métricas anuales de Matrículas se encuentran pendientes de validación de negocio (D003).'
    });
    mount.appendChild(icon);
    mount.appendChild(txt);
    return mount;
  }

  NS.banner = { render: render, hasD003: hasD003 };
})(window);