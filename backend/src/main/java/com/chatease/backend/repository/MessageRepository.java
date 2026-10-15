package com.chatease.backend.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.chatease.backend.entity.Message;

public interface MessageRepository extends JpaRepository<Message, Long> {

    List<Message> findByConversationIdOrderByCreatedAtAsc(Long conversationId);

    // chat list ka preview: sabse naya (delete na hua) message
    Optional<Message> findFirstByConversationIdAndDeletedAtIsNullOrderByIdDesc(Long conversationId);

    // user ne kabhi chat nahi padhi: doosron ke saare messages unread
    @Query("select count(m) from Message m "
            + "where m.conversation.id = :cid and m.sender.id <> :uid and m.deletedAt is null")
    long countUnreadAll(@Param("cid") Long conversationId, @Param("uid") Long userId);

    // lastReadAt ke baad aaye doosron ke messages
    @Query("select count(m) from Message m "
            + "where m.conversation.id = :cid and m.sender.id <> :uid and m.deletedAt is null "
            + "and m.createdAt > :after")
    long countUnreadAfter(@Param("cid") Long conversationId,
                          @Param("uid") Long userId,
                          @Param("after") LocalDateTime after);
}