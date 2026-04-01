package com.allies.app.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.Hibernate;

import java.io.Serializable;
import java.util.Objects;

@Getter
@Setter
@Embeddable
public class ThanhviennhomId implements Serializable {
    private static final long serialVersionUID = 2952178004556088054L;
    @NotNull
    @Column(name = "MA_NHOM", nullable = false)
    private Integer maNhom;

    @NotNull
    @Column(name = "MA_TK", nullable = false)
    private Integer maTk;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || Hibernate.getClass(this) != Hibernate.getClass(o)) return false;
        ThanhviennhomId entity = (ThanhviennhomId) o;
        return Objects.equals(this.maNhom, entity.maNhom) &&
                Objects.equals(this.maTk, entity.maTk);
    }

    @Override
    public int hashCode() {
        return Objects.hash(maNhom, maTk);
    }

}