package com.ecommerce.com.ecommerce.flash.security;

import java.util.Collection;
import java.util.Collections;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.ecommerce.com.ecommerce.flash.entity.Admin;
import com.ecommerce.com.ecommerce.flash.entity.ProductOwner;
import com.ecommerce.com.ecommerce.flash.entity.User;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public class UserPrincipal implements UserDetails {

    private Long id;
    private String name;
    private String email;
    private String password;
    private String role;
    private Collection<? extends GrantedAuthority> authorities;

    public static UserPrincipal create(User user) {
        String roleName = user.getRole().startsWith("ROLE_") ? user.getRole() : "ROLE_" + user.getRole();
        return new UserPrincipal(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPassword(),
                roleName,
                Collections.singletonList(new SimpleGrantedAuthority(roleName))
        );
    }

    public static UserPrincipal create(ProductOwner owner) {
        String roleName = "ROLE_SELLER";
        return new UserPrincipal(
                owner.getProductOwnerId(),
                owner.getProductOwnerName(),
                owner.getProductOwnerEmail(),
                owner.getProductOwnerPassword(),
                roleName,
                Collections.singletonList(new SimpleGrantedAuthority(roleName))
        );
    }

    public static UserPrincipal create(Admin admin) {
        String roleName = "ROLE_ADMIN";
        return new UserPrincipal(
                admin.getAdminId(),
                admin.getAdminName(),
                admin.getAdminEmail(),
                admin.getAdminPassword(),
                roleName,
                Collections.singletonList(new SimpleGrantedAuthority(roleName))
        );
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
