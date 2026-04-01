package com.allies.app.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.allies.app.model.Taikhoan;
import com.allies.app.payload.request.LoginRequest;
import com.allies.app.payload.request.SignupRequest;
import com.allies.app.payload.response.JwtResponse;
import com.allies.app.security.JwtUtils;
import com.allies.app.service.TaikhoanService;

import java.util.Optional;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private TaikhoanService taikhoanService;

    @Autowired
    private JwtUtils jwtUtils;

    @PostMapping(value = "/login", consumes = "application/json", produces = "application/json")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        try {
            System.out.println("=== LOGIN DEBUG ===");
            System.out.println("Username: " + loginRequest.getUsername());
            System.out.println("Password: " + loginRequest.getPassword());
            
            // Manual validation
            if (loginRequest.getUsername() == null || loginRequest.getUsername().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Tên người dùng không được để trống!");
            }
            
            if (loginRequest.getPassword() == null || loginRequest.getPassword().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Mật khẩu không được để trống!");
            }
            
            // Kiểm tra user có tồn tại không
            Optional<Taikhoan> userOpt = taikhoanService.getTaikhoanByTenDn(loginRequest.getUsername());
            if (userOpt.isEmpty()) {
                System.out.println("User not found: " + loginRequest.getUsername());
                return ResponseEntity.badRequest().body("Tên người dùng không tồn tại!");
            }
            
            Taikhoan user = userOpt.get();
            System.out.println("User found: " + user.getTenDn());
            System.out.println("Stored password hash: " + user.getMk());
            System.out.println("Input password: " + loginRequest.getPassword());
            
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtils.generateJwtToken(authentication);

            return ResponseEntity.ok(new JwtResponse(jwt, user.getMaTk(), user.getTenDn(), ""));
        } catch (Exception e) {
            System.out.println("Login error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Tên người dùng hoặc mật khẩu không đúng!");
        }
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        try {
            // Kiểm tra username đã tồn tại (case-insensitive)
            if (taikhoanService.getTaikhoanByTenDn(signUpRequest.getUsername()).isPresent()) {
                return ResponseEntity.badRequest().body("Tên người dùng đã tồn tại!");
            }

            // Validate input
            if (signUpRequest.getUsername() == null || signUpRequest.getUsername().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Tên người dùng không được để trống!");
            }
            
            if (signUpRequest.getPassword() == null || signUpRequest.getPassword().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Mật khẩu không được để trống!");
            }

            Taikhoan user = new Taikhoan();
            user.setTenDn(signUpRequest.getUsername().trim());
            user.setMk(signUpRequest.getPassword()); // Sẽ được encode trong service
            user.setAvarta("default-avatar.png");

            taikhoanService.createTaikhoan(user);

            return ResponseEntity.ok("Đăng ký thành công!");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi hệ thống: " + e.getMessage());
        }
    }
}
