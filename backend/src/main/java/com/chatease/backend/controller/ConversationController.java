package com.chatease.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.chatease.backend.dto.ConversationResponse;
import com.chatease.backend.dto.CreateConversationRequest;
import com.chatease.backend.service.ConversationService;

@RestController
@RequestMapping("/api/conversations")
public class ConversationController {

    @Autowired
    private ConversationService conversationService;

    @PostMapping
    public ConversationResponse create(@RequestBody CreateConversationRequest request,
                                       Authentication authentication) {
        return conversationService.createDirect(authentication.getName(), request.otherUserId());
    }

    @GetMapping
    public List<ConversationResponse> list(Authentication authentication) {
        return conversationService.listMine(authentication.getName());
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<Void> markRead(@PathVariable("id") Long id,
                                         Authentication authentication) {
        conversationService.markRead(authentication.getName(), id);
        return ResponseEntity.noContent().build();
    }
}