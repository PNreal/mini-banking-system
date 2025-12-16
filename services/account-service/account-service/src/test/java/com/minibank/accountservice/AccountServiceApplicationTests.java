package com.minibank.accountservice;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.ContextConfiguration;
import com.minibank.accountservice.config.TestKafkaConfig;

@SpringBootTest
@ActiveProfiles("test")
@ContextConfiguration(classes = {TestKafkaConfig.class})
class AccountServiceApplicationTests {

	@Test
	void contextLoads() {
	}

}
