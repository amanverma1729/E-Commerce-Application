package com.ecommerce.com.ecommerce.flash.service;

import java.util.List;

import com.ecommerce.com.ecommerce.flash.dto.AdminResponse;
import com.ecommerce.com.ecommerce.flash.entity.Admin;

public interface AdminService {
    AdminResponse createAdmin(Admin admin);
    List<AdminResponse> getAllAdmins();
    AdminResponse getAdminById(Long id);
    AdminResponse updateAdmin(Long id, Admin adminDetails);
    void deleteAdmin(Long id);
}
