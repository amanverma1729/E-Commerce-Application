package com.ecommerce.com.ecommerce.flash.repository.specification;

import java.util.ArrayList;
import java.util.List;

import org.springframework.data.jpa.domain.Specification;

import com.ecommerce.com.ecommerce.flash.entity.Product;
import com.ecommerce.com.ecommerce.flash.entity.ProductStatus;

import jakarta.persistence.criteria.Predicate;

public class ProductSpecification {

    public static Specification<Product> filterProducts(String search, String category, Double minPrice, Double maxPrice, boolean approvedOnly) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (approvedOnly) {
                predicates.add(criteriaBuilder.equal(root.get("approved"), true));
                predicates.add(criteriaBuilder.equal(root.get("available"), true));
                predicates.add(criteriaBuilder.equal(root.get("status"), ProductStatus.APPROVED));
            }

            if (search != null && !search.trim().isEmpty()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                Predicate nameLike = criteriaBuilder.like(criteriaBuilder.lower(root.get("name")), pattern);
                Predicate descLike = criteriaBuilder.like(criteriaBuilder.lower(root.get("description")), pattern);
                predicates.add(criteriaBuilder.or(nameLike, descLike));
            }

            if (category != null && !category.trim().isEmpty()) {
                predicates.add(criteriaBuilder.equal(criteriaBuilder.lower(root.get("category")), category.trim().toLowerCase()));
            }

            if (minPrice != null) {
                double safeMin = Math.max(0.0, minPrice);
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("price"), safeMin));
            }

            if (maxPrice != null) {
                double safeMax = Math.max(0.0, maxPrice);
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("price"), safeMax));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
