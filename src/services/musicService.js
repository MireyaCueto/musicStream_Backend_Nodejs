const db = require("../database/music");

/**
 * CAPA DE SERVICIO
 * ----------------
 * Este archivo actúa como intermediario entre los controladores y la base de datos.
 * Aquí NO hay lógica de negocio, solo llamadas limpias a las funciones del módulo "music.js".
 * 
 * Ventajas:
 * - Mantiene los controladores más limpios
 * - Permite cambiar la base de datos sin tocar los controladores
 * - Facilita testear la lógica de negocio
 */

// ---------------- USERS ----------------

/**
 * Busca un usuario por email (para login)
 */
const getUserByEmail = async (email) => await db.getUserByEmail(email);

/**
 * Obtiene todos los usuarios de la tabla "usuarios"
 */
const getAllUsers = async () => {
  return await db.getAllUsers();
};

/**
 * Obtiene un usuario por ID
 */
const getOneUser = async (id) => {
  return await db.getOneUser(id);
};

/**
 * Crea un nuevo usuario en DynamoDB
 */
const createNewUser = async (data) => {
  return await db.createUser(data);
};

/**
 * Actualiza un usuario existente
 */
const updateOneUser = async (id, changes) => {
  return await db.updateUser(id, changes);
};

/**
 * Elimina un usuario existente
 */
const deleteOneUser = async (id) => { 
  return await db.deleteUser(id); 
};

// ---------------- PLAYLISTS ----------------

/**
 * Obtiene todas las playlists
 */
const getAllPlaylists = async () => {
  return await db.getAllPlaylists();
};

/**
 * Obtiene una playlist por ID
 */
const getOnePlaylist = async (id) => {
  return await db.getOnePlaylist(id);
};

/**
 * Crea una nueva playlist
 */
const createNewPlaylist = async (data) => {
  return await db.createPlaylist(data);
};

/**
 * Actualiza una playlist existente
 */
const updateOnePlaylist = async (id, changes) => {
  return await db.updatePlaylist(id, changes);
};

/**
 * Elimina una playlist existente
 */
const deleteOnePlaylist = async (id) => { 
  return await db.deletePlaylist(id); 
};

// ---------------- SONGS ----------------

/**
 * Obtiene todas las canciones
 */
const getAllSongs = async () => {
  return await db.getAllSongs();
};

/**
 * Obtiene una canción por ID
 */
const getOneSong = async (id) => {
  return await db.getOneSong(id);
};

/**
 * Crea una nueva canción
 */
const createNewSong = async (data) => {
  return await db.createSong(data);
};

/**
 * Actualiza una canción existente
 */
const updateOneSong = async (id, changes) => {
  return await db.updateSong(id, changes);
};

/**
 * Elimina una canción existente
 */
const deleteOneSong = async (id) => { 
  return await db.deleteSong(id); 
};

// ---------------- EXPORT ----------------

module.exports = {
  getAllUsers,
  getOneUser,
  createNewUser,
  updateOneUser,
  getUserByEmail,
  deleteOneUser,

  getAllPlaylists,
  getOnePlaylist,
  createNewPlaylist,
  updateOnePlaylist,
  deleteOnePlaylist,

  getAllSongs,
  getOneSong,
  createNewSong,
  updateOneSong,
  deleteOneSong
};
