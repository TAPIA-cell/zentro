import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

// 1. Crear el Pool (No usamos await aquí, es síncrono)
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10
});

// 2. PRUEBA REAL DE CONEXIÓN (El "Ping")
db.query("SELECT 1")
  .then(() => {
    console.log("✔ Conexión exitosa a la Base de Datos AWS RDS");
  })
  .catch((err) => {
    console.error("❌ ERROR FATAL DE CONEXIÓN:", err.message);
    // Opcional: Esto ayuda a ver si es error de contraseña o de red
  });

export default db;