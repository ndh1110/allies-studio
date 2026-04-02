package com.allies.app.service;

import com.allies.app.model.Quanhe;
import com.allies.app.model.Taikhoan;
import com.allies.app.repository.QuanheRepository;
import com.allies.app.repository.TaikhoanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class QuanheService {

    @Autowired
    private QuanheRepository quanheRepository;

    @Autowired
    private TaikhoanRepository taikhoanRepository;

    public Quanhe addFriend(Integer userId1, Integer userId2) {
        Taikhoan user1 = taikhoanRepository.findById(userId1)
                .orElseThrow(() -> new IllegalArgumentException("Người dùng 1 không tồn tại"));
        Taikhoan user2 = taikhoanRepository.findById(userId2)
                .orElseThrow(() -> new IllegalArgumentException("Người dùng 2 không tồn tại"));
        Quanhe quanhe = new Quanhe();
        quanhe.setMaTkA(user1);
        quanhe.setMaTkB(user2);
        quanhe.setNgayKetBan(Instant.now());
        return quanheRepository.save(quanhe);
    }

    public List<Quanhe> getFriends(Integer userId) {
        Taikhoan user = taikhoanRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Người dùng không tồn tại"));
        return quanheRepository.findByMaTkAOrMaTkB(user, user);
    }
}