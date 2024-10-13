import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mariadb from "mariadb";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config(); // Laddar in miljövariabler från .env-filen

const app = express();
app.use(cors());
app.use(express.json());

// Setup connection to MariaDB
const pool = mariadb.createPool({
  host: "localhost",
  user: "birgitt", // Din MariaDB användare
  password: "andersson", // Ditt MariaDB lösenord
  database: "RollingMerch",
});

// Kontrollera anslutningen till MariaDB innan servern startar
pool
  .getConnection()
  .then((conn) => {
    console.log("Anslutning till MariaDB lyckades.");
    conn.release();
  })
  .catch((err) => {
    console.error("Misslyckades med att ansluta till MariaDB:", err);
    process.exit(1); // Avslutar processen om databasanslutningen misslyckas
  });

// Secret key for JWT from .env
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET saknas i miljövariabler");
}
