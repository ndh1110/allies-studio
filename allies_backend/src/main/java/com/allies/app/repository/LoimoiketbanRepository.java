package com.allies.app.repository;

import com.allies.app.model.Loimoiketban;
import com.allies.app.model.Taikhoan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LoimoiketbanRepository extends JpaRepository<Loimoiketban, Integer> {
    List<Loimoiketban> findByMaTkNhanAndTrangThai(Taikhoan maTkNhan, String trangThai);
    List<Loimoiketban> findByMaTkGui(Taikhoan maTkGui);
}