package com.allies.app.service;

import com.allies.app.model.Chat;
import com.allies.app.model.Taikhoan;
import com.allies.app.repository.ChatRepository;
import com.allies.app.repository.TaikhoanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ChatService {

    @Autowired
    private ChatRepository chatRepository;

    @Autowired
    private TaikhoanRepository taikhoanRepository;

    @Transactional
    public Map<String, Object> sendMessage(Chat chat, Integer senderId, Integer receiverId) {
        if (senderId == null || receiverId == null) {
            throw new IllegalArgumentException("Sender ID and Receiver ID must not be null");
        }
        
        Taikhoan sender = taikhoanRepository.findById(senderId)
                .orElseThrow(() -> new IllegalArgumentException("Người gửi không tồn tại"));
        Taikhoan receiver = taikhoanRepository.findById(receiverId)
                .orElseThrow(() -> new IllegalArgumentException("Người nhận không tồn tại"));
        chat.setMaTkA(sender);
        chat.setMaTkB(receiver);
        chat.setThoiGian(Instant.now());
        chat.setTrangThai("SENT");
        Chat saved = chatRepository.save(chat);
        return mapChatToDto(saved);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getConversation(Integer userId1, Integer userId2) {
        if (userId1 == null || userId2 == null) {
            throw new IllegalArgumentException("User IDs must not be null");
        }
        
        Taikhoan user1 = taikhoanRepository.findById(userId1)
                .orElseThrow(() -> new IllegalArgumentException("Người dùng không tồn tại"));
        Taikhoan user2 = taikhoanRepository.findById(userId2)
                .orElseThrow(() -> new IllegalArgumentException("Người dùng 2 không tồn tại"));
        return chatRepository.findConversation(user1, user2).stream()
                .map(this::mapChatToDto)
                .collect(Collectors.toList());
    }

    /**
     * Paginated conversation retrieval for infinite scroll.
     *
     * @param page 0-indexed page number (0 = most recent messages)
     * @param size number of messages per page (default 20)
     * @return Map containing:
     *   "messages" - List in ASC order (oldest first, ready for the UI)
     *   "hasMore"  - boolean: true if there are older pages still available
     *   "page"     - the page index that was fetched
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getConversationPaged(Integer userId1, Integer userId2, int page, int size) {
        if (userId1 == null || userId2 == null) {
            throw new IllegalArgumentException("User IDs must not be null");
        }

        Taikhoan user1 = taikhoanRepository.findById(userId1)
                .orElseThrow(() -> new IllegalArgumentException("Người dùng không tồn tại"));
        Taikhoan user2 = taikhoanRepository.findById(userId2)
                .orElseThrow(() -> new IllegalArgumentException("Người dùng 2 không tồn tại"));

        // Fetch newest-first so page 0 = most recent 20 messages
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("thoiGian").descending());
        Page<Chat> resultPage = chatRepository.findConversationPaged(user1, user2, pageRequest);

        // Reverse to chronological order (oldest first) for the UI
        List<Map<String, Object>> messages = resultPage.getContent().stream()
                .map(this::mapChatToDto)
                .collect(Collectors.toCollection(ArrayList::new));
        Collections.reverse(messages);

        Map<String, Object> response = new HashMap<>();
        response.put("messages", messages);
        response.put("hasMore", !resultPage.isLast());
        response.put("page", page);
        response.put("totalPages", resultPage.getTotalPages());
        return response;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAllChatsForUser(Integer userId) {
        if (userId == null) {
            throw new IllegalArgumentException("User ID must not be null");
        }
        
        Taikhoan user = taikhoanRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Người dùng không tồn tại"));
        return chatRepository.findByMaTkAOrMaTkB(user, user).stream()
                .map(this::mapChatToDto)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public Map<String, Object> saveMessage(Chat chat) {
        if (chat == null) {
            throw new IllegalArgumentException("Chat message must not be null");
        }
        return mapChatToDto(chatRepository.save(chat));
    }
    
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getMessagesByUser(Integer userId) {
        return getAllChatsForUser(userId);
    }

    @Transactional
    public int markMessagesAsSeen(Integer senderId, Integer receiverId) {
        if (senderId == null || receiverId == null) {
            throw new IllegalArgumentException("Sender ID and Receiver ID must not be null");
        }
        
        Taikhoan sender = taikhoanRepository.findById(senderId)
                .orElseThrow(() -> new IllegalArgumentException("Sender không tồn tại"));
        Taikhoan receiver = taikhoanRepository.findById(receiverId)
                .orElseThrow(() -> new IllegalArgumentException("Receiver không tồn tại"));
        return chatRepository.markAsSeen(sender, receiver);
    }

    private Map<String, Object> mapChatToDto(Chat chat) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", chat.getId());
        dto.put("noiDung", chat.getNoiDung());
        dto.put("thoiGian", chat.getThoiGian() != null ? chat.getThoiGian().toString() : null);
        dto.put("trangThai", chat.getTrangThai());
        
        if (chat.getMaTkA() != null) {
            Map<String, Object> sender = new HashMap<>();
            sender.put("id", chat.getMaTkA().getMaTk());
            sender.put("username", chat.getMaTkA().getTenDn());
            sender.put("avarta", chat.getMaTkA().getAvarta());
            dto.put("maTkA", sender);
        }
        
        if (chat.getMaTkB() != null) {
            Map<String, Object> receiver = new HashMap<>();
            receiver.put("id", chat.getMaTkB().getMaTk());
            receiver.put("username", chat.getMaTkB().getTenDn());
            receiver.put("avarta", chat.getMaTkB().getAvarta());
            dto.put("maTkB", receiver);
        }
        
        return dto;
    }
}