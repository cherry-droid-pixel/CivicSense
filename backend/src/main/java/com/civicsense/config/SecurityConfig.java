package com.civicsense.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

import java.util.List;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http
            .csrf(csrf -> csrf.disable())

            .cors(cors ->
                cors.configurationSource(
                    corsConfigurationSource()
                )
            )

            .formLogin(form -> form.disable())

            .httpBasic(basic -> basic.disable())

            .logout(logout -> logout.disable())

            .authorizeHttpRequests(auth -> auth

                // Health
                .requestMatchers("/health")
                .permitAll()

                // Authentication
                .requestMatchers("/api/auth/**")
                .permitAll()

                // Citizen complaints
                // Authentication handled manually
                // through HttpSession
                .requestMatchers("/api/complaints/**")
                .permitAll()

                // Image uploads
                // Authentication handled manually
                // through HttpSession
                .requestMatchers("/api/uploads/**")
                .permitAll()

                // Admin endpoints
                // Authorization handled manually
                // inside AdminController using HttpSession
                .requestMatchers("/api/admin/**")
                .permitAll()

                // Everything else
                .anyRequest()
                .authenticated()
            );

        return http.build();
    }


    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration =
                new CorsConfiguration();

        configuration.setAllowedOrigins(List.of(
                "http://127.0.0.1:5500",
                "http://localhost:5500"
        ));

        configuration.setAllowedMethods(List.of(
                "GET",
                "POST",
                "PUT",
                "DELETE",
                "OPTIONS"
        ));

        configuration.setAllowedHeaders(
                List.of("*")
        );

        // Required for JSESSIONID
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
                "/**",
                configuration
        );

        return source;
    }
}