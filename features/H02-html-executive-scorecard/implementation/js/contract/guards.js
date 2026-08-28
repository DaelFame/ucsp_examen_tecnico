/* ============================================================
   H02 — Executive Scorecard
   contract/guards.js — Type guards y guards de valores especiales
   Fuente de verdad: DATA_CONTRACT.md (valores: null, BLANK,
   "N/D — Escala anual", "CONDITIONAL — D003")
   ----------
   RESPONSABILIDAD: SOLO clasificar tipos y valores especiales del contrato.
   NO calcula, NO agrega, NO filtra, NO ranking, NO porcentajes.
   Sin lógica de negocio DAX.
   Expone: H02.guards
   ============================================================ */

(function (global) {
  'use strict';

  var NS = (global.H02 = global.H02 || {});

  /** Cadena literal que marca medidas anuales de matrículas pendientes de D003. */
  var STR_CONDITIONAL_D003 = 'CONDITIONAL — D003';

  /** Cadena literal para ingresantes cuando el contexto es semestral. */
  var STR_ND_ANUAL = 'N/D — Escala anual';

  /* ---------- Type guards primitivos ---------- */

  /**
   * True si el valor es exactamente `null` o `undefined`.
   * @param {*} v
   * @returns {boolean}
   */
  function isNullish(v) {
    return v === null || v === undefined;
  }

  /**
   * True si el valor es `null`, `undefined` o `BLANK` (equivalente a null en el contrato).
   * @param {*} v
   * @returns {boolean}
   */
  function isBlank(v) {
    return isNullish(v) || v === 'BLANK';
  }

  /**
   * True si el valor es `null` (número no disponible) o `BLANK`.
   * Convención del contrato: el JSON llega ya sin BLANK real (BLANK => null),
   * pero se admite la cadena por robustez.
   * @param {*} v
   * @returns {boolean}
   */
  function isNumber(v) {
    return typeof v === 'number' && isFinite(v);
  }

  /**
   * True si el valor es un entero (Number entero finito).
   * @param {*} v
   * @returns {boolean}
   */
  function isInteger(v) {
    return typeof v === 'number' && isFinite(v) && Math.floor(v) === v;
  }

  /**
   * True si el valor es un string.
   * @param {*} v
   * @returns {boolean}
   */
  function isString(v) {
    return typeof v === 'string';
  }

  /**
   * True si el valor es booleano.
   * @param {*} v
   * @returns {boolean}
   */
  function isBoolean(v) {
    return typeof v === 'boolean';
  }

  /**
   * True si el valor es un objeto (no null, no array).
   * @param {*} v
   * @returns {boolean}
   */
  function isObject(v) {
    return typeof v === 'object' && v !== null && !Array.isArray(v);
  }

  /**
   * True si el valor es un arreglo.
   * @param {*} v
   * @returns {boolean}
   */
  function isArray(v) {
    return Array.isArray(v);
  }

  /**
   * True si el valor coincide con el tipo solicitado.
   * Tipos soportados: 'null', 'number', 'integer', 'string', 'boolean',
   * 'object', 'array', 'blank' (null/undefined/'BLANK').
   * @param {*} v
   * @param {string} typeName
   * @returns {boolean}
   */
  function isType(v, typeName) {
    switch (typeName) {
      case 'null':
        return isNullish(v);
      case 'number':
        return isNumber(v);
      case 'integer':
        return isInteger(v);
      case 'string':
        return isString(v);
      case 'boolean':
        return isBoolean(v);
      case 'object':
        return isObject(v);
      case 'array':
        return isArray(v);
      case 'blank':
        return isBlank(v);
      default:
        return false;
    }
  }

  /* ---------- Guards de valores especiales del contrato ---------- */

  /**
   * True si el valor es el literal "CONDITIONAL — D003".
   * Usado por medidas anuales de matrículas pendientes de D003.
   * @param {*} v
   * @returns {boolean}
   */
  function isConditionalD003(v) {
    return v === STR_CONDITIONAL_D003;
  }

  /**
   * True si el valor es el literal "N/D — Escala anual".
   * Usado por ingresantes cuando el contexto es semestral.
   * @param {*} v
   * @returns {boolean}
   */
  function isNotApplicable(v) {
    return v === STR_ND_ANUAL;
  }

  NS.guards = {
    STR_CONDITIONAL_D003: STR_CONDITIONAL_D003,
    STR_ND_ANUAL: STR_ND_ANUAL,
    isNullish: isNullish,
    isBlank: isBlank,
    isNumber: isNumber,
    isInteger: isInteger,
    isString: isString,
    isBoolean: isBoolean,
    isObject: isObject,
    isArray: isArray,
    isType: isType,
    isConditionalD003: isConditionalD003,
    isNotApplicable: isNotApplicable
  };
})(window);