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
@Table(name = "thanhviencuocgoi")
public class Thanhviencuocgoi {
    @EmbeddedId
    private ThanhviencuocgoiId id;

    @MapsId("maCall")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "MA_CALL", nullable = false)
    private Cuocgoi maCall;

    @MapsId("maTkThamGia")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "MA_TK_THAM_GIA", nullable = false)
    private Taikhoan maTkThamGia;

    @NotNull
    @Column(name = "THOI_GIAN_THAM_GIA", nullable = false)
    private Instant thoiGianThamGia;

    @Column(name = "THOI_GIAN_ROI")
    private Instant thoiGianRoi;

    @Size(max = 50)
    @Column(name = "TRANG_THAI_THAM_GIA", length = 50)
    private String trangThaiThamGia;

}