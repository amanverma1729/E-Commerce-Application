package com.ecommerce.com.ecommerce.flash.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.ecommerce.com.ecommerce.flash.entity.Product;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {
    List<Product> findByCategory(String category);

    @Query("SELECT p FROM Product p WHERE p.productOwner.productOwnerId = :ownerId")
    List<Product> findProductsByProductOwnerId(Long ownerId);

    List<Product> findByProductOwner_ProductOwnerId(Long ownerId);
    List<Product> findByApproved(boolean approved);
}
