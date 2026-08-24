package com.minibank.api_gateway.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.ClientHttpRequestFactory;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

@Configuration
public class GatewayConfig {

    @Value("${gateway.services.user-service:${USER_SERVICE_URL:http://localhost:8081}}")
    private String userServiceUrl;

    @Value("${gateway.services.core-banking-service:${CORE_BANKING_SERVICE_URL:http://localhost:8082}}")
    private String coreBankingServiceUrl;

    @Value("${gateway.services.log-service:${LOG_SERVICE_URL:http://localhost:8083}}")
    private String logServiceUrl;

    @Value("${gateway.services.notification-service:${NOTIFICATION_SERVICE_URL:http://localhost:8084}}")
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

    public String getUserServiceUrl() {
        return userServiceUrl;
    }

    public String getCoreBankingServiceUrl() {
        return coreBankingServiceUrl;
    }

    public String getAccountServiceUrl() {
        return coreBankingServiceUrl;
    }

    public String getTransactionServiceUrl() {
        return coreBankingServiceUrl;
    }

    public String getAdminServiceUrl() {
        return userServiceUrl;
    }

    public String getLogServiceUrl() {
        return logServiceUrl;
    }

    public String getNotificationServiceUrl() {
        return notificationServiceUrl;
    }
}

