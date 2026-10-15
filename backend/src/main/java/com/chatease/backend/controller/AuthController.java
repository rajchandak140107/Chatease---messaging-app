package com.chatease.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.chatease.backend.dto.AuthResponse;
import com.chatease.backend.dto.UserResponse;
import com.chatease.backend.entity.User;
import com.chatease.backend.security.JwtUtil;
import com.chatease.backend.service.AuthService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/register")
    public UserResponse register(@RequestBody User user) {
        User savedUser = authService.register(user);

        return new UserResponse(
                savedUser.getId(),
                savedUser.getName(),
                savedUser.getUsername(),
                savedUser.getEmail()
        );
    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody User loginRequest) {
        User user = authService.login(
                loginRequest.getEmail(),
                loginRequest.getPassword()
        );

        String token = jwtUtil.generateToken(user.getEmail());

        return new AuthResponse(
                token,
                user.getId(),
                user.getName(),
                user.getUsername(),
                user.getEmail()
        );
    }
}