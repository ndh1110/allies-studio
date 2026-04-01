package com.allies.app.repository;

import com.allies.app.model.Cuocgoi;
import com.allies.app.model.Taikhoan;
import com.allies.app.model.Thanhviencuocgoi;
import com.allies.app.model.ThanhviencuocgoiId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ThanhviencuocgoiRepository extends JpaRepository<Thanhviencuocgoi, ThanhviencuocgoiId> {
    List<Thanhviencuocgoi> findByMaCall(Cuocgoi maCall);
    List<Thanhviencuocgoi> findByMaTkThamGia(Taikhoan maTkThamGia);
}