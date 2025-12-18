package com.minibank.transactionservice.controller;

import com.minibank.transactionservice.dto.ApiResponse;
import com.minibank.transactionservice.dto.CounterResponse;
import com.minibank.transactionservice.entity.Counter;
import com.minibank.transactionservice.entity.CounterStaff;
import com.minibank.transactionservice.service.CounterService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/counters")
@RequiredArgsConstructor
@Slf4j
public class CounterController {

    private final CounterService counterService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CounterResponse>>> getAllCounters() {
        List<Counter> counters = counterService.getAllActiveCounters();
        List<CounterResponse> responses = counters.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @GetMapping("/{counterId}")
    public ResponseEntity<ApiResponse<CounterResponse>> getCounter(@PathVariable UUID counterId) {
        Counter counter = counterService.getCounterById(counterId);
        return ResponseEntity.ok(ApiResponse.success(toResponse(counter)));
    }

    @GetMapping("/{counterId}/staff")
    public ResponseEntity<ApiResponse<List<UUID>>> getCounterStaff(@PathVariable UUID counterId) {
        List<CounterStaff> staff = counterService.getCounterStaff(counterId);
        List<UUID> staffIds = staff.stream()
                .map(CounterStaff::getUserId)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(staffIds));
    }

    private CounterResponse toResponse(Counter counter) {
        return CounterResponse.builder()
                .counterId(counter.getId())
                .counterCode(counter.getCounterCode())
                .name(counter.getName())
                .address(counter.getAddress())
                .maxStaff(counter.getMaxStaff())
                .adminUserId(counter.getAdminUserId())
                .isActive(counter.getIsActive())
                .createdAt(counter.getCreatedAt())
                .updatedAt(counter.getUpdatedAt())
                .build();
    }
}

