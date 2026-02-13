const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API de Servicio de Música",
      version: "1.0.0",
      description: "Documentación de la API del backend de Mireya",
    },
    servers: [
      {
        url: "http://localhost:3002",
      },
    ],
    components: { 
      securitySchemes: { 
         bearerAuth: { 
            type: "http", 
            scheme: "bearer", 
            bearerFormat: "JWT", 
         }, 
      }, 
   }, 
   security: [
      { bearerAuth: [] }
   ],
  },
  apis: ["./src/v1/routes/*.js"], // Rutas donde Swagger buscará anotaciones
};

const swaggerSpec = swaggerJsDoc(options);

module.exports = { swaggerUi, swaggerSpec };
