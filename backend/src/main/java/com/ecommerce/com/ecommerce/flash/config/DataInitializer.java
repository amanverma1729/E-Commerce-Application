package com.ecommerce.com.ecommerce.flash.config;

import java.util.Arrays;
import java.util.List;
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

        // 4. Seed Products: Ensure at least 5 products exist per category
        try {
            if (defaultOwner != null) {
                seedCategoryProducts(defaultOwner);
            }
        } catch (Exception e) {
            System.err.println("Products seed check: " + e.getMessage());
        }
    }

    private void seedCategoryProducts(ProductOwner owner) {
        String[] categories = {"Electronics", "Fashion", "Home", "Footwear", "Beauty", "Sports"};
        
        // Product Definitions catalog: 33 curated items
        List<ProductSeedDef> seeds = List.of(
            // --- ELECTRONICS ---
            new ProductSeedDef(
                "Sony WH-1000XM5 Wireless Headphones",
                "Industry-leading noise canceling with two processors and 8 microphones. Magnificent sound quality engineered with the new Integrated Processor V1.",
                26990.00, 35, "Electronics",
                Arrays.asList("Standard", "Pro Bundle"),
                Arrays.asList("Silver", "Black", "Midnight Blue")
            ),
            new ProductSeedDef(
                "Apple Watch Series 9 GPS 45mm",
                "S9 SiP enables a super-bright display and a magical new way to quickly and easily interact with your Apple Watch without touching the screen.",
                41900.00, 20, "Electronics",
                Arrays.asList("41mm", "45mm"),
                Arrays.asList("Midnight", "Starlight", "(PRODUCT)RED")
            ),
            new ProductSeedDef(
                "Samsung 55\" 4K Ultra HD Smart QLED TV",
                "Quantum Dot technology powers over a billion brilliant shades of vivid color. Dual LED backlight technology delivers bold contrast and picture accuracy.",
                58990.00, 15, "Electronics",
                Arrays.asList("50 Inch", "55 Inch", "65 Inch"),
                Arrays.asList("Titan Gray", "Black Slate")
            ),
            new ProductSeedDef(
                "Bose SoundLink Flex Waterproof Bluetooth Speaker",
                "State-of-the-art transducer engineered for deep, clear sound anywhere. PositionIQ technology detects orientation and optimizes audio output.",
                13900.00, 28, "Electronics",
                Arrays.asList("Standard"),
                Arrays.asList("Stone Blue", "Carmine Red", "Black")
            ),
            new ProductSeedDef(
                "Apple MacBook Air M3 15-inch Laptop",
                "Supercharged by the M3 chip with an 8-core CPU and 10-core GPU, stunning Liquid Retina display, and up to 18 hours battery life.",
                134900.00, 12, "Electronics",
                Arrays.asList("256GB / 8GB RAM", "512GB / 16GB RAM"),
                Arrays.asList("Midnight", "Space Grey", "Starlight")
            ),
            new ProductSeedDef(
                "Logitech MX Master 3S Wireless Performance Mouse",
                "Quiet clicks with 8,000 DPI track-on-glass sensor and MagSpeed electromagnetic scrolling for ultimate precision.",
                9995.00, 40, "Electronics",
                Arrays.asList("Standard"),
                Arrays.asList("Graphite", "Pale Grey")
            ),

            // --- FASHION ---
            new ProductSeedDef(
                "Levi's Original Trucker Denim Jacket",
                "The original denim jacket since 1967. A symbol of self-expression for decades, and an ideal blank canvas for customization.",
                4599.00, 30, "Fashion",
                Arrays.asList("S", "M", "L", "XL", "XXL"),
                Arrays.asList("Medium Indigo Wash", "Black Denim", "Light Wash")
            ),
            new ProductSeedDef(
                "Puma Heavyweight Oversized Graphic Hoodie",
                "Ultra-soft fleece hoodie crafted with 380 GSM combed cotton. Designed with a generous oversized drop-shoulder cut for ultimate cozy comfort.",
                3299.00, 60, "Fashion",
                Arrays.asList("S", "M", "L", "XL"),
                Arrays.asList("Sage Green", "Charcoal Slate", "Off-White")
            ),
            new ProductSeedDef(
                "Ralph Lauren Classic Fit Oxford Shirt",
                "Tailored from crisp 100% breathable cotton oxford with signature embroidered pony accent on the left chest.",
                7490.00, 25, "Fashion",
                Arrays.asList("S", "M", "L", "XL"),
                Arrays.asList("Sky Blue", "Classic White", "Pink Striped")
            ),
            new ProductSeedDef(
                "Zara Tailored Slim-Fit Stretch Chino Trousers",
                "Modern slim-fit stretch cotton chinos designed for effortless business casual style with clean silhouette.",
                2990.00, 45, "Fashion",
                Arrays.asList("30", "32", "34", "36"),
                Arrays.asList("Navy", "Khaki", "Olive Green")
            ),
            new ProductSeedDef(
                "Ray-Ban Classic Wayfarer Sunglasses",
                "Ray-Ban Original Wayfarer Classic is the most recognizable style in the history of sunglasses since 1952.",
                8590.00, 45, "Fashion",
                Arrays.asList("Standard (50mm)", "Large (54mm)"),
                Arrays.asList("Black G-15", "Tortoise Brown", "Polarized Grey")
            ),
            new ProductSeedDef(
                "Tommy Hilfiger Essential Leather Belt",
                "Classic full-grain genuine leather belt featuring brushed metal pin buckle and subtle logo branding.",
                2499.00, 35, "Fashion",
                Arrays.asList("32", "34", "36", "38"),
                Arrays.asList("Tan Brown", "Classic Black")
            ),

            // --- HOME ---
            new ProductSeedDef(
                "Nespresso Vertuo Pop Espresso Coffee Machine",
                "Compact coffee maker utilizing Centrifusion technology to gently brew aromatic espresso, double espresso, gran lungo, and mug sizes.",
                16499.00, 18, "Home",
                Arrays.asList("Solo Machine", "Bundle + Milk Frother"),
                Arrays.asList("Coconut White", "Mango Yellow", "Liquorice Black")
            ),
            new ProductSeedDef(
                "Dyson V15 Detect Cordless Vacuum Cleaner",
                "Intelligent cordless vacuum with laser illumination that reveals invisible dust and piezo sensor continuous particle counting.",
                62900.00, 10, "Home",
                Arrays.asList("Standard Package", "Complete Extra Kit"),
                Arrays.asList("Yellow/Nickel", "Gold/Iron")
            ),
            new ProductSeedDef(
                "Philips Smart Hue LED Ambience Floor Lamp",
                "16 million colors smart standing floor lamp with dynamic light effects and Alexa/Google Assistant voice integration.",
                11499.00, 22, "Home",
                Arrays.asList("Single Lamp", "Pair Pack"),
                Arrays.asList("Matte Black", "White Satin")
            ),
            new ProductSeedDef(
                "Instant Pot Duo Plus 9-in-1 Electric Pressure Cooker",
                "Multi-functional pressure cooker, slow cooker, rice cooker, steamer, and yogurt maker with 15 smart programs.",
                9990.00, 30, "Home",
                Arrays.asList("3 Litre", "6 Litre", "8 Litre"),
                Arrays.asList("Stainless Steel/Black")
            ),
            new ProductSeedDef(
                "Calvin Klein Hotel Collection 800TC Bed Sheet Set",
                "Ultra-luxurious 800 thread count sateen weave Egyptian cotton bedsheets for silky smooth comfort.",
                6890.00, 25, "Home",
                Arrays.asList("Queen", "King"),
                Arrays.asList("Crisp White", "Slate Grey", "Cream Beige")
            ),

            // --- FOOTWEAR ---
            new ProductSeedDef(
                "Nike Air Max 270 React Sneakers",
                "The Nike Air Max 270 React combines Nike's tallest Max Air unit with resilient Nike React foam for extraordinary cushioning that lasts all day.",
                12495.00, 50, "Footwear",
                Arrays.asList("UK 7", "UK 8", "UK 9", "UK 10", "UK 11"),
                Arrays.asList("Triple Black", "White/Volt", "Crimson Red")
            ),
            new ProductSeedDef(
                "Adidas Ultraboost Light Running Shoes",
                "Lightest Ultraboost ever made with 30% lighter Light BOOST material and Primeknit+ upper for ultimate energy return.",
                16999.00, 35, "Footwear",
                Arrays.asList("UK 7", "UK 8", "UK 9", "UK 10", "UK 11"),
                Arrays.asList("Core Black", "Cloud White", "Solar Red")
            ),
            new ProductSeedDef(
                "Jordan 1 Retro High OG Basketball Shoes",
                "Iconic high-top premium leather sneakers with Wings logo and encapsulated Air-Sole cushioning.",
                16995.00, 15, "Footwear",
                Arrays.asList("UK 8", "UK 9", "UK 10", "UK 11"),
                Arrays.asList("Chicago Red", "Shadow Grey", "Royal Blue")
            ),
            new ProductSeedDef(
                "Clarks Desert Boot Genuine Suede Leather",
                "Timeless ankle boot crafted from premium Charles F. Stead suede with iconic crepe rubber sole.",
                9999.00, 20, "Footwear",
                Arrays.asList("UK 7", "UK 8", "UK 9", "UK 10"),
                Arrays.asList("Sand Suede", "Beeswax Leather", "Oak Suede")
            ),
            new ProductSeedDef(
                "Puma RS-X Efekt Reflective Sneakers",
                "Futuristic chunky silhouette with angular design elements, mesh overlay, and responsive cushioning.",
                8499.00, 40, "Footwear",
                Arrays.asList("UK 7", "UK 8", "UK 9", "UK 10"),
                Arrays.asList("Puma White/Feather Grey", "Triple Black")
            ),

            // --- BEAUTY ---
            new ProductSeedDef(
                "Dyson Supersonic High-Velocity Hair Dryer",
                "Fast drying with no extreme heat. Engineered for different hair types with magnetic attachments for easy fitting and 360 rotation.",
                34900.00, 22, "Beauty",
                Arrays.asList("Standard Edition", "Gift Edition Set"),
                Arrays.asList("Iron/Fuchsia", "Nickel/Copper", "Vinca Blue")
            ),
            new ProductSeedDef(
                "Estée Lauder Advanced Night Repair Serum 50ml",
                "Deep fast-penetrating face serum reducing the look of multiple signs of aging caused by environmental stress.",
                9500.00, 30, "Beauty",
                Arrays.asList("30ml", "50ml", "75ml"),
                Arrays.asList("Standard Amber")
            ),
            new ProductSeedDef(
                "M.A.C Velvet Matte Lipstick Collection",
                "Iconic rich matte formula with high color payoff and non-drying comfortable finish.",
                2300.00, 60, "Beauty",
                Arrays.asList("Full Size (3g)"),
                Arrays.asList("Ruby Woo", "Velvet Teddy", "Chili", "Mehr")
            ),
            new ProductSeedDef(
                "CeraVe Hydrating Facial Cleanser 473ml",
                "Gentle non-foaming facial wash developed with dermatologists containing 3 essential ceramides.",
                1650.00, 80, "Beauty",
                Arrays.asList("236ml", "473ml"),
                Arrays.asList("White/Blue Bottle")
            ),
            new ProductSeedDef(
                "Kérastase Elixir Ultime Hair Hydrating Oil 100ml",
                "Beautifying hair oil infused with Wild Camellia and Argan oils for long-lasting shine and heat protection.",
                4200.00, 40, "Beauty",
                Arrays.asList("100ml Standard"),
                Arrays.asList("Golden Glass")
            ),

            // --- SPORTS ---
            new ProductSeedDef(
                "Adidas Pro Performance Non-Slip Yoga Mat",
                "6mm thick eco-friendly TPE yoga mat offering superior cushioning, dual-textured non-slip grip surface, and alignment guideline marks.",
                2199.00, 40, "Sports",
                Arrays.asList("6mm Standard", "8mm Extra Thick"),
                Arrays.asList("Teal Cyan", "Deep Obsidian", "Violet Purple")
            ),
            new ProductSeedDef(
                "Decathlon Kipsta Professional Match Football Size 5",
                "FIFA Quality Pro certified thermobonded 12-panel match ball for superior flight stability and water resistance.",
                1499.00, 50, "Sports",
                Arrays.asList("Size 5 Standard"),
                Arrays.asList("White/Solar Yellow/Blue")
            ),
            new ProductSeedDef(
                "Yonex Astrox 99 Pro Badminton Racket",
                "Head-heavy badminton racket engineered with Namd graphite for explosive power smashes.",
                14990.00, 20, "Sports",
                Arrays.asList("4U G5", "3U G4"),
                Arrays.asList("Cherry Sunburst", "White Tiger")
            ),
            new ProductSeedDef(
                "Under Armour Undeniable 5.0 Gym Duffel Bag",
                "Water-resistant UA Storm technology duffel bag with tough TPU-coated bottom and shoe pocket.",
                3999.00, 35, "Sports",
                Arrays.asList("Small 40L", "Medium 58L"),
                Arrays.asList("Black/Metallic", "Pitch Grey")
            ),
            new ProductSeedDef(
                "Bowflex SelectTech 552 Adjustable Dumbbell Pair",
                "Replaces 15 sets of weights with easy selection dial adjusting weight from 2kg to 24kg per dumbbell.",
                34500.00, 15, "Sports",
                Arrays.asList("Pair (24kg each)"),
                Arrays.asList("Black/Red")
            )
        );

        int totalAdded = 0;
        for (ProductSeedDef seed : seeds) {
            List<Product> existing = productRepository.findByCategory(seed.category);
            boolean alreadyExists = existing.stream().anyMatch(p -> p.getName().equalsIgnoreCase(seed.name));
            
            if (!alreadyExists) {
                Product p = new Product();
                p.setName(seed.name);
                p.setDescription(seed.description);
                p.setPrice(seed.price);
                p.setStock(seed.stock);
                p.setCategory(seed.category);
                p.setAvailable(true);
                p.setApproved(true);
                p.setStatus(ProductStatus.APPROVED);
                p.setProductSizes(seed.sizes);
                p.setProductColors(seed.colors);
                p.setProductOwner(owner);
                productRepository.save(p);
                totalAdded++;
            }
        }

        if (totalAdded > 0) {
            System.out.println("--> Seeded " + totalAdded + " additional catalog products into database across all categories!");
        }
    }

    private static class ProductSeedDef {
        String name;
        String description;
        double price;
        int stock;
        String category;
        List<String> sizes;
        List<String> colors;

        ProductSeedDef(String name, String description, double price, int stock, String category, List<String> sizes, List<String> colors) {
            this.name = name;
            this.description = description;
            this.price = price;
            this.stock = stock;
            this.category = category;
            this.sizes = sizes;
            this.colors = colors;
        }
    }
}

