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

// POST /login för att autentisera användare och skapa en JWT-token
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const ipAddress = req.ip;
  const userAgent = req.headers["user-agent"] || "Unknown";

  console.log(userAgent);

  // console.log(req);

  try {
    // Sanera användarnamn för att undvika XSS
    let sanitizedUsername = validator.escape(username);

    const conn = await pool.getConnection();
    const result = await conn.query("SELECT * FROM logins WHERE username = ?", [
      sanitizedUsername,
    ]);
    const user = result[0];
    conn.release(); // Frigör anslutningen när vi är klara

    if (!user) {
      // Logga misslyckat inloggningsförsök
      const conn2 = await pool.getConnection();
      await conn2.query(
        "INSERT INTO login_attempts (username, success, ip_address, failed_attempts, user_agent) VALUES (?, ?, ?, ?, ?)",
        [sanitizedUsername, false, ipAddress, 0, userAgent]
      );
      conn2.release();

      return res
        .status(400)
        .json({ message: "Fel användarnamn eller lösenord" });
    }

    // Kontrollera om kontot är låst
    const now = new Date();
    if (user.lock_until && new Date(user.lock_until) > now) {
      const remainingTime = Math.ceil(
        (new Date(user.lock_until) - now) / 1000 / 60
      );
      return res.status(403).json({
        message: `Kontot är låst. Försök igen om ${remainingTime} minut(er).`,
      });
    }

    // Kontrollera om lösenordet är giltigt
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      let failedAttempts = user.failed_attempts + 1;
      let lockUntil = null;

      // Om misslyckade försök är 3 eller fler, lås kontot i 2 minuter
      if (failedAttempts >= 3) {
        failedAttempts = 0; // Återställ misslyckade försök när kontot låses
        lockUntil = new Date(now.getTime() + 2 * 60 * 1000); // Lås i 2 minuter
      }

      const conn3 = await pool.getConnection();
      await conn3.query(
        "UPDATE logins SET failed_attempts = ?, lock_until = ? WHERE username = ?",
        [failedAttempts, lockUntil, sanitizedUsername]
      );

      // Logga misslyckat inloggningsförsök
      await conn3.query(
        "INSERT INTO login_attempts (username, success, ip_address, failed_attempts, user_agent) VALUES (?, ?, ?, ?, ?)",
        [sanitizedUsername, false, ipAddress, failedAttempts, userAgent]
      );
      conn3.release();

      return res
        .status(400)
        .json({ message: "Fel användarnamn eller lösenord" });
    }

    // Inloggning lyckades, återställ misslyckade försök och låsning
    const conn4 = await pool.getConnection();
    await conn4.query(
      "UPDATE logins SET failed_attempts = 0, lock_until = NULL WHERE username = ?",
      [sanitizedUsername]
    );

    // Logga lyckat inloggningsförsök
    await conn4.query(
      "INSERT INTO login_attempts (username, success, ip_address, failed_attempts, user_agent) VALUES (?, ?, ?, ?, ?)",
      [sanitizedUsername, true, ipAddress, 0, userAgent]
    );
    conn4.release();

    // Skapa JWT-token
    const token = jwt.sign(
      { username: user.username, access_level: user.access_level },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Sätt JWT-token i HttpOnly, Secure cookie
    res.cookie("token", token, {
      httpOnly: false,
      secure: false,
      sameSite: "Lax", // eller 'Strict' beroende på behov
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

app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  // Validera användarnamn
  if (!validator.isAlphanumeric(username)) {
    return res.status(400).json({
      message: "Användarnamn får endast innehålla bokstäver och siffror",
    });
  }

  // Validera lösenordslängd
  if (!validator.isLength(password, { min: 8 })) {
    return res
      .status(400)
      .json({ message: "Lösenordet måste vara minst 8 tecken långt" });
  }

  // Sanera användarnamn och lösenord för att förhindra XSS
  const sanitizedUsername = validator.escape(username);
  const sanitizedPassword = validator.escape(password);

  try {
    const conn = await pool.getConnection();

    // Kontrollera om användarnamnet redan finns
    const checkUser = await conn.query(
      "SELECT username FROM logins WHERE username = ?",
      [sanitizedUsername]
    );

    if (checkUser.length > 0) {
      conn.release(); // Släpp anslutningen
      return res
        .status(400)
        .json({ message: "Användarnamnet är redan upptaget" });
    }

    // Hasha lösenordet innan det sparas i databasen
    const hashedPassword = await bcrypt.hash(sanitizedPassword, 10);

    // Spara användaren i databasen

    const sql =
      "INSERT INTO logins (username, password, access_level) VALUES (?, ?, ?)";
    await conn.query(sql, [sanitizedUsername, hashedPassword, 1]);
    conn.release();

    res.status(201).json({ message: "Registreringen lyckades!" });
  } catch (error) {
    console.error("Fel vid registrering:", error);
    res.status(500).json({ message: "Serverfel vid registrering" });
  }
});

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

// GET /login-attempts - för att hämta alla inloggningsförsök från databasen (endast för admins)
app.get("/login-attempts", verifyToken(2), async (req, res) => {
  try {
    // Hämta alla inloggningsförsök
    const conn = await pool.getConnection();
    const loginAttempts = await conn.query(
      "SELECT * FROM login_attempts ORDER BY attempt_time DESC"
    );
    conn.release();

    return res.status(200).json(loginAttempts);
  } catch (error) {
    console.error("Fel vid hämtning av inloggningsförsök:", error);
    return res
      .status(500)
      .json({ message: "Serverfel vid hämtning av inloggningsförsök" });
  }
});

// POST /reviews för att ta emot recensioner från användare och spara i databasen
app.post("/reviews", async (req, res) => {
  const { username, review, rating } = req.body;

  let sanitizedReview = validator.escape(review);

  if (!validator.isInt(rating, { min: 1, max: 5 })) {
    return res.status(400).json({ message: "Ogiltig betyg" });
  }

  if (!review) {
    // TODO: validera recensionen senare
    return res.status(400).json({ message: "Recension krävs" });
  }

  try {
    const conn = await pool.getConnection();

    // TODO - Sanera användarnamn för att undvika XSS
    const reviewer = username || "Anonym";

    // Infoga recensionen i databasen
    await conn.query(
      "INSERT INTO reviews (username, review, rating) VALUES (?, ?, ?)",
      [reviewer, sanitizedReview, rating]
    );

    console.log("review: ", review);
    console.log("validator: ", sanitizedReview);

    // Frigör anslutningen
    conn.release();

    return res.status(201).json({ message: "Recensionen mottagen och sparad" });
  } catch (error) {
    console.error("Fel vid sparande av recension:", error);
    return res
      .status(500)
      .json({ message: "Serverfel vid sparande av recension" });
  }
});

// GET /reviews för att hämta alla recensioner från databasen
app.get("/reviews", async (req, res) => {
  try {
    // Skapa en anslutning till databasen
    const conn = await pool.getConnection();

    // Hämta alla recensioner
    const reviews = await conn.query(
      "SELECT * FROM reviews ORDER BY created_at DESC"
    );

    // Frigör anslutningen
    conn.release();

    return res.status(200).json(reviews);
  } catch (error) {
    console.error("Fel vid hämtning av recensioner:", error);
    return res
      .status(500)
      .json({ message: "Serverfel vid hämtning av recensioner" });
  }
});

// DELETE /reviews/:id för att ta bort en recension
app.delete("/reviews/:id", verifyToken(2), async (req, res) => {
  const reviewId = req.params.id;

  try {
    const conn = await pool.getConnection();
    const result = await conn.query("DELETE FROM reviews WHERE id = ?", [
      reviewId,
    ]);
    conn.release();

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Recension ej funnen" });
    }

    return res.status(200).json({ message: "Recension raderad" });
  } catch (error) {
    console.error("Serverfel vid radering av recension:", error);
    return res.status(500).json({ message: "Serverfel" });
  }
});

// Starta servern på port 1337
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Servern kör på port ${PORT}`);
});
