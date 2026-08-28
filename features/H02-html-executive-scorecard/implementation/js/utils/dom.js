/* ============================================================
   H02 — Executive Scorecard
   utils/dom.js — Helpers de manipulación DOM seguros.
   Expone: H02.dom
   ============================================================ */

(function (global) {
  'use strict';

  var NS = (global.H02 = global.H02 || {});

  /**
   * Crea un elemento con atributos, clases y contenido de texto.
   * @param {string} tag
   * @param {Object} [options]
   * @param {string[]} [options.className] - clases a agregar
   * @param {Object} [options.attrs] - atributos
   * @param {string} [options.text] - contenido de texto (seguro)
   * @returns {HTMLElement}
   */
  function createElement(tag, options) {
    var el = document.createElement(tag);
    var opts = options || {};
    if (opts.className) {
      opts.className.split(' ').forEach(function (c) {
        if (c) el.classList.add(c);
      });
    }
    if (opts.attrs) {
      Object.keys(opts.attrs).forEach(function (k) {
        el.setAttribute(k, opts.attrs[k]);
      });
    }
    if (typeof opts.text === 'string') {
      el.textContent = opts.text;
    }
    return el;
  }

  /**
   * Agrega hijos a un elemento.
   * @param {HTMLElement} parent
   * @param {Array<HTMLElement>} children
   * @returns {HTMLElement}
   */
  function appendChildren(parent, children) {
    (children || []).forEach(function (child) {
      if (child) parent.appendChild(child);
    });
    return parent;
  }

  /**
   * Vacía un elemento (elimina todos sus hijos).
   * @param {HTMLElement} el
   * @returns {HTMLElement}
   */
  function removeChildren(el) {
    while (el.firstChild) {
      el.removeChild(el.firstChild);
    }
    return el;
  }

  /**
   * Agrega o quita una clase.
   * @param {HTMLElement} el
   * @param {string} className
   * @param {boolean} add
   * @returns {HTMLElement}
   */
  function toggleClass(el, className, add) {
    if (el) el.classList.toggle(className, !!add);
    return el;
  }

  NS.dom = {
    createElement: createElement,
    appendChildren: appendChildren,
    removeChildren: removeChildren,
    toggleClass: toggleClass
  };
})(window);