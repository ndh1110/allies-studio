package com.allies.app.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "loimoiketban")
public class Loimoiketban {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MA_LOI_MOI", nullable = false)
    private Integer id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "MA_TK_GUI", nullable = false)
    private Taikhoan maTkGui;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "MA_TK_NHAN", nullable = false)
    private Taikhoan maTkNhan;

    @Size(max = 50)
    @NotNull
    @ColumnDefault("'PENDING'")
    @Column(name = "TRANG_THAI", nullable = false, length = 50)
    private String trangThai;

    @NotNull
    @Column(name = "THOI_GIAN_GUI", nullable = false)
    private Instant thoiGianGui;

    @Size(max = 255)
    @Column(name = "NOI_DUNG_LOI_MOI")
    private String noiDungLoiMoi;

}