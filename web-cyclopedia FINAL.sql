-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : mar. 23 sep. 2025 à 21:18
-- Version du serveur : 10.4.32-MariaDB
-- Version de PHP : 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `web-cyclopedia`
--

-- --------------------------------------------------------

--
-- Structure de la table `avis`
--

CREATE TABLE `avis` (
  `id_utilisateur` int(11) NOT NULL,
  `id` int(11) NOT NULL,
  `add_date` date DEFAULT NULL,
  `Etoiles` varchar(50) DEFAULT NULL,
  `description` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `avis`
--

INSERT INTO `avis` (`id_utilisateur`, `id`, `add_date`, `Etoiles`, `description`) VALUES
(52, 52, '2025-06-20', '4', 'Bonne plateforme éducative'),
(57, 55, '2025-06-15', '5', 'Très utile pour coder'),
(58, 57, '2025-06-25', '3', 'Bon contenu mais cher');

-- --------------------------------------------------------

--
-- Structure de la table `categories`
--

CREATE TABLE `categories` (
  `id_categorie` int(11) NOT NULL,
  `nom` varchar(50) DEFAULT NULL,
  `description` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `categories`
--

INSERT INTO `categories` (`id_categorie`, `nom`, `description`) VALUES
(1, 'Technologie', 'Sites liés à la tech'),
(2, 'Éducation', 'Ressources éducatives'),
(3, 'Loisirs', 'Divertissement et loisirs');

-- --------------------------------------------------------

--
-- Structure de la table `role`
--

CREATE TABLE `role` (
  `Id_Role` int(11) NOT NULL,
  `nom` varchar(50) DEFAULT NULL,
  `description` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `role`
--

INSERT INTO `role` (`Id_Role`, `nom`, `description`) VALUES
(1, 'Administrateur', 'Gère la plateforme'),
(2, 'Modérateur', 'Modère les contenus'),
(3, 'Utilisateur', 'Utilisateur standard');

-- --------------------------------------------------------

--
-- Structure de la table `sites`
--

CREATE TABLE `sites` (
  `id` int(11) NOT NULL,
  `nom` varchar(50) DEFAULT NULL,
  `url` varchar(50) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `date_ajout` datetime NOT NULL DEFAULT current_timestamp(),
  `image` text DEFAULT NULL,
  `valide` tinyint(1) DEFAULT NULL,
  `id_categorie` int(11) DEFAULT NULL,
  `id_utilisateur_1` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `sites`
--

INSERT INTO `sites` (`id`, `nom`, `url`, `description`, `date_ajout`, `image`, `valide`, `id_categorie`, `id_utilisateur_1`) VALUES
(52, 'World of Warcraft', 'https://worldofwarcraft.blizzard.com/fr-fr/', 'MMORPG emblématique se déroulant dans le monde d’Azeroth, avec un fort accent sur le PvE, le PvP et le lore. Gameplay classique avec une vaste communauté et des extensions régulières.', '2025-06-09 00:00:00', 'http://127.0.0.1:5500/FrontEnd\\DossierImages\\LogoSitecard\\WoW_icon.svg.png', 1, 3, 49),
(55, 'Guild Wars 2', 'https://www.guildwars2.com/fr/', 'MMORPG dynamique avec un système de combat en temps réel, des événements mondiaux et une grande liberté d\'exploration. Accent sur le PvE et le PvP.', '2025-09-09 00:00:00', 'http://127.0.0.1:5500/FrontEnd\\DossierImages\\LogoSitecard\\images.png', 1, 3, 58),
(57, 'Lost Ark', 'https://www.playlostark.com/fr-fr', 'MMORPG d\'action isométrique avec un monde vaste et des combats dynamiques. Mélange de PvE et de PvP avec une grande variété de classes.', '2025-09-11 00:00:00', 'http://127.0.0.1:5500/FrontEnd\\DossierImages\\LogoSitecard\\LoLA-logo2.png', 1, 3, 58),
(58, 'education.gouv.fr', 'https://www.education.gouv.fr/', 'Site officiel du ministère de l’Éducation national', '2025-09-11 00:00:00', 'http://localhost:5500/FrontEnd/DossierImages/LogoSitecard/MENESR.png', 1, 2, 58),
(59, 'Nasa', 'https://www.nasa.gov/', 'Le site de la NASA offre un accès complet aux actualités, missions, découvertes scientifiques et ressources multimédias liées à l’exploration spatiale américaine.', '2025-09-15 16:08:44', 'http://127.0.0.1:5500/FrontEnd\\DossierImages\\LogoSitecard\\NasaLogo.png', 1, 1, 49),
(60, 'Hopital Gui de Chauliac', 'https://www.chu-montpellier.fr/fr/a-propos-du-chu/', 'Grand centre hospitalier universitaire spécialisé à Montpellier.', '2025-09-15 16:16:44', 'http://127.0.0.1:5500/FrontEnd\\DossierImages\\LogoSitecard\\téléchargement.jpg', 1, 1, 50),
(74, 'AFPA', 'https://www.afpa.fr/', 'Organisme de formation ', '2025-09-23 21:12:38', NULL, NULL, 2, 60),
(75, 'Xampp', 'https://www.apachefriends.org/fr/download.html', 'XAMPP est une distribution Apache facile à installer. Elle contient MySQL, PHP et Perl. Il suffit de télécharger et de lancer l\'installateur.', '2025-09-23 21:15:02', NULL, NULL, 1, 71);

-- --------------------------------------------------------

--
-- Structure de la table `utilisateurs`
--

CREATE TABLE `utilisateurs` (
  `id_utilisateur` int(11) NOT NULL,
  `nom` varchar(50) NOT NULL,
  `prénom` varchar(50) NOT NULL,
  `email` varchar(50) NOT NULL,
  `mot_de_passe` varchar(255) NOT NULL,
  `date_inscription` datetime DEFAULT current_timestamp(),
  `Id_Role` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `utilisateurs`
--

INSERT INTO `utilisateurs` (`id_utilisateur`, `nom`, `prénom`, `email`, `mot_de_passe`, `date_inscription`, `Id_Role`) VALUES
(49, 'Dupont', 'Jean', 'jean.dupont@example.com', 'motdepasse123', '2025-09-08 16:24:51', 1),
(50, 'Martin', 'Claire', 'claire.martin@example.com', 'azerty123', '2025-09-08 16:24:51', 2),
(51, 'Bernard', 'Luc', 'luc.bernard@example.com', 'bonjour123', '2025-09-08 16:24:51', 1),
(52, 'Durand', 'Sophie', 'sophie.durand@example.com', 'monmotdepasse', '2025-09-08 16:24:51', 2),
(53, 'Leroy', 'Alice', 'alice.leroy@example.com', 'alicepass', '2025-09-08 16:24:51', 2),
(54, 'Moreau', 'Paul', 'paul.moreau@example.com', 'paulpass', '2025-09-08 16:24:51', 1),
(55, 'Petit', 'Emma', 'emma.petit@example.com', 'emmapass', '2025-09-08 16:24:51', 2),
(56, 'Roux', 'Marc', 'marc.roux@example.com', 'marcpass', '2025-09-08 16:24:51', 1),
(57, 'Garnier', 'Laura', 'laura.garnier@example.com', 'laurapass', '2025-09-08 16:24:51', 2),
(58, 'Faure', 'David', 'david.faure@example.com', 'davidpass', '2025-09-08 16:24:51', 1),
(60, 'aymeric', 'jeanjean', 'aymeric.34@hotmail.fr', '$2b$10$Xovi4TmvvcRbVm.94mwkO.kGtFx0hMdmiLtEojcjMUtgEEr4lBTti', '2025-09-23 10:11:05', 3),
(61, 'eni', 'ganbat', 'eni@hotmail.fr', '$2b$10$p1sBCqS5qqBQX0V0C1YLtePJKTWm1ByFQKP0HYkZxdCjmAM.ic566', '2025-09-23 10:15:45', 3),
(62, 'mader', 'nicolas', 'goongoon@hotmail.fr', '$2b$10$p1pqdjChkgL0eKi5vgSBsOW54tU442VtVyMgQG.hGY4HPzTN38H82', '2025-09-23 10:22:56', 3),
(71, 'birot', 'christophe', 'chris@hotmail.fr', '$2b$10$ImIYHQFkfyzBzBRP1GgfEu3qRvJ4XDwsggAjFL8B/dST6ikIjUsea', '2025-09-23 12:04:37', 3);

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `avis`
--
ALTER TABLE `avis`
  ADD PRIMARY KEY (`id_utilisateur`,`id`),
  ADD KEY `id_site` (`id`);

--
-- Index pour la table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id_categorie`);

--
-- Index pour la table `role`
--
ALTER TABLE `role`
  ADD PRIMARY KEY (`Id_Role`);

--
-- Index pour la table `sites`
--
ALTER TABLE `sites`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_catégorie` (`id_categorie`),
  ADD KEY `id_utilisateur_1` (`id_utilisateur_1`);

--
-- Index pour la table `utilisateurs`
--
ALTER TABLE `utilisateurs`
  ADD PRIMARY KEY (`id_utilisateur`),
  ADD KEY `Id_Role` (`Id_Role`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `categories`
--
ALTER TABLE `categories`
  MODIFY `id_categorie` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT pour la table `role`
--
ALTER TABLE `role`
  MODIFY `Id_Role` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT pour la table `sites`
--
ALTER TABLE `sites`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=76;

--
-- AUTO_INCREMENT pour la table `utilisateurs`
--
ALTER TABLE `utilisateurs`
  MODIFY `id_utilisateur` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=72;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `avis`
--
ALTER TABLE `avis`
  ADD CONSTRAINT `avis_ibfk_1` FOREIGN KEY (`id_utilisateur`) REFERENCES `utilisateurs` (`id_utilisateur`) ON DELETE CASCADE,
  ADD CONSTRAINT `avis_ibfk_2` FOREIGN KEY (`id`) REFERENCES `sites` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `sites`
--
ALTER TABLE `sites`
  ADD CONSTRAINT `sites_ibfk_1` FOREIGN KEY (`id_categorie`) REFERENCES `categories` (`id_categorie`),
  ADD CONSTRAINT `sites_ibfk_2` FOREIGN KEY (`id_utilisateur_1`) REFERENCES `utilisateurs` (`id_utilisateur`);

--
-- Contraintes pour la table `utilisateurs`
--
ALTER TABLE `utilisateurs`
  ADD CONSTRAINT `utilisateurs_ibfk_1` FOREIGN KEY (`Id_Role`) REFERENCES `role` (`Id_Role`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
