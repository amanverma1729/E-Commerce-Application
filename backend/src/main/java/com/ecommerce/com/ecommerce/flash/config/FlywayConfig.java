package com.ecommerce.com.ecommerce.flash.config;

import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.ResultSet;
import java.sql.Statement;

import javax.sql.DataSource;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.flyway.FlywayMigrationStrategy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FlywayConfig {

    @Autowired
    private DataSource dataSource;

    @Bean
    public FlywayMigrationStrategy flywayMigrationStrategy() {
        return flyway -> {
            // Ensure pre-existing tables have required auditing columns before Flyway executes V1 & V2
            ensureColumnExists("admins", "created_at", "DATETIME DEFAULT CURRENT_TIMESTAMP");
            ensureColumnExists("admins", "updated_at", "DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");

            ensureColumnExists("user", "phone_number", "VARCHAR(50) DEFAULT NULL");
            ensureColumnExists("user", "address", "TEXT DEFAULT NULL");
            ensureColumnExists("user", "agreement", "BOOLEAN NOT NULL DEFAULT FALSE");
            ensureColumnExists("user", "role", "VARCHAR(50) NOT NULL DEFAULT 'CUSTOMER'");
            ensureColumnExists("user", "status", "VARCHAR(50) NOT NULL DEFAULT 'ACTIVE'");
            ensureColumnExists("user", "created_at", "DATETIME DEFAULT CURRENT_TIMESTAMP");
            ensureColumnExists("user", "updated_at", "DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");

            ensureColumnExists("product_owner", "created_at", "DATETIME DEFAULT CURRENT_TIMESTAMP");
            ensureColumnExists("product_owner", "updated_at", "DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");

            ensureColumnExists("products", "version", "BIGINT NOT NULL DEFAULT 0");
            ensureColumnExists("products", "product_image", "LONGBLOB DEFAULT NULL");
            ensureColumnExists("products", "product_owner_id", "BIGINT DEFAULT NULL");
            ensureColumnExists("products", "created_at", "DATETIME DEFAULT CURRENT_TIMESTAMP");
            ensureColumnExists("products", "updated_at", "DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");

            ensureColumnExists("orders", "payment_method", "VARCHAR(50) DEFAULT 'CARD'");
            ensureColumnExists("orders", "total_price", "DOUBLE DEFAULT NULL");
            ensureColumnExists("orders", "unit_price_at_purchase", "DOUBLE DEFAULT NULL");
            ensureColumnExists("orders", "product_name_at_purchase", "VARCHAR(255) DEFAULT NULL");
            ensureColumnExists("orders", "shipping_address", "TEXT DEFAULT NULL");
            ensureColumnExists("orders", "idempotency_key", "VARCHAR(255) DEFAULT NULL");
            ensureColumnExists("orders", "user_id", "BIGINT DEFAULT NULL");
            ensureColumnExists("orders", "product_id", "BIGINT DEFAULT NULL");
            ensureColumnExists("orders", "created_at", "DATETIME DEFAULT CURRENT_TIMESTAMP");
            ensureColumnExists("orders", "updated_at", "DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");

            // Execute Flyway Migration
            flyway.migrate();
        };
    }

    private void ensureColumnExists(String tableName, String columnName, String columnDefinition) {
        try (Connection conn = dataSource.getConnection()) {
            DatabaseMetaData metaData = conn.getMetaData();
            try (ResultSet rs = metaData.getColumns(null, null, tableName, columnName)) {
                if (!rs.next()) {
                    try (Statement stmt = conn.createStatement()) {
                        stmt.executeUpdate("ALTER TABLE `" + tableName + "` ADD COLUMN `" + columnName + "` " + columnDefinition);
                        System.out.println("--> [Flyway Pre-Migrate] Added missing column `" + columnName + "` to table `" + tableName + "`");
                    }
                }
            }
        } catch (Exception e) {
            // Ignore if table does not exist yet (V1 will create it)
        }
    }
}
