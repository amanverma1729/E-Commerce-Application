package com.ecommerce.com.ecommerce.flash;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;

@SpringBootTest
@AutoConfigureMockMvc
public class SecurityVerificationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String userAccessToken;
    private String userRefreshToken;
    private String sellerAccessToken;
    private String adminAccessToken;

    @BeforeEach
    public void setupTokens() throws Exception {
        // 1. Obtain Customer Token
        String userLoginJson = "{\"email\":\"user@flash.com\",\"password\":\"user123\"}";
        String userResult = mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(userLoginJson))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        userAccessToken = objectMapper.readTree(userResult).path("data").path("accessToken").asText();
        userRefreshToken = objectMapper.readTree(userResult).path("data").path("refreshToken").asText();

        // 2. Obtain Seller Token
        String sellerLoginJson = "{\"email\":\"seller@flash.com\",\"password\":\"seller123\"}";
        String sellerResult = mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(sellerLoginJson))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        sellerAccessToken = objectMapper.readTree(sellerResult).path("data").path("accessToken").asText();

        // 3. Obtain Admin Token
        String adminLoginJson = "{\"email\":\"admin@flash.com\",\"password\":\"admin123\"}";
        String adminResult = mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(adminLoginJson))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        adminAccessToken = objectMapper.readTree(adminResult).path("data").path("accessToken").asText();
    }

    @Test
    public void testAuthentication_SuccessAndFailure() throws Exception {
        // Correct login
        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"user@flash.com\",\"password\":\"user123\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.accessToken").exists())
                .andExpect(jsonPath("$.data.password").doesNotExist()); // Password never returned

        // Incorrect password
        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"user@flash.com\",\"password\":\"wrongpass\"}"))
                .andExpect(status().is4xxClientError());

        // Unknown user
        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"unknown@flash.com\",\"password\":\"user123\"}"))
                .andExpect(status().is4xxClientError());
    }

    @Test
    public void testRefreshToken_SeparateFromAccessToken() throws Exception {
        // Valid Refresh Token -> Generates new access token
        String refreshReq = "{\"refreshToken\":\"" + userRefreshToken + "\"}";
        mockMvc.perform(post("/api/v1/auth/refresh")
                .contentType(MediaType.APPLICATION_JSON)
                .content(refreshReq))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.accessToken").exists());

        // Using Refresh Token AS Access Token -> Should fail with 4xx Client Error (401/403)
        mockMvc.perform(get("/users/id/1")
                .header("Authorization", "Bearer " + userRefreshToken))
                .andExpect(status().is4xxClientError());

        // Using Access Token AS Refresh Token -> Should fail with 4xx Client Error (400 Bad Request)
        String invalidRefreshReq = "{\"refreshToken\":\"" + userAccessToken + "\"}";
        mockMvc.perform(post("/api/v1/auth/refresh")
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidRefreshReq))
                .andExpect(status().is4xxClientError());
    }

    @Test
    public void testRoleBasedAuthorization() throws Exception {
        // Regular USER attempting Admin endpoint -> 403 Forbidden
        mockMvc.perform(get("/api/admins")
                .header("Authorization", "Bearer " + userAccessToken))
                .andExpect(status().isForbidden());

        // SELLER attempting Admin product approval -> 403 Forbidden
        mockMvc.perform(put("/products/1/approve")
                .header("Authorization", "Bearer " + sellerAccessToken))
                .andExpect(status().isForbidden());

        // ADMIN accessing Admin endpoint -> 200 OK
        mockMvc.perform(get("/api/admins")
                .header("Authorization", "Bearer " + adminAccessToken))
                .andExpect(status().isOk());
    }

    @Test
    public void testResourceOwnership() throws Exception {
        // User A (id 1) trying to access User B (id 999) -> 403 Forbidden
        mockMvc.perform(get("/users/id/999")
                .header("Authorization", "Bearer " + userAccessToken))
                .andExpect(status().isForbidden());

        // User A trying to update User B profile -> 403 Forbidden
        mockMvc.perform(put("/users/update/999")
                .header("Authorization", "Bearer " + userAccessToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"Hacked Name\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    public void testProductApprovalWorkflow() throws Exception {
        // Seller creates new product via multipart request
        String createRes = mockMvc.perform(post("/products")
                .header("Authorization", "Bearer " + sellerAccessToken)
                .param("name", "Test Pending Product")
                .param("description", "A product awaiting admin approval")
                .param("price", "99.99")
                .param("stock", "10")
                .param("category", "Electronics")
                .param("productOwnerId", "1")
                .contentType(MediaType.MULTIPART_FORM_DATA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("PENDING"))
                .andExpect(jsonPath("$.data.approved").value(false))
                .andReturn().getResponse().getContentAsString();

        long createdProductId = objectMapper.readTree(createRes).path("data").path("id").asLong();

        // Regular customer (USER) attempts to view pending product by ID -> 404 Not Found
        mockMvc.perform(get("/products/" + createdProductId)
                .header("Authorization", "Bearer " + userAccessToken))
                .andExpect(status().isNotFound());

        // Unauthenticated customer attempts to view pending product by ID -> 404 Not Found
        mockMvc.perform(get("/products/" + createdProductId))
                .andExpect(status().isNotFound());

        // ADMIN approves product -> 200 OK
        mockMvc.perform(put("/products/" + createdProductId + "/approve")
                .header("Authorization", "Bearer " + adminAccessToken))
                .andExpect(status().isOk());

        // Customer can now view approved product -> 200 OK
        mockMvc.perform(get("/products/" + createdProductId)
                .header("Authorization", "Bearer " + userAccessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("APPROVED"));

        // Clean up created test product by admin
        mockMvc.perform(delete("/products/" + createdProductId)
                .header("Authorization", "Bearer " + adminAccessToken))
                .andExpect(status().isOk());
    }
}
