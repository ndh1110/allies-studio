package com.allies.app.service;

import com.allies.app.model.Nhom;
import com.allies.app.model.Taikhoan;
import com.allies.app.model.Thanhviennhom;
import com.allies.app.model.ThanhviennhomId;
import com.allies.app.repository.NhomRepository;
import com.allies.app.repository.TaikhoanRepository;
import com.allies.app.repository.ThanhviennhomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class ThanhviennhomService {

    @Autowired
    private ThanhviennhomRepository thanhviennhomRepository;

    @Autowired
    private NhomRepository nhomRepository;

    @Autowired
    private TaikhoanRepository taikhoanRepository;

    public Thanhviennhom addMemberToGroup(Integer groupId, Integer userId, String vaiTro) {
        Nhom nhom = nhomRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("Nhóm không tồn tại"));
        Taikhoan user = taikhoanRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Người dùng không tồn tại"));
        ThanhviennhomId id = new ThanhviennhomId();
        id.setMaNhom(groupId);
        id.setMaTk(userId);
        Thanhviennhom member = new Thanhviennhom();
        member.setId(id);
        member.setMaNhom(nhom);
        member.setMaTk(user);
        member.setVaiTro(vaiTro);
        member.setNgayThamGia(Instant.now());
        return thanhviennhomRepository.save(member);
    }

    public List<Thanhviennhom> getMembersByGroup(Integer groupId) {
        Nhom nhom = nhomRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("Nhóm không tồn tại"));
        return thanhviennhomRepository.findByMaNhom(nhom);
    }

    public List<Thanhviennhom> getGroupsByMember(Integer userId) {
        Taikhoan user = taikhoanRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Người dùng không tồn tại"));
        return thanhviennhomRepository.findByMaTk(user);
    }

    public void removeMemberFromGroup(Integer groupId, Integer userId) {
        ThanhviennhomId id = new ThanhviennhomId();
        id.setMaNhom(groupId);
        id.setMaTk(userId);
        thanhviennhomRepository.deleteById(id);
    }
}