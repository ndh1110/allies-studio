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

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtils.generateJwtToken(authentication);

            Taikhoan user = taikhoanService.getTaikhoanByTenDn(loginRequest.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            return ResponseEntity.ok(new JwtResponse(jwt, user.getMaTk(), user.getTenDn()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Invalid username or password");
        }
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        try {
            if (taikhoanService.getTaikhoanByTenDn(signUpRequest.getUsername()).isPresent()) {
                return ResponseEntity.badRequest().body("Username is already taken!");
            }

            Taikhoan user = new Taikhoan();
            user.setTenDn(signUpRequest.getUsername());
            user.setMk(signUpRequest.getPassword());
            user.setAvarta("default-avatar.png");

            taikhoanService.createTaikhoan(user);

            return ResponseEntity.ok("User registered successfully!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
}
