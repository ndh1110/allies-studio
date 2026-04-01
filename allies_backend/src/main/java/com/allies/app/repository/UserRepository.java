package com.allies.app.repository;

import com.allies.app.model.Taikhoan;
import com.allies.app.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByMaTk(Taikhoan maTk);
}