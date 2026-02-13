require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const { swaggerUi, swaggerSpec } = require("./swagger");

const app = express();

// Middleware para permitir JSON en las peticiones
app.use(express.json());

// Habilitar CORS
app.use(cors());

// ⚠️ Swagger SIEMPRE debe ir antes de las rutas
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec)
);

// Rutas principales del proyecto
app.use("/api/v1/music", require("./v1/routes/routes"));
app.use("/api/v1/auth", require("./v1/routes/authRoutes"));

// Puerto del servidor
const PORT = process.env.PORT || 3002;

// Arrancar servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});
