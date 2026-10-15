package com.chatease.backend.dto;

public class AuthResponse {

    private String token;
    private Long id;
    private String name;
    private String username;
    private String email;

    public AuthResponse(String token, Long id, String name,
                        String username, String email) {
        this.token = token;
        this.id = id;
        this.name = name;
        this.username = username;
        this.email = email;
    }

    public String getToken() {
        return token;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getUsername() {
        return username;
    }

    public String getEmail() {
        return email;
    }
}