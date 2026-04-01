package com.allies.app.repository;

import com.allies.app.model.Nhom;
import com.allies.app.model.Taikhoan;
import com.allies.app.model.Thanhviennhom;
import com.allies.app.model.ThanhviennhomId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ThanhviennhomRepository extends JpaRepository<Thanhviennhom, ThanhviennhomId> {
    List<Thanhviennhom> findByMaNhom(Nhom maNhom);
    List<Thanhviennhom> findByMaTk(Taikhoan maTk);
}