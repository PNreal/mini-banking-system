package com.minibank.logservice.service;

import com.minibank.logservice.dto.LogFilterRequest;
import com.minibank.logservice.dto.LogRequest;
import com.minibank.logservice.dto.LogResponse;
import com.minibank.logservice.entity.Log;
import com.minibank.logservice.repository.LogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class LogService {

    private final LogRepository logRepository;

    /**
     * Create a new log entry
     */
    @Transactional
    public LogResponse createLog(LogRequest request) {
        log.debug("Creating log entry for user: {}, action: {}", request.getUserId(), request.getAction());

        try {
            Log logEntity = Log.builder()
                    .userId(request.getUserId())
                    .action(request.getAction())
                    .detail(request.getDetail())
                    .time(LocalDateTime.now())
                    .build();

            Log savedLog = logRepository.save(logEntity);
            log.info("Log entry created successfully: logId={}, userId={}, action={}", 
                    savedLog.getLogId(), savedLog.getUserId(), savedLog.getAction());

            return mapToResponse(savedLog);
        } catch (Exception e) {
            log.error("Failed to create log entry: userId={}, action={}, error={}", 
                    request.getUserId(), request.getAction(), e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Get all logs (admin only)
     */
    public Page<LogResponse> getAllLogs(Pageable pageable) {
        log.debug("Fetching all logs with pagination: page={}, size={}", pageable.getPageNumber(), pageable.getPageSize());
        return logRepository.findAll(pageable)
                .map(this::mapToResponse);
    }

    /**
     * Get logs for a specific user
     */
    public Page<LogResponse> getUserLogs(UUID userId, Pageable pageable) {
        log.debug("Fetching logs for user: {}", userId);
        return logRepository.findByUserIdOrderByTimeDesc(userId, pageable)
                .map(this::mapToResponse);
    }

    /**
     * Get logs by action
     */
    public Page<LogResponse> getLogsByAction(String action, Pageable pageable) {
        log.debug("Fetching logs by action: {}", action);
        return logRepository.findByActionOrderByTimeDesc(action, pageable)
                .map(this::mapToResponse);
    }

    /**
     * Get logs within time range
     */
    public Page<LogResponse> getLogsByTimeRange(LocalDateTime startTime, LocalDateTime endTime, Pageable pageable) {
        log.debug("Fetching logs between {} and {}", startTime, endTime);
        return logRepository.findByTimeBetween(startTime, endTime, pageable)
                .map(this::mapToResponse);
    }

    /**
     * Get user logs within time range
     */
    public Page<LogResponse> getUserLogsByTimeRange(UUID userId, LocalDateTime startTime, LocalDateTime endTime, Pageable pageable) {
        log.debug("Fetching logs for user {} between {} and {}", userId, startTime, endTime);
        return logRepository.findByUserIdAndTimeBetween(userId, startTime, endTime, pageable)
                .map(this::mapToResponse);
    }

    /**
     * Search logs with filters
     */
    public Page<LogResponse> searchLogs(LogFilterRequest filter, Pageable pageable) {
        log.debug("Searching logs with filters: userId={}, action={}, startTime={}, endTime={}", 
                filter.getUserId(), filter.getAction(), filter.getStartTime(), filter.getEndTime());

        Page<Log> logs;
        
        if (filter.getUserId() != null && filter.getStartTime() != null && filter.getEndTime() != null) {
            logs = logRepository.findByUserIdAndTimeBetween(
                    filter.getUserId(), 
                    filter.getStartTime(), 
                    filter.getEndTime(), 
                    pageable
            );
        } else if (filter.getUserId() != null) {
            logs = logRepository.findByUserIdOrderByTimeDesc(filter.getUserId(), pageable);
        } else if (filter.getStartTime() != null && filter.getEndTime() != null) {
            logs = logRepository.findByTimeBetween(filter.getStartTime(), filter.getEndTime(), pageable);
        } else if (filter.getAction() != null) {
            logs = logRepository.findByActionOrderByTimeDesc(filter.getAction(), pageable);
        } else {
            logs = logRepository.findAll(pageable);
        }

        // Filter by action if specified
        if (filter.getAction() != null && !filter.getAction().trim().isEmpty()) {
            List<Log> filtered = logs.getContent().stream()
                    .filter(log -> log.getAction().equalsIgnoreCase(filter.getAction()))
                    .collect(Collectors.toList());
            logs = new PageImpl<>(filtered, pageable, filtered.size());
        }

        return logs.map(this::mapToResponse);
    }

    /**
     * Get log statistics
     */
    public Map<String, Object> getStatistics(UUID userId, LocalDateTime startTime, LocalDateTime endTime) {
        log.debug("Getting statistics for user: {}, from {} to {}", userId, startTime, endTime);
        
        Pageable pageable = PageRequest.of(0, Integer.MAX_VALUE);
        Page<Log> logs;
        
        if (userId != null && startTime != null && endTime != null) {
            logs = logRepository.findByUserIdAndTimeBetween(userId, startTime, endTime, pageable);
        } else if (userId != null) {
            logs = logRepository.findByUserIdOrderByTimeDesc(userId, pageable);
        } else if (startTime != null && endTime != null) {
            logs = logRepository.findByTimeBetween(startTime, endTime, pageable);
        } else {
            logs = logRepository.findAll(pageable);
        }

        Map<String, Object> stats = new java.util.HashMap<>();
        stats.put("totalLogs", logs.getTotalElements());
        stats.put("startTime", startTime);
        stats.put("endTime", endTime);
        
        // Count by action
        Map<String, Long> actionCounts = logs.getContent().stream()
                .collect(Collectors.groupingBy(Log::getAction, Collectors.counting()));
        stats.put("actionCounts", actionCounts);
        
        return stats;
    }

    /**
     * Map entity to response DTO
     */
    private LogResponse mapToResponse(Log log) {
        return LogResponse.builder()
                .logId(log.getLogId())
                .userId(log.getUserId())
                .action(log.getAction())
                .detail(log.getDetail())
                .time(log.getTime())
                .build();
    }
}

