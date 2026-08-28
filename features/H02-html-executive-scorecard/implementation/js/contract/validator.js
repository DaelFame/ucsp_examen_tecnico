/* ============================================================
   H02 — Executive Scorecard
   contract/validator.js — Validación del contrato H02 v1.0
   Fuente de verdad: DATA_CONTRACT.md
   ----------
   RESPONSABILIDAD: SOLO validar estructura y tipos del JSON recibido.
   NO calcula, NO agrega, NO filtra, NO hace ranking, NO porcentajes,
   NO YoY, NO brechas. Sin lógica de negocio DAX.
   Depende de: contract/guards.js (namespace H02.guards)
   ============================================================ */

(function (global) {
  'use strict';

  var NS = (global.H02 = global.H02 || {});
  var guards = NS.guards;

  var CONTRACT_VERSION = '1.0';
  var LEVELS_VALIDOS = [
    'MAESTRIA',
    'CARRERA PROFESIONAL',
    'SEGUNDA ESPECIALIDAD',
    'DOCTORADO'
  ];

  /**
   * @typedef {Object} ValidationResult
   * @property {boolean} valid  - true si no hay errores de estructura
   * @property {string[]} errors  - lista de errores encontrados
   * @property {string[]} warnings - advertencias no bloqueantes
   */

  /** Tipo de un valor permitido en una sección del contrato. */
  var SCHEMA = {
    contexto: {
      anio: 'integer',
      semestre: ['integer', 'null'],
      escala: 'string',
      programa: ['string', 'null'],
      nivel_academico: ['string', 'null'],
      gestion: ['string', 'null'],
      departamento: ['string', 'null'],
      provincia: ['string', 'null'],
      region_sur: ['boolean', 'null'],
      universidad_seleccionada: ['string', 'null']
    },
    UCSP: {
      matriculas: ['integer', 'null', 'conditional'],
      matriculas_yoy: ['number', 'null', 'conditional'],
      matriculas_yoy_valor: ['integer', 'null', 'conditional'],
      ingresantes: ['integer', 'null', 'nd'],
      ingresantes_yoy: ['number', 'null', 'conditional'],
      ingresantes_yoy_valor: ['integer', 'null', 'conditional'],
      market_share_matriculas: ['number', 'null', 'conditional'],
      market_share_ingresantes: ['number', 'null', 'conditional']
    },
    MERCADO: {
      matriculas: ['integer', 'null', 'conditional'],
      ingresantes: ['integer', 'null'],
      cantidad_universidades: 'integer',
      cantidad_programas: 'integer'
    },
    RANKING: {
      posicion_ucsp: ['integer', 'null', 'conditional'],
      total_universidades: 'integer',
      lider: ['string', 'null', 'conditional'],
      matriculas_lider: ['integer', 'null', 'conditional'],
      brecha_vs_lider: ['integer', 'null', 'conditional'],
      universidad_lider_es_ucsp: 'boolean'
    }
  };

  /**
   * Valida que `typeSpec` (string o array de strings) incluya el tipo del valor.
   * `null` se interpreta como valor nulo JSON.
   * @param {*} value
   * @param {string|string[]} typeSpec
   * @returns {boolean}
   */
  function matchesType(value, typeSpec) {
    var allowed = Array.isArray(typeSpec) ? typeSpec : [typeSpec];
    for (var i = 0; i < allowed.length; i++) {
      var t = allowed[i];
      if (t === 'conditional') {
        if (guards.isConditionalD003(value)) return true;
        continue;
      }
      if (t === 'nd') {
        if (guards.isNotApplicable(value)) return true;
        continue;
      }
      if (guards.isType(value, t)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Valida una sección plana contra su esquema de tipos.
   * @param {object} section
   * @param {object} schema
   * @param {string} sectionName
   * @param {string[]} errors
   * @returns {void}
   */
  function validateSection(section, schema, sectionName, errors) {
    if (!guards.isObject(section)) {
      errors.push(sectionName + ': sección ausente o no es objeto.');
      return;
    }

    var keys = Object.keys(schema);
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      if (!(key in section)) {
        errors.push(sectionName + '.' + key + ': campo obligatorio ausente.');
        continue;
      }
      var value = section[key];
      if (!matchesType(value, schema[key])) {
        errors.push(
          sectionName + '.' + key +
          ': tipo inválido. Se esperaba ' + JSON.stringify(schema[key]) +
          ' y se recibió ' + (value === null ? 'null' : typeof value) + '.'
        );
      }
    }
  }

  /**
   * Valida los items de TOP3_PLUS_UCSP.
   * @param {Array} list
   * @param {string[]} errors
   * @param {string[]} warnings
   * @returns {void}
   */
  function validateTop3Plus(list, errors, warnings) {
    if (!guards.isArray(list)) {
      errors.push('TOP3_PLUS_UCSP: debe ser un arreglo.');
      return;
    }
    if (list.length < 3 || list.length > 4) {
      warnings.push('TOP3_PLUS_UCSP: se esperaban 3-4 elementos, se recibieron ' + list.length + '.');
    }
    for (var i = 0; i < list.length; i++) {
      var item = list[i];
      if (!guards.isObject(item)) {
        errors.push('TOP3_PLUS_UCSP[' + i + ']: item no es objeto.');
        continue;
      }
      if (!guards.isString(item.universidad)) {
        errors.push('TOP3_PLUS_UCSP[' + i + '].universidad: debe ser string.');
      }
      if (!guards.isInteger(item.posicion)) {
        errors.push('TOP3_PLUS_UCSP[' + i + '].posicion: debe ser entero.');
      }
      if (!guards.isInteger(item.matriculas) && !guards.isNullish(item.matriculas) && !guards.isConditionalD003(item.matriculas)) {
        errors.push('TOP3_PLUS_UCSP[' + i + '].matriculas: debe ser entero, null o "CONDITIONAL — D003".');
      }
      if (!guards.isBoolean(item.es_ucsp)) {
        errors.push('TOP3_PLUS_UCSP[' + i + '].es_ucsp: debe ser booleano.');
      }
    }
  }

  /**
   * Valida los items de TENDENCIA_MATRICULAS.
   * @param {Array} list
   * @param {string[]} errors
   * @param {string[]} warnings
   * @returns {void}
   */
  function validateTrendMatriculas(list, errors, warnings) {
    if (!guards.isArray(list)) {
      errors.push('TENDENCIA_MATRICULAS: debe ser un arreglo.');
      return;
    }
    if (list.length > 10) {
      warnings.push('TENDENCIA_MATRICULAS: más de 10 puntos (esperado máx 5 años x 2 semestres).');
    }
    for (var i = 0; i < list.length; i++) {
      var item = list[i];
      if (!guards.isObject(item)) {
        errors.push('TENDENCIA_MATRICULAS[' + i + ']: item no es objeto.');
        continue;
      }
      if (!guards.isInteger(item.anio)) {
        errors.push('TENDENCIA_MATRICULAS[' + i + '].anio: debe ser entero.');
      }
      if (guards.isNullish(item.semestre) || item.semestre < 1 || item.semestre > 2) {
        errors.push('TENDENCIA_MATRICULAS[' + i + '].semestre: debe ser 1 o 2.');
      }
      if (!guards.isInteger(item.matriculas) && !guards.isNullish(item.matriculas)) {
        errors.push('TENDENCIA_MATRICULAS[' + i + '].matriculas: debe ser entero o null.');
      }
    }
  }

  /**
   * Valida los items de TENDENCIA_INGRESANTES.
   * @param {Array} list
   * @param {string[]} errors
   * @param {string[]} warnings
   * @returns {void}
   */
  function validateTrendIngresantes(list, errors, warnings) {
    if (!guards.isArray(list)) {
      errors.push('TENDENCIA_INGRESANTES: debe ser un arreglo.');
      return;
    }
    if (list.length > 5) {
      warnings.push('TENDENCIA_INGRESANTES: más de 5 puntos (esperado máx 5 años).');
    }
    for (var i = 0; i < list.length; i++) {
      var item = list[i];
      if (!guards.isObject(item)) {
        errors.push('TENDENCIA_INGRESANTES[' + i + ']: item no es objeto.');
        continue;
      }
      if (!guards.isInteger(item.anio)) {
        errors.push('TENDENCIA_INGRESANTES[' + i + '].anio: debe ser entero.');
      }
      if (!guards.isInteger(item.ingresantes) && !guards.isNullish(item.ingresantes)) {
        errors.push('TENDENCIA_INGRESANTES[' + i + '].ingresantes: debe ser entero o null.');
      }
    }
  }

  /**
   * Valida la sección `meta`.
   * @param {object} meta
   * @param {string[]} errors
   * @param {string[]} warnings
   * @returns {void}
   */
  function validateMeta(meta, errors, warnings) {
    if (!guards.isObject(meta)) {
      errors.push('meta: sección ausente o no es objeto.');
      return;
    }
    if (meta.contract_version !== CONTRACT_VERSION) {
      warnings.push('meta.contract_version: se esperaba ' + CONTRACT_VERSION + ' y se recibió ' + meta.contract_version + '.');
    }
    if (!guards.isString(meta.generated_at)) {
      errors.push('meta.generated_at: debe ser string.');
    }
    if (!guards.isInteger(meta.source_measures_count)) {
      warnings.push('meta.source_measures_count: debe ser entero.');
    }
    if (!guards.isArray(meta.warnings)) {
      warnings.push('meta.warnings: debe ser un arreglo.');
    }
  }

  /**
   * Valida la coherencia entre `contexto.escala` y `contexto.semestre`.
   * @param {object} ctx
   * @param {string[]} errors
   * @returns {void}
   */
  function validateEscalaSemestre(ctx, errors) {
    if (!guards.isObject(ctx)) return;
    var escala = ctx.escala;
    var semestre = ctx.semestre;
    if (escala === 'ANUAL' && semestre !== null) {
      errors.push('contexto: escala=ANUAL requiere semestre=null.');
    }
    if (escala === 'SEMESTRAL' && (semestre !== 1 && semestre !== 2)) {
      errors.push('contexto: escala=SEMESTRAL requiere semestre=1 o 2.');
    }
  }

  /**
   * Valida coherencia entre UCSP y MERCADO (solo reglas del contrato, sin calcular).
   * @param {object} ucsp
   * @param {object} mercado
   * @param {string[]} warnings
   * @returns {void}
   */
  function validateUcspMercadoCoherencia(ucsp, mercado, warnings) {
    if (!guards.isObject(ucsp) || !guards.isObject(mercado)) return;
    if (guards.isNullish(mercado.matriculas) && !guards.isNullish(ucsp.market_share_matriculas)) {
      warnings.push('MERCADO.matriculas es null pero UCSP.market_share_matriculas tiene valor.');
    }
  }

  /**
   * Valida que el nivel académico (si está presente) use valores nativos permitidos.
   * @param {*} nivel
   * @param {string[]} warnings
   * @returns {void}
   */
  function validateNivelAcademico(nivel, warnings) {
    if (guards.isNullish(nivel)) return;
    if (LEVELS_VALIDOS.indexOf(nivel) === -1) {
      warnings.push('contexto.nivel_academico: valor no nativo ("' + nivel + '"). Solo se permiten: ' + LEVELS_VALIDOS.join(', ') + '.');
    }
  }

  /**
   * Valida el contrato completo H02 v1.0.
   * @param {*} data - objeto JSON recibido (ya parseado).
   * @returns {ValidationResult}
   */
  function validateSchema(data) {
    var errors = [];
    var warnings = [];

    if (!guards.isObject(data)) {
      return { valid: false, errors: ['El payload no es un objeto JSON válido.'], warnings: [] };
    }

    validateSection(data.contexto, SCHEMA.contexto, 'contexto', errors);
    validateSection(data.UCSP, SCHEMA.UCSP, 'UCSP', errors);
    validateSection(data.MERCADO, SCHEMA.MERCADO, 'MERCADO', errors);
    validateSection(data.RANKING, SCHEMA.RANKING, 'RANKING', errors);

    validateTop3Plus(data.TOP3_PLUS_UCSP, errors, warnings);
    validateTrendMatriculas(data.TENDENCIA_MATRICULAS, errors, warnings);
    validateTrendIngresantes(data.TENDENCIA_INGRESANTES, errors, warnings);
    validateMeta(data.meta, errors, warnings);

    validateEscalaSemestre(data.contexto, errors);
    validateNivelAcademico(data.contexto && data.contexto.nivel_academico, warnings);
    validateUcspMercadoCoherencia(data.UCSP, data.MERCADO, warnings);

    return {
      valid: errors.length === 0,
      errors: errors,
      warnings: warnings
    };
  }

  NS.validator = {
    CONTRACT_VERSION: CONTRACT_VERSION,
    LEVELS_VALIDOS: LEVELS_VALIDOS,
    validateSchema: validateSchema
  };
})(window);