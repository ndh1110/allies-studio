package com.allies.app.service;

import com.allies.app.model.Quanhe;
import com.allies.app.model.Taikhoan;
import com.allies.app.repository.QuanheRepository;
import com.allies.app.repository.TaikhoanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class QuanheService {

    @Autowired
    private QuanheRepository quanheRepository;

    @Autowired
    private TaikhoanRepository taikhoanRepository;

    @Autowired
    private org.springframework.messaging.simp.SimpMessagingTemplate messagingTemplate;

    @Transactional
    public void addFriend(Taikhoan user1, Taikhoan user2) {
        Optional<Quanhe> existing = quanheRepository.findRelationship(user1, user2);
        if (existing.isEmpty()) {
            Quanhe quanhe = new Quanhe();
            quanhe.setMaTkA(user1);
            quanhe.setMaTkB(user2);
            quanhe.setNgayKetBan(Instant.now());
            quanheRepository.save(quanhe);
        }
    }

    @Transactional
    public void unfriend(Integer userId, Integer friendId) {
        if (userId == null || friendId == null) {
            throw new IllegalArgumentException("User ID and Friend ID must not be null");
        }
        
        Taikhoan user = taikhoanRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User không tồn tại"));
        Taikhoan friend = taikhoanRepository.findById(friendId)
                .orElseThrow(() -> new IllegalArgumentException("Friend không tồn tại"));

        Optional<Quanhe> relationship = quanheRepository.findRelationship(user, friend);
        if (relationship.isPresent()) {
            quanheRepository.delete(relationship.get());
            
            // --- Real-time Notification to the unfriended person ---
            Map<String, Object> notification = new HashMap<>();
            notification.put("type", "UNFRIENDED");
            notification.put("unfriendedByUserId", userId); // Who initiated the unfriend
            notification.put("unfriendedByUsername", user.getTenDn());
            notification.put("targetUserId", friendId); // The person receiving the notification
            
            messagingTemplate.convertAndSendToUser(
                friend.getTenDn(), 
                "/queue/notifications", 
                notification
            );
        }
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getFriendsList(Integer userId) {
        if (userId == null) {
            throw new IllegalArgumentException("User ID must not be null");
        }
        
        Taikhoan user = taikhoanRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Người dùng không tồn tại"));
        
        List<Quanhe> relationships = quanheRepository.findByMaTkAOrMaTkB(user, user);

        return relationships.stream().map(q -> {
            Taikhoan friend = q.getMaTkA().getMaTk().equals(userId) ? q.getMaTkB() : q.getMaTkA();
            Map<String, Object> dto = new HashMap<>();
            dto.put("id", friend.getMaTk());
            dto.put("username", friend.getTenDn());
            dto.put("avarta", friend.getAvarta());
            dto.put("ngayKetBan", q.getNgayKetBan() != null ? q.getNgayKetBan().toString() : null);
            return dto;
        }).collect(Collectors.toList());
    }
}