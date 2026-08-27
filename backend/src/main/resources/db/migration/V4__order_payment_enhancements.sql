-- =============================================================================
-- Flyway Database Migration: V4__order_payment_enhancements.sql
-- Phase 5 — Order Lifecycle & Payment Abstraction Schema Extension
-- =============================================================================

ALTER TABLE `payments` ADD COLUMN `failure_reason` VARCHAR(255) DEFAULT NULL;
