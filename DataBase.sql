-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Gép: 127.0.0.1:3307
-- Létrehozás ideje: 2025. Nov 04. 13:25
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
CREATE TABLE `changes` (
  `ChangeID` int(11) NOT NULL,
  `Mit` varchar(45) NOT NULL,
  `Mikor` datetime NOT NULL,
  `UserID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `chats`
--

DROP TABLE IF EXISTS `chats`;
CREATE TABLE `chats` (
  `ChatID` int(11) NOT NULL,
  `ChatName` varchar(45) NOT NULL,
  `ChatPic` varchar(45) DEFAULT NULL,
  `CreatedAt` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
CREATE TABLE `msgs` (
  `MsgID` int(11) NOT NULL,
  `UserID` int(11) NOT NULL,
  `ChatID` int(11) NOT NULL,
  `Content` text NOT NULL,
  `SentAt` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
CREATE TABLE `reviews` (
  `ReviewID` int(11) NOT NULL,
  `Rating` int(2) NOT NULL,
  `Tartalom` varchar(45) NOT NULL,
  `Reviewer` int(11) DEFAULT NULL,
  `Reviewee` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `skills`
--

DROP TABLE IF EXISTS `skills`;
CREATE TABLE `skills` (
  `SkillID` int(11) NOT NULL,
  `Skill` varchar(45) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
CREATE TABLE `tickets` (
  `TicketID` int(11) NOT NULL,
  `UserID` int(11) NOT NULL,
  `Descr` varchar(45) NOT NULL,
  `Text` varchar(45) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
CREATE TABLE `uac` (
  `UserID` int(11) NOT NULL,
  `ChatID` int(11) NOT NULL,
  `IsChatAdmin` tinyint(4) NOT NULL DEFAULT 0,
  `JoinedAt` datetime NOT NULL
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
CREATE TABLE `uas` (
  `UserID` int(11) NOT NULL,
  `SkillID` int(11) NOT NULL
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
CREATE TABLE `users` (
  `UserID` int(11) NOT NULL,
  `Username` varchar(45) NOT NULL,
  `Password` varchar(45) NOT NULL,
  `Email` varchar(45) NOT NULL,
  `Tokens` int(11) NOT NULL DEFAULT 0,
  `rankID` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
CREATE TABLE `user_rank` (
  `rankID` int(11) NOT NULL,
  `which` varchar(45) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `user_rank`
--

INSERT INTO `user_rank` (`rankID`, `which`) VALUES
(0, 'banned'),
(1, 'user'),
(2, 'admin'),
(3, 'owner');

--
-- Indexek a kiírt táblákhoz
--

--
-- A tábla indexei `changes`
--
ALTER TABLE `changes`
  ADD PRIMARY KEY (`ChangeID`),
  ADD KEY `chfk1_idx` (`UserID`);

--
-- A tábla indexei `chats`
--
ALTER TABLE `chats`
  ADD PRIMARY KEY (`ChatID`);

--
-- A tábla indexei `msgs`
--
ALTER TABLE `msgs`
  ADD PRIMARY KEY (`MsgID`),
  ADD KEY `fkUsers_idx` (`UserID`),
  ADD KEY `fkChats_idx` (`ChatID`);

--
-- A tábla indexei `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`ReviewID`),
  ADD KEY `Reviewer` (`Reviewer`),
  ADD KEY `Reviewee` (`Reviewee`);

--
-- A tábla indexei `skills`
--
ALTER TABLE `skills`
  ADD PRIMARY KEY (`SkillID`),
  ADD UNIQUE KEY `Skill_UNIQUE` (`Skill`);

--
-- A tábla indexei `tickets`
--
ALTER TABLE `tickets`
  ADD PRIMARY KEY (`TicketID`),
  ADD KEY `Ufk_idx` (`UserID`);

--
-- A tábla indexei `uac`
--
ALTER TABLE `uac`
  ADD PRIMARY KEY (`UserID`,`ChatID`),
  ADD KEY `cfk2_idx` (`ChatID`);

--
-- A tábla indexei `uas`
--
ALTER TABLE `uas`
  ADD PRIMARY KEY (`UserID`,`SkillID`),
  ADD KEY `fk1_idx` (`SkillID`);

--
-- A tábla indexei `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`UserID`),
  ADD UNIQUE KEY `Username_UNIQUE` (`Username`),
  ADD UNIQUE KEY `Email_UNIQUE` (`Email`),
  ADD KEY `fkRank_idx` (`rankID`);

--
-- A tábla indexei `user_rank`
--
ALTER TABLE `user_rank`
  ADD PRIMARY KEY (`rankID`);

--
-- A kiírt táblák AUTO_INCREMENT értéke
--

--
-- AUTO_INCREMENT a táblához `changes`
--
ALTER TABLE `changes`
  MODIFY `ChangeID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `chats`
--
ALTER TABLE `chats`
  MODIFY `ChatID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT a táblához `msgs`
--
ALTER TABLE `msgs`
  MODIFY `MsgID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT a táblához `reviews`
--
ALTER TABLE `reviews`
  MODIFY `ReviewID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT a táblához `skills`
--
ALTER TABLE `skills`
  MODIFY `SkillID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT a táblához `tickets`
--
ALTER TABLE `tickets`
  MODIFY `TicketID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT a táblához `users`
--
ALTER TABLE `users`
  MODIFY `UserID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

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
  ADD CONSTRAINT `fkChats` FOREIGN KEY (`ChatID`) REFERENCES `chats` (`ChatID`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `fkUsers` FOREIGN KEY (`UserID`) REFERENCES `users` (`UserID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Megkötések a táblához `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`Reviewer`) REFERENCES `users` (`UserID`),
  ADD CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`Reviewee`) REFERENCES `users` (`UserID`);

--
-- Megkötések a táblához `tickets`
--
ALTER TABLE `tickets`
  ADD CONSTRAINT `Ufk` FOREIGN KEY (`UserID`) REFERENCES `users` (`UserID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Megkötések a táblához `uac`
--
ALTER TABLE `uac`
  ADD CONSTRAINT `cfk1` FOREIGN KEY (`UserID`) REFERENCES `users` (`UserID`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `cfk2` FOREIGN KEY (`ChatID`) REFERENCES `chats` (`ChatID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Megkötések a táblához `uas`
--
ALTER TABLE `uas`
  ADD CONSTRAINT `fk1` FOREIGN KEY (`SkillID`) REFERENCES `skills` (`SkillID`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk2` FOREIGN KEY (`UserID`) REFERENCES `users` (`UserID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

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
