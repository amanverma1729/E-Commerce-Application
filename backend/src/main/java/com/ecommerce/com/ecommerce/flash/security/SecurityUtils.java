package com.ecommerce.com.ecommerce.flash.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public class SecurityUtils {

    public static UserPrincipal getCurrentUserPrincipal() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal principal) {
            return principal;
        }
        return null;
    }

    public static boolean isAdmin() {
        UserPrincipal principal = getCurrentUserPrincipal();
        return principal != null && "ROLE_ADMIN".equals(principal.getRole());
    }

    public static boolean isSeller() {
        UserPrincipal principal = getCurrentUserPrincipal();
        return principal != null && "ROLE_SELLER".equals(principal.getRole());
    }

    public static boolean isOwnerOrAdmin(Long resourceOwnerId) {
        UserPrincipal principal = getCurrentUserPrincipal();
        if (principal == null) {
            return false;
        }
        if ("ROLE_ADMIN".equals(principal.getRole())) {
            return true;
        }
        return principal.getId() != null && principal.getId().equals(resourceOwnerId);
    }
}
