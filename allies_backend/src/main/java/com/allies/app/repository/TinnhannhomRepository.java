package com.allies.app.repository;

import com.allies.app.model.Nhom;
import com.allies.app.model.Taikhoan;
import com.allies.app.model.Tinnhannhom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TinnhannhomRepository extends JpaRepository<Tinnhannhom, Integer> {
    List<Tinnhannhom> findByMaNhom(Nhom maNhom);
    List<Tinnhannhom> findByMaTkNguoiGui(Taikhoan maTkNguoiGui);
}