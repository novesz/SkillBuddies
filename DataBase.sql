-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3307
-- Generation Time: 2025-11-11 09:36
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET FOREIGN_KEY_CHECKS=0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

CREATE DATABASE IF NOT EXISTS `skillmegoszt`
  DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `skillmegoszt`;

-- --------------------------------------------------------
-- Table structure for `user_rank`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `user_rank`;
CREATE TABLE `user_rank` (
  `rankID` INT(11) NOT NULL AUTO_INCREMENT,
  `which` VARCHAR(45) DEFAULT NULL,
  PRIMARY KEY (`rankID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `user_rank` (`rankID`, `which`) VALUES
(0, 'banned'),
(1, 'user'),
(2, 'admin'),
(3, 'owner');

-- --------------------------------------------------------
-- Table structure for `users`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `UserID` INT(11) NOT NULL AUTO_INCREMENT,
  `Username` VARCHAR(45) NOT NULL UNIQUE,
  `Password` VARCHAR(45) NOT NULL,
  `Email` VARCHAR(45) NOT NULL UNIQUE,
  `Tokens` INT(11) NOT NULL DEFAULT 0,
  `rankID` INT(11) NOT NULL DEFAULT 1,
  PRIMARY KEY (`UserID`),
  KEY `fkRank_idx` (`rankID`),
  CONSTRAINT `fkRank` FOREIGN KEY (`rankID`) REFERENCES `user_rank` (`rankID`)
    ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `users` (`UserID`, `Username`, `Password`, `Email`, `Tokens`, `rankID`) VALUES
(4, 'Pali', 'Pali', 'palpal828@hengersor.hu', 10000, 3),
(8, 'Eszter', 'Eszter', 'novesz831@hengersor.hu', 0, 3),
(9, 'Hubi', 'Hubertusz', 'szahub608@hengersor.hu', 0, 3),
(10, 'random', 'random', 'random@example.com', 0, 0);

-- --------------------------------------------------------
-- Table structure for `changes`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `changes`;
CREATE TABLE `changes` (
  `ChangeID` INT(11) NOT NULL AUTO_INCREMENT,
  `What` VARCHAR(45) NOT NULL,
  `When` DATETIME NOT NULL,
  `UserID` INT(11) NOT NULL,
  PRIMARY KEY (`ChangeID`),
  KEY `chfk1_idx` (`UserID`),
  CONSTRAINT `chfk1` FOREIGN KEY (`UserID`) REFERENCES `users` (`UserID`)
    ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for `chats`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `chats`;
CREATE TABLE `chats` (
  `ChatID` INT(11) NOT NULL AUTO_INCREMENT,
  `ChatName` VARCHAR(45) NOT NULL,
  `ChatPic` VARCHAR(45) DEFAULT NULL,
  `CreatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ChatID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `chats` (`ChatID`, `ChatName`, `ChatPic`, `CreatedAt`) VALUES
(1, 'Cuncik', 'Cuncik.png', '2025-01-01 00:00:00'),
(2, 'NotPoopie', 'SteakLover.png', '2025-11-04 11:47:40');

-- --------------------------------------------------------
-- Table structure for `msgs`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `msgs`;
CREATE TABLE `msgs` (
  `MsgID` INT(11) NOT NULL AUTO_INCREMENT,
  `UserID` INT(11) NOT NULL,
  `ChatID` INT(11) NOT NULL,
  `Content` TEXT NOT NULL,
  `SentAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`MsgID`),
  KEY `fkUsers_idx` (`UserID`),
  KEY `fkChats_idx` (`ChatID`),
  CONSTRAINT `msgs_fk_chat` FOREIGN KEY (`ChatID`) REFERENCES `chats` (`ChatID`)
    ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `msgs_fk_user` FOREIGN KEY (`UserID`) REFERENCES `users` (`UserID`)
    ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `msgs` (`MsgID`, `UserID`, `ChatID`, `Content`, `SentAt`) VALUES
(2, 4, 1, 'Szeretem a tejet', '2025-11-04 12:06:30'),
(3, 4, 1, 'a kakaót is', '2025-11-04 12:06:47'),
(4, 4, 1, 'hihetetlenül', '2025-11-04 12:06:55');

-- --------------------------------------------------------
-- Table structure for `reviews`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `reviews`;
CREATE TABLE `reviews` (
  `Reviewer` INT(11) NOT NULL,
  `Reviewee` INT(11) NOT NULL,
  `Rating` INT(1) DEFAULT NULL,
  `Tartalom` VARCHAR(200) DEFAULT NULL,
  `IsResolved` TINYINT(1) DEFAULT NULL,
  PRIMARY KEY (`Reviewer`, `Reviewee`),
  KEY `Reviewee` (`Reviewee`),
  CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`Reviewer`) REFERENCES `users` (`UserID`)
    ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`Reviewee`) REFERENCES `users` (`UserID`)
    ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `reviews` (`Reviewer`, `Reviewee`, `Rating`, `Tartalom`, `IsResolved`) VALUES
(4, 9, 4, 'Good guy', NULL);

-- --------------------------------------------------------
-- Table structure for `skills`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `skills`;
CREATE TABLE `skills` (
  `SkillID` INT(11) NOT NULL AUTO_INCREMENT,
  `Skill` VARCHAR(45) NOT NULL UNIQUE,
  PRIMARY KEY (`SkillID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `skills` (`SkillID`, `Skill`) VALUES
(1, 'zongora'),
(2, 'gitár'),
(3, 'matek'),
(4, 'magyar');

-- --------------------------------------------------------
-- Table structure for `tickets`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `tickets`;
CREATE TABLE `tickets` (
  `TicketID` INT(11) NOT NULL AUTO_INCREMENT,
  `Email` VARCHAR(50) DEFAULT NULL,
  `Text` VARCHAR(45) NOT NULL,
  `IsResolved` TINYINT(1) DEFAULT 0,
  `SentAt` DATE NOT NULL DEFAULT (CURRENT_DATE),
  PRIMARY KEY (`TicketID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for `uac`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `uac`;
CREATE TABLE `uac` (
  `UserID` INT(11) NOT NULL,
  `ChatID` INT(11) NOT NULL,
  `IsChatAdmin` TINYINT(1) NOT NULL DEFAULT 0,
  `JoinedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`UserID`, `ChatID`),
  KEY `cfk2_idx` (`ChatID`),
  CONSTRAINT `uac_fk_chat` FOREIGN KEY (`ChatID`) REFERENCES `chats` (`ChatID`)
    ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `uac_fk_user` FOREIGN KEY (`UserID`) REFERENCES `users` (`UserID`)
    ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `uac` (`UserID`, `ChatID`, `IsChatAdmin`, `JoinedAt`) VALUES
(4, 1, 1, '2025-01-01 00:00:00');

-- --------------------------------------------------------
-- Table structure for `uas`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `uas`;
CREATE TABLE `uas` (
  `UserID` INT(11) NOT NULL,
  `SkillID` INT(11) NOT NULL,
  PRIMARY KEY (`UserID`, `SkillID`),
  KEY `fk1_idx` (`SkillID`),
  CONSTRAINT `uas_fk_skill` FOREIGN KEY (`SkillID`) REFERENCES `skills` (`SkillID`)
    ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `uas_fk_user` FOREIGN KEY (`UserID`) REFERENCES `users` (`UserID`)
    ON DELETE NO ACTION ON UPDATE NO ACTION
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
