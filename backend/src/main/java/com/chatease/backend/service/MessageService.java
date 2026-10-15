package com.chatease.backend.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.chatease.backend.dto.MessageResponse;
import com.chatease.backend.entity.Conversation;
import com.chatease.backend.entity.ConversationMember;
import com.chatease.backend.entity.Message;
import com.chatease.backend.entity.User;
import com.chatease.backend.repository.ConversationMemberRepository;
import com.chatease.backend.repository.ConversationRepository;
import com.chatease.backend.repository.MessageRepository;
import com.chatease.backend.repository.UserRepository;

@Service
public class MessageService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ConversationRepository conversationRepository;

    @Autowired
    private ConversationMemberRepository memberRepository;

    @Autowired
    private MessageRepository messageRepository;

    @Transactional
    public MessageResponse send(String currentEmail, Long conversationId, String content) {
        User me = findUser(currentEmail);
        Conversation conversation = findConversation(conversationId);
        requireMember(conversationId, me.getId());

        if (content == null || content.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Message cannot be empty");
        }

        Message message = new Message();
        message.setConversation(conversation);
        message.setSender(me);
        message.setContent(content.trim());
        Message saved = messageRepository.save(message);

        // chat list latest activity se sort ho sake
        conversation.setUpdatedAt(LocalDateTime.now());
        conversationRepository.save(conversation);

        // reply karne ka matlab hai purane messages padh liye (WhatsApp jaisa)
        memberRepository.findByConversationIdAndUserId(conversationId, me.getId())
                .ifPresent(m -> {
                    m.setLastReadAt(LocalDateTime.now());
                    memberRepository.save(m);
                });

        List<ConversationMember> members = memberRepository.findByConversationId(conversationId);
        return toResponse(saved, members, me.getId());
    }

    @Transactional(readOnly = true)
    public List<MessageResponse> history(String currentEmail, Long conversationId) {
        User me = findUser(currentEmail);
        findConversation(conversationId);
        requireMember(conversationId, me.getId());

        List<ConversationMember> members = memberRepository.findByConversationId(conversationId);

        return messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId).stream()
                .map(m -> toResponse(m, members, me.getId()))
                .toList();
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    private Conversation findConversation(Long id) {
        return conversationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Conversation not found"));
    }

    private void requireMember(Long conversationId, Long userId) {
        if (!memberRepository.existsByConversationIdAndUserId(conversationId, userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not a member of this conversation");
        }
    }

    // time t message ke baad ka hai ya nahi
    private boolean reached(LocalDateTime t, Message m) {
        return t != null && !t.isBefore(m.getCreatedAt());
    }

    // Sirf mere bheje messages ka status hota hai, doosron ke messages ka null
    private String statusFor(Message m, List<ConversationMember> members, Long meId) {
        if (!m.getSender().getId().equals(meId)) {
            return null;
        }

        List<ConversationMember> others = members.stream()
                .filter(x -> !x.getUser().getId().equals(meId))
                .toList();

        // self-chat: doosra member nahi, toh seen maan lo
        if (others.isEmpty()) {
            return "READ";
        }

        boolean allRead = others.stream().allMatch(x -> reached(x.getLastReadAt(), m));
        if (allRead) {
            return "READ";
        }

        boolean allDelivered = others.stream().allMatch(x ->
                reached(x.getLastDeliveredAt(), m) || reached(x.getLastReadAt(), m));

        return allDelivered ? "DELIVERED" : "SENT";
    }

    private MessageResponse toResponse(Message m, List<ConversationMember> members, Long meId) {
        return new MessageResponse(
                m.getId(),
                m.getConversation().getId(),
                m.getSender().getId(),
                m.getSender().getName(),
                m.getContent(),
                m.getCreatedAt(),
                statusFor(m, members, meId));
    }
}