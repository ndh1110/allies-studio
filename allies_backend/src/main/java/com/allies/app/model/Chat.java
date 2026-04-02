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
@Table(name = "chat")
public class Chat {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MA_CHAT", nullable = false)
    private Integer id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "MA_TK_A", nullable = false)
    private Taikhoan maTkA;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "MA_TK_B", nullable = false)
    private Taikhoan maTkB;

    @Lob
    @Column(name = "NOI_DUNG")
    private String noiDung;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "MA_MEDIA")
    private Media maMedia;

    @Column(name = "ThoiGian")
    private Instant thoiGian;

    @Size(max = 50)
    @Column(name = "TrangThai", length = 50)
    private String trangThai;

}