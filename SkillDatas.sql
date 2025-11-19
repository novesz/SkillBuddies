-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: skillmegoszt
-- ------------------------------------------------------
-- Server version	5.5.5-10.4.32-MariaDB

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
-- Dumping data for table `changes`
--

LOCK TABLES `changes` WRITE;
/*!40000 ALTER TABLE `changes` DISABLE KEYS */;
/*!40000 ALTER TABLE `changes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `chats`
--

LOCK TABLES `chats` WRITE;
/*!40000 ALTER TABLE `chats` DISABLE KEYS */;
INSERT INTO `chats` VALUES (1,'Cuncik','Cuncik.png','0000-00-00 00:00:00'),(2,'NotPoopie','SteakLover.png','2025-11-04 11:47:40');
/*!40000 ALTER TABLE `chats` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `msgs`
--

LOCK TABLES `msgs` WRITE;
/*!40000 ALTER TABLE `msgs` DISABLE KEYS */;
INSERT INTO `msgs` VALUES (2,4,1,'Szeretem a tejet','2025-11-04 12:06:30'),(3,4,1,'a kakaót is','2025-11-04 12:06:47'),(4,4,1,'hihetetlenül','2025-11-04 12:06:55');
/*!40000 ALTER TABLE `msgs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `skills`
--

LOCK TABLES `skills` WRITE;
/*!40000 ALTER TABLE `skills` DISABLE KEYS */;
INSERT INTO `skills` VALUES (27,'Bootstrap'),(11,'C#'),(17,'C++'),(23,'Crocheting'),(14,'CSS'),(20,'Drums'),(1,'English(A1-A2)'),(2,'English(B1-B2)'),(3,'English(C1-C2)'),(24,'Gardening'),(4,'German(A1-A2)'),(5,'German(B1-B2)'),(6,'German(C1-C2)'),(19,'Guitar'),(13,'HTML'),(7,'Hungarian grammar'),(9,'Hungarian history'),(8,'Hungarian literature'),(16,'Java'),(12,'JavaScript'),(25,'MySQL'),(18,'Piano'),(15,'Python'),(26,'React'),(22,'Singing teacher'),(21,'Violin'),(10,'Writing');
/*!40000 ALTER TABLE `skills` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `tickets`
--

LOCK TABLES `tickets` WRITE;
/*!40000 ALTER TABLE `tickets` DISABLE KEYS */;
INSERT INTO `tickets` VALUES (1,8,'cannot log in','I simply cannot log in');
/*!40000 ALTER TABLE `tickets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `uac`
--

LOCK TABLES `uac` WRITE;
/*!40000 ALTER TABLE `uac` DISABLE KEYS */;
INSERT INTO `uac` VALUES (4,1,1,'0000-00-00 00:00:00');
/*!40000 ALTER TABLE `uac` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `uas`
--

LOCK TABLES `uas` WRITE;
/*!40000 ALTER TABLE `uas` DISABLE KEYS */;
INSERT INTO `uas` VALUES (4,14),(8,1),(8,7),(8,10),(9,22);
/*!40000 ALTER TABLE `uas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `user_rank`
--

LOCK TABLES `user_rank` WRITE;
/*!40000 ALTER TABLE `user_rank` DISABLE KEYS */;
INSERT INTO `user_rank` VALUES (0,'banned'),(1,'user'),(2,'admin'),(3,'owner');
/*!40000 ALTER TABLE `user_rank` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (4,'Pali','Pali','palpal828@hengersor.hu',10000,3),(8,'Eszter','Eszter','novesz831@hengersor.hu',0,3),(9,'Hubi','Hubertusz','szahub608@hengersor.hu',0,3),(10,'random','random','random@example.com',0,0);
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

-- Dump completed on 2025-11-19 10:18:56
