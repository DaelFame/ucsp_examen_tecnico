/* ============================================================
   H02 — Executive Scorecard
   html/components/kpis.js — Tarjetas KPI
   Expone: H02.kpis
   ============================================================ */

(function (global) {
  'use strict';

  var NS = (global.H02 = global.H02 || {});
  var guards = NS.guards;
  var dom = NS.dom;
  var fmt = NS.formatters;
  var a11y = NS.a11y;

  /**
   * Renderiza un valor especial o placeholder según el tipo.
   * @param {*} value
   * @returns {string} texto a mostrar
   */
  function displayValue(value) {
    if (guards.isBlank(value)) return '—';
    if (guards.isConditionalD003(value)) return 'Condicional — D003';
    if (guards.isNotApplicable(value)) return 'N/D — Escala anual';
    return String(value);
  }

  /**
   * Formatea un ratio para mostrar en KPI de cuota, respetando valores especiales.
   * @param {*} ratio
   * @returns {string}
   */
  function shareValue(ratio) {
    if (guards.isBlank(ratio)) return '—';
    if (guards.isConditionalD003(ratio)) return 'Condicional — D003';
    if (guards.isNumber(ratio)) return fmt.formatPercent(ratio, 1);
    return '—';
  }

  /**
   * Crea una tarjeta KPI genérica.
   * @param {Object} opts
   * @param {string} opts.label
   * @param {string} opts.value
   * @param {string} [opts.deltaText]
   * @param {string} [opts.deltaClass]
   * @param {string} [opts.hint]
   * @param {string} [opts.unit]
   * @returns {HTMLElement}
   */
  function kpiCard(opts) {
    var card = dom.createElement('article', { className: 'kpi-card', attrs: { 'aria-label': opts.label } });

    var label = dom.createElement('div', { className: 'kpi-label', text: opts.label });
    card.appendChild(label);

    var value = dom.createElement('div', { className: 'kpi-value', text: opts.value });
    if (opts.unit) {
      value.appendChild(dom.createElement('span', { className: 'kpi-unit', text: opts.unit }));
    }
    card.appendChild(value);

    if (opts.deltaText) {
      card.appendChild(dom.createElement('div', { className: 'kpi-delta ' + (opts.deltaClass || ''), text: opts.deltaText }));
    }

    if (opts.hint) {
      card.appendChild(dom.createElement('div', { className: 'kpi-hint', text: opts.hint }));
    }

    return card;
  }

  /**
   * Renderiza el bloque de 4 KPIs.
   * @param {object} data
   * @param {HTMLElement} mountMatriculas
   * @param {HTMLElement} mountIngresantes
   * @param {HTMLElement} mountShareMat
   * @param {HTMLElement} mountShareIng
   * @returns {void}
   */
  function render(data, mountMatriculas, mountIngresantes, mountShareMat, mountShareIng) {
    var ucsp = data.UCSP || {};
    var ctx = data.contexto || {};
    var escala = ctx.escala === 'SEMESTRAL' ? ' · semestre actual' : ' · anual';

    /* ---- KPI Matrículas ---- */
    dom.removeChildren(mountMatriculas);
    var mValue = displayValue(ucsp.matriculas);
    var mDelta = '';
    var mDeltaClass = '';
    if (guards.isNumber(ucsp.matriculas_yoy)) {
      mDelta = fmt.formatPercent(ucsp.matriculas_yoy, 0) + ' vs año anterior';
      mDeltaClass = ucsp.matriculas_yoy >= 0 ? 'delta-pos' : 'delta-neg';
    } else if (guards.isConditionalD003(ucsp.matriculas_yoy)) {
      mDelta = 'Variación pendiente D003';
    }
    mountMatriculas.appendChild(kpiCard({
      label: 'Matrículas UCSP',
      value: mValue,
      unit: escala,
      deltaText: mDelta,
      deltaClass: mDeltaClass,
      hint: 'Volumen de matrículas'
    }));

    /* ---- KPI Ingresantes ---- */
    dom.removeChildren(mountIngresantes);
    var iValue = displayValue(ucsp.ingresantes);
    var iDelta = '';
    var iDeltaClass = '';
    if (guards.isNumber(ucsp.ingresantes_yoy)) {
      iDelta = fmt.formatPercent(ucsp.ingresantes_yoy, 0) + ' vs año anterior';
      iDeltaClass = ucsp.ingresantes_yoy >= 0 ? 'delta-pos' : 'delta-neg';
    }
    mountIngresantes.appendChild(kpiCard({
      label: 'Ingresantes UCSP',
      value: iValue,
      deltaText: iDelta,
      deltaClass: iDeltaClass,
      hint: 'Escala anual'
    }));

    /* ---- KPI Cuota de matrículas ---- */
    dom.removeChildren(mountShareMat);
    mountShareMat.appendChild(kpiCard({
      label: 'Cuota de matrículas',
      value: shareValue(ucsp.market_share_matriculas),
      hint: 'Participación en el mercado de matrículas'
    }));

    /* ---- KPI Cuota de ingresantes ---- */
    dom.removeChildren(mountShareIng);
    mountShareIng.appendChild(kpiCard({
      label: 'Cuota de ingresantes',
      value: shareValue(ucsp.market_share_ingresantes),
      hint: 'Participación en el mercado de ingresantes'
    }));
  }

  NS.kpis = { render: render };
})(window);