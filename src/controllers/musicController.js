// Importamos el servicio que contiene la lógica de acceso a la base de datos
const musicService = require("../services/musicService");

// Librería para comparar y generar contraseñas encriptadas
const bcrypt = require("bcryptjs");

// Función para generar tokens JWT
const { generateJWT } = require("../helpers/jwt");

const { ScanCommand,GetCommand } = require("@aws-sdk/lib-dynamodb"); 
const ddb = require("../database/dynamoClient");


// -------------------------------------------------------------
// ASSETS POR DEFECTO PARA PLAYLISTS Y CANCIONES
// -------------------------------------------------------------
// Estas URLs se usarán cuando el usuario no envíe imagen o audio
// al crear una playlist o canción.

const DEFAULT_PLAYLIST_IMAGE =
  "https://ddqlflrzivqquzazcjhg.supabase.co/storage/v1/object/sign/images/default_playlist_image.png?token=...";

const DEFAULT_SONG_IMAGE =
  "https://ddqlflrzivqquzazcjhg.supabase.co/storage/v1/object/sign/images/default_song_image.png?token=...";

const DEFAULT_SONG_AUDIO =
  "https://ddqlflrzivqquzazcjhg.supabase.co/storage/v1/object/sign/music/Rick%20Astley%20...mp3?token=...";



// ==============================================================
// ========================   USERS   ===========================
// ==============================================================


/**
 * LOGIN DE USUARIO
 * -----------------
 * 1. Busca el usuario por email
 * 2. Comprueba si existe
 * 3. Compara la contraseña enviada con la encriptada
 * 4. Si es correcta, genera un token JWT
 * 5. Devuelve datos básicos del usuario + token
 */
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Buscar usuario por email
    const user = await musicService.getUserByEmail(email);

    if (!user) {
      return res.status(400).json({
        status: "FAILED",
        data: { error: "El email no existe" }
      });
    }

    // 2. Validar contraseña
    const validPassword = bcrypt.compareSync(password, user.password);

    if (!validPassword) {
      return res.status(400).json({
        status: "FAILED",
        data: { error: "La contraseña no es correcta" }
      });
    }

    // 3. Generar token
    const token = await generateJWT(user.id_usuario, user.nombre);

    // 4. Respuesta en el formato correcto
    return res.json({
      status: "OK",
      data: {
        user: {
          id_usuario: user.id_usuario,
          nombre: user.nombre,
          email: user.email,
          suscripcion: user.suscripcion,
          playlists_ids: user.playlists_ids || []
        },
        token
      }
    });

  } catch (error) {
    console.error("Error en login:", error);
    return res.status(500).json({
      status: "FAILED",
      data: { error: "Error interno del servidor" }
    });
  }
};




/**
 * RENOVAR TOKEN
 * --------------
 * Se ejecuta cuando el usuario ya tiene un token válido y quiere renovarlo.
 * 1. El middleware validarJWT añade uid al request
 * 2. Buscamos el usuario en la BD
 * 3. Generamos un nuevo token
 * 4. Devolvemos datos del usuario + token renovado
 */
const renovarUsuario = async (req, res) => {
  const { uid } = req;

  try {
    // Obtener todos los usuarios y buscar el que coincide con el uid del token
    const users = await musicService.getAllUsers();
    const dbUser = users.find((u) => u.id_usuario === uid);

    if (!dbUser) {
      return res.status(404).json({
        ok: false,
        msg: "Usuario no encontrado",
      });
    }

    // Generar nuevo token
    const token = await generateJWT(uid, dbUser.nombre);

    return res.json({
      ok: true,
      uid,
      name: dbUser.nombre,
      email: dbUser.email,
      token,
    });

  } catch (error) {
    return res.status(500).json({
      ok: false,
      msg: "Error, consulte con el admin",
    });
  }
};



/**
 * OBTENER TODOS LOS USUARIOS (con filtros y paginación)
 * ------------------------------------------------------
 * Permite filtrar por:
 * - suscripción (premium, free, etc.)
 * - isAdmin (true/false)
 * 
 * También permite:
 * - limitar resultados (limit)
 * - paginar resultados (page)
 */
const getAllUsers = async (req, res) => {
  try {
    const { suscripcion, isAdmin, limit, page } = req.query;

    // Obtener todos los usuarios de la BD
    let users = await musicService.getAllUsers();

    // Filtro por tipo de suscripción
    if (suscripcion) {
      users = users.filter(u => u.suscripcion === suscripcion);
    }

    // Filtro por si es admin o no
    if (isAdmin !== undefined) {
      users = users.filter(u => String(u.isAdmin) === String(isAdmin));
    }

    // Paginación
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || users.length;
    const start = (pageNum - 1) * limitNum;
    const end = start + limitNum;

    const paginated = users.slice(start, end);

    res.send({ status: "OK", total: users.length, data: paginated });

  } catch (error) {
    res.status(500).send({ status: "FAILED", data: { error: error.message } });
  }
};



/**
 * OBTENER UN USUARIO POR ID
 * --------------------------
 * Devuelve un usuario concreto si existe.
 */
const getOneUser = async (req, res) => {
  const { userId } = req.params;

  // Validación básica
  if (!userId) {
    return res.status(400).send({
      status: "FAILED",
      data: { error: "El parámetro ':userId' no puede estar vacío" }
    });
  }

  try {
    const user = await musicService.getOneUser(userId);

    if (!user) {
      return res.status(404).send({
        status: "FAILED",
        data: { error: `No se encontró el usuario con id ${userId}` }
      });
    }

    res.send({ status: "OK", data: user });

  } catch (error) {
    res.status(500).send({
      status: "FAILED",
      data: { error: error.message }
    });
  }
};



/**
 * CREAR NUEVO USUARIO (versión técnica, no registro)
 * ---------------------------------------------------
 * Esta ruta crea un usuario desde el panel o desde Postman.
 * - Encripta la contraseña
 * - Asigna valores por defecto
 * - Guarda en DynamoDB
 */
const createNewUser = async (req, res) => {
  const { body } = req;

  // 1. Validación de campos obligatorios mínimos
  if (!body.nombre || !body.email || !body.password) {
    return res.status(400).json({
      status: "FAILED",
      data: { error: "Faltan parámetros obligatorios: nombre, email o password" }
    });
  }

  // 2. No permitir id_usuario manual
  if (body.id_usuario) {
    return res.status(400).json({
      status: "FAILED",
      data: { error: "No se puede especificar 'id_usuario' manualmente" }
    });
  }

  try {
    // 3. Comprobar email duplicado
    const existingUser = await musicService.getUserByEmail(body.email);

    if (existingUser) {
      return res.status(409).json({
        status: "FAILED",
        data: { error: "Ya existe un usuario con ese email" }
      });
    }

    // 4. Encriptar contraseña
    const salt = bcrypt.genSaltSync();
    const hashedPassword = bcrypt.hashSync(body.password, salt);

    // 5. Construir usuario con valores por defecto
    const newUser = {
      nombre: body.nombre,
      email: body.email,
      password: hashedPassword,
      suscripcion: body.suscripcion || "free",
      isAdmin: typeof body.isAdmin === "boolean" ? body.isAdmin : false,
      playlists_ids: Array.isArray(body.playlists_ids) ? body.playlists_ids : []
    };

    // 6. Crear usuario en DB
    const createdUser = await musicService.createNewUser(newUser);

    // 7. Generar token
    const token = await generateJWT(createdUser.id_usuario, createdUser.nombre);

    // 8. Respuesta estándar
    return res.status(201).json({
      status: "OK",
      data: {
        user: {
          id_usuario: createdUser.id_usuario,
          nombre: createdUser.nombre,
          email: createdUser.email,
          suscripcion: createdUser.suscripcion,
          playlists_ids: createdUser.playlists_ids,
          isAdmin: createdUser.isAdmin
        },
        token
      }
    });

  } catch (error) {
    console.error("Error en createNewUser:", error);
    return res.status(500).json({
      status: "FAILED",
      data: { error: "Error interno del servidor" }
    });
  }
};


/**
 * ACTUALIZAR USUARIO
 * -------------------
 * Permite modificar cualquier campo del usuario.
 */
const updateOneUser = async (req, res) => {
  const { userId } = req.params;
  const changes = req.body;

  if (!userId) {
    return res.status(400).send({
      status: "FAILED",
      data: { error: "El parámetro ':userId' no puede estar vacío" }
    });
  }

  try {
    // 1. Comprobar si el usuario existe
    const user = await musicService.getOneUser(userId);

    if (!user) {
      return res.status(404).send({
        status: "FAILED",
        data: { error: "El usuario no existe" }
      });
    }

    // 2. Validar email duplicado si se quiere cambiar
    if (changes.email) {
      const existingUser = await musicService.getUserByEmail(changes.email);

      if (existingUser && existingUser.id_usuario !== userId) {
        return res.status(409).send({
          status: "FAILED",
          data: { error: "Ya existe un usuario con ese email" }
        });
      }
    }

    // 3. Actualizar usuario
    const updatedUser = await musicService.updateOneUser(userId, changes);

    res.send({ status: "OK", data: updatedUser });

  } catch (error) {
    res.status(500).send({
      status: "FAILED",
      data: { error: error.message }
    });
  }
};




/**
 * ELIMINAR USUARIO
 * -------------------
 * Permite eliminar cualquier usuario.
 */
const deleteOneUser = async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).send({
      status: "FAILED",
      data: { error: "El parámetro ':userId' no puede estar vacío" }
    });
  }

  try {
    // 1. Comprobar si el usuario existe
    const user = await musicService.getOneUser(userId);

    if (!user) {
      return res.status(404).send({
        status: "FAILED",
        data: { error: "El usuario no existe" }
      });
    }

    // 2. Eliminar usuario
    await musicService.deleteOneUser(userId);

    res.send({ status: "OK", msg: "Usuario eliminado correctamente" });

  } catch (error) {
    res.status(500).send({
      status: "FAILED",
      data: { error: error.message }
    });
  }
};




// ==============================================================
// ======================   PLAYLISTS   =========================
// ==============================================================

/**
 * OBTENER TODAS LAS PLAYLISTS (con filtros y paginación)
 * -------------------------------------------------------
 * Filtros disponibles:
 * - nombre: búsqueda parcial por nombre de playlist
 * - year: filtrar playlists creadas en un año concreto
 * - limit: limitar el número de resultados devueltos
 * - page: paginar los resultados
 * 
 */
const getAllPlaylists = async (req, res) => {
  try {
    // Extraemos los posibles filtros desde la query
    const { nombre, year, limit, page } = req.query;

    // Obtenemos todas las playlists desde la base de datos
    let playlists = await musicService.getAllPlaylists();

    // FILTRO POR NOMBRE (coincidencia parcial, case-insensitive)
    if (nombre) {
      playlists = playlists.filter(p =>
        p.nombre.toLowerCase().includes(nombre.toLowerCase())
      );
    }

    // FILTRO POR AÑO DE CREACIÓN
    if (year) {
      playlists = playlists.filter(p => {
        const playlistYear = new Date(p.fecha_creacion).getFullYear();
        return playlistYear === Number(year);
      });
    }

    // PAGINACIÓN
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || playlists.length;

    const start = (pageNum - 1) * limitNum;
    const end = start + limitNum;

    const paginated = playlists.slice(start, end);

    // Respuesta final
    res.send({ status: "OK", total: playlists.length, data: paginated });

  } catch (error) {
    // Error inesperado
    res.status(500).send({ status: "FAILED", data: { error: error.message } });
  }
};


const getPlaylistsByUser = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Obtener usuario (JSON normal)
    const userResult = await ddb.send(new GetCommand({
      TableName: "usuarios",
      Key: { id_usuario: id }
    }));

    const user = userResult.Item;

    if (!user || !user.playlists_ids || user.playlists_ids.length === 0) {
      return res.json({ status: "OK", total: 0, data: [] });
    }

    // 2. Obtener playlists del usuario
    const result = await ddb.send(new ScanCommand({
      TableName: "playlists",
      FilterExpression: "contains(:ids, id_playlist)",
      ExpressionAttributeValues: {
        ":ids": user.playlists_ids
      }
    }));

    // 3. YA VIENE TODO EN JSON, no unmarshall
    const playlists = result.Items;

    return res.json({
      status: "OK",
      total: playlists.length,
      data: playlists
    });

  } catch (error) {
    console.error("Error en getPlaylistsByUser:", error);
    return res.status(500).json({
      status: "ERROR",
      message: "No se pudieron obtener las playlists del usuario"
    });
  }
};



/**
 * OBTENER UNA PLAYLIST POR ID
 * ----------------------------
 * Devuelve una playlist concreta si existe.
 */
const getOnePlaylist = async (req, res) => {
  const { playlistId } = req.params;

  // Validación básica
  if (!playlistId) {
    return res.status(400).send({
      status: "FAILED",
      data: { error: "El parámetro ':playlistId' no puede estar vacío" }
    });
  }

  try {
    const playlist = await musicService.getOnePlaylist(playlistId);

    if (!playlist) {
      return res.status(404).send({
        status: "FAILED",
        data: { error: `No se encontró la playlist con id ${playlistId}` }
      });
    }

    res.send({ status: "OK", data: playlist });

  } catch (error) {
    res.status(500).send({
      status: "FAILED",
      data: { error: error.message }
    });
  }
};



/**
 * CREAR NUEVA PLAYLIST
 * ---------------------
 * - Valida campos obligatorios
 * - Asigna imagen por defecto si no se envía
 * - Guarda la playlist en DynamoDB
 */
const createNewPlaylist = async (req, res) => {
  const { body } = req;

  if (!body.nombre || !body.descripcion || !body.id_usuario) {
    return res.status(400).send({
      status: "FAILED",
      data: { error: "Faltan parámetros obligatorios: nombre, descripción e id_usuario" }
    });
  }

  try {
    // 1. Validar que el usuario existe
    const user = await musicService.getOneUser(body.id_usuario);
    if (!user) {
      return res.status(404).send({
        status: "FAILED",
        data: { error: "El usuario no existe" }
      });
    }

    // 2. Validar que no exista playlist con el mismo nombre para ese usuario
    const allPlaylists = await musicService.getAllPlaylists();
    const duplicate = allPlaylists.find(
      p => p.nombre === body.nombre && p.id_usuario === body.id_usuario
    );

    if (duplicate) {
      return res.status(409).send({
        status: "FAILED",
        data: { error: "Ya existe una playlist con ese nombre para este usuario" }
      });
    }

    // 3. Crear playlist
    const newPlaylist = {
      ...body,
      imagen_portada: body.imagen_portada || DEFAULT_PLAYLIST_IMAGE,
      canciones_ids: body.canciones_ids || []
    };

    const createdPlaylist = await musicService.createNewPlaylist(newPlaylist);

    res.status(201).send({ status: "OK", data: createdPlaylist });

  } catch (error) {
    res.status(500).send({
      status: "FAILED",
      data: { error: error.message }
    });
  }
};



/**
 * ACTUALIZAR PLAYLIST
 * --------------------
 * Permite modificar cualquier campo de una playlist.
 */
const updateOnePlaylist = async (req, res) => {
  const { playlistsId } = req.params;
  const changes = req.body;

  if (!playlistsId) {
    return res.status(400).send({
      status: "FAILED",
      data: { error: "El parámetro ':playlistsId' no puede estar vacío" }
    });
  }

  try {
    const playlist = await musicService.getOnePlaylist(playlistsId);

    if (!playlist) {
      return res.status(404).send({
        status: "FAILED",
        data: { error: "La playlist no existe" }
      });
    }

    // Validar nombre duplicado
    if (changes.nombre) {
      const all = await musicService.getAllPlaylists();
      const duplicate = all.find(
        p => p.nombre === changes.nombre &&
             p.id_usuario === playlist.id_usuario &&
             p.id_playlist !== playlistsId
      );

      if (duplicate) {
        return res.status(409).send({
          status: "FAILED",
          data: { error: "Ya existe otra playlist con ese nombre" }
        });
      }
    }

    const updatedPlaylist = await musicService.updateOnePlaylist(playlistsId, changes);
    res.send({ status: "OK", data: updatedPlaylist });

  } catch (error) {
    res.status(500).send({
      status: "FAILED",
      data: { error: error.message }
    });
  }
};



/**
 * ELIMINAR PLAYLIST
 * --------------------
 * Permite eliminar cualquier playlist.
 */
const deleteOnePlaylist = async (req, res) => {
  const { playlistId } = req.params;

  if (!playlistId) {
    return res.status(400).send({
      status: "FAILED",
      data: { error: "El parámetro ':playlistId' no puede estar vacío" }
    });
  }

  try {
    const playlist = await musicService.getOnePlaylist(playlistId);

    if (!playlist) {
      return res.status(404).send({
        status: "FAILED",
        data: { error: "La playlist no existe" }
      });
    }

    await musicService.deleteOnePlaylist(playlistId);

    res.send({ status: "OK", msg: "Playlist eliminada correctamente" });

  } catch (error) {
    res.status(500).send({
      status: "FAILED",
      data: { error: error.message }
    });
  }
};




// ==============================================================
// ========================   SONGS   ===========================
// ==============================================================

/**
 * OBTENER TODAS LAS CANCIONES (con filtros y paginación)
 * -------------------------------------------------------
 * Filtros disponibles:
 * - titulo (coincidencia parcial)
 * - artista
 * - album
 * - genero
 * - duracionMin / duracionMax
 * 
 * También permite:
 * - limit (número máximo de resultados)
 * - page (paginación)
 */
const getAllSongs = async (req, res) => {
  try {
    const { titulo, artista, album, genero, duracionMin, duracionMax, limit, page } = req.query;

    let songs = await musicService.getAllSongs();

    // Filtros por texto parcial
    if (titulo) {
      songs = songs.filter(s =>
        s.titulo.toLowerCase().includes(titulo.toLowerCase())
      );
    }

    if (artista) {
      songs = songs.filter(s =>
        s.artista.toLowerCase().includes(artista.toLowerCase())
      );
    }

    if (album) {
      songs = songs.filter(s =>
        s.album.toLowerCase().includes(album.toLowerCase())
      );
    }

    if (genero) {
      songs = songs.filter(s =>
        s.genero.toLowerCase().includes(genero.toLowerCase())
      );
    }

    // Filtros numéricos
    if (duracionMin) {
      songs = songs.filter(s => s.duracion_segundos >= Number(duracionMin));
    }

    if (duracionMax) {
      songs = songs.filter(s => s.duracion_segundos <= Number(duracionMax));
    }

    // Paginación
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || songs.length;
    const start = (pageNum - 1) * limitNum;
    const end = start + limitNum;

    const paginated = songs.slice(start, end);

    res.send({ status: "OK", total: songs.length, data: paginated });

  } catch (error) {
    res.status(500).send({ status: "FAILED", data: { error: error.message } });
  }
};



/**
 * OBTENER UNA CANCIÓN POR ID
 * ---------------------------
 * Devuelve una canción concreta si existe.
 */
const getOneSong = async (req, res) => {
  const { songId } = req.params;

  if (!songId) {
    return res.status(400).send({
      status: "FAILED",
      data: { error: "El parámetro ':songId' no puede estar vacío" }
    });
  }

  try {
    const song = await musicService.getOneSong(songId);

    if (!song) {
      return res.status(404).send({
        status: "FAILED",
        data: { error: `No se encontró la canción con id ${songId}` }
      });
    }

    res.send({ status: "OK", data: song });

  } catch (error) {
    res.status(500).send({
      status: "FAILED",
      data: { error: error.message }
    });
  }
};



/**
 * CREAR NUEVA CANCIÓN
 * --------------------
 * - Valida campos obligatorios
 * - Asigna imagen y audio por defecto si no se envían
 * - Guarda la canción en DynamoDB
 */
const createNewSong = async (req, res) => {
  const { body } = req;

  if (!body.titulo || !body.artista || !body.album || !body.duracion_segundos || !body.genero) {
    return res.status(400).send({
      status: "FAILED",
      data: { error: "Faltan parámetros obligatorios" }
    });
  }

  try {
    // Validar duplicado
    const allSongs = await musicService.getAllSongs();
    const duplicate = allSongs.find(
      s => s.titulo === body.titulo && s.artista === body.artista
    );

    if (duplicate) {
      return res.status(409).send({
        status: "FAILED",
        data: { error: "Ya existe una canción con ese título y artista" }
      });
    }

    const newSong = {
      ...body,
      imagen_cancion: body.imagen_cancion || DEFAULT_SONG_IMAGE,
      url_audio: body.url_audio || DEFAULT_SONG_AUDIO
    };

    const createdSong = await musicService.createNewSong(newSong);

    res.status(201).send({ status: "OK", data: createdSong });

  } catch (error) {
    res.status(500).send({
      status: "FAILED",
      data: { error: error.message }
    });
  }
};




/**
 * ACTUALIZAR CANCIÓN
 * -------------------
 * Permite modificar cualquier campo de una canción.
 */
const updateOneSong = async (req, res) => {
  const { songId } = req.params;
  const changes = req.body;

  if (!songId) {
    return res.status(400).send({
      status: "FAILED",
      data: { error: "El parámetro ':songId' no puede estar vacío" }
    });
  }

  try {
    const song = await musicService.getOneSong(songId);

    if (!song) {
      return res.status(404).send({
        status: "FAILED",
        data: { error: "La canción no existe" }
      });
    }

    // Validar duplicado si cambia título o artista
    if (changes.titulo || changes.artista) {
      const all = await musicService.getAllSongs();
      const duplicate = all.find(
        s =>
          s.id_cancion !== songId &&
          (changes.titulo || song.titulo) === s.titulo &&
          (changes.artista || song.artista) === s.artista
      );

      if (duplicate) {
        return res.status(409).send({
          status: "FAILED",
          data: { error: "Ya existe otra canción con ese título y artista" }
        });
      }
    }

    const updatedSong = await musicService.updateOneSong(songId, changes);
    res.send({ status: "OK", data: updatedSong });

  } catch (error) {
    res.status(500).send({
      status: "FAILED",
      data: { error: error.message }
    });
  }
};



/**
 * ELIMINAR CANCIÓN
 * -------------------
 * Permite eliminar cualquier canción.
 */
const deleteOneSong = async (req, res) => {
  const { songId } = req.params;

  if (!songId) {
    return res.status(400).send({
      status: "FAILED",
      data: { error: "El parámetro ':songId' no puede estar vacío" }
    });
  }

  try {
    const song = await musicService.getOneSong(songId);

    if (!song) {
      return res.status(404).send({
        status: "FAILED",
        data: { error: "La canción no existe" }
      });
    }

    await musicService.deleteOneSong(songId);

    res.send({ status: "OK", msg: "Canción eliminada correctamente" });

  } catch (error) {
    res.status(500).send({
      status: "FAILED",
      data: { error: error.message }
    });
  }
};



// =============================================================
// ========================   EXPORTS   =========================
// =============================================================

module.exports = {
  // Users
  getAllUsers,
  getOneUser,
  createNewUser,
  updateOneUser,
  loginUser,
  renovarUsuario,
  deleteOneUser,

  // Playlists
  getAllPlaylists,
  getPlaylistsByUser,
  getOnePlaylist,
  createNewPlaylist,
  updateOnePlaylist,
  deleteOnePlaylist,

  // Songs
  getAllSongs,
  getOneSong,
  createNewSong,
  updateOneSong,
  deleteOneSong
};
