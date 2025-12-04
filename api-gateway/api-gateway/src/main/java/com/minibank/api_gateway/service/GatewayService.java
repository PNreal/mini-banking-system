package com.minibank.api_gateway.service;

import com.minibank.api_gateway.config.GatewayConfig;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.io.BufferedReader;
import java.util.Enumeration;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class GatewayService {

    private final GatewayConfig gatewayConfig;
    private final RestTemplate restTemplate;

    public ResponseEntity<?> forwardRequest(HttpServletRequest request, HttpServletResponse response, String servicePath) {
        try {
            String targetUrl = getTargetUrl(servicePath);
            String requestPath = request.getRequestURI();
            String queryString = request.getQueryString();
            String fullUrl = targetUrl + requestPath.replace("/api/v1", "") + (queryString != null ? "?" + queryString : "");

            log.debug("Forwarding request: {} {} -> {}", request.getMethod(), requestPath, fullUrl);

            // Prepare headers
            HttpHeaders headers = new HttpHeaders();
            Enumeration<String> headerNames = request.getHeaderNames();
            while (headerNames.hasMoreElements()) {
                String headerName = headerNames.nextElement();
                // Skip host and content-length headers
                if (!headerName.equalsIgnoreCase("host") && !headerName.equalsIgnoreCase("content-length")) {
                    headers.add(headerName, request.getHeader(headerName));
                }
            }

            // Read request body if present
            String requestBody = null;
            if (request.getContentLength() > 0 && 
                (request.getMethod().equals("POST") || request.getMethod().equals("PUT") || request.getMethod().equals("PATCH"))) {
                try (BufferedReader reader = request.getReader()) {
                    requestBody = reader.lines().collect(Collectors.joining("\n"));
                }
            }

            // Create HTTP entity
            HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);

            // Forward request based on HTTP method
            ResponseEntity<String> responseEntity;
            HttpMethod httpMethod = HttpMethod.valueOf(request.getMethod());

            if (httpMethod == HttpMethod.GET) {
                responseEntity = restTemplate.exchange(fullUrl, HttpMethod.GET, entity, String.class);
            } else if (httpMethod == HttpMethod.POST) {
                responseEntity = restTemplate.exchange(fullUrl, HttpMethod.POST, entity, String.class);
            } else if (httpMethod == HttpMethod.PUT) {
                responseEntity = restTemplate.exchange(fullUrl, HttpMethod.PUT, entity, String.class);
            } else if (httpMethod == HttpMethod.PATCH) {
                responseEntity = restTemplate.exchange(fullUrl, HttpMethod.PATCH, entity, String.class);
            } else if (httpMethod == HttpMethod.DELETE) {
                responseEntity = restTemplate.exchange(fullUrl, HttpMethod.DELETE, entity, String.class);
            } else {
                return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED).build();
            }

            // Copy response headers
            responseEntity.getHeaders().forEach((key, values) -> {
                if (!key.equalsIgnoreCase("content-length")) {
                    response.setHeader(key, String.join(", ", values));
                }
            });

            return ResponseEntity
                    .status(responseEntity.getStatusCode())
                    .headers(responseEntity.getHeaders())
                    .body(responseEntity.getBody());

        } catch (Exception e) {
            log.error("Error forwarding request: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("{\"success\":false,\"error\":{\"code\":\"GATEWAY_ERROR\",\"message\":\"Error forwarding request to service\"}}");
        }
    }

    private String getTargetUrl(String servicePath) {
        return switch (servicePath) {
            case "/users" -> gatewayConfig.getUserServiceUrl();
            case "/account" -> gatewayConfig.getAccountServiceUrl();
            case "/transactions" -> gatewayConfig.getTransactionServiceUrl();
            case "/admin" -> gatewayConfig.getAdminServiceUrl();
            case "/logs", "/admin/logs" -> gatewayConfig.getLogServiceUrl();
            case "/notifications" -> gatewayConfig.getNotificationServiceUrl();
            default -> throw new IllegalArgumentException("Unknown service path: " + servicePath);
        };
    }
}

