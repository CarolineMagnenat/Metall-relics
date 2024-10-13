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
  user: "birgitt",
  password: "andersson",
  database: "RollingMerch",
  connectionLimit: 10, // För att begränsa antalet samtidiga anslutningar
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

// POST /login för att autentisera användare och skapa en JWT-token
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const conn = await pool.getConnection();
    const result = await conn.query("SELECT * FROM logins WHERE username = ?", [
      username,
    ]);
    conn.release(); // Frigör anslutningen när vi är klara

    const user = result[0];

    if (!user) {
      return res
        .status(400)
        .json({ message: "Fel användarnamn eller lösenord" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ message: "Fel användarnamn eller lösenord" });
    }

    const token = jwt.sign(
      { username: user.username, access_level: user.access_level },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.json({ token });
  } catch (error) {
    console.error("Serverfel:", error);
    return res.status(500).json({ message: "Serverfel" });
  }
});

// Middleware för att verifiera JWT och roller
const verifyToken = (role) => (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Ingen token angiven" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;

    if (role !== undefined && req.user.access_level < role) {
      return res.status(403).json({ message: "Åtkomst nekad" });
    }

    next();
  } catch (err) {
    return res.status(401).json({ message: "Ogiltig token" });
  }
};

// GET /userpage - skyddad rutt för användare och administratörer
app.get("/userpage", verifyToken(1), (req, res) => {
  res.json({ message: "Välkommen till användarsidan!" });
});

// GET /adminpage - skyddad rutt för administratörer
app.get("/adminpage", verifyToken(2), (req, res) => {
  res.json({ message: "Välkommen till adminsidan!" });
});

// Starta servern på port 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servern kör på port ${PORT}`);
});