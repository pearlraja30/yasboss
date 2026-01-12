package com.yasboss;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class ToysEcommerceApplication {

	public static void main(String[] args) {
		SpringApplication.run(ToysEcommerceApplication.class, args);
	}

}
