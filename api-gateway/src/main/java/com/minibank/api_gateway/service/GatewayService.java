package com.minibank.api_gateway.service;

import com.minibank.api_gateway.config.GatewayConfig;
import com.minibank.api_gateway.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import java.io.BufferedReader;
import java.util.Enumeration;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class GatewayService {

    private final GatewayConfig gatewayConfig;
    private final RestTemplate restTemplate;
    private final JwtUtil jwtUtil;

    public ResponseEntity<?> forwardRequest(HttpServletRequest request, HttpServletResponse response, String servicePath) {
        try {
            String targetUrl = getTargetUrl(servicePath);
            String requestPath = request.getRequestURI();
            String queryString = request.getQueryString();
            
            // Transform path based on service
            // Gateway: /api/v1/xxx -> Service path depends on service
            String transformedPath = transformPath(requestPath, servicePath);
            String fullUrl = targetUrl + transformedPath + (queryString != null ? "?" + queryString : "");

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

            // Extract user info from JWT and add to headers for downstream services
            String authHeader = request.getHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                try {
                    String email = jwtUtil.extractEmail(token);
                    if (email != null) {
                        headers.set("X-User-Email", email);
                        log.debug("Added X-User-Email header: {}", email);
                        
                        // Lấy userId từ user-service nếu cần
                        String userId = getUserIdByEmail(email);
                        if (userId != null) {
                            headers.set("X-User-Id", userId);
                            log.debug("Added X-User-Id header: {}", userId);
                        }
                    }
                    
                    // Extract role from JWT and add to headers
                    String role = jwtUtil.extractRole(token);
                    if (role != null) {
                        headers.set("X-User-Role", role);
                        log.debug("Added X-User-Role header: {}", role);
                    }
                } catch (Exception e) {
                    log.warn("Failed to extract user info from JWT: {}", e.getMessage());
                }
            }

            // Read request body if present
            String requestBody = null;
            HttpEntity<?> entity;
            
            // Check if this is a multipart request
            String contentType = request.getContentType();
            boolean isMultipart = contentType != null && contentType.toLowerCase().startsWith("multipart/");
            
            if (isMultipart && request instanceof MultipartHttpServletRequest) {
                // Handle multipart/form-data request
                MultipartHttpServletRequest multipartRequest = (MultipartHttpServletRequest) request;
                MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
                
                // Add all files
                Map<String, MultipartFile> fileMap = multipartRequest.getFileMap();
                for (Map.Entry<String, MultipartFile> entry : fileMap.entrySet()) {
                    MultipartFile file = entry.getValue();
                    if (file != null && !file.isEmpty()) {
                        try {
                            ByteArrayResource resource = new ByteArrayResource(file.getBytes()) {
                                @Override
                                public String getFilename() {
                                    return file.getOriginalFilename();
                                }
                            };
                            body.add(entry.getKey(), resource);
                            log.debug("Added multipart file: {} ({})", entry.getKey(), file.getOriginalFilename());
                        } catch (Exception e) {
                            log.warn("Failed to read multipart file {}: {}", entry.getKey(), e.getMessage());
                        }
                    }
                }
                
                // Add all parameters
                multipartRequest.getParameterMap().forEach((key, values) -> {
                    for (String value : values) {
                        body.add(key, value);
                    }
                });
                
                // Set content type for multipart
                headers.setContentType(MediaType.MULTIPART_FORM_DATA);
                entity = new HttpEntity<>(body, headers);
                
            } else if (request.getContentLength() > 0 && 
                (request.getMethod().equals("POST") || request.getMethod().equals("PUT") || request.getMethod().equals("PATCH"))) {
                try (BufferedReader reader = request.getReader()) {
                    requestBody = reader.lines().collect(Collectors.joining("\n"));
                }
                entity = new HttpEntity<>(requestBody, headers);
            } else {
                entity = new HttpEntity<>(null, headers);
            }

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

        } catch (RestClientResponseException ex) {
            // Trả lại nguyên status + body từ service đích (ví dụ: 400 validation error của user-service)
            int statusCode = ex.getStatusCode().value();
            log.warn("Downstream service returned error status: {} with body: {}", statusCode, ex.getResponseBodyAsString());

            HttpHeaders errorHeaders = new HttpHeaders();
            ex.getResponseHeaders().forEach((key, values) -> {
                if (!key.equalsIgnoreCase("content-length")) {
                    errorHeaders.put(key, values);
                }
            });

            return ResponseEntity
                    .status(statusCode)
                    .headers(errorHeaders)
                    .body(ex.getResponseBodyAsString());

        } catch (Exception e) {
            log.error("Error forwarding request: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("{\"success\":false,\"error\":{\"code\":\"GATEWAY_ERROR\",\"message\":\"Error forwarding request to service\"}}");
        }
    }

    /**
     * Lấy userId từ user-service bằng email
     */
    private String getUserIdByEmail(String email) {
        try {
            String url = gatewayConfig.getUserServiceUrl() + "/internal/users/by-email?email=" + email;
            HttpHeaders headers = new HttpHeaders();
            headers.set("X-Internal-Secret", "internal-secret");
            HttpEntity<Void> entity = new HttpEntity<>(headers);
            
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                // Parse JSON response để lấy userId
                // Response format: {"userId": "xxx", "email": "xxx", ...}
                String body = response.getBody();
                int start = body.indexOf("\"userId\":\"") + 10;
                int end = body.indexOf("\"", start);
                if (start > 10 && end > start) {
                    return body.substring(start, end);
                }
            }
        } catch (Exception e) {
            log.warn("Failed to get userId by email {}: {}", email, e.getMessage());
        }
        return null;
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

    /**
     * Transform gateway path to service path
     * Gateway uses /api/v1/xxx, but services may use different paths
     */
    private String transformPath(String requestPath, String servicePath) {
        // Remove /api/v1 prefix from gateway path
        String pathWithoutPrefix = requestPath.replace("/api/v1", "");
        
        return switch (servicePath) {
            // User service uses /api/xxx (no v1)
            case "/users" -> "/api" + pathWithoutPrefix;
            // Account service uses /api/xxx (no v1)  
            case "/account" -> "/api" + pathWithoutPrefix;
            // Transaction service uses /api/v1/xxx
            case "/transactions" -> "/api/v1" + pathWithoutPrefix;
            // Admin service uses /api/xxx (no v1)
            case "/admin" -> "/api" + pathWithoutPrefix;
            // Log service uses /api/xxx (no v1)
            case "/logs", "/admin/logs" -> "/api" + pathWithoutPrefix;
            // Notification service uses /api/v1/xxx
            case "/notifications" -> "/api/v1" + pathWithoutPrefix;
            default -> requestPath;
        };
    }
}

