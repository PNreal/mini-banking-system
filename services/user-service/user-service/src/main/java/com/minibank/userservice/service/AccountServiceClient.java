package com.minibank.userservice.service;

import com.minibank.userservice.dto.CreateAccountRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
@RequiredArgsConstructor
@Slf4j
public class AccountServiceClient {

    private final RestTemplate restTemplate;

    @Value("${services.account-service.url:http://localhost:8082}")
    private String accountServiceUrl;

    @Value("${internal.secret:internal-secret}")
    private String internalSecret;

    public void createAccount(CreateAccountRequest request) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("X-Internal-Secret", internalSecret);
            HttpEntity<CreateAccountRequest> entity = new HttpEntity<>(request, headers);

            restTemplate.exchange(
                    accountServiceUrl + "/api/internal/accounts/create",
                    HttpMethod.POST,
                    entity,
                    Void.class
            );
            log.debug("Account creation triggered for user {}", request.getUserId());
        } catch (Exception ex) {
            // Không chặn flow đăng ký nếu Account Service tạm thời không khả dụng.
            // Chỉ log lỗi để có thể xử lý tạo tài khoản lại sau (retry / batch).
            log.error("Failed to create account for user {} (will not block registration)", request.getUserId(), ex);
        }
    }

    /**
     * Kích hoạt tài khoản sau khi KYC được approve
     * Gọi Account Service để tạo số tài khoản chính thức
     */
    public void activateAccountAfterKyc(java.util.UUID userId) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("X-Internal-Secret", internalSecret);
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            restTemplate.exchange(
                    accountServiceUrl + "/api/internal/accounts/activate-kyc/" + userId,
                    HttpMethod.POST,
                    entity,
                    Void.class
            );
            log.info("Account activated after KYC for user {}", userId);
        } catch (Exception ex) {
            log.error("Failed to activate account after KYC for user {}", userId, ex);
            throw new RuntimeException("Failed to activate account: " + ex.getMessage());
        }
    }
}

