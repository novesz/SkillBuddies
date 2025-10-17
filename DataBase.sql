SET FOREIGN_KEY_CHECKS = 0;
DROP DATABASE IF EXISTS `skillmegoszt`;
CREATE DATABASE  IF NOT EXISTS `skillmegoszt` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */;
USE `skillmegoszt`;
-- MySQL dump 10.13  Distrib 8.0.38, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: skillmegoszt
-- ------------------------------------------------------
-- Server version	5.5.5-10.4.28-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `changes`
--

DROP TABLE IF EXISTS `changes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `changes` (
  `ChangeID` int(11) NOT NULL AUTO_INCREMENT,
  `Mit` varchar(45) NOT NULL,
  `Mikor` datetime NOT NULL,
  `UserID` int(11) NOT NULL,
  PRIMARY KEY (`ChangeID`),
  KEY `chfk1_idx` (`UserID`),
  CONSTRAINT `chfk1` FOREIGN KEY (`UserID`) REFERENCES `users` (`UserID`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `changes`
--

LOCK TABLES `changes` WRITE;
/*!40000 ALTER TABLE `changes` DISABLE KEYS */;
/*!40000 ALTER TABLE `changes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chats`
--

DROP TABLE IF EXISTS `chats`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chats` (
  `ChatID` int(11) NOT NULL AUTO_INCREMENT,
  `ChatName` varchar(45) NOT NULL,
  `ChatPic` varchar(45) DEFAULT NULL,
  `CreatedAt` datetime NOT NULL,
  PRIMARY KEY (`ChatID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chats`
--

LOCK TABLES `chats` WRITE;
/*!40000 ALTER TABLE `chats` DISABLE KEYS */;
/*!40000 ALTER TABLE `chats` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `msgs`
--

DROP TABLE IF EXISTS `msgs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `msgs` (
  `MsgID` int(11) NOT NULL AUTO_INCREMENT,
  `UserID` int(11) NOT NULL,
  `ChatID` int(11) NOT NULL,
  `Content` text NOT NULL,
  `SentAt` datetime NOT NULL,
  PRIMARY KEY (`MsgID`),
  KEY `fkUsers_idx` (`UserID`),
  KEY `fkChats_idx` (`ChatID`),
  CONSTRAINT `fkChats` FOREIGN KEY (`ChatID`) REFERENCES `chats` (`ChatID`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fkUsers` FOREIGN KEY (`UserID`) REFERENCES `users` (`UserID`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `msgs`
--

LOCK TABLES `msgs` WRITE;
/*!40000 ALTER TABLE `msgs` DISABLE KEYS */;
/*!40000 ALTER TABLE `msgs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `ReviewID` int(11) NOT NULL AUTO_INCREMENT,
  `Rating` int(2) NOT NULL,
  `Tartalom` varchar(45) NOT NULL,
  PRIMARY KEY (`ReviewID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `skills`
--

DROP TABLE IF EXISTS `skills`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `skills` (
  `SkillID` int(11) NOT NULL AUTO_INCREMENT,
  `Skill` varchar(45) NOT NULL,
  PRIMARY KEY (`SkillID`),
  UNIQUE KEY `Skill_UNIQUE` (`Skill`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `skills`
--

LOCK TABLES `skills` WRITE;
/*!40000 ALTER TABLE `skills` DISABLE KEYS */;
/*!40000 ALTER TABLE `skills` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tickets`
--

DROP TABLE IF EXISTS `tickets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tickets` (
  `TicketID` int(11) NOT NULL AUTO_INCREMENT,
  `UserID` int(11) NOT NULL,
  `Desc` varchar(45) NOT NULL,
  `Text` varchar(45) NOT NULL,
  PRIMARY KEY (`TicketID`),
  KEY `Ufk_idx` (`UserID`),
  CONSTRAINT `Ufk` FOREIGN KEY (`UserID`) REFERENCES `users` (`UserID`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tickets`
--

LOCK TABLES `tickets` WRITE;
/*!40000 ALTER TABLE `tickets` DISABLE KEYS */;
/*!40000 ALTER TABLE `tickets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `uac`
--

DROP TABLE IF EXISTS `uac`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `uac`
--

LOCK TABLES `uac` WRITE;
/*!40000 ALTER TABLE `uac` DISABLE KEYS */;
/*!40000 ALTER TABLE `uac` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `uar`
--

DROP TABLE IF EXISTS `uar`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `uar` (
  `UserID` int(11) NOT NULL,
  `ReviewID` int(11) NOT NULL,
  PRIMARY KEY (`UserID`,`ReviewID`),
  KEY `ReviewFk_idx` (`ReviewID`),
  CONSTRAINT `ReviewFk` FOREIGN KEY (`ReviewID`) REFERENCES `reviews` (`ReviewID`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `UserFk` FOREIGN KEY (`UserID`) REFERENCES `users` (`UserID`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `uar`
--

LOCK TABLES `uar` WRITE;
/*!40000 ALTER TABLE `uar` DISABLE KEYS */;
/*!40000 ALTER TABLE `uar` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `uas`
--

DROP TABLE IF EXISTS `uas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `uas` (
  `UserID` int(11) NOT NULL,
  `SkillID` int(11) NOT NULL,
  PRIMARY KEY (`UserID`,`SkillID`),
  KEY `fk1_idx` (`SkillID`),
  CONSTRAINT `fk1` FOREIGN KEY (`SkillID`) REFERENCES `skills` (`SkillID`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk2` FOREIGN KEY (`UserID`) REFERENCES `users` (`UserID`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `uas`
--

LOCK TABLES `uas` WRITE;
/*!40000 ALTER TABLE `uas` DISABLE KEYS */;
/*!40000 ALTER TABLE `uas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_rank`
--

DROP TABLE IF EXISTS `user_rank`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_rank` (
  `rankID` int(11) NOT NULL,
  `which` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`rankID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_rank`
--

LOCK TABLES `user_rank` WRITE;
/*!40000 ALTER TABLE `user_rank` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_rank` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `UserID` int(11) NOT NULL AUTO_INCREMENT,
  `Username` varchar(45) NOT NULL,
  `Password` varchar(45) NOT NULL,
  `Email` varchar(45) NOT NULL,
  `Tokens` int(11) NOT NULL DEFAULT 0,
  `rankID` int(11) NOT NULL,
  PRIMARY KEY (`UserID`),
  UNIQUE KEY `Username_UNIQUE` (`Username`),
  UNIQUE KEY `Email_UNIQUE` (`Email`),
  KEY `fkRank_idx` (`rankID`),
  CONSTRAINT `fkRank` FOREIGN KEY (`rankID`) REFERENCES `user_rank` (`rankID`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-17  8:29:18
SET FOREIGN_KEY_CHECKS = 1;