-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Gép: 127.0.0.1:3307
-- Létrehozás ideje: 2025. Nov 10. 09:24
-- Kiszolgáló verziója: 10.4.28-MariaDB
-- PHP verzió: 8.2.4

SET FOREIGN_KEY_CHECKS=0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Adatbázis: `skillmegoszt`
--
CREATE DATABASE IF NOT EXISTS `skillmegoszt` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `skillmegoszt`;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `changes`
--

DROP TABLE IF EXISTS `changes`;
CREATE TABLE IF NOT EXISTS `changes` (
  `ChangeID` int(11) NOT NULL AUTO_INCREMENT,
  `Mit` varchar(45) NOT NULL,
  `Mikor` datetime NOT NULL,
  `UserID` int(11) NOT NULL,
  PRIMARY KEY (`ChangeID`),
  KEY `chfk1_idx` (`UserID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `chats`
--

DROP TABLE IF EXISTS `chats`;
CREATE TABLE IF NOT EXISTS `chats` (
  `ChatID` int(11) NOT NULL AUTO_INCREMENT,
  `ChatName` varchar(45) NOT NULL,
  `ChatPic` varchar(45) DEFAULT NULL,
  `CreatedAt` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`ChatID`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `chats`
--

INSERT INTO `chats` (`ChatID`, `ChatName`, `ChatPic`, `CreatedAt`) VALUES
(1, 'Cuncik', 'Cuncik.png', '0000-00-00 00:00:00'),
(2, 'NotPoopie', 'SteakLover.png', '2025-11-04 11:47:40');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `msgs`
--

DROP TABLE IF EXISTS `msgs`;
CREATE TABLE IF NOT EXISTS `msgs` (
  `MsgID` int(11) NOT NULL AUTO_INCREMENT,
  `UserID` int(11) NOT NULL,
  `ChatID` int(11) NOT NULL,
  `Content` text NOT NULL,
  `SentAt` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`MsgID`),
  KEY `fkUsers_idx` (`UserID`),
  KEY `fkChats_idx` (`ChatID`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `msgs`
--

INSERT INTO `msgs` (`MsgID`, `UserID`, `ChatID`, `Content`, `SentAt`) VALUES
(2, 4, 1, 'Szeretem a tejet', '2025-11-04 12:06:30'),
(3, 4, 1, 'a kakaót is', '2025-11-04 12:06:47'),
(4, 4, 1, 'hihetetlenül', '2025-11-04 12:06:55');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `reviews`
--

DROP TABLE IF EXISTS `reviews`;
CREATE TABLE IF NOT EXISTS `reviews` (
  `Reviewer` int(11) NOT NULL,
  `Reviewee` int(11) NOT NULL,
  `Rating` int(1) DEFAULT NULL,
  `Tartalom` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`Reviewer`,`Reviewee`),
  KEY `Reviewee` (`Reviewee`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `reviews`
--

INSERT INTO `reviews` (`Reviewer`, `Reviewee`, `Rating`, `Tartalom`) VALUES
(4, 9, 4, 'Good guy');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `skills`
--

DROP TABLE IF EXISTS `skills`;
CREATE TABLE IF NOT EXISTS `skills` (
  `SkillID` int(11) NOT NULL AUTO_INCREMENT,
  `Skill` varchar(45) NOT NULL,
  PRIMARY KEY (`SkillID`),
  UNIQUE KEY `Skill_UNIQUE` (`Skill`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `skills`
--

INSERT INTO `skills` (`SkillID`, `Skill`) VALUES
(2, 'gitár'),
(4, 'magyar'),
(3, 'matek'),
(1, 'zongora');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `tickets`
--

DROP TABLE IF EXISTS `tickets`;
CREATE TABLE IF NOT EXISTS `tickets` (
  `TicketID` int(11) NOT NULL AUTO_INCREMENT,
  `UserID` int(11) NOT NULL,
  `Descr` varchar(45) NOT NULL,
  `Text` varchar(45) NOT NULL,
  PRIMARY KEY (`TicketID`),
  KEY `Ufk_idx` (`UserID`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `tickets`
--

INSERT INTO `tickets` (`TicketID`, `UserID`, `Descr`, `Text`) VALUES
(1, 8, 'cannot log in', 'I simply cannot log in');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `uac`
--

DROP TABLE IF EXISTS `uac`;
CREATE TABLE IF NOT EXISTS `uac` (
  `UserID` int(11) NOT NULL,
  `ChatID` int(11) NOT NULL,
  `IsChatAdmin` tinyint(4) NOT NULL DEFAULT 0,
  `JoinedAt` datetime NOT NULL,
  PRIMARY KEY (`UserID`,`ChatID`),
  KEY `cfk2_idx` (`ChatID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `uac`
--

INSERT INTO `uac` (`UserID`, `ChatID`, `IsChatAdmin`, `JoinedAt`) VALUES
(4, 1, 1, '0000-00-00 00:00:00');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `uas`
--

DROP TABLE IF EXISTS `uas`;
CREATE TABLE IF NOT EXISTS `uas` (
  `UserID` int(11) NOT NULL,
  `SkillID` int(11) NOT NULL,
  PRIMARY KEY (`UserID`,`SkillID`),
  KEY `fk1_idx` (`SkillID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `uas`
--

INSERT INTO `uas` (`UserID`, `SkillID`) VALUES
(4, 1),
(4, 2),
(4, 4),
(8, 2),
(8, 3),
(9, 4);

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `UserID` int(11) NOT NULL AUTO_INCREMENT,
  `Username` varchar(45) NOT NULL,
  `Password` varchar(45) NOT NULL,
  `Email` varchar(45) NOT NULL,
  `Tokens` int(11) NOT NULL DEFAULT 0,
  `rankID` int(11) NOT NULL DEFAULT 1,
  PRIMARY KEY (`UserID`),
  UNIQUE KEY `Username_UNIQUE` (`Username`),
  UNIQUE KEY `Email_UNIQUE` (`Email`),
  KEY `fkRank_idx` (`rankID`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `users`
--

INSERT INTO `users` (`UserID`, `Username`, `Password`, `Email`, `Tokens`, `rankID`) VALUES
(4, 'Pali', 'Pali', 'palpal828@hengersor.hu', 10000, 3),
(8, 'Eszter', 'Eszter', 'novesz831@hengersor.hu', 0, 3),
(9, 'Hubi', 'Hubertusz', 'szahub608@hengersor.hu', 0, 3),
(10, 'random', 'random', 'random@example.com', 0, 0);

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `user_rank`
--

DROP TABLE IF EXISTS `user_rank`;
CREATE TABLE IF NOT EXISTS `user_rank` (
  `rankID` int(11) NOT NULL AUTO_INCREMENT,
  `which` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`rankID`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `user_rank`
--

INSERT INTO `user_rank` (`rankID`, `which`) VALUES
(0, 'banned'),
(1, 'user'),
(2, 'admin'),
(3, 'owner');

--
-- Megkötések a kiírt táblákhoz
--

--
-- Megkötések a táblához `changes`
--
ALTER TABLE `changes`
  ADD CONSTRAINT `chfk1` FOREIGN KEY (`UserID`) REFERENCES `users` (`UserID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Megkötések a táblához `msgs`
--
ALTER TABLE `msgs`
  ADD CONSTRAINT `msgs_fk_chat` FOREIGN KEY (`ChatID`) REFERENCES `chats` (`ChatID`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `msgs_fk_user` FOREIGN KEY (`UserID`) REFERENCES `users` (`UserID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Megkötések a táblához `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`Reviewer`) REFERENCES `users` (`UserID`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`Reviewee`) REFERENCES `users` (`UserID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Megkötések a táblához `tickets`
--
ALTER TABLE `tickets`
  ADD CONSTRAINT `tickets_fk_user` FOREIGN KEY (`UserID`) REFERENCES `users` (`UserID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Megkötések a táblához `uac`
--
ALTER TABLE `uac`
  ADD CONSTRAINT `uac_fk_chat` FOREIGN KEY (`ChatID`) REFERENCES `chats` (`ChatID`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `uac_fk_user` FOREIGN KEY (`UserID`) REFERENCES `users` (`UserID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Megkötések a táblához `uas`
--
ALTER TABLE `uas`
  ADD CONSTRAINT `uas_fk_skill` FOREIGN KEY (`SkillID`) REFERENCES `skills` (`SkillID`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `uas_fk_user` FOREIGN KEY (`UserID`) REFERENCES `users` (`UserID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Megkötések a táblához `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fkRank` FOREIGN KEY (`rankID`) REFERENCES `user_rank` (`rankID`) ON DELETE NO ACTION ON UPDATE NO ACTION;
SET FOREIGN_KEY_CHECKS=1;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
