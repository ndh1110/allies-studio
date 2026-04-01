package com.allies.app.repository;

import com.allies.app.model.Quanhe;
import com.allies.app.model.Taikhoan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuanheRepository extends JpaRepository<Quanhe, Integer> {
    List<Quanhe> findByMaTkAOrMaTkB(Taikhoan maTkA, Taikhoan maTkB);
}