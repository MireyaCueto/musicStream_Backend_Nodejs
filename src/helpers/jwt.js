const { response } = require("express");
const jwt = require("jsonwebtoken");

/**
 * generateJWT(uid, name)
 * - Genera un token JWT con el id y nombre del usuario
 * - Expira en 24 horas
 * - Devuelve una Promesa que resuelve el token
 */
const generateJWT = (uid, name) => {
  const payload = { uid, name };

  return new Promise((resolve, reject) => {
    jwt.sign(
      payload,
      process.env.SEMILLA, // Clave secreta del .env
      { expiresIn: "24h" },
      (error, token) => {
        if (error) {
          console.log(error);
          reject(error);
        } else {
          resolve(token);
        }
      }
    );
  });
};

/**
 * validarJWT
 * - Middleware que verifica si el token enviado en "x-token" es válido
 * - Si es válido, extrae uid y name y los añade al request
 * - Si no, devuelve un error 401
 */
const validarJWT = (req, res = response, next) => {
  const token = req.header("x-token");

  // Si no se envió token
  if (!token) {
    return res.status(401).json({
      ok: false,
      msg: "Error en el token",
    });
  }

  try {
    // Verifica el token y extrae datos
    const { uid, name } = jwt.verify(token, process.env.SEMILLA);

    // Se añaden al request para usarlos en controladores
    req.uid = uid;
    req.name = name;
  } catch (error) {
    return res.status(401).json({
      ok: false,
      msg: "Token no válido",
    });
  }

  next();
};

module.exports = {
  generateJWT,
  validarJWT,
};
