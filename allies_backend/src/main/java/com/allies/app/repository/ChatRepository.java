package com.allies.app.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.allies.app.model.Chat;
import com.allies.app.model.Taikhoan;

@Repository
public interface ChatRepository extends JpaRepository<Chat, Integer> {
    List<Chat> findByMaTkAOrMaTkB(Taikhoan maTkA, Taikhoan maTkB);

    @Query("SELECT c FROM Chat c WHERE (c.maTkA = :user1 AND c.maTkB = :user2) OR (c.maTkA = :user2 AND c.maTkB = :user1) ORDER BY c.thoiGian ASC")
    List<Chat> findConversation(@Param("user1") Taikhoan user1, @Param("user2") Taikhoan user2);

    /**
     * Paginated version — returns messages in DESCENDING order (newest first).
     * The caller reverses the list before sending to the client so the UI shows
     * oldest at top, newest at bottom.
     * Use with PageRequest.of(page, size, Sort.by("thoiGian").descending())
     */
    @Query("SELECT c FROM Chat c WHERE (c.maTkA = :user1 AND c.maTkB = :user2) OR (c.maTkA = :user2 AND c.maTkB = :user1)")
    Page<Chat> findConversationPaged(@Param("user1") Taikhoan user1, @Param("user2") Taikhoan user2, Pageable pageable);

    @Modifying
    @Query("UPDATE Chat c SET c.trangThai = 'seen' WHERE c.maTkA = :sender AND c.maTkB = :receiver AND c.trangThai <> 'seen'")
    int markAsSeen(@Param("sender") Taikhoan sender, @Param("receiver") Taikhoan receiver);
}