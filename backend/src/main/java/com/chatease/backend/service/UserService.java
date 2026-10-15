
package com.chatease.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.chatease.backend.dto.UserResponse;
import com.chatease.backend.repository.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<UserResponse> searchUsers(String query, Long currentUserId) {

        if (query == null || query.isBlank()) {
            return List.of();
        }

        return userRepository
                .findByUsernameContainingIgnoreCaseOrNameContainingIgnoreCase(
                        query.trim(), query.trim())
                .stream()
                .filter(user -> !user.getId().equals(currentUserId))
                .map(user -> new UserResponse(
                        user.getId(),
                        user.getName(),
                        user.getUsername(),
                        user.getEmail()))
                .toList();
    }
}
