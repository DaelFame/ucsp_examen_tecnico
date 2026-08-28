/* ============================================================
   H02 — Executive Scorecard
   utils/accessibility.js — Helpers de accesibilidad (ARIA).
   Expone: H02.a11y
   ============================================================ */

(function (global) {
  'use strict';

  var NS = (global.H02 = global.H02 || {});

  /**
   * Anuncia un mensaje a lectores de pantalla vía aria-live.
   * @param {string} message
   * @param {string} [live='polite']
   * @returns {void}
   */
  function announceToScreenReader(message, live) {
    var region = document.getElementById('a11y-live-region');
    if (!region) {
      region = document.createElement('div');
      region.id = 'a11y-live-region';
      region.setAttribute('aria-live', live || 'polite');
      region.setAttribute('aria-atomic', 'true');
      region.className = 'sr-only';
      document.body.appendChild(region);
    }
    region.textContent = message;
  }

  /**
   * Establece el texto live de un contenedor con aria-live.
   * @param {string} id
   * @param {string} text
   * @returns {void}
   */
  function setAriaLive(id, text) {
    var el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  /**
   * Mueve el foco a un elemento.
   * @param {string} id
   * @returns {void}
   */
  function manageFocus(id) {
    var el = document.getElementById(id);
    if (el) {
      el.setAttribute('tabindex', '-1');
      el.focus();
    }
  }

  /**
   * Define si una cadena representa un valor de texto desconocido.
   * @param {string|null} value
   * @returns {boolean}
   */
  function isUnknownText(value) {
    return value === null || value === undefined || value === '';
  }

  NS.a11y = {
    announceToScreenReader: announceToScreenReader,
    setAriaLive: setAriaLive,
    manageFocus: manageFocus,
    isUnknownText: isUnknownText
  };
})(window);