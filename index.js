import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import apiSitesRouter from './BackEnd/routes/apiSites.js';
import apiUserRouter  from './BackEnd/routes/apiUser.js';
import { signupUser, loginUser } from './BackEnd/controllers/usersController.js';
import apiCategoryRouter from './BackEnd/routes/apiCategory.js';
import cors from 'cors';



dotenv.config({ path: './BackEnd/config/.env' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("Le script démarre !");

const app = express();

// Autorise toutes les origines (développement)
app.use(cors());
app.use(bodyParser.json());
const PORT = process.env.PORT || 3000;


// parsing JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir les fichiers statiques depuis le dossier FrontEnd
app.use(express.static(path.join(__dirname, 'FrontEnd')));


// Renvoyer explicitement la page d'accueil
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'FrontEnd', 'DossierHtml', 'MonSiteAccueil.html'));
});

// Pages de connexion / inscription (routes propres)
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'FrontEnd', 'DossierHtml', 'Login.html'));
});

app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'FrontEnd', 'DossierHtml', 'Signup.html'));
});

// Support des anciens liens qui pointent vers Login.html / Signup.html
app.get('/Login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'FrontEnd', 'DossierHtml', 'Login.html'));
});

app.get('/Signup.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'FrontEnd', 'DossierHtml', 'Signup.html'));
});

//API login/signup
app.post("/api/signup", signupUser);
app.post("/api/login", loginUser);


// Monter le routeurs API
app.use('/api/sites', apiSitesRouter);
app.use('/api/users', apiUserRouter);
app.use('/api/categories', apiCategoryRouter);


// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ error: 'not_found' });
});

// global error handler
import errorHandler from './BackEnd/middleware/errorHandler.js';
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
});
