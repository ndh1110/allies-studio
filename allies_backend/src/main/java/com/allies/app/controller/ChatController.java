package com.allies.app.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import com.allies.app.model.Chat;
import com.allies.app.service.ChatService;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ChatController {

    @Autowired
    private ChatService chatService;


    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat.sendMessage")
    @SendTo("/topic/public")
    public Chat sendMessage(@Payload Chat chatMessage) {
        // Save message to database
        chatMessage.setThoiGian(Instant.now());
        chatMessage.setTrangThai("sent");
        Chat savedMessage = chatService.saveMessage(chatMessage);
        
        // Send to specific user if it's a private message
        if (chatMessage.getMaTkB() != null) {
            messagingTemplate.convertAndSendToUser(
                chatMessage.getMaTkB().getTenDn(), 
                "/queue/messages", 
                savedMessage
            );
        }
        
        return savedMessage;
    }

    @MessageMapping("/chat.addUser")
    @SendTo("/topic/public")
    public String addUser(@Payload String username) {
        return username + " joined the chat!";
    }

    @GetMapping("/messages/{userId}")
    public ResponseEntity<List<Chat>> getMessages(@PathVariable Integer userId) {
        try {
            List<Chat> messages = chatService.getMessagesByUser(userId);
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/messages/{userId1}/{userId2}")
    public ResponseEntity<List<Chat>> getConversation(
            @PathVariable Integer userId1, 
            @PathVariable Integer userId2) {
        try {
            List<Chat> messages = chatService.getConversation(userId1, userId2);
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/send")
    public ResponseEntity<Chat> sendMessageViaRest(@RequestBody Chat chatMessage) {
        try {
            chatMessage.setThoiGian(Instant.now());
            chatMessage.setTrangThai("sent");
            Chat savedMessage = chatService.saveMessage(chatMessage);
            
            // Send via WebSocket
            messagingTemplate.convertAndSend("/topic/public", savedMessage);
            
            return ResponseEntity.ok(savedMessage);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
