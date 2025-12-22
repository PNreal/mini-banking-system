package com.minibank.transactionservice.config;

import com.minibank.transactionservice.entity.Counter;
import com.minibank.transactionservice.repository.CounterRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class CounterDataInitializer implements CommandLineRunner {

    private final CounterRepository counterRepository;

    @Override
    public void run(String... args) {
        if (counterRepository.count() == 0) {
            log.info("Initializing sample counter data...");
            
            List<Counter> counters = List.of(
                createCounter("Q001", "Quầy Giao Dịch 1", "Tầng 1 - Khu A", 5),
                createCounter("Q002", "Quầy Giao Dịch 2", "Tầng 1 - Khu B", 5),
                createCounter("Q003", "Quầy Giao Dịch 3", "Tầng 2 - Khu A", 3),
                createCounter("Q004", "Quầy VIP", "Tầng 3 - Khu VIP", 2)
            );
            
            counterRepository.saveAll(counters);
            log.info("Created {} sample counters", counters.size());
        } else {
            log.info("Counters already exist, skipping initialization");
        }
    }

    private Counter createCounter(String code, String name, String address, int maxStaff) {
        Counter counter = new Counter();
        counter.setId(UUID.randomUUID());
        counter.setCounterCode(code);
        counter.setName(name);
        counter.setAddress(address);
        counter.setMaxStaff(maxStaff);
        counter.setIsActive(true);
        counter.setCreatedAt(OffsetDateTime.now());
        counter.setUpdatedAt(OffsetDateTime.now());
        return counter;
    }
}
