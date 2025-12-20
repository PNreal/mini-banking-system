package com.minibank.userservice.controller;

import com.minibank.userservice.dto.CreateEmployeeRequest;
import com.minibank.userservice.dto.CreateEmployeeResponse;
import com.minibank.userservice.dto.UserResponse;
import com.minibank.userservice.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/internal/users")
@RequiredArgsConstructor
public class InternalUserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<UserResponse>> getUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUser(@PathVariable("id") UUID id) {
        return ResponseEntity.ok(userService.getUser(id));
    }

    @GetMapping("/by-email")
    public ResponseEntity<UserResponse> getUserByEmail(@RequestParam("email") String email) {
        return ResponseEntity.ok(userService.getUserByEmail(email));
    }

    @PostMapping("/employees")
    public ResponseEntity<CreateEmployeeResponse> createEmployee(@Valid @RequestBody CreateEmployeeRequest request) {
        CreateEmployeeResponse response = userService.createEmployee(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PatchMapping("/{id}/lock")
    public ResponseEntity<Void> lock(@PathVariable("id") UUID id) {
        userService.lockUser(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/unlock")
    public ResponseEntity<Void> unlock(@PathVariable("id") UUID id) {
        userService.unlockUser(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/freeze")
    public ResponseEntity<Void> freeze(@PathVariable("id") UUID id) {
        userService.freezeUser(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/unfreeze")
    public ResponseEntity<Void> unfreeze(@PathVariable("id") UUID id) {
        userService.unfreezeUser(id);
        return ResponseEntity.noContent().build();
    }
}

