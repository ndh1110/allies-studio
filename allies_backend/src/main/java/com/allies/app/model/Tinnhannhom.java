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
@Table(name = "tinnhannhom")
public class Tinnhannhom {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MA_TIN_NHAN_NHOM", nullable = false)
    private Integer id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "MA_NHOM", nullable = false)
    private Nhom maNhom;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "MA_TK_NGUOI_GUI", nullable = false)
    private Taikhoan maTkNguoiGui;

    @Lob
    @Column(name = "NOI_DUNG")
    private String noiDung;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "MA_MEDIA")
    private Media maMedia;

    @Column(name = "THOI_GIAN")
    private Instant thoiGian;

    @Size(max = 50)
    @Column(name = "TRANG_THAI", length = 50)
    private String trangThai;

}