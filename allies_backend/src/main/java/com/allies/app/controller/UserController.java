package com.allies.app.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.allies.app.model.Taikhoan;
import com.allies.app.model.Quanhe;
import com.allies.app.service.TaikhoanService;
import com.allies.app.service.QuanheService;

import java.util.List;
import java.util.Optional;
import java.util.ArrayList;
import java.util.HashMap;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*", maxAge = 3600)
public class UserController {

    @Autowired
    private TaikhoanService taikhoanService;

    @Autowired
    private QuanheService quanheService;

    @GetMapping("/search")
    public ResponseEntity<List<Object>> searchUsers(@RequestParam(required = false) String q) {
        try {
            List<Taikhoan> allUsers = taikhoanService.getAllTaikhoan();
            
            if (q == null || q.trim().isEmpty()) {
                return ResponseEntity.ok(convertToUserList(allUsers));
            }
            
            List<Taikhoan> filteredUsers = allUsers.stream()
                    .filter(user -> user.getTenDn().toLowerCase().contains(q.toLowerCase()))
                    .collect(java.util.stream.Collectors.toList());
            
            return ResponseEntity.ok(convertToUserList(filteredUsers));
        } catch (Exception e) {
            System.err.println("Error searching users: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/friends/{username}")
    public ResponseEntity<List<Object>> getFriends(@PathVariable String username) {
        try {
            System.out.println("=== FRIENDS API DEBUG ===");
            System.out.println("Requested username: " + username);
            
            // Tìm user theo username
            Optional<Taikhoan> userOpt = taikhoanService.getTaikhoanByTenDn(username);
            if (userOpt.isEmpty()) {
                System.out.println("User not found: " + username);
                return ResponseEntity.ok(new ArrayList<>()); // Return empty list instead of 400
            }
            
            Taikhoan user = userOpt.get();
            System.out.println("Found user: " + user.getTenDn() + " (ID: " + user.getMaTk() + ")");
            
            // Lấy danh sách bạn bè từ quanhe table
            List<Quanhe> friendships = quanheService.getFriends(user.getMaTk());
            System.out.println("Found " + friendships.size() + " friendships");
            
            List<Object> friendsList = new ArrayList<>();
            
            for (Quanhe friendship : friendships) {
                try {
                    Taikhoan friend;
                    
                    // Xác định ai là bạn (không phải user hiện tại)
                    if (friendship.getMaTkA().getMaTk().equals(user.getMaTk())) {
                        friend = friendship.getMaTkB();
                    } else {
                        friend = friendship.getMaTkA();
                    }
                    
                    HashMap<String, Object> friendInfo = new HashMap<>();
                    friendInfo.put("id", friend.getMaTk());
                    friendInfo.put("tenDn", friend.getTenDn());
                    friendInfo.put("avarta", friend.getAvarta() != null ? friend.getAvarta() : "default-avatar.png");
                    friendInfo.put("email", friend.getTenDn() + "@example.com"); // Default email
                    friendInfo.put("ngayKetBan", friendship.getNgayKetBan());
                    
                    friendsList.add(friendInfo);
                    System.out.println("Added friend: " + friend.getTenDn() + " (ID: " + friend.getMaTk() + ")");
                } catch (Exception e) {
                    System.err.println("Error processing friendship: " + e.getMessage());
                    e.printStackTrace();
                }
            }
            
            System.out.println("Returning " + friendsList.size() + " friends for user: " + username);
            return ResponseEntity.ok(friendsList);
            
        } catch (Exception e) {
            System.err.println("Error getting friends: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.ok(new ArrayList<>()); // Return empty list instead of 400
        }
    }

    @PostMapping("/friends")
    public ResponseEntity<String> createFriendship(@RequestBody java.util.Map<String, String> request) {
        String username1 = request.get("username1");
        String username2 = request.get("username2");
        
        if (username1 == null || username1.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Username1 is required");
        }
        if (username2 == null || username2.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Username2 is required");
        }
        if (username1.equals(username2)) {
            return ResponseEntity.badRequest().body("Cannot create friendship with yourself");
        }
        
        try {
            // Tìm user1
            Optional<Taikhoan> user1Opt = taikhoanService.getTaikhoanByTenDn(username1);
            if (user1Opt.isEmpty()) {
                return ResponseEntity.badRequest().body("User not found: " + username1);
            }
            
            // Tìm user2
            Optional<Taikhoan> user2Opt = taikhoanService.getTaikhoanByTenDn(username2);
            if (user2Opt.isEmpty()) {
                return ResponseEntity.badRequest().body("User not found: " + username2);
            }
            
            Taikhoan user1 = user1Opt.get();
            Taikhoan user2 = user2Opt.get();
            
            // Tạo quan hệ bạn bè
            quanheService.addFriend(user1.getMaTk(), user2.getMaTk());
            
            return ResponseEntity.ok("Friendship created successfully between " + username1 + " and " + username2);
                   
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error creating friendship: " + e.getMessage());
        }
    }

    @GetMapping("/all")
    public ResponseEntity<List<Object>> getAllUsers() {
        try {
            List<Taikhoan> allUsers = taikhoanService.getAllTaikhoan();
            return ResponseEntity.ok(convertToUserList(allUsers));
        } catch (Exception e) {
            System.err.println("Error getting all users: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    private List<Object> convertToUserList(List<Taikhoan> users) {
        List<Object> userList = new ArrayList<>();
        for (Taikhoan user : users) {
            HashMap<String, Object> userInfo = new HashMap<>();
            userInfo.put("id", user.getMaTk());
            userInfo.put("tenDn", user.getTenDn());
            userInfo.put("avarta", user.getAvarta());
            userInfo.put("email", user.getTenDn() + "@example.com");
            userList.add(userInfo);
        }
        return userList;
    }
}
