const express = require("express");
const router = express.Router();
const musicController = require("../../controllers/musicController");
const { validarJWT } = require("../../helpers/jwt");

// cache para acelerar peticiones GET
const apicache = require("apicache");
const cache = apicache.middleware;


/* ---------------- USERS ---------------- */

/**
 * @swagger
 * tags:
 *   - name: Usuarios
 *     description: Endpoints relacionados con usuarios
 *   - name: Playlists
 *     description: Endpoints relacionados con playlists
 *   - name: Canciones
 *     description: Endpoints relacionados con canciones
 */

/**
 * @swagger
 * /api/v1/music/users:
 *   get:
 *     summary: Obtener todos los usuarios
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: suscripcion
 *         schema:
 *           type: string
 *         description: Filtrar por tipo de suscripción
 *       - in: query
 *         name: isAdmin
 *         schema:
 *           type: boolean
 *         description: Filtrar por administradores
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Limitar número de resultados
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Página de resultados
 *     responses:
 *       200:
 *         description: Lista de usuarios
 */

/**
 * @swagger
 * /api/v1/music/users/{userId}:
 *   get:
 *     summary: Obtener un usuario por ID
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Usuario encontrado
 *       404:
 *         description: Usuario no encontrado
 */

/**
 * @swagger
 * /api/v1/music/users:
 *   post:
 *     summary: Crear un nuevo usuario
 *     tags: [Usuarios]
 *     responses:
 *       201:
 *         description: Usuario creado correctamente
 */

/**
 * @swagger
 * /api/v1/music/users/{userId}:
 *   patch:
 *     summary: Actualizar un usuario
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Usuario actualizado
 */

/**
 * @swagger
 * /api/v1/music/users/{userId}:
 *   delete:
 *     summary: Eliminar un usuario
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Usuario eliminado correctamente
 */

/* ---------------- PLAYLISTS ---------------- */

/**
 * @swagger
 * /api/v1/music/playlists:
 *   get:
 *     summary: Obtener todas las playlists
 *     tags: [Playlists]
 *     parameters:
 *       - in: query
 *         name: nombre
 *         schema:
 *           type: string
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de playlists
 */

/**
 * @swagger
 * /api/v1/music/playlists/{playlistId}:
 *   get:
 *     summary: Obtener una playlist por ID
 *     tags: [Playlists]
 *     parameters:
 *       - in: path
 *         name: playlistId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Playlist encontrada
 */

/**
 * @swagger
 * /api/v1/music/playlists:
 *   post:
 *     summary: Crear una playlist
 *     tags: [Playlists]
 *     responses:
 *       201:
 *         description: Playlist creada correctamente
 */

/**
 * @swagger
 * /api/v1/music/playlists/{playlistId}:
 *   patch:
 *     summary: Actualizar una playlist
 *     tags: [Playlists]
 *     parameters:
 *       - in: path
 *         name: playlistId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Playlist actualizada
 */

/**
 * @swagger
 * /api/v1/music/playlists/{playlistId}:
 *   delete:
 *     summary: Eliminar una playlist
 *     tags: [Playlists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: playlistId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Playlist eliminada correctamente
 */

/* ---------------- SONGS ---------------- */

/**
 * @swagger
 * /api/v1/music/songs:
 *   get:
 *     summary: Obtener todas las canciones
 *     tags: [Canciones]
 *     parameters:
 *       - in: query
 *         name: titulo
 *         schema:
 *           type: string
 *       - in: query
 *         name: artista
 *         schema:
 *           type: string
 *       - in: query
 *         name: album
 *         schema:
 *           type: string
 *       - in: query
 *         name: genero
 *         schema:
 *           type: string
 *       - in: query
 *         name: duracionMin
 *         schema:
 *           type: integer
 *       - in: query
 *         name: duracionMax
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de canciones
 */

/**
 * @swagger
 * /api/v1/music/songs/{songId}:
 *   get:
 *     summary: Obtener una canción por ID
 *     tags: [Canciones]
 *     parameters:
 *       - in: path
 *         name: songId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Canción encontrada
 */

/**
 * @swagger
 * /api/v1/music/songs:
 *   post:
 *     summary: Crear una canción
 *     tags: [Canciones]
 *     responses:
 *       201:
 *         description: Canción creada correctamente
 */

/**
 * @swagger
 * /api/v1/music/songs/{songId}:
 *   patch:
 *     summary: Actualizar una canción
 *     tags: [Canciones]
 *     parameters:
 *       - in: path
 *         name: songId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Canción actualizada
 */

/**
 * @swagger
 * /api/v1/music/songs/{songId}:
 *   delete:
 *     summary: Eliminar una canción
 *     tags: [Canciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: songId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Canción eliminada correctamente
 */



// --- Rutas de usuarios ---
router.get("/users", validarJWT, musicController.getAllUsers);
router.get("/users/:userId", musicController.getOneUser);
router.post("/users", musicController.createNewUser);
router.patch("/users/:userId", musicController.updateOneUser);
router.delete("/users/:userId", validarJWT, musicController.deleteOneUser);

// --- Rutas de playlists ---
router.get("/playlists", musicController.getAllPlaylists);
router.get("/playlists/user/:id", musicController.getPlaylistsByUser);
router.get("/playlists/:playlistId", musicController.getOnePlaylist);
router.post("/playlists", musicController.createNewPlaylist);
router.patch("/playlists/:playlistsId", musicController.updateOnePlaylist);
router.delete("/playlists/:playlistId", validarJWT, musicController.deleteOnePlaylist);

// --- Rutas de canciones ---
router.get("/songs", musicController.getAllSongs);
router.get("/songs/:songId", musicController.getOneSong);
router.post("/songs", musicController.createNewSong);
router.patch("/songs/:songId", musicController.updateOneSong);
router.delete("/songs/:songId", validarJWT, musicController.deleteOneSong);

module.exports = router;