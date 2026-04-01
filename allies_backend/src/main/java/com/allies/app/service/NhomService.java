package com.allies.app.service;

import com.allies.app.model.Nhom;
import com.allies.app.model.Taikhoan;
import com.allies.app.repository.NhomRepository;
import com.allies.app.repository.TaikhoanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class NhomService {

    @Autowired
    private NhomRepository nhomRepository;

    @Autowired
    private TaikhoanRepository taikhoanRepository;

    public Nhom createGroup(Nhom nhom, Integer creatorId) {
        Taikhoan creator = taikhoanRepository.findById(creatorId)
                .orElseThrow(() -> new IllegalArgumentException("Người tạo nhóm không tồn tại"));
        nhom.setNguoiTao(creator);
        nhom.setNgayTao(Instant.now());
        return nhomRepository.save(nhom);
    }

    public List<Nhom> getGroupsByCreator(Integer creatorId) {
        Taikhoan creator = taikhoanRepository.findById(creatorId)
                .orElseThrow(() -> new IllegalArgumentException("Người tạo nhóm không tồn tại"));
        return nhomRepository.findByNguoiTao(creator);
    }

    public Nhom getGroupById(Integer groupId) {
        return nhomRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("Nhóm không tồn tại"));
    }
}