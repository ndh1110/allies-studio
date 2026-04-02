package com.allies.app.service;

import com.allies.app.model.Chat;
import com.allies.app.model.Taikhoan;
import com.allies.app.repository.ChatRepository;
import com.allies.app.repository.TaikhoanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class ChatService {

    @Autowired
    private ChatRepository chatRepository;

    @Autowired
    private TaikhoanRepository taikhoanRepository;

    public Chat sendMessage(Chat chat, Integer senderId, Integer receiverId) {
        Taikhoan sender = taikhoanRepository.findById(senderId)
                .orElseThrow(() -> new IllegalArgumentException("Người gửi không tồn tại"));
        Taikhoan receiver = taikhoanRepository.findById(receiverId)
                .orElseThrow(() -> new IllegalArgumentException("Người nhận không tồn tại"));
        chat.setMaTkA(sender);
        chat.setMaTkB(receiver);
        chat.setThoiGian(Instant.now());
        chat.setTrangThai("SENT");
        return chatRepository.save(chat);
    }

    public List<Chat> getChatBetweenUsers(Integer userId1, Integer userId2) {
        Taikhoan user1 = taikhoanRepository.findById(userId1)
                .orElseThrow(() -> new IllegalArgumentException("Người dùng không tồn tại"));
        Taikhoan user2 = taikhoanRepository.findById(userId2)
                .orElseThrow(() -> new IllegalArgumentException("Người dùng không tồn tại"));
        return chatRepository.findByMaTkAAndMaTkB(user1, user2);
    }

    public List<Chat> getAllChatsForUser(Integer userId) {
        Taikhoan user = taikhoanRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Người dùng không tồn tại"));
        return chatRepository.findByMaTkAOrMaTkB(user, user);
    }
    
    public Chat saveMessage(Chat chat) {
        return chatRepository.save(chat);
    }
    
    public List<Chat> getMessagesByUser(Integer userId) {
        Taikhoan user = taikhoanRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Người dùng không tồn tại"));
        return chatRepository.findByMaTkAOrMaTkB(user, user);
    }
    
    public List<Chat> getConversation(Integer userId1, Integer userId2) {
        Taikhoan user1 = taikhoanRepository.findById(userId1)
                .orElseThrow(() -> new IllegalArgumentException("Người dùng không tồn tại"));
        Taikhoan user2 = taikhoanRepository.findById(userId2)
                .orElseThrow(() -> new IllegalArgumentException("Người dùng không tồn tại"));
        return chatRepository.findByMaTkAAndMaTkB(user1, user2);
    }
}