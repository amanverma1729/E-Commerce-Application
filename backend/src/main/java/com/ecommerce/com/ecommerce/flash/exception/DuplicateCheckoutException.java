package com.ecommerce.com.ecommerce.flash.exception;

public class DuplicateCheckoutException extends RuntimeException {
    public DuplicateCheckoutException(String message) {
        super(message);
    }
}
