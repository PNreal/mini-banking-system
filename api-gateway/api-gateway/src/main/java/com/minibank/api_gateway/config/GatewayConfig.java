package com.minibank.api_gateway.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.ClientHttpRequestFactory;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

@Configuration
public class GatewayConfig {

    @Value("${gateway.services.user-service}")
    private String userServiceUrl;

    @Value("${gateway.services.account-service}")
    private String accountServiceUrl;

    @Value("${gateway.services.transaction-service}")
    private String transactionServiceUrl;

    @Value("${gateway.services.admin-service}")
    private String adminServiceUrl;

    @Value("${gateway.services.log-service}")
    private String logServiceUrl;

    @Value("${gateway.services.notification-service}")
    private String notificationServiceUrl;

    @Bean
    public RestTemplate restTemplate() {
        RestTemplate restTemplate = new RestTemplate();
        restTemplate.setRequestFactory(clientHttpRequestFactory());
        return restTemplate;
    }

    @Bean
    public ClientHttpRequestFactory clientHttpRequestFactory() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5000);
        factory.setReadTimeout(10000);
        return factory;
    }

    // Service URLs are used by GatewayService
    public String getUserServiceUrl() {
        return userServiceUrl;
    }

    public String getAccountServiceUrl() {
        return accountServiceUrl;
    }

    public String getTransactionServiceUrl() {
        return transactionServiceUrl;
    }

    public String getAdminServiceUrl() {
        return adminServiceUrl;
    }

    public String getLogServiceUrl() {
        return logServiceUrl;
    }

    public String getNotificationServiceUrl() {
        return notificationServiceUrl;
    }
}

