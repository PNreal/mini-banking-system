package com.minibank.transactionservice;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest(properties = {
	"spring.kafka.bootstrap-servers=localhost:9092"
})
@ActiveProfiles("test")
class TransactionServiceApplicationTests {

	@Test
	void contextLoads() {
		// This test verifies that the Spring application context loads successfully
		// with all beans configured correctly
	}

}
