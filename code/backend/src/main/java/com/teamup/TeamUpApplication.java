package com.teamup;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.scheduling.annotation.EnableScheduling;
import com.teamup.config.TeamUpProperties;
@SpringBootApplication
@EnableScheduling
@EnableConfigurationProperties(TeamUpProperties.class) public class TeamUpApplication {
    public static void main(String[] args) {
        SpringApplication.run(TeamUpApplication.class, args);
    }
}
