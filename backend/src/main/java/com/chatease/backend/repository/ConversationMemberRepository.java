package com.chatease.backend.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.chatease.backend.entity.ConversationMember;

public interface ConversationMemberRepository extends JpaRepository<ConversationMember, Long> {

    List<ConversationMember> findByUserId(Long userId);

    List<ConversationMember> findByConversationId(Long conversationId);

    boolean existsByConversationIdAndUserId(Long conversationId, Long userId);

    Optional<ConversationMember> findByConversationIdAndUserId(Long conversationId, Long userId);

    // user ki app khuli hai: uski saari chats ke messages "delivered" maan lo
    @Modifying
    @Query("update ConversationMember m set m.lastDeliveredAt = :now where m.user.id = :uid")
    int markDelivered(@Param("uid") Long userId, @Param("now") LocalDateTime now);
}