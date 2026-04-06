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
import java.util.Map;

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
    public Map<String, Object> sendMessage(@Payload Chat chatMessage) {
        // Save message to database
        chatMessage.setThoiGian(Instant.now());
        chatMessage.setTrangThai("sent");
        Map<String, Object> savedMessage = chatService.saveMessage(chatMessage);
        
        // Broadcast to Receiver
        Object receiverObj = savedMessage.get("maTkB");
        if (receiverObj instanceof Map) {
            @SuppressWarnings("unchecked")
            Map<String, Object> receiver = (Map<String, Object>) receiverObj;
            String receiverUsername = (String) receiver.get("username");
            if (receiverUsername != null) {
                messagingTemplate.convertAndSendToUser(
                    receiverUsername, 
                    "/queue/messages", 
                    savedMessage
                );
            }
        }

        // Broadcast back to Sender (to confirm receipt and provide server-side ID)
        Object senderObj = savedMessage.get("maTkA");
        if (senderObj instanceof Map) {
            @SuppressWarnings("unchecked")
            Map<String, Object> sender = (Map<String, Object>) senderObj;
            String senderUsername = (String) sender.get("username");
            if (senderUsername != null) {
                messagingTemplate.convertAndSendToUser(
                    senderUsername, 
                    "/queue/messages", 
                    savedMessage
                );
            }
        }
        
        return savedMessage;
    }

    @MessageMapping("/chat.addUser")
    @SendTo("/topic/public")
    public String addUser(@Payload String username) {
        return username + " joined the chat!";
    }

    @GetMapping("/messages/{userId}")
    public ResponseEntity<List<Map<String, Object>>> getMessages(@PathVariable Integer userId) {
        try {
            List<Map<String, Object>> messages = chatService.getMessagesByUser(userId);
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/messages/{userId1}/{userId2}")
    public ResponseEntity<List<Map<String, Object>>> getConversation(
            @PathVariable Integer userId1, 
            @PathVariable Integer userId2) {
        try {
            List<Map<String, Object>> messages = chatService.getConversation(userId1, userId2);
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Paginated conversation endpoint for infinite scroll.
     * GET /api/chat/messages/{userId1}/{userId2}/paged?page=0&size=20
     *
     * page=0 returns the MOST RECENT 'size' messages (already in ASC order).
     * page=1 returns the NEXT batch of older messages, and so on.
     *
     * Response shape:
     * {
     *   "messages": [...],   // chronological order, oldest-first
     *   "hasMore": true,     // false when no more older pages exist
     *   "page": 0,
     *   "totalPages": 5
     * }
     */
    @GetMapping("/messages/{userId1}/{userId2}/paged")
    public ResponseEntity<Map<String, Object>> getConversationPaged(
            @PathVariable Integer userId1,
            @PathVariable Integer userId2,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            Map<String, Object> result = chatService.getConversationPaged(userId1, userId2, page, size);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }


    @PostMapping("/send")
    public ResponseEntity<Map<String, Object>> sendMessageViaRest(@RequestBody Chat chatMessage) {
        try {
            chatMessage.setThoiGian(Instant.now());
            chatMessage.setTrangThai("sent");
            Map<String, Object> savedMessage = chatService.saveMessage(chatMessage);
            
            // Send via WebSocket
            messagingTemplate.convertAndSend("/topic/public", savedMessage);
            
            return ResponseEntity.ok(savedMessage);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/seen/{senderId}/{receiverId}")
    public ResponseEntity<Map<String, Object>> markAsSeen(
            @PathVariable Integer senderId,
            @PathVariable Integer receiverId) {
        try {
            int updated = chatService.markMessagesAsSeen(senderId, receiverId);
            Map<String, Object> result = new java.util.HashMap<>();
            result.put("updated", updated);
            result.put("senderId", senderId);
            result.put("receiverId", receiverId);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
