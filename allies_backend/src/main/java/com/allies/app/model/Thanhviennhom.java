package com.allies.app.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "thanhviennhom")
public class Thanhviennhom {
    @EmbeddedId
    private ThanhviennhomId id;

    @MapsId("maNhom")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "MA_NHOM", nullable = false)
    private Nhom maNhom;

    @MapsId("maTk")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "MA_TK", nullable = false)
    private Taikhoan maTk;

    @Size(max = 50)
    @NotNull
    @Column(name = "VAI_TRO", nullable = false, length = 50)
    private String vaiTro;

    @NotNull
    @Column(name = "NGAY_THAM_GIA", nullable = false)
    private Instant ngayThamGia;

}