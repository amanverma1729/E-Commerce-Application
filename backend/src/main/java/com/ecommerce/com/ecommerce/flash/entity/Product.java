package com.ecommerce.com.ecommerce.flash.entity;

import java.util.List;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import java.time.LocalDateTime;

@Entity
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "products")
public class Product {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;
    
    private String description;
    
    @Column(nullable = false)
    private double price;
    
    private int stock;
    private String category;

    @Column(nullable = false)
    private boolean available = false;

    @Column(nullable = false)
    private boolean approved = false;

    @Version
    @Column(nullable = false)
    private Long version = 0L;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Many products belong to one Product Owner
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "product_owner_id", referencedColumnName = "product_owner_id")
    private ProductOwner productOwner;

    // Store Image as byte array (Lob = Large Object)
    @Lob
    private byte[] productImage;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "product_sizes", joinColumns = @JoinColumn(name = "product_id"))
    @Column(name = "size")
    private List<String> productSizes;

    // Explicitly map productColors to its own collection table
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "product_colors", joinColumns = @JoinColumn(name = "product_id"))
    @Column(name = "color")
    private List<String> productColors;
    
    @Enumerated(EnumType.STRING)
    private ProductStatus status = ProductStatus.PENDING;

    @Transient
    public String getProductImageBase64() {
        if (this.productImage != null && this.productImage.length > 0) {
            return java.util.Base64.getEncoder().encodeToString(this.productImage);
        }
        return null;
    }
}
