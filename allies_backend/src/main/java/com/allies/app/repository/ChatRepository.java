package com.allies.app.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.allies.app.model.Chat;
import com.allies.app.model.Taikhoan;

@Repository
public interface ChatRepository extends JpaRepository<Chat, Integer> {
    List<Chat> findByMaTkAOrMaTkB(Taikhoan maTkA, Taikhoan maTkB);
    List<Chat> findByMaTkAAndMaTkB(Taikhoan maTkA, Taikhoan maTkB);
    List<Chat> findByMaTkBAndTrangThai(Taikhoan maTkB, String trangThai);
    Long countByMaTkBAndTrangThai(Taikhoan maTkB, String trangThai);
    
    @Query("SELECT c FROM Chat c WHERE (c.maTkA = :user1 AND c.maTkB = :user2) OR (c.maTkA = :user2 AND c.maTkB = :user1) ORDER BY c.thoiGian ASC")
    List<Chat> findConversationBetweenUsers(@Param("user1") Taikhoan user1, @Param("user2") Taikhoan user2);
    
    @Query("SELECT c FROM Chat c WHERE c.maTkA = :user OR c.maTkB = :user ORDER BY c.thoiGian DESC")
    List<Chat> findAllMessagesForUser(@Param("user") Taikhoan user);
}