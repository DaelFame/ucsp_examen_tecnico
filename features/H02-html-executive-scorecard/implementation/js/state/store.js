/* ============================================================
   H02 — Executive Scorecard
   state/store.js — Store de estados de presentación.
   Estados: loading | ready | empty | error | conditional
   Expone: H02.store
   ----------
   RESPONSABILIDAD: solo almacena estado de UI y datos del contrato.
   NO contiene lógica de negocio.
   ============================================================ */

(function (global) {
  'use strict';

  var NS = (global.H02 = global.H02 || {});

  var STATUS = {
    LOADING: 'loading',
    READY: 'ready',
    EMPTY: 'empty',
    ERROR: 'error',
    CONDITIONAL: 'conditional'
  };

  var state = {
    status: STATUS.LOADING,
    data: null,
    error: null,
    listeners: []
  };

  /**
   * Suscribe un listener a cambios de estado.
   * @param {Function} fn - (state) => void
   * @returns {void}
   */
  function subscribe(fn) {
    state.listeners.push(fn);
  }

  /**
   * Devuelve una copia del estado actual (solo lectura de UI).
   * @returns {{status: string, data: object|null, error: string|null}}
   */
  function getState() {
    return {
      status: state.status,
      data: state.data,
      error: state.error
    };
  }

  /**
   * Emite el estado a todos los listeners.
   * @returns {void}
   */
  function emit() {
    var snapshot = getState();
    state.listeners.forEach(function (fn) {
      try {
        fn(snapshot);
      } catch (e) {
        // Un listener fallido no debe romper el resto.
      }
    });
  }

  /**
   * Establece el estado de carga (loading).
   * @returns {void}
   */
  function setLoading() {
    state.status = STATUS.LOADING;
    state.data = null;
    state.error = null;
    emit();
  }

  /**
   * Establece el estado listo (ready).
   * @param {object} data - contrato validado.
   * @returns {void}
   */
  function setReady(data) {
    state.status = STATUS.READY;
    state.data = data;
    state.error = null;
    emit();
  }

  /**
   * Establece el estado vacío (empty): UCSP sin datos.
   * @param {object} data
   * @returns {void}
   */
  function setEmpty(data) {
    state.status = STATUS.EMPTY;
    state.data = data;
    state.error = null;
    emit();
  }

  /**
   * Establece el estado condicional (conditional): campos D003 presentes.
   * @param {object} data
   * @returns {void}
   */
  function setConditional(data) {
    state.status = STATUS.CONDITIONAL;
    state.data = data;
    state.error = null;
    emit();
  }

  /**
   * Establece el estado de error (error).
   * @param {string} message
   * @returns {void}
   */
  function setError(message) {
    state.status = STATUS.ERROR;
    state.data = null;
    state.error = message || 'Error desconocido al cargar los datos.';
    emit();
  }

  NS.store = {
    STATUS: STATUS,
    subscribe: subscribe,
    getState: getState,
    setLoading: setLoading,
    setReady: setReady,
    setEmpty: setEmpty,
    setConditional: setConditional,
    setError: setError
  };
})(window);