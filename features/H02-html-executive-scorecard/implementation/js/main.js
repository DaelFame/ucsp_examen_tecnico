/* ============================================================
   H02 — Executive Scorecard
   main.js — Bootstrap / orquestador de renderizado.
   Flujo: LOAD → mock → validar contrato → estado → render.
   Sin lógica de negocio DAX. Solo presentación.
   ============================================================ */

(function () {
  'use strict';

  var dom = H02.dom;
  var store = H02.store;
  var validator = H02.validator;
  var guards = H02.guards;
  var a11y = H02.a11y;

  /* ---------- Referencias de montaje ---------- */
  var refs = {};

  /**
   * Captura las referencias del DOM.
   * @returns {Object}
   */
  function captureRefs() {
    return {
      header: document.getElementById('header-contexto'),
      banner: document.getElementById('d003-banner'),
      globalState: document.getElementById('global-state'),
      kpiMat: document.getElementById('kpi-matriculas'),
      kpiIng: document.getElementById('kpi-ingresantes'),
      kpiShareMat: document.getElementById('kpi-market-share-matriculas'),
      kpiShareIng: document.getElementById('kpi-market-share-ingresantes'),
      ranking: document.getElementById('ranking-table'),
      top3: document.getElementById('top3-plus-ucsp'),
      trendMat: document.getElementById('trend-matriculas'),
      trendIng: document.getElementById('trend-ingresantes'),
      footerMeta: document.getElementById('footer-meta'),
      mockSelect: document.getElementById('mock-select')
    };
  }

  /**
   * Determina el estado de presentación del contrato validado.
   * @param {object} data
   * @returns {string} 'ready' | 'empty' | 'conditional'
   */
  function decideState(data) {
    if (H02.banner.hasD003(data)) return store.STATUS.CONDITIONAL;
    var ucsp = data.UCSP || {};
    var noDatosUcsp = guards.isBlank(ucsp.matriculas) && guards.isBlank(ucsp.ingresantes);
    if (noDatosUcsp) return store.STATUS.EMPTY;
    return store.STATUS.READY;
  }

  /**
   * Renderiza skeletons en todos los slots (estado loading).
   * @returns {void}
   */
  function renderLoading() {
    document.querySelectorAll('.kpi-slot, .top3-slot, .ranking-slot, .trend-slot').forEach(function (slot) {
      dom.removeChildren(slot);
      var block = dom.createElement('div', { className: 'skeleton-block skeleton-block--tall' });
      slot.appendChild(block);
    });
    dom.removeChildren(refs.header);
    refs.header.appendChild(dom.createElement('div', { className: 'header-skeleton' }));
    refs.banner.hidden = true;
  }

  /**
   * Oculta el estado global y lo limpia.
   * @returns {void}
   */
  function hideGlobalState() {
    var g = refs.globalState;
    g.classList.remove('global-state--visible', 'global-state--error', 'global-state--empty');
    g.hidden = true;
    dom.removeChildren(g);
  }

  /**
   * Muestra un estado global (error o empty a nivel app).
   * @param {string} message
   * @param {string} kind - 'error' | 'empty'
   * @returns {void}
   */
  function showGlobalState(message, kind) {
    var g = refs.globalState;
    dom.removeChildren(g);
    g.textContent = message;
    g.classList.add('global-state--visible', 'global-state--' + kind);
    g.hidden = false;
  }

  /**
   * Renderiza todos los componentes con los datos del estado.
   * @param {object} data
   * @returns {void}
   */
  function renderDashboard(data) {
    hideGlobalState();
    H02.header.render(data, refs.header);
    H02.banner.render(data, refs.banner);
    H02.kpis.render(data, refs.kpiMat, refs.kpiIng, refs.kpiShareMat, refs.kpiShareIng);
    H02.ranking.render(data, refs.ranking);
    H02.top3.render(data, refs.top3);
    H02.trends.render(data, refs.trendMat, refs.trendIng);

    // Footer meta
    var meta = data.meta || {};
    var txt = 'Contrato H02 v' + (meta.contract_version || '?');
    if (guards.isNumber(meta.source_measures_count)) {
      txt += ' · Fuente H01: ' + meta.source_measures_count + ' medidas inventariadas';
    }
    refs.footerMeta.textContent = txt;
  }

  /**
   * Orquestador de render según estado del store.
   * @param {{status:string, data:object|null, error:string|null}} state
   * @returns {void}
   */
  function onStateChange(state) {
    switch (state.status) {
      case store.STATUS.LOADING:
        renderLoading();
        break;
      case store.STATUS.READY:
        renderDashboard(state.data);
        a11y.announceToScreenReader('Datos cargados.');
        break;
      case store.STATUS.EMPTY:
        renderDashboard(state.data);
        showGlobalState('Sin datos de UCSP en el contexto actual.', 'empty');
        a11y.announceToScreenReader('Sin datos de UCSP en el contexto actual.');
        break;
      case store.STATUS.CONDITIONAL:
        renderDashboard(state.data);
        a11y.announceToScreenReader('Métricas anuales de matrículas pendientes de validación D003.');
        break;
      case store.STATUS.ERROR:
        hideGlobalState();
        showGlobalState(state.error || 'Error cargando los datos.', 'error');
        a11y.announceToScreenReader(state.error || 'Error cargando los datos.', 'assertive');
        break;
      default:
        break;
    }
  }

  /**
   * Carga un mock por clave, valida el contrato y fija el estado.
   * @param {string} key
   * @returns {void}
   */
  function loadMock(key) {
    store.setLoading();

    var mock = H02.mockData[key];
    if (!mock) {
      store.setError('Mock no encontrado: ' + key);
      return;
    }

    var result = validator.validateSchema(mock);
    if (!result.valid) {
      store.setError('Contrato inválido: ' + result.errors.join(' | '));
      return;
    }

    var status = decideState(mock);
    if (status === store.STATUS.CONDITIONAL) store.setConditional(mock);
    else if (status === store.STATUS.EMPTY) store.setEmpty(mock);
    else store.setReady(mock);
  }

  /**
   * Construye el selector de mocks (dev).
   * @returns {void}
   */
  function buildMockSelector() {
    var wrap = document.getElementById('mock-selector');
    if (!wrap || !refs.mockSelect) return;
    var options = H02.mocks.list();
    options.forEach(function (m) {
      var opt = dom.createElement('option', { attrs: { value: m.key }, text: m.label });
      refs.mockSelect.appendChild(opt);
    });
    refs.mockSelect.addEventListener('change', function () {
      loadMock(refs.mockSelect.value);
    });
  }

  /**
   * Punto de entrada.
   * @returns {void}
   */
  function init() {
    refs = captureRefs();
    store.subscribe(onStateChange);
    buildMockSelector();
    loadMock('full');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();