import React from "react";
import ProductCard from "./ProductCard";
import styles from "./productgrid.module.css";

const ProductGrid = ({ products, loading, title }) => {
  if (loading) {
    return (
      <div className={styles.container}>
        {title && <h2 className={styles.gridTitle}>{title}</h2>}
        <div className={styles.grid}>
          {Array.from({ length: 8 }).map((_, idx) => (
            <div key={idx} className={styles.skeletonCard}>
              <div className={`${styles.skeletonFrame} skeleton`} />
              <div className={styles.skeletonTextGroup}>
                <div className={`${styles.skeletonLineShort} skeleton`} />
                <div className={`${styles.skeletonLineTitle} skeleton`} />
                <div className={`${styles.skeletonLinePrice} skeleton`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <div className={styles.emptyIcon}>📦</div>
        <h3 className={styles.emptyTitle}>No Products Found</h3>
        <p className={styles.emptySubtitle}>
          We couldn't find any products matching your search criteria. Try adjusting your filters.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {title && <h2 className={styles.gridTitle}>{title}</h2>}
      <div className={styles.grid}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default ProductGrid;
