package com.ecommerce.com.ecommerce.flash.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.ecommerce.com.ecommerce.flash.dto.AdminResponse;
import com.ecommerce.com.ecommerce.flash.dto.ApiResponse;
import com.ecommerce.com.ecommerce.flash.entity.Admin;
import com.ecommerce.com.ecommerce.flash.service.AdminService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admins")
@PreAuthorize("hasRole('ADMIN')")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"}, allowCredentials = "true")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AdminResponse>> createAdmin(@Valid @RequestBody Admin admin) {
        AdminResponse response = adminService.createAdmin(admin);
        return ResponseEntity.ok(ApiResponse.success("Admin created successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<AdminResponse>>> getAllAdmins() {
        List<AdminResponse> response = adminService.getAllAdmins();
        return ResponseEntity.ok(ApiResponse.success("Admins retrieved successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AdminResponse>> getAdminById(@PathVariable Long id) {
        AdminResponse response = adminService.getAdminById(id);
        return ResponseEntity.ok(ApiResponse.success("Admin retrieved successfully", response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AdminResponse>> updateAdmin(@PathVariable Long id, @RequestBody Admin adminDetails) {
        AdminResponse response = adminService.updateAdmin(id, adminDetails);
        return ResponseEntity.ok(ApiResponse.success("Admin updated successfully", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteAdmin(@PathVariable Long id) {
        adminService.deleteAdmin(id);
        return ResponseEntity.ok(ApiResponse.success("Admin deleted successfully.", null));
    }
}
