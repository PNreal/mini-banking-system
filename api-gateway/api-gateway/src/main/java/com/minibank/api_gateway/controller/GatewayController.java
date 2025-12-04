package com.minibank.api_gateway.controller;

import com.minibank.api_gateway.service.GatewayService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Slf4j
public class GatewayController {

    private final GatewayService gatewayService;

    // User Service Routes
    @RequestMapping(value = "/users/**", method = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.PATCH, RequestMethod.DELETE})
    public ResponseEntity<?> routeToUserService(HttpServletRequest request, HttpServletResponse response) {
        return gatewayService.forwardRequest(request, response, "/users");
    }

    // Account Service Routes
    @RequestMapping(value = "/account/**", method = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.PATCH, RequestMethod.DELETE})
    public ResponseEntity<?> routeToAccountService(HttpServletRequest request, HttpServletResponse response) {
        return gatewayService.forwardRequest(request, response, "/account");
    }

    // Transaction Service Routes
    @RequestMapping(value = "/transactions/**", method = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.PATCH, RequestMethod.DELETE})
    public ResponseEntity<?> routeToTransactionService(HttpServletRequest request, HttpServletResponse response) {
        return gatewayService.forwardRequest(request, response, "/transactions");
    }

    // Admin Service Routes
    @RequestMapping(value = "/admin/**", method = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.PATCH, RequestMethod.DELETE})
    public ResponseEntity<?> routeToAdminService(HttpServletRequest request, HttpServletResponse response) {
        return gatewayService.forwardRequest(request, response, "/admin");
    }

    // Log Service Routes
    @RequestMapping(value = {"/logs/**", "/admin/logs/**"}, method = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.PATCH, RequestMethod.DELETE})
    public ResponseEntity<?> routeToLogService(HttpServletRequest request, HttpServletResponse response) {
        String path = request.getRequestURI();
        String routePath = path.startsWith("/api/v1/admin/logs") ? "/admin/logs" : "/logs";
        return gatewayService.forwardRequest(request, response, routePath);
    }

    // Notification Service Routes
    @RequestMapping(value = "/notifications/**", method = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.PATCH, RequestMethod.DELETE})
    public ResponseEntity<?> routeToNotificationService(HttpServletRequest request, HttpServletResponse response) {
        return gatewayService.forwardRequest(request, response, "/notifications");
    }
}

