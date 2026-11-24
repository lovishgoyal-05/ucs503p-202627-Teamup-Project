package com.teamup.config;
import com.teamup.security.OidcLoginSuccessHandler;
import com.teamup.security.JwtAuthenticationFilter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.List;
@Configuration @EnableWebSecurity public class SecurityConfig {
    @Bean SecurityFilterChain securityFilterChain(HttpSecurity http, OidcLoginSuccessHandler success, JwtAuthenticationFilter jwt) throws Exception {
        http.cors(Customizer.withDefaults())
            .csrf(csrf -> csrf.ignoringRequestMatchers("/api/**"))
            .authorizeHttpRequests(a -> a
                .requestMatchers("/oauth2/**","/login/**","/swagger-ui/**","/swagger-ui.html","/v3/api-docs/**","/actuator/health").permitAll()
                .requestMatchers(HttpMethod.GET,"/api/v1/events","/api/v1/posts","/api/v1/skills").permitAll()
                .requestMatchers("/api/v1/auth/me","/api/v1/auth/logout","/api/v1/auth/refresh","/api/v1/auth/demo-login","/api/v1/admin/login").permitAll()
                .anyRequest().authenticated()
            )
            .oauth2Login(o -> o.successHandler(success))
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
            .addFilterBefore(jwt, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
    @Bean CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration c=new CorsConfiguration();
        c.setAllowedOriginPatterns(List.of("*"));
        c.setAllowedMethods(List.of("GET","POST","PUT","PATCH","DELETE","OPTIONS","HEAD"));
        c.setAllowedHeaders(List.of("*"));
        c.setExposedHeaders(List.of("*"));
        c.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource s=new UrlBasedCorsConfigurationSource();
        s.registerCorsConfiguration("/**",c);
        return s;
    }
}
