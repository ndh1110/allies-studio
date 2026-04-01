package com.allies.app.service;

import com.allies.app.model.Nhom;
import com.allies.app.model.Taikhoan;
import com.allies.app.model.Tinnhannhom;
import com.allies.app.repository.NhomRepository;
import com.allies.app.repository.TaikhoanRepository;
import com.allies.app.repository.TinnhannhomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class TinnhannhomService {

    @Autowired
    private TinnhannhomRepository tinnhannhomRepository;

    @Autowired
    private NhomRepository nhomRepository;

    @Autowired
    private TaikhoanRepository taikhoanRepository;

    public Tinnhannhom sendGroupMessage(Tinnhannhom message, Integer groupId, Integer senderId) {
        Nhom nhom = nhomRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("Nhóm không tồn tại"));
        Taikhoan sender = taikhoanRepository.findById(senderId)
                .orElseThrow(() -> new IllegalArgumentException("Người gửi không tồn tại"));
        message.setMaNhom(nhom);
        message.setMaTkNguoiGui(sender);
        message.setThoiGian(Instant.now());
        message.setTrangThai("SENT");
        return tinnhannhomRepository.save(message);
    }

    public List<Tinnhannhom> getGroupMessages(Integer groupId) {
        Nhom nhom = nhomRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("Nhóm không tồn tại"));
        return tinnhannhomRepository.findByMaNhom(nhom);
    }

    public List<Tinnhannhom> getMessagesBySender(Integer senderId) {
        Taikhoan sender = taikhoanRepository.findById(senderId)
                .orElseThrow(() -> new IllegalArgumentException("Người gửi không tồn tại"));
        return tinnhannhomRepository.findByMaTkNguoiGui(sender);
    }
}