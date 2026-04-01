package com.allies.app.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "Taikhoan")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Taikhoan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MA_TK")
    private Integer maTk;

    @Column(name = "TEN_DN", nullable = false, unique = true, length = 50)
    private String tenDn;

    @Column(name = "MK", nullable = false)
    private String mk;

    @Column(name = "AVARTA")
    private String avarta;
}
