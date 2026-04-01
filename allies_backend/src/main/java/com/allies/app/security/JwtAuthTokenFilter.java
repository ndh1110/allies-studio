package com.allies.app.security;

import java.io.IOException;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import com.allies.app.service.TaikhoanService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public class JwtAuthTokenFilter extends OncePerRequestFilter {

    private final JwtUtils jwtUtils;
    private final TaikhoanService taikhoanService;
    
    public JwtAuthTokenFilter(JwtUtils jwtUtils, TaikhoanService taikhoanService) {
        this.jwtUtils = jwtUtils;
        this.taikhoanService = taikhoanService;
    }
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            // Skip JWT filter for /api/users/** endpoints
            String requestPath = request.getRequestURI();
            if (requestPath.startsWith("/api/users/")) {
                System.out.println("Skipping JWT filter for: " + requestPath);
                filterChain.doFilter(request, response);
                return;
            }

            // 1. Lấy JWT từ Header Authorization (Ví dụ: Bearer <token>)
            String jwt = parseJwt(request);

            // 2. Xác thực và tải người dùng
            if (jwt != null && jwtUtils.validateJwtToken(jwt)) {
                String username = jwtUtils.getUserNameFromJwtToken(jwt);

                UserDetails userDetails = taikhoanService.loadUserByUsername(username);

                // 3. Tạo đối tượng xác thực và đặt vào SecurityContext
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(userDetails,
                                null,
                                userDetails.getAuthorities());

                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (Exception e) {
            logger.error("Cannot set user authentication: {}", e);
        }

        filterChain.doFilter(request, response);
    }

    private String parseJwt(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");

        if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
            // Lấy token (bỏ qua "Bearer ")
            return headerAuth.substring(7);
        }

        return null;
    }
}