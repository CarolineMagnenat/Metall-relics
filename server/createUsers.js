// Importera nödvändiga paket
import { createPool } from "mariadb"; // MariaDB för att interagera med databasen
import { hash } from "bcrypt"; // Bcrypt för att hashade lösenord

// Skapa en anslutningspool till MariaDB
const pool = createPool({
  host: "localhost", // Din MariaDB host, oftast "localhost"
  user: "birgitt", // Ditt MariaDB användarnamn, t.ex. "root"
  password: "andersson", // Ditt MariaDB lösenord
  database: "RollingMerch", // Namnet på databasen du använder
});

// Funktion för att skapa användare
async function createUsers() {
  try {
    // Skapa en anslutning till databasen
    const conn = await pool.getConnection();

    // Skapa hashade lösenord med "bcrypt"
    const saltRounds = 10; // Antalet salt-rundor, 10 är ett standardvärde för bra säkerhet
    const hashedAdminPassword = await hash("123", saltRounds);
    const hashedUserPassword = await hash("123", saltRounds);

    // SQL-fråga för att lägga till användarna i "logins"-tabellen
    const query = `
      INSERT INTO logins (username, password, access_level) VALUES
      (?, ?, 2), -- Admin user (access_level = 2 betyder admin)
      (?, ?, 1); -- Regular user (access_level = 1 betyder vanlig användare)
    `;

    // Värden som sätts in i SQL-frågan ovan
    const values = ["carro", hashedAdminPassword, "benji", hashedUserPassword];

    // Kör SQL-frågan och sätt in användarna i databasen
    await conn.query(query, values);
    console.log("Användare har lagts till framgångsrikt!");

    // Stäng anslutningen när vi är klara
    conn.release();
  } catch (error) {
    // Hantera eventuella fel som uppstår
    console.error("Något gick fel:", error);
  } finally {
    // Stäng poolen för att förhindra anslutningsläckor
    pool.end();
  }
}

// Kör funktionen för att skapa användare
createUsers();
