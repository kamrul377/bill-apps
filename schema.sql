
-- 1. Create and select the database
CREATE DATABASE IF NOT EXISTS `isp_billing` 
  DEFAULT CHARACTER SET utf8mb4 
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE `isp_billing`;

-- -----------------------------------------------------
-- Drop tables if they exist (Clean Setup)
-- -----------------------------------------------------
DROP TABLE IF EXISTS `bills`;
DROP TABLE IF EXISTS `users`;

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
-- Note: ticket_id is NON-UNIQUE so multiple bills can share the same ticket_id
-- -----------------------------------------------------
-- CREATE TABLE IF NOT EXISTS `bills` (
--   `id` INT AUTO_INCREMENT PRIMARY KEY,
--   `ticket_id` VARCHAR(50) NOT NULL COMMENT '6-digit ticket identifier (e.g., 454433). Allowed multiple bills per ticket ID',
--   `user_id` VARCHAR(100) NOT NULL COMMENT 'Subscriber/Customer identifier (e.g., 454433, CUST-1092)',
--   `amount` DECIMAL(10, 2) NOT NULL COMMENT 'Bill amount in Bangladeshi Taka (TK)',
--   `description` TEXT NOT NULL COMMENT 'Bill details or service breakdown',
--   `date` DATE NOT NULL COMMENT 'Billing / service date',
--   `status` ENUM('Pending', 'Approved', 'Rejected', 'Paid') NOT NULL DEFAULT 'Pending',
--   `created_by` VARCHAR(100) DEFAULT NULL COMMENT 'Staff email or name who created the bill',
--   `rejection_reason` TEXT DEFAULT NULL COMMENT 'Reason if rejected by manager',
--   `paid_by` VARCHAR(100) DEFAULT NULL COMMENT 'Accounts staff who settled the payment',
--   `paid_at` TIMESTAMP NULL DEFAULT NULL COMMENT 'Timestamp when bill was paid',
--   `payment_method` VARCHAR(50) DEFAULT 'Cash' COMMENT 'Cash, bKash, Nagad, Bank, etc.',
--   `payment_note` TEXT DEFAULT NULL COMMENT 'Transaction reference or payment note',
--   `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--   `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
--   INDEX `idx_bills_status` (`status`),
--   INDEX `idx_bills_user_id` (`user_id`),
--   INDEX `idx_bills_date` (`date`),
--   INDEX `idx_bills_ticket_id` (`ticket_id`),
--   INDEX `idx_bills_created_by` (`created_by`)
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



-- create category table-----
CREATE TABLE IF NOT EXISTS `bill_categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `bills` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `ticket_id` VARCHAR(50) NOT NULL
    COMMENT '6-digit ticket identifier (e.g., 454433). Allowed multiple bills per ticket ID',
  `user_id` VARCHAR(100) NOT NULL
    COMMENT 'Subscriber/Customer identifier (e.g., 454433, CUST-1092)',
  `amount` DECIMAL(10, 2) NOT NULL
    COMMENT 'Bill amount in Bangladeshi Taka (TK)',
  `description` TEXT NOT NULL
    COMMENT 'Bill details or service breakdown',
  `category_id` INT NOT NULL
    COMMENT 'Reference to bill_categories.id. Default category is Others',
  `date` DATE NOT NULL
    COMMENT 'Billing / service date',
  `status` ENUM('Pending', 'Approved', 'Rejected', 'Paid')
    NOT NULL DEFAULT 'Pending',
  `created_by` VARCHAR(100) DEFAULT NULL
    COMMENT 'Staff email or name who created the bill',
  `rejection_reason` TEXT DEFAULT NULL
    COMMENT 'Reason if rejected by manager',
  `paid_by` VARCHAR(100) DEFAULT NULL
    COMMENT 'Accounts staff who settled the payment',
  `paid_at` TIMESTAMP NULL DEFAULT NULL
    COMMENT 'Timestamp when bill was paid',
  `payment_method` VARCHAR(50) DEFAULT 'Cash'
    COMMENT 'Cash, bKash, Nagad, Bank, etc.',
  `payment_note` TEXT DEFAULT NULL
    COMMENT 'Transaction reference or payment note',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_bills_status` (`status`),
  INDEX `idx_bills_user_id` (`user_id`),
  INDEX `idx_bills_date` (`date`),
  INDEX `idx_bills_ticket_id` (`ticket_id`),
  INDEX `idx_bills_created_by` (`created_by`),
  INDEX `idx_bills_category_id` (`category_id`),

  CONSTRAINT `fk_bills_category`
    FOREIGN KEY (`category_id`)
    REFERENCES `bill_categories` (`id`)
    ON UPDATE CASCADE
    ON DELETE RESTRICT

) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- 4. Initial System Administrator Setup
-- Email: kamrul.cse9@gmail.com
-- Password: 66667777ssc
-- -----------------------------------------------------
-- INSERT INTO `users` (`id`, `user_id`, `name`, `password`, `role`, `created_at`) 
-- VALUES (1, 'kamrul.cse9@gmail.com', 'Kamrul Islam', '66667777ssc', 'admin', NOW())
-- ON DUPLICATE KEY UPDATE 
--   `name`=VALUES(`name`),
--   `password`=VALUES(`password`),
--   `role`=VALUES(`role`);






CREATE TABLE pocs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS clients (
    id INT AUTO_INCREMENT PRIMARY KEY,

    client_id VARCHAR(100) NOT NULL UNIQUE,
    client_name VARCHAR(150) NOT NULL,
    client_phone VARCHAR(30) DEFAULT NULL,

    primary_ip VARCHAR(50) DEFAULT NULL,
    primary_onu VARCHAR(150) DEFAULT NULL,

    secondary_ip VARCHAR(50) DEFAULT NULL,
    secondary_onu VARCHAR(150) DEFAULT NULL,

    location VARCHAR(255) DEFAULT NULL,

    poc_id INT DEFAULT NULL,

    status ENUM('Connected', 'Disconnected')
        NOT NULL DEFAULT 'Connected',

    description TEXT DEFAULT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_clients_status (status),
    INDEX idx_clients_client_name (client_name),
    INDEX idx_clients_primary_ip (primary_ip),
    INDEX idx_clients_location (location),
    INDEX idx_clients_poc_id (poc_id),

    CONSTRAINT fk_clients_poc
        FOREIGN KEY (poc_id)
        REFERENCES pocs(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE

) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;