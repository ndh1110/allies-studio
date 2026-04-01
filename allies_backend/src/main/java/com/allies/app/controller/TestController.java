package com.allies.app.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.allies.app.model.Taikhoan;
import com.allies.app.model.Quanhe;
import com.allies.app.model.Chat;
import com.allies.app.service.TaikhoanService;
import com.allies.app.service.QuanheService;
import com.allies.app.service.ChatService;

import java.util.List;
import java.util.Optional;
import java.util.ArrayList;
import java.util.HashMap;

@RestController
@RequestMapping("/api/test")
@CrossOrigin(origins = "*", maxAge = 3600)
public class TestController {

    @Autowired
    private TaikhoanService taikhoanService;

    @Autowired
    private QuanheService quanheService;

    @Autowired
    private ChatService chatService;

    @GetMapping("/users")
    public List<Taikhoan> getAllUsers() {
        return taikhoanService.getAllTaikhoan();
    }

    @GetMapping("/user/{username}")
    public Optional<Taikhoan> getUserByUsername(@PathVariable String username) {
        return taikhoanService.getTaikhoanByTenDn(username);
    }

    @PostMapping("/create-test-user")
    public String createTestUser() {
        try {
            // Kiểm tra xem user đã tồn tại chưa
            Optional<Taikhoan> existingUser = taikhoanService.getTaikhoanByTenDn("user1");
            if (existingUser.isPresent()) {
                return "User user1 already exists with password hash: " + existingUser.get().getMk();
            }
            
            Taikhoan testUser = new Taikhoan();
            testUser.setTenDn("user1");
            testUser.setMk("123456"); // Sẽ được encode trong service
            testUser.setAvarta("default-avatar.png");
            
            Taikhoan createdUser = taikhoanService.createTaikhoan(testUser);
            return "Test user created successfully: " + createdUser.getTenDn() + ", Password hash: " + createdUser.getMk();
        } catch (Exception e) {
            return "Error creating test user: " + e.getMessage();
        }
    }

    @PostMapping("/check-password")
    public String checkPassword(@RequestParam String username, @RequestParam String password) {
        try {
            Optional<Taikhoan> userOpt = taikhoanService.getTaikhoanByTenDn(username);
            if (userOpt.isEmpty()) {
                return "User not found: " + username;
            }
            
            Taikhoan user = userOpt.get();
            return "User found: " + user.getTenDn() + ", Password hash: " + user.getMk();
        } catch (Exception e) {
            return "Error: " + e.getMessage();
        }
    }

    @PostMapping("/test-bcrypt")
    public String testBcrypt(@RequestParam String password, @RequestParam String hash) {
        try {
            org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder encoder = 
                new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder();
            
            boolean matches = encoder.matches(password, hash);
            return "Password: " + password + ", Hash: " + hash + ", Matches: " + matches;
        } catch (Exception e) {
            return "Error: " + e.getMessage();
        }
    }

    @PostMapping("/create-friendship")
    public String createFriendship(@RequestBody java.util.Map<String, String> request) {
        String username1 = request.get("username1");
        String username2 = request.get("username2");
        
        if (username1 == null || username1.trim().isEmpty()) {
            return "Username1 is required";
        }
        if (username2 == null || username2.trim().isEmpty()) {
            return "Username2 is required";
        }
        if (username1.equals(username2)) {
            return "Cannot create friendship with yourself";
        }
        
        try {
            // Tìm user1
            Optional<Taikhoan> user1Opt = taikhoanService.getTaikhoanByTenDn(username1);
            if (user1Opt.isEmpty()) {
                return "User not found: " + username1;
            }
            
            // Tìm user2
            Optional<Taikhoan> user2Opt = taikhoanService.getTaikhoanByTenDn(username2);
            if (user2Opt.isEmpty()) {
                return "User not found: " + username2;
            }
            
            Taikhoan user1 = user1Opt.get();
            Taikhoan user2 = user2Opt.get();
            
            // Tạo quan hệ bạn bè
            Quanhe friendship = quanheService.addFriend(user1.getMaTk(), user2.getMaTk());
            
            return "Friendship created successfully between " + username1 + " (ID: " + user1.getMaTk() + 
                   ") and " + username2 + " (ID: " + user2.getMaTk() + "). Relationship ID: " + friendship.getId();
                   
        } catch (Exception e) {
            return "Error creating friendship: " + e.getMessage();
        }
    }

    @GetMapping("/friends/{username}")
    public String getFriends(@PathVariable String username) {
        try {
            Optional<Taikhoan> userOpt = taikhoanService.getTaikhoanByTenDn(username);
            if (userOpt.isEmpty()) {
                return "User not found: " + username;
            }
            
            Taikhoan user = userOpt.get();
            List<Quanhe> friends = quanheService.getFriends(user.getMaTk());
            
            if (friends.isEmpty()) {
                return "User " + username + " has no friends yet.";
            }
            
            StringBuilder result = new StringBuilder("Friends of " + username + ":\n");
            for (Quanhe friendship : friends) {
                String friendName;
                if (friendship.getMaTkA().getMaTk().equals(user.getMaTk())) {
                    friendName = friendship.getMaTkB().getTenDn();
                } else {
                    friendName = friendship.getMaTkA().getTenDn();
                }
                result.append("- ").append(friendName).append(" (since: ").append(friendship.getNgayKetBan()).append(")\n");
            }
            
            return result.toString();
            
        } catch (Exception e) {
            return "Error getting friends: " + e.getMessage();
        }
    }

    // Friends API moved to UserController

    @PostMapping("/test-chat")
    public String testChat(@RequestBody java.util.Map<String, Object> request) {
        try {
            String username1 = (String) request.get("username1");
            String username2 = (String) request.get("username2");
            String message = (String) request.get("message");
            
            if (username1 == null || username2 == null || message == null) {
                return "Missing required fields: username1, username2, message";
            }
            
            // Tìm user1
            Optional<Taikhoan> user1Opt = taikhoanService.getTaikhoanByTenDn(username1);
            if (user1Opt.isEmpty()) {
                return "User not found: " + username1;
            }
            
            // Tìm user2
            Optional<Taikhoan> user2Opt = taikhoanService.getTaikhoanByTenDn(username2);
            if (user2Opt.isEmpty()) {
                return "User not found: " + username2;
            }
            
            Taikhoan user1 = user1Opt.get();
            Taikhoan user2 = user2Opt.get();
            
            // Tạo tin nhắn
            Chat chat = new Chat();
            chat.setMaTkA(user1);
            chat.setMaTkB(user2);
            chat.setNoiDung(message);
            chat.setThoiGian(java.time.Instant.now());
            chat.setTrangThai("sent");
            
            // Lưu tin nhắn
            Chat savedChat = chatService.saveMessage(chat);
            
            return "Message sent successfully! ID: " + savedChat.getId() + 
                   ", From: " + username1 + ", To: " + username2 + 
                   ", Message: " + message;
                   
        } catch (Exception e) {
            return "Error sending message: " + e.getMessage();
        }
    }

    @GetMapping("/chat-history/{username1}/{username2}")
    public String getChatHistory(@PathVariable String username1, @PathVariable String username2) {
        try {
            // Tìm user1
            Optional<Taikhoan> user1Opt = taikhoanService.getTaikhoanByTenDn(username1);
            if (user1Opt.isEmpty()) {
                return "User not found: " + username1;
            }
            
            // Tìm user2
            Optional<Taikhoan> user2Opt = taikhoanService.getTaikhoanByTenDn(username2);
            if (user2Opt.isEmpty()) {
                return "User not found: " + username2;
            }
            
            Taikhoan user1 = user1Opt.get();
            Taikhoan user2 = user2Opt.get();
            
            // Lấy lịch sử chat
            List<Chat> messages = chatService.getConversation(user1.getMaTk(), user2.getMaTk());
            
            if (messages.isEmpty()) {
                return "No messages found between " + username1 + " and " + username2;
            }
            
            StringBuilder result = new StringBuilder("Chat history between " + username1 + " and " + username2 + ":\n");
            for (Chat msg : messages) {
                result.append("[").append(msg.getThoiGian()).append("] ")
                      .append(msg.getMaTkA().getTenDn()).append(": ")
                      .append(msg.getNoiDung()).append("\n");
            }
            
            return result.toString();
            
        } catch (Exception e) {
            return "Error getting chat history: " + e.getMessage();
        }
    }

    @GetMapping("/websocket-test")
    public String testWebSocket() {
        return "WebSocket endpoint is accessible. Backend is running on port 8080.";
    }

    // Search users API moved to UserController

}