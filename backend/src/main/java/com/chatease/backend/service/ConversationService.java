package com.chatease.backend.service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.chatease.backend.dto.ConversationResponse;
import com.chatease.backend.entity.Conversation;
import com.chatease.backend.entity.ConversationMember;
import com.chatease.backend.entity.ConversationType;
import com.chatease.backend.entity.MemberRole;
import com.chatease.backend.entity.Message;
import com.chatease.backend.entity.User;
import com.chatease.backend.repository.ConversationMemberRepository;
import com.chatease.backend.repository.ConversationRepository;
import com.chatease.backend.repository.MessageRepository;
import com.chatease.backend.repository.UserRepository;

@Service
public class ConversationService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ConversationRepository conversationRepository;

    @Autowired
    private ConversationMemberRepository memberRepository;

    @Autowired
    private MessageRepository messageRepository;

    @Transactional
    public ConversationResponse createDirect(String currentEmail, Long otherUserId) {
        User me = userRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        if (otherUserId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "otherUserId is required");
        }

        // self-chat allowed ("Message yourself"), isliye other == me ho sakta hai
        User other = me.getId().equals(otherUserId)
                ? me
                : userRepository.findById(otherUserId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Other user not found"));

        // hamesha chhota id "low", bada id "high" (self-chat mein dono same)
        User low = me.getId() <= other.getId() ? me : other;
        User high = me.getId() <= other.getId() ? other : me;

        // pehle se conversation hai toh wahi wapas do
        Conversation conversation = conversationRepository
                .findByDirectUserLowIdAndDirectUserHighId(low.getId(), high.getId())
                .orElseGet(() -> {
                    Conversation c = new Conversation();
                    c.setType(ConversationType.DIRECT);
                    c.setDirectUserLow(low);
                    c.setDirectUserHigh(high);
                    Conversation saved = conversationRepository.save(c);

                    addMember(saved, low);
                    // self-chat mein ek hi member banega
                    if (!low.getId().equals(high.getId())) {
                        addMember(saved, high);
                    }
                    return saved;
                });

        return toResponse(conversation, me);
    }

    // readOnly nahi hai, kyunki yahan "delivered" update hota hai
    @Transactional
    public List<ConversationResponse> listMine(String currentEmail) {
        User me = userRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        // user ki app khuli hai aur list le rahi hai: uske saare messages delivered
        memberRepository.markDelivered(me.getId(), LocalDateTime.now());

        return memberRepository.findByUserId(me.getId()).stream()
                .map(ConversationMember::getConversation)
                .map(c -> toResponse(c, me))
                .sorted(Comparator.comparing(
                        ConversationResponse::updatedAt,
                        Comparator.nullsLast(Comparator.<LocalDateTime>reverseOrder())))
                .toList();
    }

    @Transactional
    public void markRead(String currentEmail, Long conversationId) {
        User me = userRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        ConversationMember member = memberRepository
                .findByConversationIdAndUserId(conversationId, me.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Not a member of this conversation"));

        LocalDateTime now = LocalDateTime.now();
        member.setLastReadAt(now);
        member.setLastDeliveredAt(now); // jo padha wo deliver bhi hua
        memberRepository.save(member);
    }

    private void addMember(Conversation conversation, User user) {
        ConversationMember member = new ConversationMember();
        member.setConversation(conversation);
        member.setUser(user);
        member.setRole(MemberRole.MEMBER);
        memberRepository.save(member);
    }

    private static String preview(String text) {
        if (text == null) return null;
        String t = text.replaceAll("\\s+", " ").trim();
        return t.length() > 80 ? t.substring(0, 80) + "…" : t;
    }

    private ConversationResponse toResponse(Conversation c, User me) {
        Long otherId = null;
        String otherName = null;

        if (c.getType() == ConversationType.DIRECT) {
            User other = c.getDirectUserLow().getId().equals(me.getId())
                    ? c.getDirectUserHigh()
                    : c.getDirectUserLow();
            otherId = other.getId();
            otherName = other.getName();
        }

        Message last = messageRepository
                .findFirstByConversationIdAndDeletedAtIsNullOrderByIdDesc(c.getId())
                .orElse(null);

        LocalDateTime lastRead = memberRepository
                .findByConversationIdAndUserId(c.getId(), me.getId())
                .map(ConversationMember::getLastReadAt)
                .orElse(null);

        long unread = lastRead == null
                ? messageRepository.countUnreadAll(c.getId(), me.getId())
                : messageRepository.countUnreadAfter(c.getId(), me.getId(), lastRead);

        LocalDateTime lastAt = last == null ? null : last.getCreatedAt();
        LocalDateTime activity = lastAt != null ? lastAt : c.getUpdatedAt();

        return new ConversationResponse(
                c.getId(), c.getType(), c.getTitle(), otherId, otherName,
                activity,
                last == null ? null : preview(last.getContent()),
                lastAt,
                last == null ? null : last.getSender().getId(),
                (int) unread);
    }
}