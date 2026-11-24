package com.teamup.config;
import com.teamup.security.OidcLoginSuccessHandler;
import com.teamup.security.JwtAuthenticationFilter;
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
import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
@Configuration @EnableWebSecurity public class SecurityConfig {
    @Bean SecurityFilterChain securityFilterChain(HttpSecurity http, OidcLoginSuccessHandler success, JwtAuthenticationFilter jwt) throws Exception {
        http.cors(Customizer.withDefaults())
            .csrf(csrf -> csrf.ignoringRequestMatchers("/api/**"))
            .authorizeHttpRequests(a -> a
                .requestMatchers("/oauth2/**","/login/**","/swagger-ui/**","/swagger-ui.html","/v3/api-docs/**","/actuator/health","/api/v1/health").permitAll()
                .requestMatchers(HttpMethod.GET,"/api/v1/events","/api/v1/posts","/api/v1/skills").permitAll()
                .requestMatchers(HttpMethod.POST,"/api/v1/events/sync").permitAll()
                .requestMatchers("/api/v1/auth/me","/api/v1/auth/logout","/api/v1/auth/refresh","/api/v1/auth/demo-login","/api/v1/admin/login").permitAll()
                .anyRequest().authenticated()
            )
            .oauth2Login(o -> o.successHandler(success))
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
            .addFilterBefore(jwt, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
    @Bean CorsConfigurationSource corsConfigurationSource(TeamUpProperties properties) {
        Set<String> origins = new LinkedHashSet<>();
        if (properties.getFrontendOrigin() != null && !properties.getFrontendOrigin().isBlank()) {
            origins.add(properties.getFrontendOrigin().trim());
        }
        if (properties.getAllowedOrigins() != null && !properties.getAllowedOrigins().isBlank()) {
            Arrays.stream(properties.getAllowedOrigins().split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .forEach(origins::add);
        }
        CorsConfiguration c=new CorsConfiguration();
        c.setAllowedOriginPatterns(List.copyOf(origins));
        c.setAllowedMethods(List.of("GET","POST","PUT","PATCH","DELETE","OPTIONS","HEAD"));
        c.setAllowedHeaders(List.of("*"));
        c.setExposedHeaders(List.of("*"));
        c.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource s=new UrlBasedCorsConfigurationSource();
        s.registerCorsConfiguration("/**",c);
        return s;
    }
}
