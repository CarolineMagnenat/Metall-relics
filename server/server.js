import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mariadb from "mariadb";
import cors from "cors";
import validator from "validator";
import helmet from "helmet";
import cookieParser from "cookie-parser";

// Definiera __dirname med ES-moduler
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Använd absolut sökväg för att ladda in .env från projektets rotkatalog
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();
app.use(
  cors({
    origin: "http://localhost:5174",
    credentials: true, // Tillåter cookies att skickas
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(helmet());

// Konfigurera Content Security Policy (CSP) med Helmet
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      // Lägg till andra direktiv om det behövs
    },
  })
);

// Setup connection to MariaDB
const pool = mariadb.createPool({
  host: "localhost",
  user: "birgitt",
  password: "andersson",
  database: "RollingMerch",
  connectionLimit: 10,
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

// // Secret key for JWT from .env
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET saknas i miljövariabler");
}

// POST /login för att autentisera användare och skapa en JWT-token
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    // Sanera användarnamn för att undvika XSS
    let sanitizedUsername = validator.escape(username);

    const conn = await pool.getConnection();
    const result = await conn.query("SELECT * FROM logins WHERE username = ?", [
      sanitizedUsername,
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

    // Sätt JWT-token i HttpOnly, Secure cookie
    res.cookie("token", token, {
      httpOnly: false,
      secure: false,
      sameSite: "Lax", // eller 'Lax' baserat på dina behov
      maxAge: 60 * 60 * 1000, // 1 timme
      path: "/",
    });

    return res.json({
      message: "Inloggning lyckades",
      username: user.username,
      access_level: user.access_level,
    });
  } catch (error) {
    console.error("Serverfel:", error);
    return res.status(500).json({ message: "Serverfel" });
  }
});

// POST /logout för att logga ut användaren och ta bort JWT-cookien
app.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Se till att sätta till true i produktion
    sameSite: "Lax",
  });

  res.status(200).json({ message: "Utloggad och cookie raderad" });
});

// Middleware för att verifiera JWT och roller
const verifyToken = (role) => (req, res, next) => {
  // console.log("Cookies på serversidan:", req.cookies);

  const token = req.cookies.token;

  if (!token) {
    console.log("Ingen token hittades - blockad åtkomst");
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
    console.log("Token fel - blockad");
    return res.status(401).json({ message: "Ogiltig token" });
  }
};

// GET /userinfo - returnera användarens information baserat på JWT-token
app.get("/userinfo", verifyToken(), (req, res) => {
  // Returnera användarinformation från JWT-tokenen
  res.json({
    username: req.user.username,
    access_level: req.user.access_level,
  });
});

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
