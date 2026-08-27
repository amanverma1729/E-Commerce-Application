-- =============================================================================
-- Flyway Database Migration: V2__seed_initial_data.sql
-- Enterprise Seed Data Initialization (Min 5 Products Per Category)
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

-- 4. Seed Initial Enterprise Products (33 products across 6 core categories)
INSERT IGNORE INTO `products` (`id`, `name`, `description`, `price`, `stock`, `category`, `available`, `approved`, `status`, `product_owner_id`, `version`, `created_at`, `updated_at`)
VALUES
-- Electronics (6 products)
(1, 'Sony WH-1000XM5 Wireless Headphones', 'Industry-leading noise canceling with two processors and 8 microphones. Magnificent sound quality engineered with the new Integrated Processor V1.', 26990.00, 35, 'Electronics', TRUE, TRUE, 'APPROVED', 1, 0, NOW(), NOW()),
(2, 'Apple Watch Series 9 GPS 45mm', 'S9 SiP enables a super-bright display and a magical new way to quickly and easily interact with your Apple Watch without touching the screen.', 41900.00, 20, 'Electronics', TRUE, TRUE, 'APPROVED', 1, 0, NOW(), NOW()),
(3, 'Samsung 55" 4K Ultra HD Smart QLED TV', 'Quantum Dot technology powers over a billion brilliant shades of vivid color. Dual LED backlight technology delivers bold contrast and picture accuracy.', 58990.00, 15, 'Electronics', TRUE, TRUE, 'APPROVED', 1, 0, NOW(), NOW()),
(4, 'Bose SoundLink Flex Waterproof Bluetooth Speaker', 'State-of-the-art transducer engineered for deep, clear sound anywhere. PositionIQ technology detects orientation and optimizes audio output.', 13900.00, 28, 'Electronics', TRUE, TRUE, 'APPROVED', 1, 0, NOW(), NOW()),
(5, 'Apple MacBook Air M3 15-inch Laptop', 'Supercharged by the M3 chip with an 8-core CPU and 10-core GPU, stunning Liquid Retina display, and up to 18 hours battery life.', 134900.00, 12, 'Electronics', TRUE, TRUE, 'APPROVED', 1, 0, NOW(), NOW()),
(6, 'Logitech MX Master 3S Wireless Performance Mouse', 'Quiet clicks with 8,000 DPI track-on-glass sensor and MagSpeed electromagnetic scrolling for ultimate precision.', 9995.00, 40, 'Electronics', TRUE, TRUE, 'APPROVED', 1, 0, NOW(), NOW()),

-- Fashion (6 products)
(7, 'Levi\'s Original Trucker Denim Jacket', 'The original denim jacket since 1967. A symbol of self-expression for decades, and an ideal blank canvas for customization.', 4599.00, 30, 'Fashion', TRUE, TRUE, 'APPROVED', 1, 0, NOW(), NOW()),
(8, 'Puma Heavyweight Oversized Graphic Hoodie', 'Ultra-soft fleece hoodie crafted with 380 GSM combed cotton. Designed with a generous oversized drop-shoulder cut for ultimate cozy comfort.', 3299.00, 60, 'Fashion', TRUE, TRUE, 'APPROVED', 1, 0, NOW(), NOW()),
(9, 'Ralph Lauren Classic Fit Oxford Shirt', 'Tailored from crisp 100% breathable cotton oxford with signature embroidered pony accent on the left chest.', 7490.00, 25, 'Fashion', TRUE, TRUE, 'APPROVED', 1, 0, NOW(), NOW()),
(10, 'Zara Tailored Slim-Fit Stretch Chino Trousers', 'Modern slim-fit stretch cotton chinos designed for effortless business casual style with clean silhouette.', 2990.00, 45, 'Fashion', TRUE, TRUE, 'APPROVED', 1, 0, NOW(), NOW()),
(11, 'Ray-Ban Classic Wayfarer Sunglasses', 'Ray-Ban Original Wayfarer Classic is the most recognizable style in the history of sunglasses since 1952.', 8590.00, 45, 'Fashion', TRUE, TRUE, 'APPROVED', 1, 0, NOW(), NOW()),
(12, 'Tommy Hilfiger Essential Leather Belt', 'Classic full-grain genuine leather belt featuring brushed metal pin buckle and subtle logo branding.', 2499.00, 35, 'Fashion', TRUE, TRUE, 'APPROVED', 1, 0, NOW(), NOW()),

-- Home (5 products)
(13, 'Nespresso Vertuo Pop Espresso Coffee Machine', 'Compact coffee maker utilizing Centrifusion technology to gently brew aromatic espresso, double espresso, gran lungo, and mug sizes.', 16499.00, 18, 'Home', TRUE, TRUE, 'APPROVED', 1, 0, NOW(), NOW()),
(14, 'Dyson V15 Detect Cordless Vacuum Cleaner', 'Intelligent cordless vacuum with laser illumination that reveals invisible dust and piezo sensor continuous particle counting.', 62900.00, 10, 'Home', TRUE, TRUE, 'APPROVED', 1, 0, NOW(), NOW()),
(15, 'Philips Smart Hue LED Ambience Floor Lamp', '16 million colors smart standing floor lamp with dynamic light effects and Alexa/Google Assistant voice integration.', 11499.00, 22, 'Home', TRUE, TRUE, 'APPROVED', 1, 0, NOW(), NOW()),
(16, 'Instant Pot Duo Plus 9-in-1 Electric Pressure Cooker', 'Multi-functional pressure cooker, slow cooker, rice cooker, steamer, and yogurt maker with 15 smart programs.', 9990.00, 30, 'Home', TRUE, TRUE, 'APPROVED', 1, 0, NOW(), NOW()),
(17, 'Calvin Klein Hotel Collection 800TC Bed Sheet Set', 'Ultra-luxurious 800 thread count sateen weave Egyptian cotton bedsheets for silky smooth comfort.', 6890.00, 25, 'Home', TRUE, TRUE, 'APPROVED', 1, 0, NOW(), NOW()),

-- Footwear (5 products)
(18, 'Nike Air Max 270 React Sneakers', 'The Nike Air Max 270 React combines Nike\'s tallest Max Air unit with resilient Nike React foam for extraordinary cushioning that lasts all day.', 12495.00, 50, 'Footwear', TRUE, TRUE, 'APPROVED', 1, 0, NOW(), NOW()),
(19, 'Adidas Ultraboost Light Running Shoes', 'Lightest Ultraboost ever made with 30% lighter Light BOOST material and Primeknit+ upper for ultimate energy return.', 16999.00, 35, 'Footwear', TRUE, TRUE, 'APPROVED', 1, 0, NOW(), NOW()),
(20, 'Jordan 1 Retro High OG Basketball Shoes', 'Iconic high-top premium leather sneakers with Wings logo and encapsulated Air-Sole cushioning.', 16995.00, 15, 'Footwear', TRUE, TRUE, 'APPROVED', 1, 0, NOW(), NOW()),
(21, 'Clarks Desert Boot Genuine Suede Leather', 'Timeless ankle boot crafted from premium Charles F. Stead suede with iconic crepe rubber sole.', 9999.00, 20, 'Footwear', TRUE, TRUE, 'APPROVED', 1, 0, NOW(), NOW()),
(22, 'Puma RS-X Efekt Reflective Sneakers', 'Futuristic chunky silhouette with angular design elements, mesh overlay, and responsive cushioning.', 8499.00, 40, 'Footwear', TRUE, TRUE, 'APPROVED', 1, 0, NOW(), NOW()),

-- Beauty (5 products)
(23, 'Dyson Supersonic High-Velocity Hair Dryer', 'Fast drying with no extreme heat. Engineered for different hair types with magnetic attachments for easy fitting and 360 rotation.', 34900.00, 22, 'Beauty', TRUE, TRUE, 'APPROVED', 1, 0, NOW(), NOW()),
(24, 'Estée Lauder Advanced Night Repair Serum 50ml', 'Deep fast-penetrating face serum reducing the look of multiple signs of aging caused by environmental stress.', 9500.00, 30, 'Beauty', TRUE, TRUE, 'APPROVED', 1, 0, NOW(), NOW()),
(25, 'M.A.C Velvet Matte Lipstick Collection', 'Iconic rich matte formula with high color payoff and non-drying comfortable finish.', 2300.00, 60, 'Beauty', TRUE, TRUE, 'APPROVED', 1, 0, NOW(), NOW()),
(26, 'CeraVe Hydrating Facial Cleanser 473ml', 'Gentle non-foaming facial wash developed with dermatologists containing 3 essential ceramides.', 1650.00, 80, 'Beauty', TRUE, TRUE, 'APPROVED', 1, 0, NOW(), NOW()),
(27, 'Kérastase Elixir Ultime Hair Hydrating Oil 100ml', 'Beautifying hair oil infused with Wild Camellia and Argan oils for long-lasting shine and heat protection.', 4200.00, 40, 'Beauty', TRUE, TRUE, 'APPROVED', 1, 0, NOW(), NOW()),

-- Sports (5 products)
(28, 'Adidas Pro Performance Non-Slip Yoga Mat', '6mm thick eco-friendly TPE yoga mat offering superior cushioning, dual-textured non-slip grip surface, and alignment guideline marks.', 2199.00, 40, 'Sports', TRUE, TRUE, 'APPROVED', 1, 0, NOW(), NOW()),
(29, 'Decathlon Kipsta Professional Match Football Size 5', 'FIFA Quality Pro certified thermobonded 12-panel match ball for superior flight stability and water resistance.', 1499.00, 50, 'Sports', TRUE, TRUE, 'APPROVED', 1, 0, NOW(), NOW()),
(30, 'Yonex Astrox 99 Pro Badminton Racket', 'Head-heavy badminton racket engineered with Namd graphite for explosive power smashes.', 14990.00, 20, 'Sports', TRUE, TRUE, 'APPROVED', 1, 0, NOW(), NOW()),
(31, 'Under Armour Undeniable 5.0 Gym Duffel Bag', 'Water-resistant UA Storm technology duffel bag with tough TPU-coated bottom and shoe pocket.', 3999.00, 35, 'Sports', TRUE, TRUE, 'APPROVED', 1, 0, NOW(), NOW()),
(32, 'Bowflex SelectTech 552 Adjustable Dumbbell Pair', 'Replaces 15 sets of weights with easy selection dial adjusting weight from 2kg to 24kg per dumbbell.', 34500.00, 15, 'Sports', TRUE, TRUE, 'APPROVED', 1, 0, NOW(), NOW());

-- 5. Seed Product Sizes
INSERT IGNORE INTO `product_sizes` (`product_id`, `size`) VALUES
(1, 'Standard'), (1, 'Pro Bundle'),
(2, '41mm'), (2, '45mm'),
(3, '50 Inch'), (3, '55 Inch'), (3, '65 Inch'),
(4, 'Standard'),
(5, '256GB / 8GB RAM'), (5, '512GB / 16GB RAM'),
(6, 'Standard'),
(7, 'S'), (7, 'M'), (7, 'L'), (7, 'XL'), (7, 'XXL'),
(8, 'S'), (8, 'M'), (8, 'L'), (8, 'XL'),
(9, 'S'), (9, 'M'), (9, 'L'), (9, 'XL'),
(10, '30'), (10, '32'), (10, '34'), (10, '36'),
(11, 'Standard (50mm)'), (11, 'Large (54mm)'),
(12, '32'), (12, '34'), (12, '36'), (12, '38'),
(13, 'Solo Machine'), (13, 'Bundle + Milk Frother'),
(14, 'Standard Package'), (14, 'Complete Extra Kit'),
(15, 'Single Lamp'), (15, 'Pair Pack'),
(16, '3 Litre'), (16, '6 Litre'), (16, '8 Litre'),
(17, 'Queen'), (17, 'King'),
(18, 'UK 7'), (18, 'UK 8'), (18, 'UK 9'), (18, 'UK 10'), (18, 'UK 11'),
(19, 'UK 7'), (19, 'UK 8'), (19, 'UK 9'), (19, 'UK 10'), (19, 'UK 11'),
(20, 'UK 8'), (20, 'UK 9'), (20, 'UK 10'), (20, 'UK 11'),
(21, 'UK 7'), (21, 'UK 8'), (21, 'UK 9'), (21, 'UK 10'),
(22, 'UK 7'), (22, 'UK 8'), (22, 'UK 9'), (22, 'UK 10'),
(23, 'Standard Edition'), (23, 'Gift Edition Set'),
(24, '30ml'), (24, '50ml'), (24, '75ml'),
(25, 'Full Size (3g)'),
(26, '236ml'), (26, '473ml'),
(27, '100ml Standard'),
(28, '6mm Standard'), (28, '8mm Extra Thick'),
(29, 'Size 5 Standard'),
(30, '4U G5'), (30, '3U G4'),
(31, 'Small 40L'), (31, 'Medium 58L'),
(32, 'Pair (24kg each)');

-- 6. Seed Product Colors
INSERT IGNORE INTO `product_colors` (`product_id`, `color`) VALUES
(1, 'Silver'), (1, 'Black'), (1, 'Midnight Blue'),
(2, 'Midnight'), (2, 'Starlight'), (2, '(PRODUCT)RED'),
(3, 'Titan Gray'), (3, 'Black Slate'),
(4, 'Stone Blue'), (4, 'Carmine Red'), (4, 'Black'),
(5, 'Midnight'), (5, 'Space Grey'), (5, 'Starlight'),
(6, 'Graphite'), (6, 'Pale Grey'),
(7, 'Medium Indigo Wash'), (7, 'Black Denim'), (7, 'Light Wash'),
(8, 'Sage Green'), (8, 'Charcoal Slate'), (8, 'Off-White'),
(9, 'Sky Blue'), (9, 'Classic White'), (9, 'Pink Striped'),
(10, 'Navy'), (10, 'Khaki'), (10, 'Olive Green'),
(11, 'Black G-15'), (11, 'Tortoise Brown'), (11, 'Polarized Grey'),
(12, 'Tan Brown'), (12, 'Classic Black'),
(13, 'Coconut White'), (13, 'Mango Yellow'), (13, 'Liquorice Black'),
(14, 'Yellow/Nickel'), (14, 'Gold/Iron'),
(15, 'Matte Black'), (15, 'White Satin'),
(16, 'Stainless Steel/Black'),
(17, 'Crisp White'), (17, 'Slate Grey'), (17, 'Cream Beige'),
(18, 'Triple Black'), (18, 'White/Volt'), (18, 'Crimson Red'),
(19, 'Core Black'), (19, 'Cloud White'), (19, 'Solar Red'),
(20, 'Chicago Red'), (20, 'Shadow Grey'), (20, 'Royal Blue'),
(21, 'Sand Suede'), (21, 'Beeswax Leather'), (21, 'Oak Suede'),
(22, 'Puma White/Feather Grey'), (22, 'Triple Black'),
(23, 'Iron/Fuchsia'), (23, 'Nickel/Copper'), (23, 'Vinca Blue'),
(24, 'Standard Amber'),
(25, 'Ruby Woo'), (25, 'Velvet Teddy'), (25, 'Chili'), (25, 'Mehr'),
(26, 'White/Blue Bottle'),
(27, 'Golden Glass'),
(28, 'Teal Cyan'), (28, 'Deep Obsidian'), (28, 'Violet Purple'),
(29, 'White/Solar Yellow/Blue'),
(30, 'Cherry Sunburst'), (30, 'White Tiger'),
(31, 'Black/Metallic'), (31, 'Pitch Grey'),
(32, 'Black/Red');

