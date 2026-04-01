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
@Table(name = "cuocgoi")
public class Cuocgoi {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MA_CALL", nullable = false)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "MA_NHOM")
    private Nhom maNhom;

    @Size(max = 50)
    @NotNull
    @Column(name = "LOAI_GOI", nullable = false, length = 50)
    private String loaiGoi;

    @NotNull
    @Column(name = "THOI_GIAN_BAT_DAU", nullable = false)
    private Instant thoiGianBatDau;

    @Column(name = "THOI_GIAN_KET_THUC")
    private Instant thoiGianKetThuc;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "NGUOI_TAO_CALL", nullable = false)
    private Taikhoan nguoiTaoCall;

    @Size(max = 50)
    @NotNull
    @Column(name = "TRANG_THAI", nullable = false, length = 50)
    private String trangThai;

    @Column(name = "TONG_THOI_LUONG_GIAY")
    private Integer tongThoiLuongGiay;

}