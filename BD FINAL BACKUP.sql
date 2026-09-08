-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : lun. 17 nov. 2025 à 16:15
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
(74, 'AFPA', 'https://www.afpa.fr/', ' Centre de formations professionnelles qualifiantes pour adultes, perfectionnement, reconversion professionnelle, remise à niveau, VAE, métier, formation continue', '2025-09-23 21:12:38', '', 1, 2, 60),
(76, 'MLI Hérault', 'https://mlicentreherault.fr/', 'La Mission Locale du Centre Hérault est un lieu d\'accueil, d\'écoute et d\'accompagnement des jeunes de 16 à 25 ans', '2025-09-23 21:22:22', '', 1, 2, 60),
(81, 'Claude', 'https://claude.ai/login?returnTo=%2F%3F', 'Rencontrez votre partenaire de réflexion en matière d\'IA. Résolvez des problèmes complexes, analysez des données, écrivez du code et collaborez sur des projets difficiles.', '2025-09-25 20:30:21', '', 1, 1, 60),
(84, 'Xampp', 'https://www.apachefriends.org/fr/index.html', 'XAMPP est une distribution Apache entièrement gratuite et facile à installer contenant MySQL, PHP et Perl.', '2025-10-02 18:07:50', '', 1, 1, 74),
(92, 'Wow', 'https://worldofwarcraft.blizzard.com/fr-fr/', 'World of Warcraft (abrégé WoW) est un jeu vidéo de type MMORPG (jeu de rôle en ligne massivement multijoueur)', '2025-10-10 18:02:49', '', 1, 3, 60),
(94, 'Chatgpt', 'https://chatgpt.com', 'ChatGPT est une intelligence artificielle développée par OpenAI, conçue pour comprendre et générer du langage naturel.', '2025-10-10 18:23:35', '', 1, 1, 60),
(98, 'Dota', 'https://www.dota2.com/home', 'Dota 2 est un jeu vidéo de type arène de bataille en ligne multijoueur développé et édité par Valve Corporation avec l\'aide de certains des créateurs du jeu d\'origine : Defense of the Ancients', '2025-10-10 18:37:23', '', 1, 3, 80),
(108, 'Mistral', 'https://mistral.ai/fr', 'Mistral AI est une entreprise française fondée en avril 2023, spécialisée dans l\'intelligence artificielle générative.', '2025-10-10 20:58:47', '', 1, 1, 80),
(109, 'Nasa', 'https://www.nasa.gov/', 'La National Aeronautics and Space Administration (en français : « Administration nationale de l\'aéronautique et de l\'espace »)', '2025-10-10 20:59:22', '', 1, 1, 80),
(111, 'Final fantasy XIV', 'https://fr.finalfantasyxiv.com/', 'Site promotionnel officiel de FINAL FANTASY XIV. Jeu de rôle en ligne (MMO) où vous pouvez explorer le monde d\'Éorzéa et vivre des aventures avec des joueurs du monde entier.', '2025-10-13 15:39:53', '', 1, 3, 80),
(112, 'Mabimbo', 'https://www.ma-bimbo.com/', 'jeu', '2025-11-06 09:42:12', NULL, 1, 3, 82);

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
  MODIFY `id_categorie` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT pour la table `role`
--
ALTER TABLE `role`
  MODIFY `Id_Role` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT pour la table `sites`
--
ALTER TABLE `sites`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=113;

--
-- AUTO_INCREMENT pour la table `utilisateurs`
--
ALTER TABLE `utilisateurs`
  MODIFY `id_utilisateur` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=83;

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
  ADD CONSTRAINT `sites_ibfk_2` FOREIGN KEY (`id_utilisateur_1`) REFERENCES `utilisateurs` (`id_utilisateur`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `utilisateurs`
--
ALTER TABLE `utilisateurs`
  ADD CONSTRAINT `utilisateurs_ibfk_1` FOREIGN KEY (`Id_Role`) REFERENCES `role` (`Id_Role`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
