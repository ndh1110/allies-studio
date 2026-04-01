package com.allies.app.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "media")
public class Media {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MA_MEDIA", nullable = false)
    private Integer id;

    @Size(max = 255)
    @Column(name = "TEN_FILE")
    private String tenFile;

    @Size(max = 500)
    @NotNull
    @Column(name = "DUONG_DAN_URL", nullable = false, length = 500)
    private String duongDanUrl;

    @Size(max = 50)
    @NotNull
    @Column(name = "LOAI_MEDIA", nullable = false, length = 50)
    private String loaiMedia;

    @Column(name = "KICH_THUOC_KB")
    private Integer kichThuocKb;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "MA_TK_UPLOAD")
    private Taikhoan maTkUpload;

}