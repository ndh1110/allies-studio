package com.allies.app.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import com.allies.app.model.Chat;
import com.allies.app.model.Taikhoan;
import com.allies.app.service.ChatService;
import com.allies.app.service.UserPresenceService;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ChatController {

    @Autowired
    private ChatService chatService;

    @Autowired
    private UserPresenceService userPresenceService;


    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload Chat chatMessage) {
        try {
            System.out.println("=== RECEIVED WEBSOCKET MESSAGE ===");
            System.out.println("From: " + chatMessage.getMaTkA().getTenDn() + " (ID: " + chatMessage.getMaTkA().getMaTk() + ")");
            System.out.println("To: " + chatMessage.getMaTkB().getTenDn() + " (ID: " + chatMessage.getMaTkB().getMaTk() + ")");
            System.out.println("Content: " + chatMessage.getNoiDung());
            
            // Save message to database
            chatMessage.setThoiGian(Instant.now());
            chatMessage.setTrangThai("sent");
            Chat savedMessage = chatService.saveMessage(chatMessage);
            System.out.println("Message saved with ID: " + savedMessage.getId());
            
            // Send to specific users if it's a private message
            if (chatMessage.getMaTkB() != null) {
                System.out.println("Sending message to receiver: " + chatMessage.getMaTkB().getTenDn());
                
                // Only send to receiver, not sender (to avoid duplicates)
                String receiverTopic = "/topic/messages." + chatMessage.getMaTkB().getTenDn();
                
                System.out.println("Sending to receiver topic: " + receiverTopic);
                messagingTemplate.convertAndSend(receiverTopic, savedMessage);
                
                // Also send to sender topic for confirmation (but only if different from receiver)
                if (!chatMessage.getMaTkA().getTenDn().equals(chatMessage.getMaTkB().getTenDn())) {
                    String senderTopic = "/topic/messages." + chatMessage.getMaTkA().getTenDn();
                    System.out.println("Sending to sender topic: " + senderTopic);
                    messagingTemplate.convertAndSend(senderTopic, savedMessage);
                }
            } else {
                // Send to public topic if no specific receiver
                messagingTemplate.convertAndSend("/topic/public", savedMessage);
            }
        } catch (Exception e) {
            System.err.println("Error sending message: " + e.getMessage());
        }
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
            System.err.println("Error getting messages for user " + userId + ": " + e.getMessage());
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
            System.err.println("Error getting conversation between users " + userId1 + " and " + userId2 + ": " + e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/send")
    public ResponseEntity<Chat> sendMessageViaRest(@RequestBody Chat chatMessage) {
        try {
            chatMessage.setThoiGian(Instant.now());
            chatMessage.setTrangThai("sent");
            Chat savedMessage = chatService.saveMessage(chatMessage);
            
            // REST API chỉ lưu tin nhắn, không gửi qua WebSocket
            // WebSocket sẽ tự động gửi khi có tin nhắn mới
            System.out.println("REST: Message saved with ID: " + savedMessage.getId());
            
            return ResponseEntity.ok(savedMessage);
        } catch (Exception e) {
            System.err.println("Error sending message via REST: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @MessageMapping("/chat.typing")
    public void handleTyping(@Payload String typingData) {
        // Forward typing indicator to the other user
        messagingTemplate.convertAndSend("/topic/typing", typingData);
    }

    @MessageMapping("/chat.read")
    public void markMessageAsRead(@Payload String messageId) {
        // Update message status to read
        try {
            Integer id = Integer.parseInt(messageId);
            chatService.markMessageAsRead(id);
        } catch (Exception e) {
            // Handle error
        }
    }

    @MessageMapping("/user.connect")
    public void handleUserConnect(@Payload String userData) {
        try {
            // Parse user data if it's JSON
            if (userData.startsWith("{")) {
                // Extract username from JSON
                String username = extractUsernameFromJson(userData);
                userPresenceService.userConnected(username);
                System.out.println("User connected via JSON: " + username);
            } else {
                // Direct username
                userPresenceService.userConnected(userData);
                System.out.println("User connected: " + userData);
            }
        } catch (Exception e) {
            System.err.println("Error handling user connect: " + e.getMessage());
        }
    }

    private String extractUsernameFromJson(String jsonData) {
        try {
            // Simple JSON parsing to extract username
            if (jsonData.contains("\"tenDn\"")) {
                int startIndex = jsonData.indexOf("\"tenDn\":\"") + 8;
                int endIndex = jsonData.indexOf("\"", startIndex);
                return jsonData.substring(startIndex, endIndex);
            }
            return jsonData; // Fallback
        } catch (Exception e) {
            return jsonData; // Fallback
        }
    }

    @MessageMapping("/user.disconnect")
    public void handleUserDisconnect(@Payload String userData) {
        // Update user presence
        userPresenceService.userDisconnected(userData);
    }
    
    @GetMapping("/online-users")
    public ResponseEntity<List<Object>> getOnlineUsers() {
        try {
            List<Object> onlineUsers = new ArrayList<>();
            userPresenceService.getOnlineUsers().forEach(user -> {
                Map<String, Object> userInfo = new HashMap<>();
                userInfo.put("id", user.getMaTk());
                userInfo.put("tenDn", user.getTenDn());
                userInfo.put("avarta", user.getAvarta());
                userInfo.put("email", user.getTenDn() + "@example.com"); // Mock email
                onlineUsers.add(userInfo);
            });
            return ResponseEntity.ok(onlineUsers);
        } catch (Exception e) {
            System.err.println("Error getting online users: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/conversations/{userId}")
    public ResponseEntity<List<Object>> getConversations(@PathVariable Integer userId) {
        try {
            System.out.println("Getting conversations for user: " + userId);
            
            // Get all messages for this user
            List<Chat> allMessages = chatService.getMessagesByUser(userId);
            System.out.println("Found " + allMessages.size() + " messages for user " + userId);
            
            // Group messages by conversation partner
            Map<Integer, Chat> lastMessages = new HashMap<>();
            Map<Integer, Integer> unreadCounts = new HashMap<>();
            
            for (Chat message : allMessages) {
                try {
                    Integer partnerId;
                    if (message.getMaTkA().getMaTk().equals(userId)) {
                        partnerId = message.getMaTkB().getMaTk();
                    } else {
                        partnerId = message.getMaTkA().getMaTk();
                    }
                    
                    // Keep the latest message for each partner
                    if (!lastMessages.containsKey(partnerId) || 
                        message.getThoiGian().isAfter(lastMessages.get(partnerId).getThoiGian())) {
                        lastMessages.put(partnerId, message);
                    }
                    
                    // Count unread messages (messages where user is receiver and status is 'sent')
                    if (message.getMaTkB().getMaTk().equals(userId) && "sent".equals(message.getTrangThai())) {
                        unreadCounts.put(partnerId, unreadCounts.getOrDefault(partnerId, 0) + 1);
                    }
                } catch (Exception e) {
                    System.err.println("Error processing message: " + e.getMessage());
                    e.printStackTrace();
                }
            }
            
            // Convert to response format
            List<Object> conversations = new ArrayList<>();
            for (Map.Entry<Integer, Chat> entry : lastMessages.entrySet()) {
                try {
                    Integer partnerId = entry.getKey();
                    Chat lastMessage = entry.getValue();
                    
                    // Get partner info
                    Taikhoan partner = lastMessage.getMaTkA().getMaTk().equals(userId) ? 
                        lastMessage.getMaTkB() : lastMessage.getMaTkA();
                    
                    Map<String, Object> conversation = new HashMap<>();
                    conversation.put("partnerId", partnerId);
                    conversation.put("partnerName", partner.getTenDn());
                    conversation.put("partnerAvatar", partner.getAvarta() != null ? partner.getAvarta() : "default-avatar.png");
                    conversation.put("lastMessage", lastMessage.getNoiDung());
                    conversation.put("lastMessageTime", lastMessage.getThoiGian());
                    conversation.put("unreadCount", unreadCounts.getOrDefault(partnerId, 0));
                    conversation.put("isOnline", userPresenceService.isUserOnline(partner.getTenDn()));
                    
                    conversations.add(conversation);
                } catch (Exception e) {
                    System.err.println("Error processing conversation: " + e.getMessage());
                    e.printStackTrace();
                }
            }
            
            // Sort by last message time (newest first)
            conversations.sort((a, b) -> {
                try {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> convA = (Map<String, Object>) a;
                    @SuppressWarnings("unchecked")
                    Map<String, Object> convB = (Map<String, Object>) b;
                    Instant timeA = (Instant) convA.get("lastMessageTime");
                    Instant timeB = (Instant) convB.get("lastMessageTime");
                    return timeB.compareTo(timeA);
                } catch (Exception e) {
                    return 0;
                }
            });
            
            System.out.println("Returning " + conversations.size() + " conversations");
            return ResponseEntity.ok(conversations);
            
        } catch (Exception e) {
            System.err.println("Error getting conversations: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.ok(new ArrayList<>()); // Return empty list instead of 400
        }
    }
}
