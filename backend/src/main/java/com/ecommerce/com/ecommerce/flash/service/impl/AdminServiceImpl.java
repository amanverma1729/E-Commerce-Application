package com.ecommerce.com.ecommerce.flash.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ecommerce.com.ecommerce.flash.dto.AdminResponse;
import com.ecommerce.com.ecommerce.flash.entity.Admin;
import com.ecommerce.com.ecommerce.flash.exception.ResourceNotFoundException;
import com.ecommerce.com.ecommerce.flash.repository.AdminRepository;
import com.ecommerce.com.ecommerce.flash.service.AdminService;

@Service
public class AdminServiceImpl implements AdminService {

    private final AdminRepository adminRepository;

    public AdminServiceImpl(AdminRepository adminRepository) {
        this.adminRepository = adminRepository;
    }

    @Override
    @Transactional
    public AdminResponse createAdmin(Admin admin) {
        Admin savedAdmin = adminRepository.save(admin);
        return mapToResponse(savedAdmin);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AdminResponse> getAllAdmins() {
        return adminRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public AdminResponse getAdminById(Long id) {
        Admin admin = adminRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found with ID: " + id));
        return mapToResponse(admin);
    }

    @Override
    @Transactional
    public AdminResponse updateAdmin(Long id, Admin adminDetails) {
        Admin existing = adminRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found with ID: " + id));

        if (adminDetails.getAdminName() != null) {
            existing.setAdminName(adminDetails.getAdminName());
        }
        if (adminDetails.getAdminEmail() != null) {
            existing.setAdminEmail(adminDetails.getAdminEmail());
        }
        if (adminDetails.getAdminPassword() != null) {
            existing.setAdminPassword(adminDetails.getAdminPassword());
        }

        Admin updated = adminRepository.save(existing);
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public void deleteAdmin(Long id) {
        Admin existing = adminRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found with ID: " + id));
        adminRepository.delete(existing);
    }

    private AdminResponse mapToResponse(Admin admin) {
        return AdminResponse.builder()
                .adminId(admin.getAdminId())
                .adminName(admin.getAdminName())
                .adminEmail(admin.getAdminEmail())
                .build();
    }
}
