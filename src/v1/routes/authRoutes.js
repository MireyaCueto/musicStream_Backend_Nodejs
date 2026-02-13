const { Router } = require("express");
const { check } = require("express-validator");
const { validarCampos } = require("../../middlewares/validarCampos");
const { createNewUser, loginUser, renovarUsuario } = require("../../controllers/musicController");
const { validarJWT } = require("../../helpers/jwt");

const router = Router();


/**
 * @swagger
 * tags:
 *   - name: Autenticación
 *     description: Endpoints para registro, login y renovación de token
 */

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               suscripcion:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario registrado correctamente
 */

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login correcto
 */

/**
 * @swagger
 * /api/v1/auth/renew:
 *   get:
 *     summary: Renovar token JWT
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token renovado correctamente
 */



/**
 * Ruta: POST /api/v1/auth/register
 * Objetivo: Registrar un nuevo usuario
 * - Valida campos obligatorios con express-validator
 * - Si todo es correcto, ejecuta createNewUser (controlador)
 */
router.post(
  "/register",
  [
    check("nombre", "El nombre es obligatorio").not().isEmpty(),
    check("email", "El email es obligatorio").isEmail(),
    check("password", "El password es obligatorio").not().isEmpty(),
    validarCampos, // Middleware que revisa si hubo errores en las validaciones
  ],
  createNewUser
);

/**
 * Ruta: POST /api/v1/auth/login
 * Objetivo: Iniciar sesión
 * - Valida email y password
 * - Si son correctos, loginUser genera un JWT
 */
router.post(
  "/login",
  [
    check("email", "El email es obligatorio").isEmail(),
    check("password", "El password es obligatorio").not().isEmpty(),
    validarCampos,
  ],
  loginUser
);

/**
 * Ruta: GET /api/v1/auth/renew
 * Objetivo: Renovar el token JWT
 * - Requiere un token válido en el header "x-token"
 * - validarJWT verifica el token
 * - renovarUsuario genera uno nuevo
 */
router.get("/renew", validarJWT, renovarUsuario);

module.exports = router;
