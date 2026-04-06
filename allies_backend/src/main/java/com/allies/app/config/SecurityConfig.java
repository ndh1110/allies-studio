package com.allies.app.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import com.allies.app.service.TaikhoanService;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;

import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.allies.app.security.JwtAuthTokenFilter;
import com.allies.app.security.JwtUtils;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

  // ===== Core beans =====
  @Bean
  public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }

  /** Cho AuthController dùng khi login */
  @Bean
  public AuthenticationManager authenticationManager(AuthenticationConfiguration conf) throws Exception {
    return conf.getAuthenticationManager();
  }

  /**
   * Dùng UserDetailsService từ TaikhoanService (@Service implements
   * UserDetailsService).
   * Ở version Spring Security của bạn, DaoAuthenticationProvider CHƯA có ctor
   * (uds, encoder),
   * vì vậy dùng setter (deprecated ở bản mới) và tắt warning.
   */
  @Bean
  @SuppressWarnings("deprecation")
  public AuthenticationProvider daoAuthenticationProvider(
      UserDetailsService uds, PasswordEncoder encoder) {
    DaoAuthenticationProvider p = new DaoAuthenticationProvider();
    p.setUserDetailsService(uds);
    p.setPasswordEncoder(encoder);
    return p;
  }

  // ===== JWT utils & filter =====
  @Bean
  public JwtUtils jwtUtils() {
    return new JwtUtils();
  }

  /**
   * Tùy chữ ký constructor của JwtAuthTokenFilter:
   * - Nếu filter của bạn là (JwtUtils, TaikhoanService) => dùng
   * UserDetailsService uds như dưới vẫn OK
   * miễn TaikhoanService implements UserDetailsService.
   * - Nếu nó nhận đúng (JwtUtils, UserDetailsService) thì càng khớp.
   */
  @Bean
  public JwtAuthTokenFilter jwtAuthTokenFilter(JwtUtils jwtUtils, TaikhoanService taikhoanService) {
    return new JwtAuthTokenFilter(jwtUtils, taikhoanService);
  }

  // ===== Security chain =====
  @Bean
  public SecurityFilterChain securityFilterChain(
      HttpSecurity http,
      AuthenticationProvider daoProvider,
      JwtAuthTokenFilter jwtAuthTokenFilter) throws Exception {

    http
        .csrf(csrf -> csrf.disable())
        .cors(Customizer.withDefaults())
        .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(auth -> auth
            // public endpoints
            .requestMatchers("/api/auth/**", "/api/test/**", "/ws/**").permitAll()
            // protected endpoints
            .requestMatchers("/api/users/search/**").authenticated()
            .requestMatchers("/api/loimoiketban", "/api/loimoiketban/**").authenticated()
            .requestMatchers("/api/quanhe/**").authenticated()
            .requestMatchers("/api/groups/**").authenticated()
            .requestMatchers("/api/chat/**").authenticated()
            // default
            .anyRequest().authenticated())
        .authenticationProvider(daoProvider)
        .addFilterBefore(jwtAuthTokenFilter, UsernamePasswordAuthenticationFilter.class);

    return http.build();
  }

  // ===== CORS (localhost + ngrok) =====
  // @Bean
  // public CorsConfigurationSource corsConfigurationSource() {
  // CorsConfiguration cfg = new CorsConfiguration();
  // cfg.setAllowCredentials(true);
  // cfg.setAllowedOriginPatterns(List.of(
  // "http://localhost:4200",
  // "https://*.ngrok-free.dev",
  // "https://*.ngrok.io"
  // ));
  // cfg.setAllowedMethods(List.of("GET","POST","PUT","DELETE","OPTIONS","PATCH"));
  // cfg.setAllowedHeaders(List.of("*"));
  // cfg.setExposedHeaders(List.of("Authorization"));

  // UrlBasedCorsConfigurationSource source = new
  // UrlBasedCorsConfigurationSource();
  // source.registerCorsConfiguration("/**", cfg);
  // return source;
  // }
  @Bean
  public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration cfg = new CorsConfiguration();
    cfg.setAllowCredentials(true);

    // Đổi thành dấu * để nhận mọi IP khi test LAN
    cfg.setAllowedOriginPatterns(List.of("*"));

    cfg.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
    cfg.setAllowedHeaders(List.of("*"));
    cfg.setExposedHeaders(List.of("Authorization"));

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", cfg);
    return source;
  }
}
