package com.allies.app.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "user")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID", nullable = false)
    private Integer id;

    @NotNull
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "MA_TK", nullable = false)
    private Taikhoan maTk;

    @Size(max = 255)
    @Column(name = "TEN")
    private String ten;

    @Size(max = 255)
    @Column(name = "DIA_CHI")
    private String diaChi;

    @Size(max = 20)
    @Column(name = "SDT", length = 20)
    private String sdt;

    @Size(max = 255)
    @Column(name = "MAIL")
    private String mail;

}