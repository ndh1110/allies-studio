package com.allies.app.service;

import com.allies.app.model.Taikhoan;
import com.allies.app.model.Tinnhannhom;
import com.allies.app.model.Tinnhannhomdaxem;
import com.allies.app.model.TinnhannhomdaxemId;
import com.allies.app.repository.TaikhoanRepository;
import com.allies.app.repository.TinnhannhomRepository;
import com.allies.app.repository.TinnhannhomdaxemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class TinnhannhomdaxemService {

    @Autowired
    private TinnhannhomdaxemRepository tinnhannhomdaxemRepository;

    @Autowired
    private TinnhannhomRepository tinnhannhomRepository;

    @Autowired
    private TaikhoanRepository taikhoanRepository;

    public Tinnhannhomdaxem markMessageAsSeen(Integer messageId, Integer userId) {
        Tinnhannhom message = tinnhannhomRepository.findById(messageId)
                .orElseThrow(() -> new IllegalArgumentException("Tin nhắn nhóm không tồn tại"));
        Taikhoan user = taikhoanRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Người dùng không tồn tại"));
        TinnhannhomdaxemId id = new TinnhannhomdaxemId();
        id.setMaTinNhanNhom(messageId);
        id.setMaTkDaXem(userId);
        Tinnhannhomdaxem seen = new Tinnhannhomdaxem();
        seen.setId(id);
        seen.setMaTinNhanNhom(message);
        seen.setMaTkDaXem(user);
        seen.setThoiGianXem(Instant.now());
        return tinnhannhomdaxemRepository.save(seen);
    }

    public List<Tinnhannhomdaxem> getSeenMessagesByMessage(Integer messageId) {
        Tinnhannhom message = tinnhannhomRepository.findById(messageId)
                .orElseThrow(() -> new IllegalArgumentException("Tin nhắn nhóm không tồn tại"));
        return tinnhannhomdaxemRepository.findByMaTinNhanNhom(message);
    }

    public List<Tinnhannhomdaxem> getSeenMessagesByUser(Integer userId) {
        Taikhoan user = taikhoanRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Người dùng không tồn tại"));
        return tinnhannhomdaxemRepository.findByMaTkDaXem(user);
    }
}