require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { swaggerUi, swaggerSpec } = require("./swagger");

const app = express();

// Middleware para permitir JSON en las peticiones
app.use(express.json());

// Habilitar CORS para permitir peticiones desde el frontend
app.use(cors());

// Rutas principales del proyecto
app.use("/api/v1/music", require("./v1/routes/routes")); // Rutas de música (usuarios, playlists, canciones)
app.use("/api/v1/auth", require("./v1/routes/authRoutes")); // Rutas de autenticación

// Documentación Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Puerto del servidor
const PORT = process.env.PORT || 3002;

// Arrancar servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});
