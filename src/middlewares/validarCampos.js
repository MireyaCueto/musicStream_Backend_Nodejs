const { response } = require("express");
const { validationResult } = require("express-validator");

/**
 * Middleware: validarCampos
 * - Revisa si express-validator detectó errores en los campos enviados
 * - Si hay errores, devuelve un 400 con el detalle
 * - Si no hay errores, continúa al siguiente middleware/controlador
 */
const validarCampos = (req, res = response, next) => {
  const errores = validationResult(req);

  // Si hay errores, se devuelven al cliente
  if (!errores.isEmpty()) {
    return res.status(400).json({
      ok: false,
      msg: errores.mapped(),
    });
  }

  // Si todo está bien, continúa
  next();
};

module.exports = {
  validarCampos,
};
