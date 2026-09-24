-- ====================================================================
-- NetBill ISP Operations - MySQL Database Schema
-- Run this script in your MySQL instance (phpMyAdmin, MySQL Workbench, or CLI)
-- Example CLI import:
--   mysql -u root -p < schema.sql
-- ====================================================================

-- 1. Create and select the database
CREATE DATABASE IF NOT EXISTS `isp_billing` 
  DEFAULT CHARACTER SET utf8mb4 
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE `isp_billing`;

-- -----------------------------------------------------
-- 2. Table: users (Staff & Administrators)
-- Roles: admin, manager, accounts, support
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` VARCHAR(100) NOT NULL UNIQUE COMMENT 'Staff Email address used for login',
  `name` VARCHAR(100) NOT NULL COMMENT 'Full display name of staff member',
  `password` VARCHAR(255) NOT NULL COMMENT 'Authentication password',
  `role` ENUM('admin', 'support', 'manager', 'accounts') NOT NULL DEFAULT 'support',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_users_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- 3. Table: bills (ISP Tickets & Invoices)
-- Status: Pending, Approved, Rejected, Paid
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `bills` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `ticket_id` VARCHAR(50) NOT NULL COMMENT '6-digit ticket identifier (e.g., 454433). Not unique - multiple bills/users can share same ticket ID',
  `user_id` VARCHAR(100) NOT NULL COMMENT 'Subscriber/Customer identifier (number or string, e.g., 454433, CUST-1092)',
  `amount` DECIMAL(10, 2) NOT NULL COMMENT 'Bill amount in Bangladeshi Taka (TK)',
  `description` TEXT NOT NULL COMMENT 'Bill details or service breakdown',
  `date` DATE NOT NULL COMMENT 'Billing / service date',
  `status` ENUM('Pending', 'Approved', 'Rejected', 'Paid') NOT NULL DEFAULT 'Pending',
  `created_by` VARCHAR(100) DEFAULT NULL COMMENT 'Staff email or name who created the bill',
  `rejection_reason` TEXT DEFAULT NULL COMMENT 'Reason if rejected by manager',
  `paid_by` VARCHAR(100) DEFAULT NULL COMMENT 'Accounts staff who settled the payment',
  `paid_at` TIMESTAMP NULL DEFAULT NULL COMMENT 'Timestamp when bill was paid',
  `payment_method` VARCHAR(50) DEFAULT 'Cash' COMMENT 'Cash, bKash, Nagad, Bank, etc.',
  `payment_note` TEXT DEFAULT NULL COMMENT 'Transaction reference or payment note',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_bills_status` (`status`),
  INDEX `idx_bills_user_id` (`user_id`),
  INDEX `idx_bills_date` (`date`),
  INDEX `idx_bills_ticket_id` (`ticket_id`),
  INDEX `idx_bills_created_by` (`created_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- 4. Initial System Administrator Setup
-- Email: kamrul.cse9@gmail.com
-- Password: 66667777ssc
-- -----------------------------------------------------
INSERT INTO `users` (`id`, `user_id`, `name`, `password`, `role`, `created_at`) 
VALUES (1, 'kamrul.cse9@gmail.com', 'Kamrul Islam', '66667777ssc', 'admin', NOW())
ON DUPLICATE KEY UPDATE 
  `name`=VALUES(`name`),
  `password`=VALUES(`password`),
  `role`=VALUES(`role`);
