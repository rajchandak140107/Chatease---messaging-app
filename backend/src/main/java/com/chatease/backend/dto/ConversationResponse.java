package com.chatease.backend.dto;

import java.time.LocalDateTime;

import com.chatease.backend.entity.ConversationType;

public record ConversationResponse(
        Long id,
        ConversationType type,
        String title,
        Long otherUserId,
        String otherUserName,
        LocalDateTime updatedAt,
        String lastMessage,
        LocalDateTime lastMessageAt,
        Long lastMessageSenderId,
        int unreadCount
) {
}