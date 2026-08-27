package com.ecommerce.com.ecommerce.flash.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    // Many orders can reference one product (legacy / primary item reference)
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "product_id")
    private Product product;
    
    // Many orders can reference one user (customer)
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id")
    private User user;
    
    // Status of the order: PENDING, CONFIRMED, CANCELLED, DELIVERED, etc.
    @Column(nullable = false)
    private String status = "PENDING";
    
    @Column(nullable = false)
    private int quantity = 1;

    @Column(name = "payment_method")
    private String paymentMethod;

    @Column(name = "total_price")
    private Double totalPrice;

    // Historical Price & Product Snapshots
    @Column(name = "unit_price_at_purchase")
    private Double unitPriceAtPurchase;

    @Column(name = "product_name_at_purchase")
    private String productNameAtPurchase;

    @Column(name = "shipping_address")
    private String shippingAddress;

    @Column(name = "idempotency_key")
    private String idempotencyKey;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<OrderItem> orderItems = new ArrayList<>();

    @OneToOne(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Payment payment;
    
    // Order placed date/time
    @Column(name = "order_date")
    private LocalDateTime orderDate = LocalDateTime.now();

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
