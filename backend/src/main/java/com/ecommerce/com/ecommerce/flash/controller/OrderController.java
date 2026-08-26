package com.ecommerce.com.ecommerce.flash.controller;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.ecommerce.com.ecommerce.flash.dao.OrderDao;
import com.ecommerce.com.ecommerce.flash.dao.ProductDao;
import com.ecommerce.com.ecommerce.flash.dao.UserDao;
import com.ecommerce.com.ecommerce.flash.entity.Order;
import com.ecommerce.com.ecommerce.flash.entity.Product;
import com.ecommerce.com.ecommerce.flash.entity.User;

@RestController
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"}, allowCredentials = "true")
public class OrderController {

    @Autowired
    private OrderDao orderDao;

    @Autowired
    private ProductDao productDao;

    @Autowired
    private UserDao userDao;
    
    // ----------------------------
    // Order Endpoints
    // ----------------------------
    
    // Place an order (for immediate purchase)
    @PostMapping("/orders")
    public ResponseEntity<?> placeOrder(@RequestBody Order order) {
        if (order.getProduct() != null && order.getProduct().getId() != null) {
            Optional<Product> prod = productDao.getProductById(order.getProduct().getId());
            prod.ifPresent(order::setProduct);
        }
        if (order.getUser() != null && order.getUser().getId() != null) {
            User user = userDao.getUserById(order.getUser().getId());
            if (user != null) {
                order.setUser(user);
            }
        }
        if (order.getQuantity() <= 0) {
            order.setQuantity(1);
        }
        Order savedOrder = orderDao.placeOrder(order);
        return ResponseEntity.ok(savedOrder);
    }
    
    // Get a single order by id
    @GetMapping("/orders/{orderId}")
    public ResponseEntity<?> getOrderById(@PathVariable Long orderId) {
        Optional<Order> orderOpt = orderDao.getOrderById(orderId);
        if (orderOpt.isPresent()) {
            return ResponseEntity.ok(orderOpt.get());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                                 .body("Order not found with id: " + orderId);
        }
    }
    
    // Get orders for a user (all orders, regardless of status)
    @GetMapping("/orders/user/{userId}")
    public ResponseEntity<?> getOrdersByUser(@PathVariable Long userId) {
        List<Order> orders = orderDao.getOrdersByUserId(userId);
        return ResponseEntity.ok(orders);
    }
    
    // Get orders for a product owner
    @GetMapping("/orders/owner/{productOwnerId}")
    public ResponseEntity<?> getOrdersByProductOwner(@PathVariable Long productOwnerId) {
        List<Order> orders = orderDao.getOrdersByProductOwnerId(productOwnerId);
        return ResponseEntity.ok(orders);
    }
    
    // Update an order's status or payment details
    @PutMapping("/orders/{orderId}")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long orderId, @RequestBody Order updatedOrder) {
        Optional<Order> existingOrderOpt = orderDao.getOrderById(orderId);
        if (existingOrderOpt.isPresent()) {
            Order existingOrder = existingOrderOpt.get();
            if (updatedOrder.getStatus() != null) {
                existingOrder.setStatus(updatedOrder.getStatus());
            }
            if (updatedOrder.getPaymentMethod() != null) {
                existingOrder.setPaymentMethod(updatedOrder.getPaymentMethod());
            }
            if (updatedOrder.getQuantity() > 0) {
                existingOrder.setQuantity(updatedOrder.getQuantity());
            }
            Order savedOrder = orderDao.updateOrder(existingOrder);
            return ResponseEntity.ok(savedOrder);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    // DELETE endpoint to cancel an order
    @DeleteMapping("/orders/{orderId}")
    public ResponseEntity<?> cancelOrder(@PathVariable Long orderId) {
        Optional<Order> orderOptional = orderDao.getOrderById(orderId);
        if (orderOptional.isPresent()) {
            orderDao.deleteOrder(orderId);
            return ResponseEntity.ok("Order cancelled successfully.");
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                                 .body("Order not found with id: " + orderId);
        }
    }
    
    // ----------------------------
    // Cart Endpoints
    // ----------------------------
    
    // Add an item to the cart (creates an order with status "In Cart")
    @PostMapping("/cart")
    public ResponseEntity<?> addToCart(@RequestBody Order order) {
        order.setStatus("In Cart");
        if (order.getProduct() != null && order.getProduct().getId() != null) {
            Optional<Product> prod = productDao.getProductById(order.getProduct().getId());
            prod.ifPresent(order::setProduct);
        }
        if (order.getUser() != null && order.getUser().getId() != null) {
            User user = userDao.getUserById(order.getUser().getId());
            if (user != null) {
                order.setUser(user);
            }
        }
        if (order.getQuantity() <= 0) {
            order.setQuantity(1);
        }
        Order savedOrder = orderDao.placeOrder(order);
        return ResponseEntity.ok(savedOrder);
    }
    
    // Get cart items for a user (only orders with status "In Cart")
    @GetMapping("/cart/user/{userId}")
    public ResponseEntity<?> getCartItemsByUser(@PathVariable Long userId) {
        List<Order> orders = orderDao.getOrdersByUserId(userId);
        List<Order> cartItems = orders.stream()
                                       .filter(o -> "In Cart".equalsIgnoreCase(o.getStatus()))
                                       .collect(Collectors.toList());
        return ResponseEntity.ok(cartItems);
    }
    
    // Remove an item from the cart
    @DeleteMapping("/cart/{orderId}")
    public ResponseEntity<?> removeFromCart(@PathVariable Long orderId) {
        Optional<Order> orderOptional = orderDao.getOrderById(orderId);
        if (orderOptional.isPresent()) {
            orderDao.deleteOrder(orderId);
            return ResponseEntity.ok("Item removed from cart.");
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                                 .body("Cart item not found with id: " + orderId);
        }
    }
}
