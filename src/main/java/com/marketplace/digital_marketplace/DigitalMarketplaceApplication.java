package com.marketplace.digital_marketplace;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class DigitalMarketplaceApplication {

	public static void main(String[] args) {
		SpringApplication.run(DigitalMarketplaceApplication.class, args);
	}

}