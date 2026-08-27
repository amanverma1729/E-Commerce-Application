-- =============================================================================
-- Flyway Database Migration: V5__add_product_search_indexes.sql
-- Phase 6 — Product Search, Filtering, and Pagination Indexes
-- =============================================================================

CREATE INDEX `idx_products_status_approved` ON `products` (`status`, `approved`, `available`);
CREATE INDEX `idx_products_category` ON `products` (`category`);
CREATE INDEX `idx_products_price` ON `products` (`price`);
CREATE INDEX `idx_products_name` ON `products` (`name`);
