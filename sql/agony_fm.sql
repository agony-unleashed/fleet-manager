-- phpMyAdmin SQL Dump
-- version 3.4.1
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Nov 23, 2011 at 09:38 AM
-- Server version: 5.0.77
-- PHP Version: 5.2.11

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `agony_fm`
--

-- --------------------------------------------------------

--
-- Table structure for table `fleetComposition`
--

CREATE TABLE IF NOT EXISTS `fleetComposition` (
  `id` int(6) NOT NULL auto_increment,
  `fleetId` int(11) default NULL,
  `pilot` varchar(40) collate utf8_bin default NULL,
  `shipName` varchar(40) collate utf8_bin default NULL,
  `shipType` varchar(40) collate utf8_bin default NULL,
  `shipDNA` varchar(512) collate utf8_bin default NULL,
  `scrams` int(11) default NULL,
  `points` int(11) default NULL,
  `webs` int(11) default NULL,
  `caldECM` int(11) default NULL,
  `minmECM` int(11) default NULL,
  `amarECM` int(11) default NULL,
  `galeECM` int(11) default NULL,
  `multECM` int(11) default NULL,
  `damps` int(11) default NULL,
  `paints` int(11) default NULL,
  `tracks` int(11) default NULL,
  `neuts` int(11) default NULL,
  `rshield` int(11) default NULL,
  `rcap` int(11) default NULL,
  `rarmor` int(11) default NULL,
  `rhull` int(11) default NULL,
  `scanner` int(11) default NULL,
  `dps` int(11) default NULL,
  `trackGroup` int(11) default NULL,
  `dampGroup` int(11) default NULL,
  PRIMARY KEY  (`id`),
  UNIQUE KEY `id` (`id`),
  KEY `fleetId` (`fleetId`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 COLLATE=utf8_bin AUTO_INCREMENT=2290 ;

-- --------------------------------------------------------

--
-- Table structure for table `fleets`
--

CREATE TABLE IF NOT EXISTS `fleets` (
  `id` int(6) NOT NULL auto_increment,
  `fleetOwner` varchar(40) collate utf8_bin default NULL,
  `fleetXO` varchar(40) collate utf8_bin default NULL,
  `createdOn` datetime default NULL,
  `about` text collate utf8_bin,
  `memberCount` int(6) default NULL,
  `isPublic` int(6) default '0',
  `description` text collate utf8_bin,
  PRIMARY KEY  (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 COLLATE=utf8_bin AUTO_INCREMENT=100 ;

-- --------------------------------------------------------

--
-- Table structure for table `itemList`
--

CREATE TABLE IF NOT EXISTS `itemList` (
  `id` int(6) NOT NULL auto_increment,
  `itemId` int(11) default NULL,
  `groupId` int(11) default NULL,
  `name` text collate utf8_bin,
  `subGroup` varchar(40) collate utf8_bin default NULL,
  PRIMARY KEY  (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 COLLATE=utf8_bin AUTO_INCREMENT=1453 ;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
