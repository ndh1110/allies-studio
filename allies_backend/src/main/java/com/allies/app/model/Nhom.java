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
@Table(name = "nhom")
public class Nhom {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MA_NHOM", nullable = false)
    private Integer id;

    @Size(max = 255)
    @NotNull
    @Column(name = "TEN_NHOM", nullable = false)
    private String tenNhom;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "NGUOI_TAO", nullable = false)
    private Taikhoan nguoiTao;

    @NotNull
    @Column(name = "NGAY_TAO", nullable = false)
    private Instant ngayTao;

}