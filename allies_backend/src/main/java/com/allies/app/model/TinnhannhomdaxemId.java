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
public class TinnhannhomdaxemId implements Serializable {
    private static final long serialVersionUID = -1716299468313168906L;
    @NotNull
    @Column(name = "MA_TIN_NHAN_NHOM", nullable = false)
    private Integer maTinNhanNhom;

    @NotNull
    @Column(name = "MA_TK_DA_XEM", nullable = false)
    private Integer maTkDaXem;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || Hibernate.getClass(this) != Hibernate.getClass(o)) return false;
        TinnhannhomdaxemId entity = (TinnhannhomdaxemId) o;
        return Objects.equals(this.maTkDaXem, entity.maTkDaXem) &&
                Objects.equals(this.maTinNhanNhom, entity.maTinNhanNhom);
    }

    @Override
    public int hashCode() {
        return Objects.hash(maTkDaXem, maTinNhanNhom);
    }

}