package com.gestock;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class GestockApplication {

    public static void main(String[] args) {
        SpringApplication.run(GestockApplication.class, args);

        System.out.println("Trabajando");
    }
}