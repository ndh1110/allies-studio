package com.allies.app.service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.allies.app.model.Cuocgoi;
import com.allies.app.model.Taikhoan;
import com.allies.app.repository.CuocgoiRepository;
import com.allies.app.repository.TaikhoanRepository;

@Service
public class CuocgoiService {

    @Autowired
    private CuocgoiRepository cuocgoiRepository;

    @Autowired
    private TaikhoanRepository taikhoanRepository;

    public Cuocgoi startCall(Cuocgoi cuocgoi, Integer creatorId) {
        Taikhoan creator = taikhoanRepository.findById(creatorId)
                .orElseThrow(() -> new IllegalArgumentException("Người tạo cuộc gọi không tồn tại"));
        cuocgoi.setNguoiTaoCall(creator);
        cuocgoi.setThoiGianBatDau(Instant.now());
        cuocgoi.setTrangThai("STARTED");
        return cuocgoiRepository.save(cuocgoi);
    }

    public Cuocgoi endCall(Integer callId) {
        Cuocgoi cuocgoi = cuocgoiRepository.findById(callId)
                .orElseThrow(() -> new IllegalArgumentException("Cuộc gọi không tồn tại"));
        cuocgoi.setThoiGianKetThuc(Instant.now());
        cuocgoi.setTrangThai("ENDED");
        long seconds = ChronoUnit.SECONDS.between(cuocgoi.getThoiGianBatDau(), cuocgoi.getThoiGianKetThuc());
        cuocgoi.setTongThoiLuongGiay((int) seconds);
        return cuocgoiRepository.save(cuocgoi);
    }

    public List<Cuocgoi> getCallsByUser(Integer userId) {
        Taikhoan user = taikhoanRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Người dùng không tồn tại"));
        return cuocgoiRepository.findByNguoiTaoCall(user);
    }
    
    public Cuocgoi createCall(Cuocgoi call) {
        return cuocgoiRepository.save(call);
    }
    
    public Optional<Cuocgoi> getCallById(Integer callId) {
        return cuocgoiRepository.findById(callId);
    }
    
    public Cuocgoi updateCall(Cuocgoi call) {
        return cuocgoiRepository.save(call);
    }
    
    public List<Cuocgoi> getCallHistoryByUser(Integer userId) {
        Taikhoan user = taikhoanRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Người dùng không tồn tại"));
        return cuocgoiRepository.findByNguoiTaoCall(user);
    }
}