package com.allies.app.service;

import com.allies.app.model.Taikhoan;
import com.allies.app.repository.TaikhoanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class UserPresenceService {
    
    @Autowired
    private TaikhoanRepository taikhoanRepository;
    
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    
    // Store online users with their last activity time
    private final Map<String, Instant> onlineUsers = new ConcurrentHashMap<>();
    
    public void userConnected(String username) {
        onlineUsers.put(username, Instant.now());
        System.out.println("User connected: " + username + ", Total online: " + onlineUsers.size());
        notifyUserPresenceChange();
    }
    
    public void userDisconnected(String username) {
        onlineUsers.remove(username);
        notifyUserPresenceChange();
    }
    
    public boolean isUserOnline(String username) {
        return onlineUsers.containsKey(username);
    }
    
    public List<Taikhoan> getOnlineUsers() {
        List<Taikhoan> users = new ArrayList<>();
        for (String username : onlineUsers.keySet()) {
            try {
                taikhoanRepository.findByTenDn(username).ifPresent(users::add);
            } catch (Exception e) {
                System.err.println("Error finding user: " + username + ", " + e.getMessage());
            }
        }
        return users;
    }
    
    public void updateUserActivity(String username) {
        if (onlineUsers.containsKey(username)) {
            onlineUsers.put(username, Instant.now());
        }
    }
    
    private void notifyUserPresenceChange() {
        List<Taikhoan> onlineUsersList = getOnlineUsers();
        System.out.println("Notifying user presence change, online users: " + onlineUsersList.size());
        messagingTemplate.convertAndSend("/topic/presence", onlineUsersList);
    }
    
    public void cleanupInactiveUsers() {
        Instant cutoff = Instant.now().minusSeconds(300); // 5 minutes
        onlineUsers.entrySet().removeIf(entry -> entry.getValue().isBefore(cutoff));
    }
}
