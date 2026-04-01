package com.allies.app.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.allies.app.model.Media;
import com.allies.app.model.Taikhoan;

@Repository
public interface MediaRepository extends JpaRepository<Media, Integer> {
    List<Media> findByMaTkUpload(Taikhoan maTkUpload);
}