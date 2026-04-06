package com.allies.app.service;

import com.allies.app.model.Loimoiketban;
import com.allies.app.model.Taikhoan;
import com.allies.app.repository.LoimoiketbanRepository;
import com.allies.app.repository.TaikhoanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;
import java.util.Map;
import java.util.HashMap;
import org.springframework.transaction.annotation.Transactional;

@Service
public class LoimoiketbanService {

    @Autowired
    private LoimoiketbanRepository loimoiketbanRepository;

    @Autowired
    private TaikhoanRepository taikhoanRepository;

    @Autowired
    private QuanheService quanheService;

    @Autowired
    private org.springframework.messaging.simp.SimpMessagingTemplate messagingTemplate;

    @Transactional
    public Map<String, Object> sendFriendRequest(Integer senderId, Integer receiverId, String noiDung) {
        if (senderId == null || receiverId == null) {
            throw new IllegalArgumentException("Sender ID and Receiver ID must not be null");
        }
        Taikhoan sender = taikhoanRepository.findById(senderId)
                .orElseThrow(() -> new IllegalArgumentException("Người gửi không tồn tại"));
        Taikhoan receiver = taikhoanRepository.findById(receiverId)
                .orElseThrow(() -> new IllegalArgumentException("Người nhận không tồn tại"));
        // Delete previous requests to avoid constraint violations
        List<Loimoiketban> existing = loimoiketbanRepository.findBetweenUsers(sender, receiver);
        if (!existing.isEmpty()) {
            loimoiketbanRepository.deleteAll(existing);
            loimoiketbanRepository.flush();
        }
        Loimoiketban request = new Loimoiketban();
        request.setMaTkGui(sender);
        request.setMaTkNhan(receiver);
        request.setNoiDungLoiMoi(noiDung);
        request.setThoiGianGui(Instant.now());
        request.setTrangThai("PENDING");
        Map<String, Object> result = mapToDto(loimoiketbanRepository.save(request));

        // --- Broadcast Notification to Receiver ---
        Map<String, Object> notification = new HashMap<>();
        notification.put("type", "FRIEND_REQUEST");
        notification.put("targetUserId", receiverId);
        notification.put("data", result);

        messagingTemplate.convertAndSendToUser(
                receiver.getTenDn(),
                "/queue/notifications",
                notification);

        return result;
    }

    @Transactional
    public Map<String, Object> acceptFriendRequest(Integer requestId) {
        if (requestId == null) {
            throw new IllegalArgumentException("Request ID must not be null");
        }

        Loimoiketban request = loimoiketbanRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Lời mời không tồn tại"));
        request.setTrangThai("ACCEPTED");
        quanheService.addFriend(request.getMaTkGui(), request.getMaTkNhan());

        Map<String, Object> result = mapToDto(loimoiketbanRepository.save(request));

        // --- Broadcast Notification to original sender that their request was accepted
        // ---
        Taikhoan originalSender = request.getMaTkGui();
        if (originalSender != null) {
            Map<String, Object> notification = new HashMap<>();
            notification.put("type", "FRIEND_REQUEST_ACCEPTED");
            notification.put("targetUserId", originalSender.getMaTk());
            notification.put("data", result);

            messagingTemplate.convertAndSendToUser(
                    originalSender.getTenDn(),
                    "/queue/notifications",
                    notification);
        }

        return result;
    }

    @Transactional
    public Map<String, Object> rejectFriendRequest(Integer requestId) {
        if (requestId == null) {
            throw new IllegalArgumentException("Request ID must not be null");
        }

        Loimoiketban request = loimoiketbanRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Lời mời không tồn tại"));
        request.setTrangThai("REJECTED");
        Map<String, Object> result = mapToDto(loimoiketbanRepository.save(request));

        // --- Real-time Notification to original sender ---
        Taikhoan originalSender = request.getMaTkGui();
        if (originalSender != null) {
            Map<String, Object> notification = new HashMap<>();
            notification.put("type", "FRIEND_REQUEST_DECLINED");
            notification.put("targetUserId", originalSender.getMaTk());
            notification.put("data", result);

            messagingTemplate.convertAndSendToUser(
                    originalSender.getTenDn(),
                    "/queue/notifications",
                    notification);
        }

        return result;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getPendingRequests(Integer receiverId) {
        if (receiverId == null) {
            throw new IllegalArgumentException("Receiver ID must not be null");
        }

        Taikhoan receiver = taikhoanRepository.findById(receiverId)
                .orElseThrow(() -> new IllegalArgumentException("Người nhận không tồn tại"));
        return loimoiketbanRepository.findByMaTkNhanAndTrangThai(receiver, "PENDING")
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    // 1) Lấy danh sách đã gửi
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getSentRequests(Taikhoan sender) {
        return loimoiketbanRepository.findByMaTkGui(sender)
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    private Map<String, Object> mapToDto(Loimoiketban entity) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", entity.getId());
        dto.put("trangThai", entity.getTrangThai());
        dto.put("thoiGianGui", entity.getThoiGianGui() != null ? entity.getThoiGianGui().toString() : null);

        if (entity.getMaTkGui() != null) {
            Map<String, Object> fromUser = new HashMap<>();
            fromUser.put("id", entity.getMaTkGui().getMaTk());
            fromUser.put("username", entity.getMaTkGui().getTenDn());
            dto.put("fromUser", fromUser);
            dto.put("maTkGui", fromUser); // For backwards compatibility
        }

        if (entity.getMaTkNhan() != null) {
            Map<String, Object> toUser = new HashMap<>();
            toUser.put("id", entity.getMaTkNhan().getMaTk());
            toUser.put("username", entity.getMaTkNhan().getTenDn());
            dto.put("toUser", toUser);
        }

        return dto;
    }

    // 2) Hủy lời mời (xóa hoặc set trạng thái CANCELED)
    @Transactional
    public void cancelFriendRequest(Integer requestId) {
        if (requestId == null) {
            throw new IllegalArgumentException("Request ID must not be null");
        }
        loimoiketbanRepository.deleteById(requestId);
    }

}