package com.allies.app.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.allies.app.model.Cuocgoi;
import com.allies.app.model.Taikhoan;

@Repository
public interface CuocgoiRepository extends JpaRepository<Cuocgoi, Integer> {
    List<Cuocgoi> findByNguoiTaoCall(Taikhoan nguoiTaoCall);
}