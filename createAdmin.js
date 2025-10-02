import bcrypt from 'bcrypt';
import readline from 'readline';
import pool from './BackEnd/config/dataBase.js'; // adapte le chemin si besoin

const SALT_ROUNDS = 10;

// Fonction pour demander une entrée au terminal
function ask(question) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise(resolve => {
        rl.question(question, answer => {
            rl.close();
            resolve(answer.trim());
        });
    });
}

async function createAdmin() {
    try {
        console.log("Création d'un compte administrateur");

        const nom = await ask("Nom : ");
        const prenom = await ask("Prénom : ");
        const email = await ask("Email : ");
        const password = await ask("Mot de passe : ");

        // Hachage du mot de passe
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        const roleId = 1; // Valeur pour le rôle administrateur dans ta table

        // Insertion dans la base
        const [result] = await pool.query(
            `INSERT INTO utilisateurs (nom, prénom, email, mot_de_passe, Id_Role)
             VALUES (?, ?, ?, ?, ?)`,
            [nom, prenom, email, hashedPassword, roleId]
        );

        console.log("Admin créé avec succès, ID:", result.insertId);
        process.exit(0);

    } catch (err) {
        console.error("Erreur lors de la création de l'admin :", err);
        process.exit(1);
    }
}

createAdmin();
