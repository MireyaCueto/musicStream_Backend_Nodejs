const { PutCommand, GetCommand, ScanCommand, UpdateCommand } = require("@aws-sdk/lib-dynamodb");
const ddb = require("./dynamoClient");
const { v4: uuid } = require("uuid");
const { DeleteCommand } = require("@aws-sdk/lib-dynamodb");


/**
 * Este archivo contiene TODA la lógica de acceso a DynamoDB.
 * 
 * Aquí se realizan:
 * - Lecturas (Scan, Get)
 * - Escrituras (Put)
 * - Actualizaciones (Update)
 * 
 * No hay lógica de negocio, solo interacción directa con la base de datos.
 */

// ---------------------------------------------------------
// Helper para generar dinámicamente un UpdateExpression
// ---------------------------------------------------------

/**
 * buildUpdateExpression(changes)
 * Convierte un objeto JS en una expresión válida para DynamoDB UpdateCommand.
 * 
 * Ejemplo:
 *  { nombre: "Mireya", suscripcion: "premium" }
 * 
 * Se convierte en:
 *  UpdateExpression: "SET nombre = :nombre, suscripcion = :suscripcion"
 *  ExpressionAttributeValues: { ":nombre": "Mireya", ":suscripcion": "premium" }
 */
function buildUpdateExpression(changes) {
  const updateExpressions = [];
  const expressionValues = {};

  for (const key of Object.keys(changes)) {
    updateExpressions.push(`${key} = :${key}`);
    expressionValues[`:${key}`] = changes[key];
  }

  return {
    UpdateExpression: `SET ${updateExpressions.join(", ")}`,
    ExpressionAttributeValues: expressionValues
  };
}

// ---------------------------------------------------------
// USERS
// ---------------------------------------------------------

/**
 * Busca un usuario por email usando un Scan + FilterExpression
 * (DynamoDB no permite buscar por atributos sin índice secundario)
 */
async function getUserByEmail(email) {
  const result = await ddb.send(new ScanCommand({
    TableName: "usuarios",
    FilterExpression: "email = :email",
    ExpressionAttributeValues: { ":email": email }
  }));

  return result.Items?.[0] || null;
}

/**
 * Obtiene todos los usuarios
 */
async function getAllUsers() {
  const result = await ddb.send(new ScanCommand({ TableName: "usuarios" }));
  return result.Items || [];
}

/**
 * Obtiene un usuario por ID
 */
async function getOneUser(id) {
  const result = await ddb.send(new GetCommand({
    TableName: "usuarios",
    Key: { id_usuario: id }
  }));
  return result.Item || null;
}

/**
 * Crea un usuario nuevo con un UUID generado automáticamente
 */
async function createUser(userData) {
  const id = uuid();
  const item = { id_usuario: id, ...userData };

  await ddb.send(new PutCommand({
    TableName: "usuarios",
    Item: item
  }));

  return item;
}

/**
 * Actualiza un usuario existente usando UpdateExpression dinámico
 */
async function updateUser(id, changes) {
  const { UpdateExpression, ExpressionAttributeValues } = buildUpdateExpression(changes);

  const result = await ddb.send(new UpdateCommand({
    TableName: "usuarios",
    Key: { id_usuario: id },
    UpdateExpression,
    ExpressionAttributeValues,
    ReturnValues: "ALL_NEW"
  }));

  return result.Attributes;
}

/**
 * Elimina un usuario existente
 */
async function deleteUser(id) {
  await ddb.send(new DeleteCommand({
    TableName: "usuarios",
    Key: { id_usuario: id }
  }));
  return true;
}



// ---------------------------------------------------------
// PLAYLISTS
// ---------------------------------------------------------

async function getAllPlaylists() {
  const result = await ddb.send(new ScanCommand({ TableName: "playlists" }));
  return result.Items || [];
}

async function getOnePlaylist(id) {
  const result = await ddb.send(new GetCommand({
    TableName: "playlists",
    Key: { id_playlist: id }
  }));
  return result.Item || null;
}

async function createPlaylist(data) {
  const id = uuid();
  const item = { id_playlist: id, ...data };

  await ddb.send(new PutCommand({
    TableName: "playlists",
    Item: item
  }));

  return item;
}

async function updatePlaylist(id, changes) {
  const { UpdateExpression, ExpressionAttributeValues } = buildUpdateExpression(changes);

  const result = await ddb.send(new UpdateCommand({
    TableName: "playlists",
    Key: { id_playlist: id },
    UpdateExpression,
    ExpressionAttributeValues,
    ReturnValues: "ALL_NEW"
  }));

  return result.Attributes;
}

async function deletePlaylist(id) {
  await ddb.send(new DeleteCommand({
    TableName: "playlists",
    Key: { id_playlist: id }
  }));
  return true;
}


// ---------------------------------------------------------
// SONGS
// ---------------------------------------------------------

async function getAllSongs() {
  const result = await ddb.send(new ScanCommand({ TableName: "canciones" }));
  return result.Items || [];
}

async function getOneSong(id) {
  const result = await ddb.send(new GetCommand({
    TableName: "canciones",
    Key: { id_cancion: id }
  }));
  return result.Item || null;
}

async function createSong(data) {
  const id = uuid();
  const item = { id_cancion: id, ...data };

  await ddb.send(new PutCommand({
    TableName: "canciones",
    Item: item
  }));

  return item;
}

async function updateSong(id, changes) {
  const { UpdateExpression, ExpressionAttributeValues } = buildUpdateExpression(changes);

  const result = await ddb.send(new UpdateCommand({
    TableName: "canciones",
    Key: { id_cancion: id },
    UpdateExpression,
    ExpressionAttributeValues,
    ReturnValues: "ALL_NEW"
  }));

  return result.Attributes;
}

async function deleteSong(id) {
  await ddb.send(new DeleteCommand({
    TableName: "canciones",
    Key: { id_cancion: id }
  }));
  return true;
}



// ---------------------------------------------------------
// EXPORT
// ---------------------------------------------------------

module.exports = {
  // Users
  getAllUsers,
  getOneUser,
  createUser,
  updateUser,
  getUserByEmail,
  deleteUser,

  // Playlists
  getAllPlaylists,
  getOnePlaylist,
  createPlaylist,
  updatePlaylist,
  deletePlaylist,

  // Songs
  getAllSongs,
  getOneSong,
  createSong,
  updateSong,
  deleteSong
};
