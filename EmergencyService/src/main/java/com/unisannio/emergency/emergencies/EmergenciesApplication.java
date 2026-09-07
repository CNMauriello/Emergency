package com.unisannio.emergency.emergencies;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class EmergenciesApplication {

	public static void main(String[] args) {
		SpringApplication.run(EmergenciesApplication.class, args);
	}

}
