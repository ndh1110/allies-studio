package com.allies.app.service;

import com.allies.app.model.Cuocgoi;
import com.allies.app.model.Taikhoan;
import com.allies.app.model.Thanhviencuocgoi;
import com.allies.app.model.ThanhviencuocgoiId;
import com.allies.app.repository.CuocgoiRepository;
import com.allies.app.repository.TaikhoanRepository;
import com.allies.app.repository.ThanhviencuocgoiRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class ThanhviencuocgoiService {

    @Autowired
    private ThanhviencuocgoiRepository thanhviencuocgoiRepository;

    @Autowired
    private CuocgoiRepository cuocgoiRepository;

    @Autowired
    private TaikhoanRepository taikhoanRepository;

    public Thanhviencuocgoi addMemberToCall(Integer callId, Integer userId) {
        Cuocgoi call = cuocgoiRepository.findById(callId)
                .orElseThrow(() -> new IllegalArgumentException("Cuộc gọi không tồn tại"));
        Taikhoan user = taikhoanRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Người dùng không tồn tại"));
        ThanhviencuocgoiId id = new ThanhviencuocgoiId();
        id.setMaCall(callId);
        id.setMaTkThamGia(userId);
        Thanhviencuocgoi member = new Thanhviencuocgoi();
        member.setId(id);
        member.setMaCall(call);
        member.setMaTkThamGia(user);
        member.setThoiGianThamGia(Instant.now());
        member.setTrangThaiThamGia("JOINED");
        return thanhviencuocgoiRepository.save(member);
    }

    public Thanhviencuocgoi leaveCall(Integer callId, Integer userId) {
        ThanhviencuocgoiId id = new ThanhviencuocgoiId();
        id.setMaCall(callId);
        id.setMaTkThamGia(userId);
        Thanhviencuocgoi member = thanhviencuocgoiRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Thành viên cuộc gọi không tồn tại"));
        member.setThoiGianRoi(Instant.now());
        member.setTrangThaiThamGia("LEFT");
        return thanhviencuocgoiRepository.save(member);
    }

    public List<Thanhviencuocgoi> getMembersByCall(Integer callId) {
        Cuocgoi call = cuocgoiRepository.findById(callId)
                .orElseThrow(() -> new IllegalArgumentException("Cuộc gọi không tồn tại"));
        return thanhviencuocgoiRepository.findByMaCall(call);
    }

    public List<Thanhviencuocgoi> getCallsByMember(Integer userId) {
        Taikhoan user = taikhoanRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Người dùng không tồn tại"));
        return thanhviencuocgoiRepository.findByMaTkThamGia(user);
    }
}