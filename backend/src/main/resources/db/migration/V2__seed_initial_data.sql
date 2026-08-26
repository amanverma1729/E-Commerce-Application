-- =============================================================================
-- Flyway Database Migration: V2__seed_initial_data.sql
-- Enterprise Seed Data Initialization
-- =============================================================================

-- 1. Seed Default Admin (admin@flash.com / admin123)
INSERT IGNORE INTO `admins` (`admin_id`, `admin_name`, `admin_email`, `admin_password`, `created_at`, `updated_at`)
VALUES (1, 'System Admin', 'admin@flash.com', 'admin123', NOW(), NOW());

-- 2. Seed Default Product Owner (seller@flash.com / seller123)
INSERT IGNORE INTO `product_owner` (`product_owner_id`, `product_owner_name`, `product_owner_email`, `product_owner_password`, `product_owner_number`, `created_at`, `updated_at`)
VALUES (1, 'Flash Official Store', 'seller@flash.com', 'seller123', 9876543210, NOW(), NOW());

-- 3. Seed Default Customer User (user@flash.com / user123)
INSERT IGNORE INTO `user` (`id`, `name`, `email`, `password`, `phone_number`, `address`, `agreement`, `role`, `status`, `created_at`, `updated_at`)
VALUES (1, 'John Doe', 'user@flash.com', 'user123', '9876543210', '742 Evergreen Terrace, Springfield', TRUE, 'CUSTOMER', 'ACTIVE', NOW(), NOW());

-- 4. Seed Initial Enterprise Products
INSERT IGNORE INTO `products` (`id`, `name`, `description`, `price`, `stock`, `category`, `available`, `approved`, `status`, `product_owner_id`, `version`, `created_at`, `updated_at`)
VALUES
(1, 'Wireless Noise-Canceling Headphones', 'Premium over-ear wireless headphones with active noise cancellation, 30-hour battery life, and crystal-clear audio clarity.', 4999.00, 25, 'Electronics', TRUE, TRUE, 'APPROVED', 1, 0, NOW(), NOW()),
(2, 'Ultra-Light Breathable Running Shoes', 'Ergonomic sports sneakers featuring response cushioning, high-grip rubber sole, and lightweight breathable mesh upper.', 2499.00, 40, 'Footwear', TRUE, TRUE, 'APPROVED', 1, 0, NOW(), NOW()),
(3, 'Classic Vintage Denim Jacket', 'Timeless heavy-duty cotton denim jacket with buttoned chest pockets, distressed vintage wash, and comfortable fit.', 1999.00, 15, 'Apparel', TRUE, TRUE, 'APPROVED', 1, 0, NOW(), NOW()),
(4, 'Smart Fitness Tracker Watch v2', 'Water-resistant smartwatch with AMOLED display, continuous heart rate monitor, SPO2 tracking, and 14-day battery life.', 3499.00, 30, 'Electronics', TRUE, TRUE, 'APPROVED', 1, 0, NOW(), NOW()),
(5, 'Genuine Leather Travel Duffel Bag', 'Handcrafted full-grain leather weekender duffel bag with dedicated shoe compartment and reinforced shoulder strap.', 2999.00, 18, 'Accessories', TRUE, TRUE, 'APPROVED', 1, 0, NOW(), NOW()),
(6, 'Organic Cotton Heavyweight Oversized Tee', '100% combed organic cotton streetwear graphic t-shirt with dropped shoulders and durable ribbed crew collar.', 899.00, 50, 'Apparel', TRUE, TRUE, 'APPROVED', 1, 0, NOW(), NOW());

-- 5. Seed Product Sizes
INSERT IGNORE INTO `product_sizes` (`product_id`, `size`) VALUES
(1, 'Standard'), (1, 'Pro'),
(2, 'UK 7'), (2, 'UK 8'), (2, 'UK 9'), (2, 'UK 10'),
(3, 'S'), (3, 'M'), (3, 'L'), (3, 'XL'),
(4, '40mm'), (4, '44mm'),
(5, '35L'), (5, '45L'),
(6, 'M'), (6, 'L'), (6, 'XL'), (6, 'XXL');

-- 6. Seed Product Colors
INSERT IGNORE INTO `product_colors` (`product_id`, `color`) VALUES
(1, 'Matte Black'), (1, 'Silver'), (1, 'Navy Blue'),
(2, 'Neon Orange'), (2, 'Stealth Grey'), (2, 'Pure White'),
(3, 'Washed Blue'), (3, 'Dark Indigo'), (3, 'Obsidian Black'),
(4, 'Midnight Black'), (4, 'Rose Gold'), (4, 'Space Grey'),
(5, 'Cognac Brown'), (5, 'Dark Chocolate'), (5, 'Jet Black'),
(6, 'Sage Green'), (6, 'Off White'), (6, 'Charcoal');
