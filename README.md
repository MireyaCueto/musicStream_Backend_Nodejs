# 🎵 MusicStream Backend – Node.js + Express + DynamoDB

<div align="center">

![NodeJS](https://img.shields.io/badge/Node.js-20232A?style=for-the-badge&logo=node.js&logoColor=61DAFB)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![AWS DynamoDB](https://img.shields.io/badge/AWS%20DynamoDB-4053D6?style=for-the-badge&logo=amazon-dynamodb&logoColor=white)
![Swagger](https://img.shields.io/badge/Swagger-85EA2D?style=for-the-badge&logo=Swagger&logoColor=black)

</div>

<div align="center">
  <strong>Backend desarrollado en Node.js + Express, conectado a AWS DynamoDB, con autenticación JWT, CRUD completo y documentación interactiva.</strong>
</div>

---

## 📌 1. Definición del proyecto

Este backend es el núcleo de la aplicación de streaming y proporciona:

*  ``Gestión de usuarios:`` Registro, login, actualización y borrado.
*  ``Seguridad:`` Autenticación robusta mediante **JWT (JSON Web Tokens)**.
*  ``CRUD Completo:`` Gestión total de **Usuarios, Playlists y Canciones**.
*  ``Filtros Avanzados:`` Búsquedas optimizadas en endpoints GET.
*  ``Base de Datos Cloud:`` Conexión nativa con **AWS DynamoDB**.
*  ``Documentación:`` API documentada interactivamente con **Swagger UI**.
*  ``Despliegue:`` Configurado para **Render**.
*  ``Cloud:`` Subida de archivos multimedia por defecto en **Supabase.com**.

---

## 🗂️ 2. Estructura del proyecto

La arquitectura sigue una separación de responsabilidades clara (MVC / Service Layer):

```text
src/
├── 📂 controllers/      # Lógica de control de las peticiones
├── 📂 database/         # Configuración y conexión a DynamoDB
├── 📂 helpers/          # Funciones de utilidad y validaciones
├── 📂 middlewares/      # Validaciones de rutas y verificación de JWT
├── 📂 services/         # Lógica de negocio (interacción con DB)
├── 📜 swagger.js        # Configuración de la documentación
├── 📂 v1/
│   └── 📂 routes/       # Definición de endpoints
│       ├── 📄 routes.js
│       └── 📄 authRoutes.js
└── 📄 index.js          # Punto de entrada de la aplicación
📄 package.json
📄 README.md
```

---

## 🛠️ 3. Cómo replicar este backend en tu equipo
Sigue estos pasos para instalar y ejecutar el proyecto en un entorno local.

### 3.1. Clonar el repositorio
Puedes clonar el repositorio usando Git o descargarlo directamente:

```bash
git clone [https://github.com/TU_USUARIO/TU_REPO.git](https://github.com/TU_USUARIO/TU_REPO.git)
cd TU_REPO
```

Abrirlo desde un editor de código como ``Visual Studio Code``.

### 3.2. Instalar dependencias
```Bash 
npm install
```

### 3.3. Crear archivo de variables de entornoEn la raíz del proyecto, crea un archivo .env:
```Bash
touch .env
```

> [!IMPORTANT]  
> **Configuración del entorno:** Copia el siguiente contenido en tu archivo `.env` y sustituye los valores con tus credenciales. Este archivo deberá de situarse fuera de la carpeta ``src`` del proyecto, a la altura del ``package.json``.

```env
# AWS Configuration
AWS_REGION=eu-north-1  # Región de tu aplicación de AWS (puede llegar a variar)
AWS_ACCESS_KEY_ID=TU_CLAVE_DE_ACCESO
AWS_SECRET_ACCESS_KEY=TU_CLAVE_SECRETA
# Auth & Server
SEMILLA=clave_secreta_para_firmar_jwt
PORT=3002
```

### 3.4. Ejecutar el servidor
Para levantar el servidor en modo desarrollo/producción:

```Bash
npm start
```

> 🚀 **Status:** El backend estará escuchando en: `http://localhost:3002`

---

## 🗄️ 4. Conexión con Amazon DynamoDB
Este backend utiliza **AWS DynamoDB** como base de datos NoSQL de alto rendimiento. Para integrar tu backend con esta sigue este flujo:

### 4.1. Configuración de Identidad (IAM)
Para que Node.js pueda hablar con AWS, necesitas un usuario con permisos:
1.  **AWS Console** ➔ **IAM** ➔ **Users** ➔ **Create User**.
2.  **Permisos**: Selecciona `AmazonDynamoDBFullAccess`.
3.  **Seguridad**: Crea un *Access Key* (Uso local/SDK). 
4.  **Guarda**: Obtendrás tu `AWS_ACCESS_KEY_ID` y `AWS_SECRET_ACCESS_KEY`.
> [!WARNING]  
> NO COMPARTAS ESA CLAVE DE ACCESO.
> Ya que podrían acceder a tu base de datos y modificar a su antojo.

### 4.2. Estructura de Datos
Debes crear manualmente las siguientes tablas en tu región de AWS:

| Tabla | Partition Key | Tipo | Propósito |
| :--- | :--- | :--- | :--- |
| `usuarios` | `id_usuario` | `String` | Gestión de perfiles y roles |
| `playlists` | `id_playlist` | `String` | Listas de reproducción de usuarios |
| `canciones` | `id_cancion` | `String` | Metadatos de la biblioteca musical |

### 4.3. Vinculación `.env`
Verifica que las credenciales del paso 4.1 estén reflejadas correctamente en tu archivo de configuración (paso 3.3) para evitar errores de conexión `403 Forbidden`.

---

## ⚙️ 5. Especificaciones del Proyecto

### 🔗 Catálogo de Endpoints

La API cuenta con una interfaz gráfica completa para pruebas y auditoría.

**Swagger Live:** [https://musicstream-backend-nodejs.onrender.com/api-docs](https://musicstream-backend-nodejs.onrender.com/api-docs)

**Resumen de endpoints:**

| Módulo | Método | Endpoint | Seguridad |
| :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/v1/auth/register` | 🔓 Público |
| | `POST` | `/api/v1/auth/login` | 🔓 Público |
| | `GET` | `/api/v1/auth/renew` | 🔑 Token |
| **Users** | `GET` | `/api/v1/music/users` | 🔑 Token |
| | `GET` | `/api/v1/music/users/:userId` | 🔓 Público |
| | `POST` | `/api/v1/music/users` | 🔓 Público |
| | `PATCH` | `/api/v1/music/users/:userId` | 🔓 Público |
| | `DELETE`| `/api/v1/music/users/:userId` | 🔑 Token |
| **Playlists**| `GET` | `/api/v1/music/playlists` | 🔓 Público |
| | `GET` | `/api/v1/music/playlists/:playlistId` | 🔓 Público |
| | `POST` | `/api/v1/music/playlists` | 🔓 Público |
| | `PATCH` | `/api/v1/music/playlists/:playlistId` | 🔓 Público |
| | `DELETE`| `/api/v1/music/playlists/:playlistId` | 🔑 Token |
| **Songs** | `POST` | `/api/v1/music/songs` | 🔓 Público |
| | `GET` | `/api/v1/music/songs/:songsId` | 🔓 Público |
| | `POST` | `/api/v1/music/songs` | 🔓 Público |
| | `PATCH` | `/api/v1/music/songs/:songsId` | 🔓 Público |
| | `DELETE`| `/api/v1/music/songs/:songsId` | 🔑 Token |

---

## 🚀 6. Guía de Despliegue (Render)
Este backend está optimizado para la infraestructura de **Render.com**.
Te dejo aquí algunas configuraciones necesarias si lo quieres desplegar en este servicio:

* **Root Directory:** `src`
* **Build Command:** `npm install`
* **Start Command:** `npm start`
* **Variables Críticas:** Asegúrate de configurar `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` y `SEMILLA` en el panel de control de Render.

---
<br/>
<h5>¡Eso sería todo! 😊👍</h5> 
<h6>Espero os resulte interesante el proyecto y podáis replicarlo sin problemas para vuestras aplicaciones. Gracias por llegar hasta aquí <3</h6>
<br/><br/>

<div align="center">
  <img src="https://img.shields.io/badge/Made%20with-Node.js-green?style=for-the-badge&logo=node.js" alt="NodeJS" />
  <img src="https://img.shields.io/badge/Powered%20by-AWS-orange?style=for-the-badge&logo=amazon-aws" alt="AWS" />
  <br />
  <p><b>Proyecto desarrollado con ❤️ por Mireya Cueto</b></p>
  <sub>© 2026 MusicStream Backend - Código Abierto</sub>
</div>
