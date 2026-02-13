const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");

/**
 * Configuración del cliente de DynamoDB
 * - Usa las credenciales y región definidas en el archivo .env
 * - DynamoDBDocumentClient permite trabajar con objetos JS directamente
 */
const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,       // Clave pública
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY // Clave privada
  }
});

// Cliente que simplifica las operaciones (put, get, scan, update...)
const ddb = DynamoDBDocumentClient.from(client);

module.exports = ddb;
