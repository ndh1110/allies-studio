package com.allies.app.service;

import com.allies.app.model.Loimoiketban;
import com.allies.app.model.Taikhoan;
import com.allies.app.repository.LoimoiketbanRepository;
import com.allies.app.repository.TaikhoanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class LoimoiketbanService {

    @Autowired
    private LoimoiketbanRepository loimoiketbanRepository;

    @Autowired
    private TaikhoanRepository taikhoanRepository;

    public Loimoiketban sendFriendRequest(Integer senderId, Integer receiverId, String noiDung) {
        Taikhoan sender = taikhoanRepository.findById(senderId)
                .orElseThrow(() -> new IllegalArgumentException("Người gửi không tồn tại"));
        Taikhoan receiver = taikhoanRepository.findById(receiverId)
                .orElseThrow(() -> new IllegalArgumentException("Người nhận không tồn tại"));
        Loimoiketban request = new Loimoiketban();
        request.setMaTkGui(sender);
        request.setMaTkNhan(receiver);
        request.setNoiDungLoiMoi(noiDung);
        request.setThoiGianGui(Instant.now());
        request.setTrangThai("PENDING");
        return loimoiketbanRepository.save(request);
    }

    public Loimoiketban acceptFriendRequest(Integer requestId) {
        Loimoiketban request = loimoiketbanRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Lời mời không tồn tại"));
        request.setTrangThai("ACCEPTED");
        return loimoiketbanRepository.save(request);
    }

    public Loimoiketban rejectFriendRequest(Integer requestId) {
        Loimoiketban request = loimoiketbanRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Lời mời không tồn tại"));
        request.setTrangThai("REJECTED");
        return loimoiketbanRepository.save(request);
    }

    public List<Loimoiketban> getPendingRequests(Integer receiverId) {
        Taikhoan receiver = taikhoanRepository.findById(receiverId)
                .orElseThrow(() -> new IllegalArgumentException("Người nhận không tồn tại"));
        return loimoiketbanRepository.findByMaTkNhanAndTrangThai(receiver, "PENDING");
    }
}