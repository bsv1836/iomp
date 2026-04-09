package com.marketplace.digital_marketplace;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;
import java.util.TimeZone;

@SpringBootApplication
@EnableScheduling
public class DigitalMarketplaceApplication {

	public static void main(String[] args) {
		// Enforce IST timezone IMMEDIATELY before Spring or Hibernate start
		TimeZone.setDefault(TimeZone.getTimeZone("Asia/Kolkata"));
		
		Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();
		dotenv.entries().forEach(entry -> System.setProperty(entry.getKey(), entry.getValue()));
		SpringApplication.run(DigitalMarketplaceApplication.class, args);
	}

}

}