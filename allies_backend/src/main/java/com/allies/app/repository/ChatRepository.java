package com.allies.app.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.allies.app.model.Chat;
import com.allies.app.model.Taikhoan;

@Repository
public interface ChatRepository extends JpaRepository<Chat, Integer> {
    List<Chat> findByMaTkAOrMaTkB(Taikhoan maTkA, Taikhoan maTkB);
    List<Chat> findByMaTkAAndMaTkB(Taikhoan maTkA, Taikhoan maTkB);
}