package com.allies.app.repository;

import com.allies.app.model.Nhom;
import com.allies.app.model.Taikhoan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NhomRepository extends JpaRepository<Nhom, Integer> {
    List<Nhom> findByNguoiTao(Taikhoan nguoiTao);
}
