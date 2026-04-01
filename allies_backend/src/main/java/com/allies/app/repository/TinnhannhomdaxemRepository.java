package com.allies.app.repository;

import com.allies.app.model.Taikhoan;
import com.allies.app.model.Tinnhannhom;
import com.allies.app.model.Tinnhannhomdaxem;
import com.allies.app.model.TinnhannhomdaxemId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TinnhannhomdaxemRepository extends JpaRepository<Tinnhannhomdaxem, TinnhannhomdaxemId> {
    List<Tinnhannhomdaxem> findByMaTinNhanNhom(Tinnhannhom maTinNhanNhom);
    List<Tinnhannhomdaxem> findByMaTkDaXem(Taikhoan maTkDaXem);
}