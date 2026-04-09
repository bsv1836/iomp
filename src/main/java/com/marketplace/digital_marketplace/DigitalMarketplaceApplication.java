package com.marketplace.digital_marketplace;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;
import jakarta.annotation.PostConstruct;
import java.util.TimeZone;

@SpringBootApplication
@EnableScheduling
public class DigitalMarketplaceApplication {

	public static void main(String[] args) {
		Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();
		dotenv.entries().forEach(entry -> System.setProperty(entry.getKey(), entry.getValue()));
		SpringApplication.run(DigitalMarketplaceApplication.class, args);
	}

	@PostConstruct
	public void init() {
		// Enforce IST timezone for the application backend
		TimeZone.setDefault(TimeZone.getTimeZone("Asia/Kolkata"));
	}

}