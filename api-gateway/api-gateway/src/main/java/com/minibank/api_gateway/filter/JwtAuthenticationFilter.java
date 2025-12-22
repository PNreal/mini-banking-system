package com.minibank.api_gateway.filter;

import com.minibank.api_gateway.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.annotation.Order;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Component
@Slf4j
@Order(1)
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    // Public endpoints that don't require authentication
    // Đơn giản hóa: toàn bộ /api/v1/users/** là public (user-service tự chịu trách nhiệm auth)
    private static final List<String> PUBLIC_ENDPOINTS = List.of(
            "/api/v1/users",
            "/api/v1/kyc",
            "/api/v1/health",
            "/actuator/health",
            "/actuator/info"
    );

    public JwtAuthenticationFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String path = request.getRequestURI();

        // Skip authentication for public endpoints
        if (isPublicEndpoint(path)) {
            filterChain.doFilter(request, response);
            return;
        }

        // Extract JWT token from Authorization header
        String authHeader = request.getHeader("Authorization");
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            log.warn("Missing or invalid Authorization header for path: {}", path);
            handleUnauthorized(response, "Missing or invalid Authorization header", path);
            return;
        }

        String token = authHeader.substring(7);

        try {
            // Validate and extract user info from JWT
            if (jwtUtil.validateToken(token)) {
                String userId = jwtUtil.extractUserId(token);
                String role = jwtUtil.extractRole(token);
                String email = jwtUtil.extractEmail(token);

                // Set Authentication in SecurityContext
                List<SimpleGrantedAuthority> authorities = Collections.singletonList(
                        new SimpleGrantedAuthority("ROLE_" + (role != null ? role : "USER"))
                );
                UsernamePasswordAuthenticationToken authentication = 
                        new UsernamePasswordAuthenticationToken(email, null, authorities);
                SecurityContextHolder.getContext().setAuthentication(authentication);

                // Add user info to request headers for downstream services
                JwtRequestWrapper wrappedRequest = new JwtRequestWrapper(request);
                wrappedRequest.addHeader("X-User-Id", userId != null ? userId : "");
                wrappedRequest.addHeader("X-User-Role", role != null ? role : "");
                wrappedRequest.addHeader("X-Trace-Id", UUID.randomUUID().toString());

                log.debug("Authenticated user: {} with role: {} for path: {}", userId, role, path);
                filterChain.doFilter(wrappedRequest, response);
            } else {
                log.warn("Invalid JWT token for path: {}", path);
                handleUnauthorized(response, "Invalid or expired token", path);
            }
        } catch (Exception e) {
            log.error("Error processing JWT token: {}", e.getMessage(), e);
            handleUnauthorized(response, "Error processing authentication token", path);
        }
    }

    private boolean isPublicEndpoint(String path) {
        return PUBLIC_ENDPOINTS.stream().anyMatch(path::startsWith);
    }

    private void handleUnauthorized(HttpServletResponse response, String message, String path) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        String errorResponse = String.format(
                "{\"success\":false,\"error\":{\"code\":\"UNAUTHORIZED\",\"message\":\"%s\",\"timestamp\":\"%s\",\"path\":\"%s\"}}",
                message,
                java.time.LocalDateTime.now(),
                path
        );

        response.getWriter().write(errorResponse);
    }
}

