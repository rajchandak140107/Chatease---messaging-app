package com.chatease.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.chatease.backend.dto.MessageResponse;
import com.chatease.backend.dto.SendMessageRequest;
import com.chatease.backend.service.MessageService;

@RestController
@RequestMapping("/api/conversations/{conversationId}/messages")
public class MessageController {

    @Autowired
    private MessageService messageService;

    @PostMapping
    public MessageResponse send(@PathVariable("conversationId") Long conversationId,
                                @RequestBody SendMessageRequest request,
                                Authentication authentication) {
        return messageService.send(authentication.getName(), conversationId, request.content());
    }

    @GetMapping
    public List<MessageResponse> history(@PathVariable("conversationId") Long conversationId,
                                         Authentication authentication) {
        return messageService.history(authentication.getName(), conversationId);
    }
}