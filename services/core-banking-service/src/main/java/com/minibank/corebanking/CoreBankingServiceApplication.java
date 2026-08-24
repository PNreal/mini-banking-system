package com.minibank.corebanking;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class CoreBankingServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(CoreBankingServiceApplication.class, args);
    }
}
