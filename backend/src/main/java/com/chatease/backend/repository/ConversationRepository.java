package com.chatease.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.chatease.backend.entity.Conversation;

public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    Optional<Conversation> findByDirectUserLowIdAndDirectUserHighId(Long lowId, Long highId);
}