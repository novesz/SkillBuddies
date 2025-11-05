-- phpMyAdmin SQL Dump (Fixed Version)
-- Compatible with MariaDB 10.4+
-- Created by ChatGPT

SET FOREIGN_KEY_CHECKS=0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

CREATE DATABASE IF NOT EXISTS `skillmegoszt` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `skillmegoszt`;

-- --------------------------------------------------------
-- Table: user_rank
-- --------------------------------------------------------
DROP TABLE IF EXISTS `user_rank`;
CREATE TABLE `user_rank` (
  `rankID` int(11) NOT NULL AUTO_INCREMENT,
  `which` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`rankID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `user_rank` (`rankID`, `which`) VALUES
(0, 'banned'),
(1, 'user'),
(2, 'admin'),
(3, 'owner');

-- --------------------------------------------------------
-- Table: users
-- --------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `UserID` int(11) NOT NULL AUTO_INCREMENT,
  `Username` varchar(45) NOT NULL,
  `Password` varchar(45) NOT NULL,
  `Email` varchar(45) NOT NULL,
  `Tokens` int(11) NOT NULL DEFAULT 0,
  `rankID` int(11) NOT NULL DEFAULT 1,
  PRIMARY KEY (`UserID`),
  UNIQUE KEY `Username_UNIQUE` (`Username`),
  UNIQUE KEY `Email_UNIQUE` (`Email`),
  KEY `fkRank_idx` (`rankID`),
  CONSTRAINT `fkRank` FOREIGN KEY (`rankID`) REFERENCES `user_rank` (`rankID`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `users` (`UserID`, `Username`, `Password`, `Email`, `Tokens`, `rankID`) VALUES
(4, 'Pali', 'Pali', 'palpal828@hengersor.hu', 10000, 3),
(8, 'Eszter', 'Eszter', 'novesz831@hengersor.hu', 0, 3),
(9, 'Hubi', 'Hubertusz', 'szahub608@hengersor.hu', 0, 3),
(10, 'random', 'random', 'random@example.com', 0, 0);

-- --------------------------------------------------------
-- Table: changes
-- --------------------------------------------------------
DROP TABLE IF EXISTS `changes`;
CREATE TABLE `changes` (
  `ChangeID` int(11) NOT NULL AUTO_INCREMENT,
  `Mit` varchar(45) NOT NULL,
  `Mikor` datetime NOT NULL,
  `UserID` int(11) NOT NULL,
  PRIMARY KEY (`ChangeID`),
  KEY `chfk1_idx` (`UserID`),
  CONSTRAINT `chfk1` FOREIGN KEY (`UserID`) REFERENCES `users` (`UserID`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table: chats
-- --------------------------------------------------------
DROP TABLE IF EXISTS `chats`;
CREATE TABLE `chats` (
  `ChatID` int(11) NOT NULL AUTO_INCREMENT,
  `ChatName` varchar(45) NOT NULL,
  `ChatPic` varchar(45) DEFAULT NULL,
  `CreatedAt` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`ChatID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `chats` (`ChatID`, `ChatName`, `ChatPic`, `CreatedAt`) VALUES
(1, 'Cuncik', 'Cuncik.png', '0000-00-00 00:00:00'),
(2, 'NotPoopie', 'SteakLover.png', '2025-11-04 11:47:40');

-- --------------------------------------------------------
-- Table: msgs
-- --------------------------------------------------------
DROP TABLE IF EXISTS `msgs`;
CREATE TABLE `msgs` (
  `MsgID` int(11) NOT NULL AUTO_INCREMENT,
  `UserID` int(11) NOT NULL,
  `ChatID` int(11) NOT NULL,
  `Content` text NOT NULL,
  `SentAt` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`MsgID`),
  KEY `fkUsers_idx` (`UserID`),
  KEY `fkChats_idx` (`ChatID`),
  CONSTRAINT `fkChats` FOREIGN KEY (`ChatID`) REFERENCES `chats` (`ChatID`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fkUsers` FOREIGN KEY (`UserID`) REFERENCES `users` (`UserID`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `msgs` (`MsgID`, `UserID`, `ChatID`, `Content`, `SentAt`) VALUES
(2, 4, 1, 'Szeretem a tejet', '2025-11-04 12:06:30'),
(3, 4, 1, 'a kakaót is', '2025-11-04 12:06:47'),
(4, 4, 1, 'hihetetlenül', '2025-11-04 12:06:55');

-- --------------------------------------------------------
-- Table: reviews
-- --------------------------------------------------------
DROP TABLE IF EXISTS `reviews`;
CREATE TABLE `reviews` (
  `ReviewID` int(11) NOT NULL AUTO_INCREMENT,
  `Rating` int(2) NOT NULL,
  `Tartalom` varchar(45) NOT NULL,
  `Reviewer` int(11) DEFAULT NULL,
  `Reviewee` int(11) DEFAULT NULL,
  PRIMARY KEY (`ReviewID`),
  KEY `Reviewer` (`Reviewer`),
  KEY `Reviewee` (`Reviewee`),
  CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`Reviewer`) REFERENCES `users` (`UserID`),
  CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`Reviewee`) REFERENCES `users` (`UserID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table: skills
-- --------------------------------------------------------
DROP TABLE IF EXISTS `skills`;
CREATE TABLE `skills` (
  `SkillID` int(11) NOT NULL AUTO_INCREMENT,
  `Skill` varchar(45) NOT NULL,
  PRIMARY KEY (`SkillID`),
  UNIQUE KEY `Skill_UNIQUE` (`Skill`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `skills` (`SkillID`, `Skill`) VALUES
(2, 'gitár'),
(4, 'magyar'),
(3, 'matek'),
(1, 'zongora');

-- --------------------------------------------------------
-- Table: tickets
-- --------------------------------------------------------
DROP TABLE IF EXISTS `tickets`;
CREATE TABLE `tickets` (
  `TicketID` int(11) NOT NULL AUTO_INCREMENT,
  `UserID` int(11) NOT NULL,
  `Descr` varchar(45) NOT NULL,
  `Text` varchar(45) NOT NULL,
  PRIMARY KEY (`TicketID`),
  KEY `Ufk_idx` (`UserID`),
  CONSTRAINT `Ufk` FOREIGN KEY (`UserID`) REFERENCES `users` (`UserID`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `tickets` (`TicketID`, `UserID`, `Descr`, `Text`) VALUES
(1, 8, 'cannot log in', 'I simply cannot log in');

-- --------------------------------------------------------
-- Table: uac
-- --------------------------------------------------------
DROP TABLE IF EXISTS `uac`;
CREATE TABLE `uac` (
  `UserID` int(11) NOT NULL,
  `ChatID` int(11) NOT NULL,
  `IsChatAdmin` tinyint(4) NOT NULL DEFAULT 0,
  `JoinedAt` datetime NOT NULL,
  PRIMARY KEY (`UserID`,`ChatID`),
  KEY `cfk2_idx` (`ChatID`),
  CONSTRAINT `cfk1` FOREIGN KEY (`UserID`) REFERENCES `users` (`UserID`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `cfk2` FOREIGN KEY (`ChatID`) REFERENCES `chats` (`ChatID`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `uac` (`UserID`, `ChatID`, `IsChatAdmin`, `JoinedAt`) VALUES
(4, 1, 1, '0000-00-00 00:00:00');

-- --------------------------------------------------------
-- Table: uas
-- --------------------------------------------------------
DROP TABLE IF EXISTS `uas`;
CREATE TABLE `uas` (
  `UserID` int(11) NOT NULL,
  `SkillID` int(11) NOT NULL,
  PRIMARY KEY (`UserID`,`SkillID`),
  KEY `fk1_idx` (`SkillID`),
  CONSTRAINT `fk1` FOREIGN KEY (`SkillID`) REFERENCES `skills` (`SkillID`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk2` FOREIGN KEY (`UserID`) REFERENCES `users` (`UserID`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `uas` (`UserID`, `SkillID`) VALUES
(4, 1),
(4, 2),
(4, 4),
(8, 2),
(8, 3),
(9, 4);

SET FOREIGN_KEY_CHECKS=1;
COMMIT;
