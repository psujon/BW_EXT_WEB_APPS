-- ========================================================
-- GARMENTS DASHBOARD COMPLETE MYSQL DATABASE BACKUP
-- Database: garments_db
-- Created At: 11/21/2026, 5:26:07 PM
-- Trigger Source: Auto Backup Test
-- Total Tables Exported: 16
-- Includes: DATABASE, TABLE STRUCTURE (DDL) & DATA
-- ========================================================

CREATE DATABASE IF NOT EXISTS `garments_db` DEFAULT CHARACTER SET utf8mb4;
USE `garments_db`;

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";

-- --------------------------------------------------------
-- Table structure & data for table `backup_history`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `backup_history`;
CREATE TABLE `backup_history` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `backup_name` varchar(255) NOT NULL,
  `backup_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` varchar(20) NOT NULL DEFAULT 'Success',
  `file_size` varchar(50) DEFAULT NULL,
  `processed_by` int(11) DEFAULT NULL,
  `processed_date` datetime(3) DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `backup_history` (1 records)
INSERT INTO `backup_history` (`id`, `backup_name`, `backup_date`, `status`, `file_size`, `processed_by`, `processed_date`) VALUES (1, 'garments_db_full_backup_2026-11-20_05-53-34.sql', '2026-11-20 05:53:34', 'Success', '38.4 KB', 2, '2026-11-20 05:53:34');

-- --------------------------------------------------------
-- Table structure & data for table `buyer_orders`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `buyer_orders`;
CREATE TABLE `buyer_orders` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `section_id` int(11) NOT NULL,
  `buyer_id` int(11) NOT NULL,
  `style_id` int(11) NOT NULL,
  `process_id` int(11) NOT NULL,
  `color_id` int(11) NOT NULL,
  `order_quantity` int(11) NOT NULL,
  `yarn_received` int(11) NOT NULL DEFAULT 0,
  `processed_by` int(11) DEFAULT NULL,
  `processed_date` datetime(3) DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `buyer_orders_section_id_fkey` (`section_id`),
  KEY `buyer_orders_buyer_id_fkey` (`buyer_id`),
  KEY `buyer_orders_style_id_fkey` (`style_id`),
  KEY `buyer_orders_process_id_fkey` (`process_id`),
  KEY `buyer_orders_color_id_fkey` (`color_id`),
  CONSTRAINT `buyer_orders_buyer_id_fkey` FOREIGN KEY (`buyer_id`) REFERENCES `buyers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `buyer_orders_color_id_fkey` FOREIGN KEY (`color_id`) REFERENCES `colors` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `buyer_orders_process_id_fkey` FOREIGN KEY (`process_id`) REFERENCES `processes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `buyer_orders_section_id_fkey` FOREIGN KEY (`section_id`) REFERENCES `sections` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `buyer_orders_style_id_fkey` FOREIGN KEY (`style_id`) REFERENCES `styles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure & data for table `buyers`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `buyers`;
CREATE TABLE `buyers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `country` varchar(100) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `processed_by` int(11) DEFAULT NULL,
  `processed_date` datetime(3) DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `buyers` (1 records)
INSERT INTO `buyers` (`id`, `name`, `country`, `email`, `phone`, `processed_by`, `processed_date`) VALUES (1, 'BEST WOOL SWEATERS LTD.', 'BANGLADESH', 'info@bestwoolbd.net', '+880', 1, '2026-11-17 09:21:55');

-- --------------------------------------------------------
-- Table structure & data for table `colors`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `colors`;
CREATE TABLE `colors` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `section_id` int(11) NOT NULL,
  `style_id` int(11) NOT NULL,
  `process_id` int(11) NOT NULL,
  `color_name` varchar(100) NOT NULL,
  `processed_by` int(11) DEFAULT NULL,
  `processed_date` datetime(3) DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `colors_section_id_fkey` (`section_id`),
  KEY `colors_style_id_fkey` (`style_id`),
  KEY `colors_process_id_fkey` (`process_id`),
  CONSTRAINT `colors_process_id_fkey` FOREIGN KEY (`process_id`) REFERENCES `processes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `colors_section_id_fkey` FOREIGN KEY (`section_id`) REFERENCES `sections` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `colors_style_id_fkey` FOREIGN KEY (`style_id`) REFERENCES `styles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=49 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `colors` (47 records)
INSERT INTO `colors` (`id`, `section_id`, `style_id`, `process_id`, `color_name`, `processed_by`, `processed_date`) VALUES (1, 1, 1, 12, 'ALL', 1, '2026-11-17 09:30:25');
INSERT INTO `colors` (`id`, `section_id`, `style_id`, `process_id`, `color_name`, `processed_by`, `processed_date`) VALUES (2, 1, 3, 10, 'ALL', 1, '2026-11-17 09:34:56');
INSERT INTO `colors` (`id`, `section_id`, `style_id`, `process_id`, `color_name`, `processed_by`, `processed_date`) VALUES (3, 1, 2, 11, 'ALL', 1, '2026-11-17 09:35:06');
INSERT INTO `colors` (`id`, `section_id`, `style_id`, `process_id`, `color_name`, `processed_by`, `processed_date`) VALUES (4, 1, 4, 13, 'ALL', 1, '2026-11-17 09:35:42');
INSERT INTO `colors` (`id`, `section_id`, `style_id`, `process_id`, `color_name`, `processed_by`, `processed_date`) VALUES (5, 1, 5, 9, 'ALL', 1, '2026-11-17 09:39:01');
INSERT INTO `colors` (`id`, `section_id`, `style_id`, `process_id`, `color_name`, `processed_by`, `processed_date`) VALUES (7, 1, 7, 7, 'ALL', 1, '2026-11-17 09:39:29');
INSERT INTO `colors` (`id`, `section_id`, `style_id`, `process_id`, `color_name`, `processed_by`, `processed_date`) VALUES (8, 1, 8, 6, 'ALL', 1, '2026-11-17 09:39:43');
INSERT INTO `colors` (`id`, `section_id`, `style_id`, `process_id`, `color_name`, `processed_by`, `processed_date`) VALUES (9, 2, 9, 5, 'ALABASTER GREEN', 1, '2026-11-17 09:40:00');
INSERT INTO `colors` (`id`, `section_id`, `style_id`, `process_id`, `color_name`, `processed_by`, `processed_date`) VALUES (10, 2, 9, 5, 'NAVY BLAZER', 1, '2026-11-17 09:40:13');
INSERT INTO `colors` (`id`, `section_id`, `style_id`, `process_id`, `color_name`, `processed_by`, `processed_date`) VALUES (11, 2, 9, 5, 'SNOW WHITE', 1, '2026-11-17 09:40:27');
INSERT INTO `colors` (`id`, `section_id`, `style_id`, `process_id`, `color_name`, `processed_by`, `processed_date`) VALUES (12, 2, 10, 4, 'BROWN IRON', 1, '2026-11-17 09:40:40');
INSERT INTO `colors` (`id`, `section_id`, `style_id`, `process_id`, `color_name`, `processed_by`, `processed_date`) VALUES (13, 2, 10, 4, 'GREY MIDIUM', 1, '2026-11-17 09:40:51');
INSERT INTO `colors` (`id`, `section_id`, `style_id`, `process_id`, `color_name`, `processed_by`, `processed_date`) VALUES (14, 2, 11, 3, 'BLACK', 1, '2026-11-17 09:41:38');
INSERT INTO `colors` (`id`, `section_id`, `style_id`, `process_id`, `color_name`, `processed_by`, `processed_date`) VALUES (15, 2, 11, 3, 'CLOUD DANCHER', 1, '2026-11-17 09:41:49');
INSERT INTO `colors` (`id`, `section_id`, `style_id`, `process_id`, `color_name`, `processed_by`, `processed_date`) VALUES (16, 2, 12, 2, 'EGRET', 1, '2026-11-17 09:42:07');
INSERT INTO `colors` (`id`, `section_id`, `style_id`, `process_id`, `color_name`, `processed_by`, `processed_date`) VALUES (17, 2, 12, 2, 'DOUBLE CREAM', 1, '2026-11-17 09:42:19');
INSERT INTO `colors` (`id`, `section_id`, `style_id`, `process_id`, `color_name`, `processed_by`, `processed_date`) VALUES (18, 2, 12, 2, 'MOLE', 1, '2026-11-17 09:42:29');
INSERT INTO `colors` (`id`, `section_id`, `style_id`, `process_id`, `color_name`, `processed_by`, `processed_date`) VALUES (19, 2, 12, 2, 'BLACK', 1, '2026-11-17 09:42:43');
INSERT INTO `colors` (`id`, `section_id`, `style_id`, `process_id`, `color_name`, `processed_by`, `processed_date`) VALUES (20, 2, 13, 1, 'LT BEIGE', 1, '2026-11-17 09:42:58');
INSERT INTO `colors` (`id`, `section_id`, `style_id`, `process_id`, `color_name`, `processed_by`, `processed_date`) VALUES (21, 1, 14, 14, 'ALL', 1, '2026-11-21 04:04:32');
INSERT INTO `colors` (`id`, `section_id`, `style_id`, `process_id`, `color_name`, `processed_by`, `processed_date`) VALUES (22, 1, 15, 15, 'ALL', 1, '2026-11-21 04:04:41');
INSERT INTO `colors` (`id`, `section_id`, `style_id`, `process_id`, `color_name`, `processed_by`, `processed_date`) VALUES (23, 2, 28, 28, 'NIGHT SKY', 1, '2026-11-21 04:08:43');
INSERT INTO `colors` (`id`, `section_id`, `style_id`, `process_id`, `color_name`, `processed_by`, `processed_date`) VALUES (24, 2, 28, 28, 'MARSHMELLOW', 1, '2026-11-21 04:08:55');
INSERT INTO `colors` (`id`, `section_id`, `style_id`, `process_id`, `color_name`, `processed_by`, `processed_date`) VALUES (25, 2, 28, 28, 'DOUBLE CREAM', 1, '2026-11-21 04:09:07');
INSERT INTO `colors` (`id`, `section_id`, `style_id`, `process_id`, `color_name`, `processed_by`, `processed_date`) VALUES (26, 2, 28, 28, 'DARK OLIVE', 1, '2026-11-21 04:09:19');
INSERT INTO `colors` (`id`, `section_id`, `style_id`, `process_id`, `color_name`, `processed_by`, `processed_date`) VALUES (27, 2, 29, 29, 'NIGHT SKY', 1, '2026-11-21 04:09:30');
INSERT INTO `colors` (`id`, `section_id`, `style_id`, `process_id`, `color_name`, `processed_by`, `processed_date`) VALUES (28, 2, 29, 29, 'OTSTER GREY', 1, '2026-11-21 04:09:40');
INSERT INTO `colors` (`id`, `section_id`, `style_id`, `process_id`, `color_name`, `processed_by`, `processed_date`) VALUES (29, 2, 29, 29, 'MARTINI', 1, '2026-11-21 04:09:48');
INSERT INTO `colors` (`id`, `section_id`, `style_id`, `process_id`, `color_name`, `processed_by`, `processed_date`) VALUES (30, 2, 29, 29, 'GRANADA SKY', 1, '2026-11-21 04:10:04');
INSERT INTO `colors` (`id`, `section_id`, `style_id`, `process_id`, `color_name`, `processed_by`, `processed_date`) VALUES (31, 1, 16, 16, 'ALL', 1, '2026-11-21 04:12:08');
INSERT INTO `colors` (`id`, `section_id`, `style_id`, `process_id`, `color_name`, `processed_by`, `processed_date`) VALUES (32, 1, 17, 17, 'ALL', 1, '2026-11-21 04:12:19');
INSERT INTO `colors` (`id`, `section_id`, `style_id`, `process_id`, `color_name`, `processed_by`, `processed_date`) VALUES (33, 1, 18, 18, 'ALL', 1, '2026-11-21 04:12:29');
INSERT INTO `colors` (`id`, `section_id`, `style_id`, `process_id`, `color_name`, `processed_by`, `processed_date`) VALUES (34, 1, 19, 19, 'ALL', 1, '2026-11-21 04:12:38');
INSERT INTO `colors` (`id`, `section_id`, `style_id`, `process_id`, `color_name`, `processed_by`, `processed_date`) VALUES (35, 1, 20, 20, 'ALL', 1, '2026-11-21 04:12:49');
INSERT INTO `colors` (`id`, `section_id`, `style_id`, `process_id`, `color_name`, `processed_by`, `processed_date`) VALUES (36, 1, 21, 21, 'ALL', 1, '2026-11-21 04:12:59');
INSERT INTO `colors` (`id`, `section_id`, `style_id`, `process_id`, `color_name`, `processed_by`, `processed_date`) VALUES (37, 1, 22, 22, 'ALL', 1, '2026-11-21 04:13:15');
INSERT INTO `colors` (`id`, `section_id`, `style_id`, `process_id`, `color_name`, `processed_by`, `processed_date`) VALUES (38, 1, 23, 23, 'ALL', 1, '2026-11-21 04:13:24');
INSERT INTO `colors` (`id`, `section_id`, `style_id`, `process_id`, `color_name`, `processed_by`, `processed_date`) VALUES (39, 1, 24, 24, 'ALL', 1, '2026-11-21 04:13:35');
INSERT INTO `colors` (`id`, `section_id`, `style_id`, `process_id`, `color_name`, `processed_by`, `processed_date`) VALUES (40, 1, 25, 25, 'ALL', 1, '2026-11-21 04:13:45');
INSERT INTO `colors` (`id`, `section_id`, `style_id`, `process_id`, `color_name`, `processed_by`, `processed_date`) VALUES (41, 1, 26, 26, 'ALL', 1, '2026-11-21 04:13:59');
INSERT INTO `colors` (`id`, `section_id`, `style_id`, `process_id`, `color_name`, `processed_by`, `processed_date`) VALUES (42, 1, 27, 27, 'ALL', 1, '2026-11-21 04:14:17');
INSERT INTO `colors` (`id`, `section_id`, `style_id`, `process_id`, `color_name`, `processed_by`, `processed_date`) VALUES (43, 1, 30, 30, 'ALL', 2, '2026-11-21 04:59:59');
INSERT INTO `colors` (`id`, `section_id`, `style_id`, `process_id`, `color_name`, `processed_by`, `processed_date`) VALUES (44, 1, 28, 31, 'ALL', 2, '2026-11-21 05:06:22');
INSERT INTO `colors` (`id`, `section_id`, `style_id`, `process_id`, `color_name`, `processed_by`, `processed_date`) VALUES (45, 1, 10, 32, 'ALL', 2, '2026-11-21 05:14:10');
INSERT INTO `colors` (`id`, `section_id`, `style_id`, `process_id`, `color_name`, `processed_by`, `processed_date`) VALUES (46, 1, 31, 33, 'ALL', 2, '2026-11-21 05:16:41');
INSERT INTO `colors` (`id`, `section_id`, `style_id`, `process_id`, `color_name`, `processed_by`, `processed_date`) VALUES (47, 1, 32, 34, 'ALL', 2, '2026-11-21 05:20:41');
INSERT INTO `colors` (`id`, `section_id`, `style_id`, `process_id`, `color_name`, `processed_by`, `processed_date`) VALUES (48, 1, 33, 35, 'ALL', 2, '2026-11-21 06:11:34');

-- --------------------------------------------------------
-- Table structure & data for table `company_profiles`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `company_profiles`;
CREATE TABLE `company_profiles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `company_name` varchar(150) NOT NULL,
  `tagline` varchar(255) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `website` varchar(100) DEFAULT NULL,
  `tax_id` varchar(100) DEFAULT NULL,
  `logo_url` longtext DEFAULT NULL,
  `processed_by` int(11) DEFAULT NULL,
  `processed_date` datetime(3) DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `company_profiles` (1 records)
INSERT INTO `company_profiles` (`id`, `company_name`, `tagline`, `email`, `phone`, `address`, `website`, `tax_id`, `logo_url`, `processed_by`, `processed_date`) VALUES (1, 'BEST WOOL SWEATERS LTD.', '', 'info@bestwoolbd.net', '', 'Surabari, Kashimpur, Gazipur.', 'https://bestwoolbd.net', '', '', 1, '2026-11-18 06:28:23');

-- --------------------------------------------------------
-- Table structure & data for table `employees`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `employees`;
CREATE TABLE `employees` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `card_no` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `designation` varchar(100) NOT NULL,
  `join_date` date NOT NULL,
  `section_id` int(11) NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'Active',
  `processed_by` int(11) DEFAULT NULL,
  `processed_date` datetime(3) DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `employees_section_id_fkey` (`section_id`),
  CONSTRAINT `employees_section_id_fkey` FOREIGN KEY (`section_id`) REFERENCES `sections` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `employees` (28 records)
INSERT INTO `employees` (`id`, `card_no`, `name`, `designation`, `join_date`, `section_id`, `status`, `processed_by`, `processed_date`) VALUES (1, 'BH10031', 'Mst. Shilpi Begum', 'Jr. Operator', '2025-09-01 00:00:00', 2, 'Active', 1, '2026-11-18 05:45:19');
INSERT INTO `employees` (`id`, `card_no`, `name`, `designation`, `join_date`, `section_id`, `status`, `processed_by`, `processed_date`) VALUES (2, 'BH10040', 'Mst. Selina Parvin', 'Jr. Operator', '2025-09-01 00:00:00', 2, 'Active', 1, '2026-11-18 06:01:15');
INSERT INTO `employees` (`id`, `card_no`, `name`, `designation`, `join_date`, `section_id`, `status`, `processed_by`, `processed_date`) VALUES (3, 'BH10061', 'Sheuli Aktar', 'Jr. Operator', '2025-09-01 00:00:00', 2, 'Active', 1, '2026-11-18 06:19:34');
INSERT INTO `employees` (`id`, `card_no`, `name`, `designation`, `join_date`, `section_id`, `status`, `processed_by`, `processed_date`) VALUES (4, 'BH10091', 'Mst. Karima', 'Jr. Operator', '2025-09-01 00:00:00', 2, 'Active', 1, '2026-11-18 06:19:43');
INSERT INTO `employees` (`id`, `card_no`, `name`, `designation`, `join_date`, `section_id`, `status`, `processed_by`, `processed_date`) VALUES (5, 'BH10164', 'Mst. Tanzila Begum', 'Jr. Operator', '2025-09-01 00:00:00', 2, 'Active', 1, '2026-11-18 06:19:55');
INSERT INTO `employees` (`id`, `card_no`, `name`, `designation`, `join_date`, `section_id`, `status`, `processed_by`, `processed_date`) VALUES (6, 'BH10482', 'Mst. Champa Khatun', 'Jr. Operator', '2025-12-09 00:00:00', 2, 'Active', 1, '2026-11-18 06:20:48');
INSERT INTO `employees` (`id`, `card_no`, `name`, `designation`, `join_date`, `section_id`, `status`, `processed_by`, `processed_date`) VALUES (7, 'BH10483', 'Mst. Najema Khatun', 'Jr. Operator', '2025-12-09 00:00:00', 2, 'Active', 1, '2026-11-18 06:20:59');
INSERT INTO `employees` (`id`, `card_no`, `name`, `designation`, `join_date`, `section_id`, `status`, `processed_by`, `processed_date`) VALUES (8, 'BH10498', 'Roksena', 'Jr. Operator', '2025-12-17 00:00:00', 2, 'Active', 1, '2026-11-18 06:21:13');
INSERT INTO `employees` (`id`, `card_no`, `name`, `designation`, `join_date`, `section_id`, `status`, `processed_by`, `processed_date`) VALUES (9, 'BH10530', 'Mst. Kaulpana', 'Jr. Operator', '2026-01-06 00:00:00', 2, 'Active', 1, '2026-11-18 06:21:22');
INSERT INTO `employees` (`id`, `card_no`, `name`, `designation`, `join_date`, `section_id`, `status`, `processed_by`, `processed_date`) VALUES (10, 'BH10707', 'Mst. Rogina', 'Jr. Operator', '2026-05-04 00:00:00', 2, 'Active', 1, '2026-11-18 06:21:38');
INSERT INTO `employees` (`id`, `card_no`, `name`, `designation`, `join_date`, `section_id`, `status`, `processed_by`, `processed_date`) VALUES (11, 'BH10055', 'Mst. Robila Khatun', 'Jr. Operator', '2025-09-01 00:00:00', 1, 'Active', 1, '2026-11-18 06:24:42');
INSERT INTO `employees` (`id`, `card_no`, `name`, `designation`, `join_date`, `section_id`, `status`, `processed_by`, `processed_date`) VALUES (12, 'BH10140', 'Mst. Rabina Akther Bina', 'Jr. Operator', '2025-09-01 00:00:00', 1, 'Active', 1, '2026-11-18 06:24:49');
INSERT INTO `employees` (`id`, `card_no`, `name`, `designation`, `join_date`, `section_id`, `status`, `processed_by`, `processed_date`) VALUES (13, 'BH10262', 'Mst. Sharmin Akter', 'Jr. Operator', '2025-09-01 00:00:00', 1, 'Active', 1, '2026-11-18 06:25:03');
INSERT INTO `employees` (`id`, `card_no`, `name`, `designation`, `join_date`, `section_id`, `status`, `processed_by`, `processed_date`) VALUES (14, 'BH10290', 'Dulu Begum', 'Jr. Operator', '2025-09-01 00:00:00', 1, 'Active', 1, '2026-11-18 06:25:08');
INSERT INTO `employees` (`id`, `card_no`, `name`, `designation`, `join_date`, `section_id`, `status`, `processed_by`, `processed_date`) VALUES (15, 'BH10291', 'Mst. Asneara Begum', 'Jr. Operator', '2025-09-01 00:00:00', 1, 'Active', 1, '2026-11-18 06:25:12');
INSERT INTO `employees` (`id`, `card_no`, `name`, `designation`, `join_date`, `section_id`, `status`, `processed_by`, `processed_date`) VALUES (16, 'BH10313', 'Mst. Reshma Begum', 'Jr. Operator', '2025-09-01 00:00:00', 1, 'Active', 1, '2026-11-18 06:25:21');
INSERT INTO `employees` (`id`, `card_no`, `name`, `designation`, `join_date`, `section_id`, `status`, `processed_by`, `processed_date`) VALUES (17, 'BH10324', 'Mst. Rubina Aktar', 'Jr. Operator', '2025-09-01 00:00:00', 1, 'Active', 1, '2026-11-18 06:25:30');
INSERT INTO `employees` (`id`, `card_no`, `name`, `designation`, `join_date`, `section_id`, `status`, `processed_by`, `processed_date`) VALUES (18, 'BH10338', 'Jesmin Akter', 'Jr. Operator', '2025-09-01 00:00:00', 1, 'Active', 1, '2026-11-18 06:25:39');
INSERT INTO `employees` (`id`, `card_no`, `name`, `designation`, `join_date`, `section_id`, `status`, `processed_by`, `processed_date`) VALUES (19, 'BH10480', 'Nargis Akter', 'Jr. Operator', '2025-12-09 00:00:00', 1, 'Active', 1, '2026-11-18 06:25:48');
INSERT INTO `employees` (`id`, `card_no`, `name`, `designation`, `join_date`, `section_id`, `status`, `processed_by`, `processed_date`) VALUES (20, 'BH10481', 'Mst. Summa Khatun', 'Jr. Operator', '2025-12-09 00:00:00', 1, 'Active', 1, '2026-11-18 06:25:53');
INSERT INTO `employees` (`id`, `card_no`, `name`, `designation`, `join_date`, `section_id`, `status`, `processed_by`, `processed_date`) VALUES (21, 'BH10552', 'Rabeya Khatun', 'Jr. Operator', '2026-01-14 00:00:00', 1, 'Active', 1, '2026-11-18 06:26:02');
INSERT INTO `employees` (`id`, `card_no`, `name`, `designation`, `join_date`, `section_id`, `status`, `processed_by`, `processed_date`) VALUES (22, 'BH10621', 'Babita Rani', 'Jr. Operator', '2026-04-01 00:00:00', 1, 'Active', 1, '2026-11-18 06:26:23');
INSERT INTO `employees` (`id`, `card_no`, `name`, `designation`, `join_date`, `section_id`, `status`, `processed_by`, `processed_date`) VALUES (23, 'BH10625', 'Mst. Rawsanara Begum', 'Jr. Operator', '2026-04-01 00:00:00', 1, 'Active', 1, '2026-11-18 06:26:27');
INSERT INTO `employees` (`id`, `card_no`, `name`, `designation`, `join_date`, `section_id`, `status`, `processed_by`, `processed_date`) VALUES (24, 'BH10628', 'Shree Moti Rotna Rani', 'Jr. Operator', '2026-04-01 00:00:00', 1, 'Active', 1, '2026-11-18 06:26:32');
INSERT INTO `employees` (`id`, `card_no`, `name`, `designation`, `join_date`, `section_id`, `status`, `processed_by`, `processed_date`) VALUES (25, 'BH10658', 'Mst. Suborna Khatun', 'Jr. Operator', '2026-04-07 00:00:00', 1, 'Active', 1, '2026-11-18 06:26:42');
INSERT INTO `employees` (`id`, `card_no`, `name`, `designation`, `join_date`, `section_id`, `status`, `processed_by`, `processed_date`) VALUES (26, 'BH10667', 'Mst. Husneara', 'Jr. Operator', '2026-04-11 00:00:00', 1, 'Active', 1, '2026-11-18 06:26:50');
INSERT INTO `employees` (`id`, `card_no`, `name`, `designation`, `join_date`, `section_id`, `status`, `processed_by`, `processed_date`) VALUES (27, 'BH10680', 'Mst. Jannati Khatun', 'Jr. Operator', '2026-04-15 00:00:00', 1, 'Active', 1, '2026-11-18 06:26:58');
INSERT INTO `employees` (`id`, `card_no`, `name`, `designation`, `join_date`, `section_id`, `status`, `processed_by`, `processed_date`) VALUES (28, 'BH10733', 'Mst. Rohima Begum', 'Jr. Operator', '2026-06-08 00:00:00', 1, 'Active', 1, '2026-11-18 06:27:06');

-- --------------------------------------------------------
-- Table structure & data for table `order_increase_requests`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `order_increase_requests`;
CREATE TABLE `order_increase_requests` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `buyer_order_id` int(11) NOT NULL,
  `increase_quantity` int(11) NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'Pending',
  `requested_by` int(11) DEFAULT NULL,
  `requested_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `approved_by` int(11) DEFAULT NULL,
  `approved_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `order_increase_requests_buyer_order_id_fkey` (`buyer_order_id`),
  CONSTRAINT `order_increase_requests_buyer_order_id_fkey` FOREIGN KEY (`buyer_order_id`) REFERENCES `buyer_orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure & data for table `permissions`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `permissions`;
CREATE TABLE `permissions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `menu_key` varchar(50) NOT NULL,
  `can_view` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `permissions_user_id_fkey` (`user_id`),
  CONSTRAINT `permissions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `permissions` (35 records)
INSERT INTO `permissions` (`id`, `user_id`, `menu_key`, `can_view`) VALUES (1, 1, 'dashboard', 1);
INSERT INTO `permissions` (`id`, `user_id`, `menu_key`, `can_view`) VALUES (2, 1, 'buyer', 1);
INSERT INTO `permissions` (`id`, `user_id`, `menu_key`, `can_view`) VALUES (3, 1, 'style', 1);
INSERT INTO `permissions` (`id`, `user_id`, `menu_key`, `can_view`) VALUES (4, 1, 'process', 1);
INSERT INTO `permissions` (`id`, `user_id`, `menu_key`, `can_view`) VALUES (5, 1, 'piece_rate', 1);
INSERT INTO `permissions` (`id`, `user_id`, `menu_key`, `can_view`) VALUES (6, 1, 'buyer_order_info', 1);
INSERT INTO `permissions` (`id`, `user_id`, `menu_key`, `can_view`) VALUES (7, 1, 'yarn_challan', 1);
INSERT INTO `permissions` (`id`, `user_id`, `menu_key`, `can_view`) VALUES (8, 1, 'production_entry', 1);
INSERT INTO `permissions` (`id`, `user_id`, `menu_key`, `can_view`) VALUES (9, 1, 'production_show', 1);
INSERT INTO `permissions` (`id`, `user_id`, `menu_key`, `can_view`) VALUES (10, 1, 'user', 1);
INSERT INTO `permissions` (`id`, `user_id`, `menu_key`, `can_view`) VALUES (11, 1, 'user_permission', 1);
INSERT INTO `permissions` (`id`, `user_id`, `menu_key`, `can_view`) VALUES (12, 1, 'database_backup', 1);
INSERT INTO `permissions` (`id`, `user_id`, `menu_key`, `can_view`) VALUES (13, 1, 'section', 1);
INSERT INTO `permissions` (`id`, `user_id`, `menu_key`, `can_view`) VALUES (14, 1, 'color', 1);
INSERT INTO `permissions` (`id`, `user_id`, `menu_key`, `can_view`) VALUES (15, 1, 'company_profile', 1);
INSERT INTO `permissions` (`id`, `user_id`, `menu_key`, `can_view`) VALUES (16, 1, 'employee_info', 1);
INSERT INTO `permissions` (`id`, `user_id`, `menu_key`, `can_view`) VALUES (17, 2, 'dashboard', 1);
INSERT INTO `permissions` (`id`, `user_id`, `menu_key`, `can_view`) VALUES (18, 2, 'production_entry', 1);
INSERT INTO `permissions` (`id`, `user_id`, `menu_key`, `can_view`) VALUES (19, 2, 'production_show', 1);
INSERT INTO `permissions` (`id`, `user_id`, `menu_key`, `can_view`) VALUES (20, 2, 'employee_info', 1);
INSERT INTO `permissions` (`id`, `user_id`, `menu_key`, `can_view`) VALUES (21, 2, 'yarn_challan', 1);
INSERT INTO `permissions` (`id`, `user_id`, `menu_key`, `can_view`) VALUES (22, 2, 'buyer_order_info', 1);
INSERT INTO `permissions` (`id`, `user_id`, `menu_key`, `can_view`) VALUES (23, 2, 'style', 1);
INSERT INTO `permissions` (`id`, `user_id`, `menu_key`, `can_view`) VALUES (24, 2, 'buyer', 1);
INSERT INTO `permissions` (`id`, `user_id`, `menu_key`, `can_view`) VALUES (25, 2, 'process', 1);
INSERT INTO `permissions` (`id`, `user_id`, `menu_key`, `can_view`) VALUES (26, 2, 'color', 1);
INSERT INTO `permissions` (`id`, `user_id`, `menu_key`, `can_view`) VALUES (27, 2, 'database_backup', 1);
INSERT INTO `permissions` (`id`, `user_id`, `menu_key`, `can_view`) VALUES (28, 3, 'dashboard', 1);
INSERT INTO `permissions` (`id`, `user_id`, `menu_key`, `can_view`) VALUES (29, 3, 'production_entry', 1);
INSERT INTO `permissions` (`id`, `user_id`, `menu_key`, `can_view`) VALUES (30, 3, 'production_show', 1);
INSERT INTO `permissions` (`id`, `user_id`, `menu_key`, `can_view`) VALUES (31, 3, 'employee_info', 1);
INSERT INTO `permissions` (`id`, `user_id`, `menu_key`, `can_view`) VALUES (32, 3, 'yarn_challan', 1);
INSERT INTO `permissions` (`id`, `user_id`, `menu_key`, `can_view`) VALUES (33, 3, 'buyer_order_info', 1);
INSERT INTO `permissions` (`id`, `user_id`, `menu_key`, `can_view`) VALUES (34, 3, 'style', 1);
INSERT INTO `permissions` (`id`, `user_id`, `menu_key`, `can_view`) VALUES (35, 3, 'buyer', 1);

-- --------------------------------------------------------
-- Table structure & data for table `piece_rates`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `piece_rates`;
CREATE TABLE `piece_rates` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `section_id` int(11) NOT NULL,
  `style_id` int(11) NOT NULL,
  `process_id` int(11) NOT NULL,
  `color_id` int(11) NOT NULL,
  `rate` decimal(10,2) NOT NULL,
  `effective_date` date NOT NULL,
  `processed_by` int(11) DEFAULT NULL,
  `processed_date` datetime(3) DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `piece_rates_section_id_fkey` (`section_id`),
  KEY `piece_rates_style_id_fkey` (`style_id`),
  KEY `piece_rates_process_id_fkey` (`process_id`),
  KEY `piece_rates_color_id_fkey` (`color_id`),
  CONSTRAINT `piece_rates_color_id_fkey` FOREIGN KEY (`color_id`) REFERENCES `colors` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `piece_rates_process_id_fkey` FOREIGN KEY (`process_id`) REFERENCES `processes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `piece_rates_section_id_fkey` FOREIGN KEY (`section_id`) REFERENCES `sections` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `piece_rates_style_id_fkey` FOREIGN KEY (`style_id`) REFERENCES `styles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `piece_rates` (3 records)
INSERT INTO `piece_rates` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `rate`, `effective_date`, `processed_by`, `processed_date`) VALUES (1, 2, 11, 3, 15, '"0"', '2026-11-01 00:00:00', 1, '2026-11-17 09:46:13');
INSERT INTO `piece_rates` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `rate`, `effective_date`, `processed_by`, `processed_date`) VALUES (2, 2, 11, 3, 14, '"0"', '2026-11-01 00:00:00', 1, '2026-11-17 09:46:39');
INSERT INTO `piece_rates` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `rate`, `effective_date`, `processed_by`, `processed_date`) VALUES (3, 2, 13, 1, 20, '"0"', '2026-11-01 00:00:00', 1, '2026-11-17 09:47:00');

-- --------------------------------------------------------
-- Table structure & data for table `processes`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `processes`;
CREATE TABLE `processes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `section_id` int(11) NOT NULL,
  `buyer_id` int(11) NOT NULL,
  `style_id` int(11) NOT NULL,
  `process_name` varchar(100) NOT NULL,
  `type` varchar(50) NOT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'Active',
  `processed_by` int(11) DEFAULT NULL,
  `processed_date` datetime(3) DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `processes_section_id_fkey` (`section_id`),
  KEY `processes_buyer_id_fkey` (`buyer_id`),
  KEY `processes_style_id_fkey` (`style_id`),
  CONSTRAINT `processes_buyer_id_fkey` FOREIGN KEY (`buyer_id`) REFERENCES `buyers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `processes_section_id_fkey` FOREIGN KEY (`section_id`) REFERENCES `sections` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `processes_style_id_fkey` FOREIGN KEY (`style_id`) REFERENCES `styles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `processes` (34 records)
INSERT INTO `processes` (`id`, `section_id`, `buyer_id`, `style_id`, `process_name`, `type`, `status`, `processed_by`, `processed_date`) VALUES (1, 2, 1, 13, '100% ORANIC COTTON2/32', 'incomplete', 'Active', 1, '2026-11-17 09:26:40');
INSERT INTO `processes` (`id`, `section_id`, `buyer_id`, `style_id`, `process_name`, `type`, `status`, `processed_by`, `processed_date`) VALUES (2, 2, 1, 12, '100% VISCOSE 2/30', 'incomplete', 'Active', 1, '2026-11-17 09:27:22');
INSERT INTO `processes` (`id`, `section_id`, `buyer_id`, `style_id`, `process_name`, `type`, `status`, `processed_by`, `processed_date`) VALUES (3, 2, 1, 11, '100% COMBED COTTON 2/32', 'incomplete', 'Active', 1, '2026-11-17 09:27:39');
INSERT INTO `processes` (`id`, `section_id`, `buyer_id`, `style_id`, `process_name`, `type`, `status`, `processed_by`, `processed_date`) VALUES (4, 2, 1, 10, '100%COTTON 2/20', 'incomplete', 'Active', 1, '2026-11-17 09:27:56');
INSERT INTO `processes` (`id`, `section_id`, `buyer_id`, `style_id`, `process_name`, `type`, `status`, `processed_by`, `processed_date`) VALUES (5, 2, 1, 9, '100% BCI COMBED COMECT COTTON 2/32', 'incomplete', 'Active', 1, '2026-11-17 09:28:12');
INSERT INTO `processes` (`id`, `section_id`, `buyer_id`, `style_id`, `process_name`, `type`, `status`, `processed_by`, `processed_date`) VALUES (6, 1, 1, 8, 'SPANDEX+ELASTIC+POLESTER', 'incomplete', 'Active', 1, '2026-11-17 09:28:30');
INSERT INTO `processes` (`id`, `section_id`, `buyer_id`, `style_id`, `process_name`, `type`, `status`, `processed_by`, `processed_date`) VALUES (7, 1, 1, 7, 'PART OPEN', 'incomplete', 'Active', 1, '2026-11-17 09:28:57');
INSERT INTO `processes` (`id`, `section_id`, `buyer_id`, `style_id`, `process_name`, `type`, `status`, `processed_by`, `processed_date`) VALUES (9, 1, 1, 5, 'PART OPEN', 'incomplete', 'Active', 1, '2026-11-17 09:29:16');
INSERT INTO `processes` (`id`, `section_id`, `buyer_id`, `style_id`, `process_name`, `type`, `status`, `processed_by`, `processed_date`) VALUES (10, 1, 1, 3, 'PART OPEN', 'incomplete', 'Active', 1, '2026-11-17 09:29:29');
INSERT INTO `processes` (`id`, `section_id`, `buyer_id`, `style_id`, `process_name`, `type`, `status`, `processed_by`, `processed_date`) VALUES (11, 1, 1, 2, 'PART OPEN', 'incomplete', 'Active', 1, '2026-11-17 09:29:38');
INSERT INTO `processes` (`id`, `section_id`, `buyer_id`, `style_id`, `process_name`, `type`, `status`, `processed_by`, `processed_date`) VALUES (12, 1, 1, 1, 'PART OPEN', 'incomplete', 'Active', 1, '2026-11-17 09:29:46');
INSERT INTO `processes` (`id`, `section_id`, `buyer_id`, `style_id`, `process_name`, `type`, `status`, `processed_by`, `processed_date`) VALUES (13, 1, 1, 4, 'PART OPEN', 'incomplete', 'Active', 1, '2026-11-17 09:35:31');
INSERT INTO `processes` (`id`, `section_id`, `buyer_id`, `style_id`, `process_name`, `type`, `status`, `processed_by`, `processed_date`) VALUES (14, 1, 1, 14, 'ALL', 'complete', 'Active', 1, '2026-11-21 03:55:47');
INSERT INTO `processes` (`id`, `section_id`, `buyer_id`, `style_id`, `process_name`, `type`, `status`, `processed_by`, `processed_date`) VALUES (15, 1, 1, 15, 'PART OPEN', 'complete', 'Active', 1, '2026-11-21 03:56:00');
INSERT INTO `processes` (`id`, `section_id`, `buyer_id`, `style_id`, `process_name`, `type`, `status`, `processed_by`, `processed_date`) VALUES (16, 1, 1, 16, 'PART OPEN', 'complete', 'Active', 1, '2026-11-21 03:56:12');
INSERT INTO `processes` (`id`, `section_id`, `buyer_id`, `style_id`, `process_name`, `type`, `status`, `processed_by`, `processed_date`) VALUES (17, 1, 1, 17, 'PART OPEN', 'complete', 'Active', 1, '2026-11-21 03:56:27');
INSERT INTO `processes` (`id`, `section_id`, `buyer_id`, `style_id`, `process_name`, `type`, `status`, `processed_by`, `processed_date`) VALUES (18, 1, 1, 18, 'PART OPEN', 'complete', 'Active', 1, '2026-11-21 03:56:39');
INSERT INTO `processes` (`id`, `section_id`, `buyer_id`, `style_id`, `process_name`, `type`, `status`, `processed_by`, `processed_date`) VALUES (19, 1, 1, 19, 'PART OPEN', 'complete', 'Active', 1, '2026-11-21 03:56:52');
INSERT INTO `processes` (`id`, `section_id`, `buyer_id`, `style_id`, `process_name`, `type`, `status`, `processed_by`, `processed_date`) VALUES (20, 1, 1, 20, 'PART OPEN', 'complete', 'Active', 1, '2026-11-21 03:57:03');
INSERT INTO `processes` (`id`, `section_id`, `buyer_id`, `style_id`, `process_name`, `type`, `status`, `processed_by`, `processed_date`) VALUES (21, 1, 1, 21, 'PART OPEN', 'complete', 'Active', 1, '2026-11-21 03:57:33');
INSERT INTO `processes` (`id`, `section_id`, `buyer_id`, `style_id`, `process_name`, `type`, `status`, `processed_by`, `processed_date`) VALUES (22, 1, 1, 22, 'PART OPEN', 'complete', 'Active', 1, '2026-11-21 03:57:43');
INSERT INTO `processes` (`id`, `section_id`, `buyer_id`, `style_id`, `process_name`, `type`, `status`, `processed_by`, `processed_date`) VALUES (23, 1, 1, 23, 'PART OPEN', 'complete', 'Active', 1, '2026-11-21 03:57:57');
INSERT INTO `processes` (`id`, `section_id`, `buyer_id`, `style_id`, `process_name`, `type`, `status`, `processed_by`, `processed_date`) VALUES (24, 1, 1, 24, 'PART OPEN', 'complete', 'Active', 1, '2026-11-21 03:58:18');
INSERT INTO `processes` (`id`, `section_id`, `buyer_id`, `style_id`, `process_name`, `type`, `status`, `processed_by`, `processed_date`) VALUES (25, 1, 1, 25, 'PART OPEN', 'complete', 'Active', 1, '2026-11-21 03:58:38');
INSERT INTO `processes` (`id`, `section_id`, `buyer_id`, `style_id`, `process_name`, `type`, `status`, `processed_by`, `processed_date`) VALUES (26, 1, 1, 26, 'PART OPEN', 'complete', 'Active', 1, '2026-11-21 03:59:01');
INSERT INTO `processes` (`id`, `section_id`, `buyer_id`, `style_id`, `process_name`, `type`, `status`, `processed_by`, `processed_date`) VALUES (27, 1, 1, 27, 'PART OPEN', 'complete', 'Active', 1, '2026-11-21 03:59:13');
INSERT INTO `processes` (`id`, `section_id`, `buyer_id`, `style_id`, `process_name`, `type`, `status`, `processed_by`, `processed_date`) VALUES (28, 2, 1, 28, '43%AC27%NYLON30%PBT 2/30', 'complete', 'Active', 1, '2026-11-21 04:06:50');
INSERT INTO `processes` (`id`, `section_id`, `buyer_id`, `style_id`, `process_name`, `type`, `status`, `processed_by`, `processed_date`) VALUES (29, 2, 1, 29, '100% ORGANIC COTTON 2/32', 'complete', 'Active', 1, '2026-11-21 04:07:07');
INSERT INTO `processes` (`id`, `section_id`, `buyer_id`, `style_id`, `process_name`, `type`, `status`, `processed_by`, `processed_date`) VALUES (30, 1, 1, 30, 'PART OPEN', 'complete', 'Active', 2, '2026-11-21 04:59:41');
INSERT INTO `processes` (`id`, `section_id`, `buyer_id`, `style_id`, `process_name`, `type`, `status`, `processed_by`, `processed_date`) VALUES (31, 1, 1, 28, 'PART OPEN', 'complete', 'Active', 2, '2026-11-21 05:06:06');
INSERT INTO `processes` (`id`, `section_id`, `buyer_id`, `style_id`, `process_name`, `type`, `status`, `processed_by`, `processed_date`) VALUES (32, 1, 1, 10, 'PART OPEN', 'complete', 'Active', 2, '2026-11-21 05:12:41');
INSERT INTO `processes` (`id`, `section_id`, `buyer_id`, `style_id`, `process_name`, `type`, `status`, `processed_by`, `processed_date`) VALUES (33, 1, 1, 31, 'PART OPEN', 'complete', 'Active', 2, '2026-11-21 05:16:25');
INSERT INTO `processes` (`id`, `section_id`, `buyer_id`, `style_id`, `process_name`, `type`, `status`, `processed_by`, `processed_date`) VALUES (34, 1, 1, 32, 'PART OPEN', 'complete', 'Active', 2, '2026-11-21 05:20:25');
INSERT INTO `processes` (`id`, `section_id`, `buyer_id`, `style_id`, `process_name`, `type`, `status`, `processed_by`, `processed_date`) VALUES (35, 1, 1, 33, 'PART OPEN', 'complete', 'Active', 2, '2026-11-21 06:11:18');

-- --------------------------------------------------------
-- Table structure & data for table `production`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `production`;
CREATE TABLE `production` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `section_id` int(11) NOT NULL,
  `style_id` int(11) NOT NULL,
  `process_id` int(11) NOT NULL,
  `color_id` int(11) NOT NULL,
  `production_date` date NOT NULL,
  `card_no` int(11) NOT NULL,
  `quantity` decimal(12,2) NOT NULL,
  `processed_by` int(11) DEFAULT NULL,
  `processed_date` datetime(3) DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `production_section_id_fkey` (`section_id`),
  KEY `production_style_id_fkey` (`style_id`),
  KEY `production_process_id_fkey` (`process_id`),
  KEY `production_color_id_fkey` (`color_id`),
  CONSTRAINT `production_color_id_fkey` FOREIGN KEY (`color_id`) REFERENCES `colors` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `production_process_id_fkey` FOREIGN KEY (`process_id`) REFERENCES `processes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `production_section_id_fkey` FOREIGN KEY (`section_id`) REFERENCES `sections` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `production_style_id_fkey` FOREIGN KEY (`style_id`) REFERENCES `styles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=148 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `production` (133 records)
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (7, 1, 7, 7, 7, '2026-11-01 00:00:00', 12, '"2"', 2, '2026-11-20 08:57:52');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (8, 1, 30, 30, 43, '2026-11-02 00:00:00', 11, '"10"', 2, '2026-11-21 05:04:29');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (9, 1, 30, 30, 43, '2026-11-02 00:00:00', 13, '"2"', 2, '2026-11-21 05:04:29');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (10, 1, 30, 30, 43, '2026-11-02 00:00:00', 14, '"4"', 2, '2026-11-21 05:04:29');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (11, 1, 30, 30, 43, '2026-11-02 00:00:00', 16, '"4"', 2, '2026-11-21 05:04:29');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (12, 1, 30, 30, 43, '2026-11-02 00:00:00', 20, '"2"', 2, '2026-11-21 05:04:29');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (13, 1, 30, 30, 43, '2026-11-02 00:00:00', 21, '"3"', 2, '2026-11-21 05:04:29');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (14, 1, 30, 30, 43, '2026-11-02 00:00:00', 22, '"1"', 2, '2026-11-21 05:04:29');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (15, 1, 30, 30, 43, '2026-11-02 00:00:00', 24, '"7"', 2, '2026-11-21 05:04:29');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (16, 1, 30, 30, 43, '2026-11-02 00:00:00', 26, '"2"', 2, '2026-11-21 05:04:29');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (17, 1, 30, 30, 43, '2026-11-02 00:00:00', 27, '"3"', 2, '2026-11-21 05:04:29');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (18, 1, 30, 30, 43, '2026-11-02 00:00:00', 28, '"7"', 2, '2026-11-21 05:04:29');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (19, 1, 28, 31, 44, '2026-11-02 00:00:00', 22, '"2"', 2, '2026-11-21 05:11:40');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (20, 1, 28, 31, 44, '2026-11-02 00:00:00', 23, '"8"', 2, '2026-11-21 05:11:40');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (21, 1, 28, 31, 44, '2026-11-02 00:00:00', 26, '"3"', 2, '2026-11-21 05:11:40');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (22, 1, 10, 32, 45, '2026-11-02 00:00:00', 14, '"1"', 2, '2026-11-21 05:15:35');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (23, 1, 10, 32, 45, '2026-11-02 00:00:00', 25, '"10"', 2, '2026-11-21 05:15:35');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (24, 1, 31, 33, 46, '2026-11-02 00:00:00', 21, '"4"', 2, '2026-11-21 05:17:22');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (25, 1, 21, 21, 36, '2026-11-02 00:00:00', 21, '"2"', 2, '2026-11-21 05:17:52');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (26, 1, 22, 22, 37, '2026-11-02 00:00:00', 27, '"2"', 2, '2026-11-21 05:18:31');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (27, 1, 32, 34, 47, '2026-11-02 00:00:00', 18, '"2"', 2, '2026-11-21 05:21:11');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (28, 1, 27, 27, 42, '2026-11-02 00:00:00', 11, '"1"', 2, '2026-11-21 05:22:17');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (29, 1, 27, 27, 42, '2026-11-02 00:00:00', 14, '"1"', 2, '2026-11-21 05:22:17');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (30, 1, 27, 27, 42, '2026-11-02 00:00:00', 23, '"1"', 2, '2026-11-21 05:22:17');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (31, 1, 31, 33, 46, '2026-11-03 00:00:00', 11, '"6"', 2, '2026-11-21 05:24:27');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (32, 1, 31, 33, 46, '2026-11-03 00:00:00', 21, '"12"', 2, '2026-11-21 05:24:27');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (33, 1, 31, 33, 46, '2026-11-03 00:00:00', 25, '"7"', 2, '2026-11-21 05:24:27');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (34, 1, 31, 33, 46, '2026-11-03 00:00:00', 28, '"4"', 2, '2026-11-21 05:24:27');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (35, 1, 10, 32, 45, '2026-11-03 00:00:00', 14, '"7"', 2, '2026-11-21 05:55:18');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (36, 1, 10, 32, 45, '2026-11-03 00:00:00', 17, '"5"', 2, '2026-11-21 05:55:18');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (37, 1, 10, 32, 45, '2026-11-03 00:00:00', 24, '"1"', 2, '2026-11-21 05:55:18');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (38, 1, 10, 32, 45, '2026-11-03 00:00:00', 25, '"1"', 2, '2026-11-21 05:55:18');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (39, 1, 10, 32, 45, '2026-11-03 00:00:00', 28, '"4"', 2, '2026-11-21 05:55:18');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (40, 1, 30, 30, 43, '2026-11-03 00:00:00', 11, '"2"', 2, '2026-11-21 06:05:13');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (41, 1, 30, 30, 43, '2026-11-03 00:00:00', 12, '"3"', 2, '2026-11-21 06:05:13');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (42, 1, 30, 30, 43, '2026-11-03 00:00:00', 13, '"5"', 2, '2026-11-21 06:05:13');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (43, 1, 30, 30, 43, '2026-11-03 00:00:00', 14, '"2"', 2, '2026-11-21 06:05:13');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (44, 1, 30, 30, 43, '2026-11-03 00:00:00', 16, '"7"', 2, '2026-11-21 06:05:13');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (45, 1, 30, 30, 43, '2026-11-03 00:00:00', 17, '"3"', 2, '2026-11-21 06:05:13');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (46, 1, 30, 30, 43, '2026-11-03 00:00:00', 20, '"4"', 2, '2026-11-21 06:05:13');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (47, 1, 30, 30, 43, '2026-11-03 00:00:00', 21, '"2"', 2, '2026-11-21 06:05:13');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (48, 1, 30, 30, 43, '2026-11-03 00:00:00', 22, '"3"', 2, '2026-11-21 06:05:13');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (49, 1, 30, 30, 43, '2026-11-03 00:00:00', 23, '"8"', 2, '2026-11-21 06:05:13');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (50, 1, 30, 30, 43, '2026-11-03 00:00:00', 24, '"4"', 2, '2026-11-21 06:05:13');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (51, 1, 30, 30, 43, '2026-11-03 00:00:00', 26, '"3"', 2, '2026-11-21 06:05:13');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (52, 1, 32, 34, 47, '2026-11-03 00:00:00', 11, '"1"', 2, '2026-11-21 06:05:46');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (53, 1, 32, 34, 47, '2026-11-03 00:00:00', 16, '"3"', 2, '2026-11-21 06:05:46');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (54, 1, 32, 34, 47, '2026-11-03 00:00:00', 18, '"3"', 2, '2026-11-21 06:06:19');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (55, 1, 32, 34, 47, '2026-11-03 00:00:00', 28, '"2"', 2, '2026-11-21 06:06:19');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (56, 1, 33, 35, 48, '2026-11-03 00:00:00', 13, '"4"', 2, '2026-11-21 06:12:47');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (57, 1, 21, 21, 36, '2026-11-03 00:00:00', 12, '"5"', 2, '2026-11-21 06:13:25');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (58, 1, 20, 20, 35, '2026-11-03 00:00:00', 20, '"10"', 2, '2026-11-21 06:15:17');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (59, 1, 20, 20, 35, '2026-11-03 00:00:00', 22, '"6"', 2, '2026-11-21 06:15:17');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (60, 1, 20, 20, 35, '2026-11-03 00:00:00', 26, '"4"', 2, '2026-11-21 06:15:17');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (61, 1, 5, 9, 5, '2026-11-03 00:00:00', 17, '"1"', 2, '2026-11-21 06:15:57');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (62, 1, 27, 27, 42, '2026-11-03 00:00:00', 14, '"1"', 2, '2026-11-21 06:16:30');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (63, 1, 32, 34, 47, '2026-11-05 00:00:00', 11, '"6"', 2, '2026-11-21 09:07:17');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (64, 1, 32, 34, 47, '2026-11-05 00:00:00', 14, '"6"', 2, '2026-11-21 09:07:17');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (65, 1, 32, 34, 47, '2026-11-05 00:00:00', 18, '"1"', 2, '2026-11-21 09:07:17');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (66, 1, 32, 34, 47, '2026-11-05 00:00:00', 19, '"9"', 2, '2026-11-21 09:07:17');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (67, 1, 32, 34, 47, '2026-11-05 00:00:00', 21, '"6"', 2, '2026-11-21 09:07:17');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (68, 1, 32, 34, 47, '2026-11-05 00:00:00', 22, '"2"', 2, '2026-11-21 09:07:17');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (69, 1, 32, 34, 47, '2026-11-05 00:00:00', 26, '"8"', 2, '2026-11-21 09:07:17');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (70, 1, 21, 21, 36, '2026-11-05 00:00:00', 11, '"1"', 2, '2026-11-21 09:08:47');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (71, 1, 21, 21, 36, '2026-11-05 00:00:00', 12, '"4"', 2, '2026-11-21 09:08:47');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (72, 1, 30, 30, 43, '2026-11-05 00:00:00', 20, '"2"', 2, '2026-11-21 09:10:30');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (73, 1, 30, 30, 43, '2026-11-05 00:00:00', 22, '"5"', 2, '2026-11-21 09:10:30');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (74, 1, 30, 30, 43, '2026-11-05 00:00:00', 23, '"4"', 2, '2026-11-21 09:10:30');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (75, 1, 30, 30, 43, '2026-11-05 00:00:00', 24, '"2"', 2, '2026-11-21 09:10:30');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (76, 1, 30, 30, 43, '2026-11-05 00:00:00', 25, '"2"', 2, '2026-11-21 09:10:30');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (77, 1, 30, 30, 43, '2026-11-05 00:00:00', 27, '"3"', 2, '2026-11-21 09:10:30');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (78, 1, 30, 30, 43, '2026-11-05 00:00:00', 28, '"2"', 2, '2026-11-21 09:10:30');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (79, 1, 33, 35, 48, '2026-11-05 00:00:00', 13, '"15"', 2, '2026-11-21 09:11:23');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (80, 1, 33, 35, 48, '2026-11-05 00:00:00', 22, '"2"', 2, '2026-11-21 09:11:23');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (81, 1, 33, 35, 48, '2026-11-05 00:00:00', 28, '"2"', 2, '2026-11-21 09:11:23');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (82, 1, 23, 23, 38, '2026-11-05 00:00:00', 20, '"4"', 2, '2026-11-21 09:13:06');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (83, 1, 23, 23, 38, '2026-11-05 00:00:00', 23, '"3"', 2, '2026-11-21 09:13:06');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (84, 1, 23, 23, 38, '2026-11-05 00:00:00', 24, '"3"', 2, '2026-11-21 09:13:06');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (85, 1, 23, 23, 38, '2026-11-05 00:00:00', 25, '"4"', 2, '2026-11-21 09:13:06');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (86, 1, 23, 23, 38, '2026-11-05 00:00:00', 28, '"2"', 2, '2026-11-21 09:13:06');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (87, 1, 31, 33, 46, '2026-11-05 00:00:00', 12, '"2"', 2, '2026-11-21 09:15:26');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (88, 1, 31, 33, 46, '2026-11-05 00:00:00', 17, '"3"', 2, '2026-11-21 09:15:26');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (89, 1, 31, 33, 46, '2026-11-05 00:00:00', 21, '"3"', 2, '2026-11-21 09:15:26');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (90, 1, 31, 33, 46, '2026-11-05 00:00:00', 25, '"2"', 2, '2026-11-21 09:15:26');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (91, 1, 31, 33, 46, '2026-11-05 00:00:00', 27, '"3"', 2, '2026-11-21 09:15:26');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (92, 1, 10, 32, 45, '2026-11-05 00:00:00', 14, '"2"', 2, '2026-11-21 09:16:42');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (93, 1, 10, 32, 45, '2026-11-05 00:00:00', 17, '"2"', 2, '2026-11-21 09:16:42');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (94, 1, 10, 32, 45, '2026-11-05 00:00:00', 27, '"2"', 2, '2026-11-21 09:16:42');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (95, 1, 27, 27, 42, '2026-11-05 00:00:00', 13, '"13"', 2, '2026-11-21 09:18:05');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (96, 1, 27, 27, 42, '2026-11-05 00:00:00', 13, '"3"', 2, '2026-11-21 09:22:40');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (97, 1, 27, 27, 42, '2026-11-05 00:00:00', 28, '"2"', 2, '2026-11-21 09:22:40');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (98, 1, 21, 21, 36, '2026-11-05 00:00:00', 11, '"7"', 2, '2026-11-21 09:24:54');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (99, 1, 21, 21, 36, '2026-11-05 00:00:00', 12, '"2"', 2, '2026-11-21 09:24:54');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (100, 1, 21, 21, 36, '2026-11-05 00:00:00', 17, '"1"', 2, '2026-11-21 09:24:54');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (101, 1, 21, 21, 36, '2026-11-05 00:00:00', 20, '"2"', 2, '2026-11-21 09:24:54');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (102, 1, 21, 21, 36, '2026-11-05 00:00:00', 21, '"9"', 2, '2026-11-21 09:24:54');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (103, 1, 21, 21, 36, '2026-11-05 00:00:00', 23, '"3"', 2, '2026-11-21 09:24:54');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (104, 1, 21, 21, 36, '2026-11-05 00:00:00', 24, '"3"', 2, '2026-11-21 09:24:54');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (105, 1, 21, 21, 36, '2026-11-05 00:00:00', 25, '"3"', 2, '2026-11-21 09:24:54');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (106, 1, 21, 21, 36, '2026-11-05 00:00:00', 26, '"2"', 2, '2026-11-21 09:25:46');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (107, 1, 21, 21, 36, '2026-11-05 00:00:00', 27, '"2"', 2, '2026-11-21 09:25:46');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (108, 1, 21, 21, 36, '2026-11-05 00:00:00', 28, '"3"', 2, '2026-11-21 09:25:46');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (109, 1, 30, 30, 43, '2026-11-05 00:00:00', 13, '"2"', 2, '2026-11-21 09:26:25');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (110, 1, 30, 30, 43, '2026-11-05 00:00:00', 16, '"1"', 2, '2026-11-21 09:26:25');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (111, 1, 30, 30, 43, '2026-11-05 00:00:00', 20, '"2"', 2, '2026-11-21 09:31:01');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (112, 1, 30, 30, 43, '2026-11-05 00:00:00', 21, '"9"', 2, '2026-11-21 09:31:01');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (113, 1, 30, 30, 43, '2026-11-05 00:00:00', 23, '"3"', 2, '2026-11-21 09:31:01');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (114, 1, 30, 30, 43, '2026-11-05 00:00:00', 24, '"3"', 2, '2026-11-21 09:31:01');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (115, 1, 30, 30, 43, '2026-11-05 00:00:00', 25, '"3"', 2, '2026-11-21 09:31:01');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (116, 1, 30, 30, 43, '2026-11-05 00:00:00', 26, '"2"', 2, '2026-11-21 09:31:01');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (117, 1, 30, 30, 43, '2026-11-05 00:00:00', 27, '"2"', 2, '2026-11-21 09:31:01');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (118, 1, 30, 30, 43, '2026-11-05 00:00:00', 28, '"3"', 2, '2026-11-21 09:31:01');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (124, 1, 31, 33, 46, '2026-11-05 00:00:00', 12, '"5"', 2, '2026-11-21 09:40:44');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (125, 1, 31, 33, 46, '2026-11-05 00:00:00', 14, '"8"', 2, '2026-11-21 09:40:44');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (126, 1, 31, 33, 46, '2026-11-05 00:00:00', 17, '"5"', 2, '2026-11-21 09:40:44');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (127, 1, 31, 33, 46, '2026-11-05 00:00:00', 25, '"1"', 2, '2026-11-21 09:40:44');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (128, 1, 31, 33, 46, '2026-11-05 00:00:00', 27, '"6"', 2, '2026-11-21 09:40:44');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (129, 1, 32, 34, 47, '2026-11-05 00:00:00', 16, '"2"', 2, '2026-11-21 09:41:39');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (130, 1, 32, 34, 47, '2026-11-05 00:00:00', 26, '"1"', 2, '2026-11-21 09:41:39');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (131, 1, 32, 34, 47, '2026-11-05 00:00:00', 28, '"2"', 2, '2026-11-21 09:41:39');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (132, 1, 23, 23, 38, '2026-11-05 00:00:00', 19, '"12"', 2, '2026-11-21 09:43:12');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (133, 1, 23, 23, 38, '2026-11-05 00:00:00', 21, '"2"', 2, '2026-11-21 09:43:12');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (134, 1, 23, 23, 38, '2026-11-05 00:00:00', 21, '"1"', 2, '2026-11-21 09:43:30');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (135, 1, 23, 23, 38, '2026-11-05 00:00:00', 23, '"2"', 2, '2026-11-21 09:44:07');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (136, 1, 23, 23, 38, '2026-11-05 00:00:00', 24, '"5"', 2, '2026-11-21 09:44:07');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (137, 1, 33, 35, 48, '2026-11-05 00:00:00', 13, '"8"', 2, '2026-11-21 09:45:44');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (138, 1, 33, 35, 48, '2026-11-05 00:00:00', 20, '"4"', 2, '2026-11-21 09:45:44');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (139, 1, 33, 35, 48, '2026-11-05 00:00:00', 28, '"2"', 2, '2026-11-21 09:45:44');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (140, 1, 27, 27, 42, '2026-11-05 00:00:00', 11, '"1"', 2, '2026-11-21 09:46:14');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (141, 1, 21, 21, 36, '2026-11-05 00:00:00', 11, '"1"', 2, '2026-11-21 09:47:23');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (142, 1, 21, 21, 36, '2026-11-05 00:00:00', 12, '"2"', 2, '2026-11-21 09:47:23');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (143, 1, 21, 21, 36, '2026-11-05 00:00:00', 17, '"3"', 2, '2026-11-21 09:47:23');
INSERT INTO `production` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `production_date`, `card_no`, `quantity`, `processed_by`, `processed_date`) VALUES (144, 1, 21, 21, 36, '2026-11-05 00:00:00', 21, '"2"', 1, '2026-11-21 10:22:52');

-- --------------------------------------------------------
-- Table structure & data for table `rewinding_requests`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `rewinding_requests`;
CREATE TABLE `rewinding_requests` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `buyer_order_id` int(11) NOT NULL,
  `rewinding_quantity` int(11) NOT NULL,
  `is_confirmed` tinyint(1) NOT NULL DEFAULT 1,
  `status` varchar(20) NOT NULL DEFAULT 'Pending',
  `requested_by` int(11) DEFAULT NULL,
  `requested_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `approved_by` int(11) DEFAULT NULL,
  `approved_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `rewinding_requests_buyer_order_id_fkey` (`buyer_order_id`),
  CONSTRAINT `rewinding_requests_buyer_order_id_fkey` FOREIGN KEY (`buyer_order_id`) REFERENCES `buyer_orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure & data for table `sections`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `sections`;
CREATE TABLE `sections` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `code` varchar(50) NOT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'Active',
  `processed_by` int(11) DEFAULT NULL,
  `processed_date` datetime(3) DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `sections` (2 records)
INSERT INTO `sections` (`id`, `name`, `code`, `status`, `processed_by`, `processed_date`) VALUES (1, 'Jacquard Winding (P)', '1001', 'Active', 1, '2026-11-17 09:25:34');
INSERT INTO `sections` (`id`, `name`, `code`, `status`, `processed_by`, `processed_date`) VALUES (2, 'Auto Winding', '1002', 'Active', 1, '2026-11-17 09:25:40');

-- --------------------------------------------------------
-- Table structure & data for table `styles`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `styles`;
CREATE TABLE `styles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `style_no` varchar(100) NOT NULL,
  `buyer_id` int(11) NOT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'Running',
  `processed_by` int(11) DEFAULT NULL,
  `processed_date` datetime(3) DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `styles_buyer_id_fkey` (`buyer_id`),
  CONSTRAINT `styles_buyer_id_fkey` FOREIGN KEY (`buyer_id`) REFERENCES `buyers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `styles` (32 records)
INSERT INTO `styles` (`id`, `style_no`, `buyer_id`, `status`, `processed_by`, `processed_date`) VALUES (1, 'ELLA TOP', 1, 'Active', 1, '2026-11-17 09:22:30');
INSERT INTO `styles` (`id`, `style_no`, `buyer_id`, `status`, `processed_by`, `processed_date`) VALUES (2, 'T8003', 1, 'Active', 1, '2026-11-17 09:23:11');
INSERT INTO `styles` (`id`, `style_no`, `buyer_id`, `status`, `processed_by`, `processed_date`) VALUES (3, 'ISAC', 1, 'Active', 1, '2026-11-17 09:23:16');
INSERT INTO `styles` (`id`, `style_no`, `buyer_id`, `status`, `processed_by`, `processed_date`) VALUES (4, 'PANSY', 1, 'Active', 1, '2026-11-17 09:23:23');
INSERT INTO `styles` (`id`, `style_no`, `buyer_id`, `status`, `processed_by`, `processed_date`) VALUES (5, 'REIGAN', 1, 'Active', 1, '2026-11-17 09:23:37');
INSERT INTO `styles` (`id`, `style_no`, `buyer_id`, `status`, `processed_by`, `processed_date`) VALUES (7, '1141873', 1, 'Active', 1, '2026-11-17 09:23:50');
INSERT INTO `styles` (`id`, `style_no`, `buyer_id`, `status`, `processed_by`, `processed_date`) VALUES (8, 'SAMPLE YARN', 1, 'Active', 1, '2026-11-17 09:24:02');
INSERT INTO `styles` (`id`, `style_no`, `buyer_id`, `status`, `processed_by`, `processed_date`) VALUES (9, 'PANSY PULLOVER', 1, 'Active', 1, '2026-11-17 09:24:09');
INSERT INTO `styles` (`id`, `style_no`, `buyer_id`, `status`, `processed_by`, `processed_date`) VALUES (10, 'REMIXI', 1, 'Active', 1, '2026-11-17 09:24:16');
INSERT INTO `styles` (`id`, `style_no`, `buyer_id`, `status`, `processed_by`, `processed_date`) VALUES (11, 'NORA L/S CARDIGAN KNIT', 1, 'Active', 1, '2026-11-17 09:24:30');
INSERT INTO `styles` (`id`, `style_no`, `buyer_id`, `status`, `processed_by`, `processed_date`) VALUES (12, 'SALTA ONE BUTTON L/S CARDIGAN', 1, 'Active', 1, '2026-11-17 09:24:51');
INSERT INTO `styles` (`id`, `style_no`, `buyer_id`, `status`, `processed_by`, `processed_date`) VALUES (13, 'ISAC ZIP CARDIGAN', 1, 'Active', 1, '2026-11-17 09:25:04');
INSERT INTO `styles` (`id`, `style_no`, `buyer_id`, `status`, `processed_by`, `processed_date`) VALUES (14, '15397149 BOXY', 1, 'Active', 1, '2026-11-21 03:49:44');
INSERT INTO `styles` (`id`, `style_no`, `buyer_id`, `status`, `processed_by`, `processed_date`) VALUES (15, '6821-F', 1, 'Active', 1, '2026-11-21 03:49:58');
INSERT INTO `styles` (`id`, `style_no`, `buyer_id`, `status`, `processed_by`, `processed_date`) VALUES (16, '72E8320+220', 1, 'Active', 1, '2026-11-21 03:50:09');
INSERT INTO `styles` (`id`, `style_no`, `buyer_id`, `status`, `processed_by`, `processed_date`) VALUES (17, 'BLU-REY', 1, 'Active', 1, '2026-11-21 03:50:41');
INSERT INTO `styles` (`id`, `style_no`, `buyer_id`, `status`, `processed_by`, `processed_date`) VALUES (18, 'CABLE-01', 1, 'Active', 1, '2026-11-21 03:50:47');
INSERT INTO `styles` (`id`, `style_no`, `buyer_id`, `status`, `processed_by`, `processed_date`) VALUES (19, 'EILLA TOP', 1, 'Active', 1, '2026-11-21 03:50:59');
INSERT INTO `styles` (`id`, `style_no`, `buyer_id`, `status`, `processed_by`, `processed_date`) VALUES (20, 'HALI S/S', 1, 'Active', 1, '2026-11-21 03:51:05');
INSERT INTO `styles` (`id`, `style_no`, `buyer_id`, `status`, `processed_by`, `processed_date`) VALUES (21, 'JJCLAYTON KNIT SS SPLIT NECK', 1, 'Active', 1, '2026-11-21 03:51:39');
INSERT INTO `styles` (`id`, `style_no`, `buyer_id`, `status`, `processed_by`, `processed_date`) VALUES (22, 'LYKKE', 1, 'Active', 1, '2026-11-21 03:51:45');
INSERT INTO `styles` (`id`, `style_no`, `buyer_id`, `status`, `processed_by`, `processed_date`) VALUES (23, 'NORALS', 1, 'Active', 1, '2026-11-21 03:51:51');
INSERT INTO `styles` (`id`, `style_no`, `buyer_id`, `status`, `processed_by`, `processed_date`) VALUES (24, 'OSCAR KNIT', 1, 'Active', 1, '2026-11-21 03:51:58');
INSERT INTO `styles` (`id`, `style_no`, `buyer_id`, `status`, `processed_by`, `processed_date`) VALUES (25, 'PILOT', 1, 'Active', 1, '2026-11-21 03:54:03');
INSERT INTO `styles` (`id`, `style_no`, `buyer_id`, `status`, `processed_by`, `processed_date`) VALUES (26, 'SALTA', 1, 'Active', 1, '2026-11-21 03:54:11');
INSERT INTO `styles` (`id`, `style_no`, `buyer_id`, `status`, `processed_by`, `processed_date`) VALUES (27, 'WOODY', 1, 'Active', 1, '2026-11-21 03:54:29');
INSERT INTO `styles` (`id`, `style_no`, `buyer_id`, `status`, `processed_by`, `processed_date`) VALUES (28, 'HALI S/SONE BUTTON CARDIGAN', 1, 'Active', 1, '2026-11-21 04:05:20');
INSERT INTO `styles` (`id`, `style_no`, `buyer_id`, `status`, `processed_by`, `processed_date`) VALUES (29, 'JPRBLU REY KNIT CREW NECK', 1, 'Active', 1, '2026-11-21 04:05:42');
INSERT INTO `styles` (`id`, `style_no`, `buyer_id`, `status`, `processed_by`, `processed_date`) VALUES (30, 'RUNNER', 1, 'Active', 2, '2026-11-21 04:58:55');
INSERT INTO `styles` (`id`, `style_no`, `buyer_id`, `status`, `processed_by`, `processed_date`) VALUES (31, '45504', 1, 'Active', 2, '2026-11-21 05:16:07');
INSERT INTO `styles` (`id`, `style_no`, `buyer_id`, `status`, `processed_by`, `processed_date`) VALUES (32, 'RILEY', 1, 'Active', 2, '2026-11-21 05:20:07');
INSERT INTO `styles` (`id`, `style_no`, `buyer_id`, `status`, `processed_by`, `processed_date`) VALUES (33, '41873', 1, 'Active', 2, '2026-11-21 06:10:55');

-- --------------------------------------------------------
-- Table structure & data for table `users`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `role` varchar(20) NOT NULL DEFAULT 'user',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_username_key` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `users` (3 records)
INSERT INTO `users` (`id`, `name`, `username`, `password`, `email`, `role`, `created_at`) VALUES (1, 'System Admin', 'admin', 'admin123', 'admin@bestwool.com', 'admin', '2026-11-17 05:16:25');
INSERT INTO `users` (`id`, `name`, `username`, `password`, `email`, `role`, `created_at`) VALUES (2, 'Factory Operator', 'operator', 'operator123', 'operator@bestwool.com', 'operator', '2026-11-17 05:28:32');
INSERT INTO `users` (`id`, `name`, `username`, `password`, `email`, `role`, `created_at`) VALUES (3, 'Sohel Ahmed', 'sohel', 'sohel', 'bestwoolf@dhaka.net', 'admin', '2026-11-19 11:58:30');

-- --------------------------------------------------------
-- Table structure & data for table `yarn_challans`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `yarn_challans`;
CREATE TABLE `yarn_challans` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `section_id` int(11) NOT NULL,
  `style_id` int(11) NOT NULL,
  `process_id` int(11) NOT NULL,
  `color_id` int(11) NOT NULL,
  `challan_no` varchar(100) DEFAULT NULL,
  `gate_pass_no` varchar(100) DEFAULT NULL,
  `challan_date` date DEFAULT NULL,
  `quantity` int(11) NOT NULL,
  `processed_by` int(11) DEFAULT NULL,
  `processed_date` datetime(3) DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `yarn_challans_section_id_fkey` (`section_id`),
  KEY `yarn_challans_style_id_fkey` (`style_id`),
  KEY `yarn_challans_process_id_fkey` (`process_id`),
  KEY `yarn_challans_color_id_fkey` (`color_id`),
  CONSTRAINT `yarn_challans_color_id_fkey` FOREIGN KEY (`color_id`) REFERENCES `colors` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `yarn_challans_process_id_fkey` FOREIGN KEY (`process_id`) REFERENCES `processes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `yarn_challans_section_id_fkey` FOREIGN KEY (`section_id`) REFERENCES `sections` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `yarn_challans_style_id_fkey` FOREIGN KEY (`style_id`) REFERENCES `styles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
