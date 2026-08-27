package com.ecommerce.com.ecommerce.flash.service;

import java.util.ArrayList;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import com.ecommerce.com.ecommerce.flash.dto.CartItemRequest;
import com.ecommerce.com.ecommerce.flash.dto.CartResponse;
import com.ecommerce.com.ecommerce.flash.entity.Cart;
import com.ecommerce.com.ecommerce.flash.entity.Product;
import com.ecommerce.com.ecommerce.flash.entity.ProductStatus;
import com.ecommerce.com.ecommerce.flash.entity.User;
import com.ecommerce.com.ecommerce.flash.exception.ResourceNotFoundException;
import com.ecommerce.com.ecommerce.flash.repository.CartItemRepository;
import com.ecommerce.com.ecommerce.flash.repository.CartRepository;
import com.ecommerce.com.ecommerce.flash.repository.OrderRepository;
import com.ecommerce.com.ecommerce.flash.repository.ProductRepository;
import com.ecommerce.com.ecommerce.flash.repository.UserRepository;
import com.ecommerce.com.ecommerce.flash.security.UserPrincipal;
import com.ecommerce.com.ecommerce.flash.service.impl.CartServiceImpl;

@ExtendWith(MockitoExtension.class)
class CartServiceTest {

    @Mock
    private CartRepository cartRepository;

    @Mock
    private CartItemRepository cartItemRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private OrderRepository orderRepository;

    @InjectMocks
    private CartServiceImpl cartService;

    private User user;
    private Product product;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(5L);
        user.setName("Cart User");
        user.setEmail("cart@test.com");
        user.setRole("ROLE_USER");

        product = new Product();
        product.setId(200L);
        product.setName("Gaming Keyboard");
        product.setPrice(75.0);
        product.setStock(20);
        product.setApproved(true);
        product.setAvailable(true);
        product.setStatus(ProductStatus.APPROVED);

        UserPrincipal principal = UserPrincipal.create(user);
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @Test
    void testAddItemToCart_Success() {
        CartItemRequest request = new CartItemRequest(200L, 2);

        Cart cart = new Cart();
        cart.setId(1L);
        cart.setUser(user);
        cart.setCartItems(new ArrayList<>());

        when(userRepository.findById(5L)).thenReturn(Optional.of(user));
        when(productRepository.findById(200L)).thenReturn(Optional.of(product));
        when(cartRepository.findByUserId(5L)).thenReturn(Optional.of(cart));
        when(cartItemRepository.findByCartIdAndProductId(1L, 200L)).thenReturn(Optional.empty());
        when(cartRepository.save(any(Cart.class))).thenAnswer(inv -> inv.getArgument(0));

        CartResponse response = cartService.addItemToCart(request);

        assertNotNull(response);
        assertEquals(150.0, response.getTotalAmount()); // 2 * 75.0
        assertEquals(1, response.getItems().size());
        verify(cartRepository).save(any(Cart.class));
    }

    @Test
    void testAddItemToCart_InvalidProduct_ThrowsException() {
        CartItemRequest request = new CartItemRequest(999L, 1);

        when(userRepository.findById(5L)).thenReturn(Optional.of(user));
        when(productRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> cartService.addItemToCart(request));
    }

    @Test
    void testRemoveFromCart_ItemNotFound_ThrowsException() {
        when(userRepository.findById(5L)).thenReturn(Optional.of(user));
        when(cartItemRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> cartService.removeCartItem(999L));
    }
}
