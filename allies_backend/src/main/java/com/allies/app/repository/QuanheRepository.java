package com.allies.app.repository;

import com.allies.app.model.Quanhe;
import com.allies.app.model.Taikhoan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuanheRepository extends JpaRepository<Quanhe, Integer> {
    List<Quanhe> findByMaTkAOrMaTkB(Taikhoan maTkA, Taikhoan maTkB);

    @Query("SELECT q FROM Quanhe q WHERE (q.maTkA = :user AND q.maTkB = :friend) OR (q.maTkA = :friend AND q.maTkB = :user)")
    Optional<Quanhe> findRelationship(@Param("user") Taikhoan user, @Param("friend") Taikhoan friend);
}