package com.allies.app.repository;

import com.allies.app.model.Loimoiketban;
import com.allies.app.model.Taikhoan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LoimoiketbanRepository extends JpaRepository<Loimoiketban, Integer> {
    List<Loimoiketban> findByMaTkNhanAndTrangThai(Taikhoan maTkNhan, String trangThai);
    List<Loimoiketban> findByMaTkGui(Taikhoan maTkGui);

    /** Find any existing request between two users regardless of direction. */
    @Query("SELECT l FROM Loimoiketban l WHERE " +
           "(l.maTkGui = :a AND l.maTkNhan = :b) OR " +
           "(l.maTkGui = :b AND l.maTkNhan = :a)")
    List<Loimoiketban> findBetweenUsers(@Param("a") Taikhoan a, @Param("b") Taikhoan b);

    /** Find a request from a specific sender to a specific receiver. */
    Optional<Loimoiketban> findByMaTkGuiAndMaTkNhan(Taikhoan maTkGui, Taikhoan maTkNhan);
}