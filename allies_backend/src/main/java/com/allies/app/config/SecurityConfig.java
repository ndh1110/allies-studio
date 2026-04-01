package com.allies.app.config;

import java.util.Arrays;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import com.allies.app.repository.TaikhoanRepository;
import com.allies.app.security.JwtAuthTokenFilter;
import com.allies.app.security.JwtUtils;
import com.allies.app.service.TaikhoanService;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    // ====== 1. Password encoder ======
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // ====== 2. Service cho user details ======
    @Bean
    public TaikhoanService taikhoanService(TaikhoanRepository taikhoanRepository, PasswordEncoder passwordEncoder) {
        return new TaikhoanService(taikhoanRepository, passwordEncoder);
    }

    // ====== 3. Cấu hình AuthenticationProvider ======
    @Bean
    public DaoAuthenticationProvider authenticationProvider(TaikhoanService taikhoanService, PasswordEncoder passwordEncoder) {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(taikhoanService);
        provider.setPasswordEncoder(passwordEncoder);
        return provider;
    }

    // ====== 4. AuthenticationManager ======
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    // ====== 5. JWT filter ======
    @Bean
    public JwtAuthTokenFilter jwtAuthTokenFilter(JwtUtils jwtUtils, TaikhoanService taikhoanService) {
        return new JwtAuthTokenFilter(jwtUtils, taikhoanService);
    }

    // ====== 6. JWT utils ======
    // JwtUtils is now a @Component, so we don't need to create a bean

    // ====== 7. CORS configuration ======
    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);
        config.setAllowedOriginPatterns(Arrays.asList(
                "http://localhost:*",
                "http://localhost:4200",
                "http://127.0.0.1:*",
                "http://192.168.*.*",
                "http://10.*.*.*",
                "https://*.ngrok-free.dev",
                "https://*.ngrok.io"
        ));
        config.setAllowedHeaders(Arrays.asList("*"));
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        config.setExposedHeaders(Arrays.asList("Authorization", "Content-Type"));
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }

    // ====== 8. Security filter chain ======
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http,
                                                   JwtAuthTokenFilter jwtAuthTokenFilter,
                                                   DaoAuthenticationProvider authProvider) throws Exception {

        http
            .cors(cors -> {})
            .csrf(csrf -> csrf.disable())
            .authenticationProvider(authProvider)
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**", "/api/test/**", "/ws/**", "/api/chat/**", "/api/users/**").permitAll()
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/**").permitAll()
                .anyRequest().permitAll()
            )
            .addFilterBefore(jwtAuthTokenFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
