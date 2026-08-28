/* ============================================================
   H02 — Executive Scorecard
   html/components/header.js — Header / contexto
   Expone: H02.header
   ============================================================ */

(function (global) {
  'use strict';

  var NS = (global.H02 = global.H02 || {});
  var guards = NS.guards;
  var dom = NS.dom;

  var SEMESTRE_TXT = { 1: 'Semestre 1', 2: 'Semestre 2' };

  /**
   * Devuelve la etiqueta de periodo según contexto.
   * @param {object} ctx
   * @returns {string}
   */
  function periodoLabel(ctx) {
    var anio = guards.isNumber(ctx.anio) ? String(ctx.anio) : '—';
    var sem = SEMESTRE_TXT[ctx.semestre];
    return sem ? (anio + ' · ' + sem) : anio;
  }

  /**
   * Renderiza el header de contexto.
   * @param {object} data - contrato validado.
   * @param {HTMLElement} mount
   * @returns {HTMLElement}
   */
  function render(data, mount) {
    dom.removeChildren(mount);
    var ctx = data.contexto || {};

    var brand = dom.createElement('div', { className: 'header-brand' });
    brand.appendChild(dom.createElement('span', { className: 'header-title', text: 'Executive Scorecard UCSP' }));
    brand.appendChild(dom.createElement('span', { className: 'header-subtitle', text: 'Matrículas e Ingresantes' }));

    var chips = dom.createElement('div', { className: 'header-chips' });

    var periodo = dom.createElement('span', { className: 'chip chip-periodo', text: periodoLabel(ctx) });
    chips.appendChild(periodo);

    var escala = ctx.escala;
    if (guards.isString(escala) && escala) {
      chips.appendChild(dom.createElement('span', { className: 'chip', text: escala === 'ANUAL' ? 'Escala anual' : 'Escala semestral' }));
    }

    var gestion = ctx.gestion;
    if (guards.isString(gestion) && gestion) {
      chips.appendChild(dom.createElement('span', { className: 'chip', text: gestion }));
    }

    var nivel = ctx.nivel_academico;
    if (guards.isString(nivel) && nivel) {
      chips.appendChild(dom.createElement('span', { className: 'chip chip-nivel', text: nivel }));
    }

    var dep = ctx.departamento || ctx.provincia;
    if (guards.isString(dep) && dep) {
      chips.appendChild(dom.createElement('span', { className: 'chip', text: dep }));
    }

    var uv = ctx.universidad_seleccionada;
    if (guards.isString(uv) && uv) {
      chips.appendChild(dom.createElement('span', { className: 'chip chip-uni', text: uv }));
    }

    mount.appendChild(brand);
    mount.appendChild(chips);
    return mount;
  }

  NS.header = { render: render };
})(window);