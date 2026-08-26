package com.ecommerce.com.ecommerce.flash.config;

import java.util.Arrays;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import com.ecommerce.com.ecommerce.flash.entity.Admin;
import com.ecommerce.com.ecommerce.flash.entity.Product;
import com.ecommerce.com.ecommerce.flash.entity.ProductOwner;
import com.ecommerce.com.ecommerce.flash.entity.ProductStatus;
import com.ecommerce.com.ecommerce.flash.entity.User;
import com.ecommerce.com.ecommerce.flash.repository.AdminRepository;
import com.ecommerce.com.ecommerce.flash.repository.ProductOwnerRepository;
import com.ecommerce.com.ecommerce.flash.repository.ProductRepository;
import com.ecommerce.com.ecommerce.flash.repository.UserRepository;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProductOwnerRepository productOwnerRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        // Ensure table auto_increment columns
        try {
            jdbcTemplate.execute("ALTER TABLE admins MODIFY COLUMN admin_id BIGINT AUTO_INCREMENT");
        } catch (Exception ignored) {}

        // 1. Seed Admin if not present
        try {
            if (adminRepository.count() == 0) {
                Admin admin = new Admin();
                admin.setAdminName("System Admin");
                admin.setAdminEmail("admin@flash.com");
                admin.setAdminPassword("admin123");
                adminRepository.save(admin);
                System.out.println("--> Seeded default Admin: admin@flash.com / admin123");
            }
        } catch (Exception e) {
            System.err.println("Admin seed check: " + e.getMessage());
        }

        // 2. Seed Default Product Owner if not present
        ProductOwner defaultOwner = null;
        try {
            Optional<ProductOwner> ownerOpt = productOwnerRepository.findByProductOwnerEmail("seller@flash.com");
            if (ownerOpt.isPresent()) {
                defaultOwner = ownerOpt.get();
            } else {
                ProductOwner owner = new ProductOwner();
                owner.setProductOwnerName("Flash Official Store");
                owner.setProductOwnerEmail("seller@flash.com");
                owner.setProductOwnerPassword("seller123");
                owner.setProductOwnerNumber(9876543210L);
                defaultOwner = productOwnerRepository.save(owner);
                System.out.println("--> Seeded default ProductOwner: seller@flash.com / seller123");
            }
        } catch (Exception e) {
            System.err.println("Owner seed check: " + e.getMessage());
        }

        // 3. Seed Default Customer User if not present
        try {
            if (userRepository.findByEmail("user@flash.com").isEmpty()) {
                User user = new User();
                user.setName("John Doe");
                user.setEmail("user@flash.com");
                user.setPassword("user123");
                user.setPhoneNumber("9876543210");
                user.setAddress("742 Evergreen Terrace, Springfield");
                userRepository.save(user);
                System.out.println("--> Seeded default User: user@flash.com / user123");
            }
        } catch (Exception e) {
            System.err.println("User seed check: " + e.getMessage());
        }

        // 4. Seed Initial Products if catalog is empty
        try {
            if (productRepository.count() == 0) {
                Product p1 = new Product();
                p1.setName("Wireless Noise-Canceling Headphones");
                p1.setDescription("Premium over-ear wireless headphones with active noise cancellation, 30-hour battery life, and crystal-clear audio clarity.");
                p1.setPrice(4999.00);
                p1.setStock(25);
                p1.setCategory("Electronics");
                p1.setAvailable(true);
                p1.setApproved(true);
                p1.setStatus(ProductStatus.APPROVED);
                p1.setProductSizes(Arrays.asList("Standard", "Pro"));
                p1.setProductColors(Arrays.asList("Matte Black", "Silver", "Navy Blue"));
                p1.setProductOwner(defaultOwner);
                productRepository.save(p1);

                Product p2 = new Product();
                p2.setName("Ultra-Light Breathable Running Shoes");
                p2.setDescription("Ergonomic sports sneakers featuring response cushioning, high-grip rubber sole, and lightweight breathable mesh upper.");
                p2.setPrice(2499.00);
                p2.setStock(40);
                p2.setCategory("Footwear");
                p2.setAvailable(true);
                p2.setApproved(true);
                p2.setStatus(ProductStatus.APPROVED);
                p2.setProductSizes(Arrays.asList("UK 7", "UK 8", "UK 9", "UK 10"));
                p2.setProductColors(Arrays.asList("Neon Orange", "Stealth Grey", "Pure White"));
                p2.setProductOwner(defaultOwner);
                productRepository.save(p2);

                Product p3 = new Product();
                p3.setName("Classic Vintage Denim Jacket");
                p3.setDescription("Timeless heavy-duty cotton denim jacket with buttoned chest pockets, distressed vintage wash, and comfortable fit.");
                p3.setPrice(1999.00);
                p3.setStock(15);
                p3.setCategory("Apparel");
                p3.setAvailable(true);
                p3.setApproved(true);
                p3.setStatus(ProductStatus.APPROVED);
                p3.setProductSizes(Arrays.asList("S", "M", "L", "XL"));
                p3.setProductColors(Arrays.asList("Washed Blue", "Dark Indigo", "Obsidian Black"));
                p3.setProductOwner(defaultOwner);
                productRepository.save(p3);

                Product p4 = new Product();
                p4.setName("Smart Fitness Tracker Watch v2");
                p4.setDescription("Water-resistant smartwatch with AMOLED display, continuous heart rate monitor, SPO2 tracking, and 14-day battery life.");
                p4.setPrice(3499.00);
                p4.setStock(30);
                p4.setCategory("Electronics");
                p4.setAvailable(true);
                p4.setApproved(true);
                p4.setStatus(ProductStatus.APPROVED);
                p4.setProductSizes(Arrays.asList("40mm", "44mm"));
                p4.setProductColors(Arrays.asList("Midnight Black", "Rose Gold", "Space Grey"));
                p4.setProductOwner(defaultOwner);
                productRepository.save(p4);

                Product p5 = new Product();
                p5.setName("Genuine Leather Travel Duffel Bag");
                p5.setDescription("Handcrafted full-grain leather weekender duffel bag with dedicated shoe compartment and reinforced shoulder strap.");
                p5.setPrice(2999.00);
                p5.setStock(18);
                p5.setCategory("Accessories");
                p5.setAvailable(true);
                p5.setApproved(true);
                p5.setStatus(ProductStatus.APPROVED);
                p5.setProductSizes(Arrays.asList("35L", "45L"));
                p5.setProductColors(Arrays.asList("Cognac Brown", "Dark Chocolate", "Jet Black"));
                p5.setProductOwner(defaultOwner);
                productRepository.save(p5);

                Product p6 = new Product();
                p6.setName("Organic Cotton Heavyweight Oversized Tee");
                p6.setDescription("100% combed organic cotton streetwear graphic t-shirt with dropped shoulders and durable ribbed crew collar.");
                p6.setPrice(899.00);
                p6.setStock(50);
                p6.setCategory("Apparel");
                p6.setAvailable(true);
                p6.setApproved(true);
                p6.setStatus(ProductStatus.APPROVED);
                p6.setProductSizes(Arrays.asList("M", "L", "XL", "XXL"));
                p6.setProductColors(Arrays.asList("Sage Green", "Off White", "Charcoal"));
                p6.setProductOwner(defaultOwner);
                productRepository.save(p6);

                System.out.println("--> Seeded 6 initial sample products into database!");
            }
        } catch (Exception e) {
            System.err.println("Products seed check: " + e.getMessage());
        }
    }
}
