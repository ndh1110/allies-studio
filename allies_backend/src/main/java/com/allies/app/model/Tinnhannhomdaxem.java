package com.allies.app.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "tinnhannhomdaxem")
public class Tinnhannhomdaxem {
    @EmbeddedId
    private TinnhannhomdaxemId id;

    @MapsId("maTinNhanNhom")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "MA_TIN_NHAN_NHOM", nullable = false)
    private Tinnhannhom maTinNhanNhom;

    @MapsId("maTkDaXem")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "MA_TK_DA_XEM", nullable = false)
    private Taikhoan maTkDaXem;

    @NotNull
    @Column(name = "THOI_GIAN_XEM", nullable = false)
    private Instant thoiGianXem;

}