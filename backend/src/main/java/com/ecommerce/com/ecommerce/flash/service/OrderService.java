package com.ecommerce.com.ecommerce.flash.service;

import java.util.List;

import com.ecommerce.com.ecommerce.flash.dto.CheckoutRequest;
import com.ecommerce.com.ecommerce.flash.dto.OrderRequest;
import com.ecommerce.com.ecommerce.flash.dto.OrderResponse;

public interface OrderService {
    OrderResponse checkout(CheckoutRequest request);
    OrderResponse placeOrder(OrderRequest request);
    OrderResponse getOrderById(Long orderId);
    List<OrderResponse> getOrdersByUserId(Long userId);
    List<OrderResponse> getOrdersByProductOwnerId(Long productOwnerId);
    OrderResponse updateOrderStatus(Long orderId, String status, String paymentMethod, int quantity);
    void cancelOrder(Long orderId);
}
