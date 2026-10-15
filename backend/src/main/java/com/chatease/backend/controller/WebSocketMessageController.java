package com.chatease.backend.controller;

import java.security.Principal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import com.chatease.backend.dto.MessageResponse;
import com.chatease.backend.dto.SendMessageRequest;
import com.chatease.backend.service.MessageService;

@Controller
public class WebSocketMessageController {

    @Autowired
    private MessageService messageService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/conversations/{conversationId}/send")
    public void sendMessage(
            @DestinationVariable("conversationId") Long conversationId,
            SendMessageRequest request,
            Principal principal) {

        if (principal == null) {
            throw new IllegalStateException(
                    "WebSocket user is not authenticated");
        }

        MessageResponse savedMessage = messageService.send(
                principal.getName(),
                conversationId,
                request.content()
        );

        messagingTemplate.convertAndSend(
                "/topic/conversations/" + conversationId,
                savedMessage
        );
    }
}