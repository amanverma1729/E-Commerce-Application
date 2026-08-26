-- =============================================================================
-- Flyway Database Migration: V1__initial_schema.sql
-- Enterprise E-Commerce Database Schema Initializer
-- =============================================================================

-- 1. Admins Table
CREATE TABLE IF NOT EXISTS `admins` (
    `admin_id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `admin_name` VARCHAR(255) NOT NULL,
    `admin_email` VARCHAR(255) NOT NULL UNIQUE,
    `admin_password` VARCHAR(255) NOT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Customer Users Table
CREATE TABLE IF NOT EXISTS `user` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `phone_number` VARCHAR(50) DEFAULT NULL,
    `address` TEXT DEFAULT NULL,
    `agreement` BOOLEAN NOT NULL DEFAULT FALSE,
    `role` VARCHAR(50) NOT NULL DEFAULT 'CUSTOMER',
    `status` VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_user_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Product Owners (Sellers) Table
CREATE TABLE IF NOT EXISTS `product_owner` (
    `product_owner_id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `product_owner_name` VARCHAR(255) NOT NULL,
    `product_owner_email` VARCHAR(255) NOT NULL UNIQUE,
    `product_owner_password` VARCHAR(255) NOT NULL,
    `product_owner_number` BIGINT NOT NULL UNIQUE,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_owner_email` (`product_owner_email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Products Table with Optimistic Locking (version) and Audit Fields
CREATE TABLE IF NOT EXISTS `products` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT DEFAULT NULL,
    `price` DOUBLE NOT NULL,
    `stock` INT NOT NULL DEFAULT 0,
    `category` VARCHAR(100) NOT NULL,
    `available` BOOLEAN NOT NULL DEFAULT TRUE,
    `approved` BOOLEAN NOT NULL DEFAULT FALSE,
    `status` VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    `product_image` LONGBLOB DEFAULT NULL,
    `product_owner_id` BIGINT DEFAULT NULL,
    `version` BIGINT NOT NULL DEFAULT 0,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_product_category` (`category`),
    INDEX `idx_product_approved` (`approved`),
    INDEX `idx_product_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Product Sizes Element Collection Table
CREATE TABLE IF NOT EXISTS `product_sizes` (
    `product_id` BIGINT NOT NULL,
    `size` VARCHAR(50) NOT NULL,
    PRIMARY KEY (`product_id`, `size`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Product Colors Element Collection Table
CREATE TABLE IF NOT EXISTS `product_colors` (
    `product_id` BIGINT NOT NULL,
    `color` VARCHAR(50) NOT NULL,
    PRIMARY KEY (`product_id`, `color`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Orders Table with Historical Price/Address Snapshots & Idempotency Key
CREATE TABLE IF NOT EXISTS `orders` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `order_date` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `status` VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    `quantity` INT NOT NULL DEFAULT 1,
    `payment_method` VARCHAR(50) DEFAULT 'CARD',
    `total_price` DOUBLE DEFAULT NULL,
    `unit_price_at_purchase` DOUBLE DEFAULT NULL,
    `product_name_at_purchase` VARCHAR(255) DEFAULT NULL,
    `shipping_address` TEXT DEFAULT NULL,
    `idempotency_key` VARCHAR(255) DEFAULT NULL,
    `user_id` BIGINT DEFAULT NULL,
    `product_id` BIGINT DEFAULT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_orders_user` (`user_id`),
    INDEX `idx_orders_status` (`status`),
    INDEX `idx_orders_idempotency` (`idempotency_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
