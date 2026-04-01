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
public class ThanhviencuocgoiId implements Serializable {
    private static final long serialVersionUID = -912089176516608543L;
    @NotNull
    @Column(name = "MA_CALL", nullable = false)
    private Integer maCall;

    @NotNull
    @Column(name = "MA_TK_THAM_GIA", nullable = false)
    private Integer maTkThamGia;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || Hibernate.getClass(this) != Hibernate.getClass(o)) return false;
        ThanhviencuocgoiId entity = (ThanhviencuocgoiId) o;
        return Objects.equals(this.maCall, entity.maCall) &&
                Objects.equals(this.maTkThamGia, entity.maTkThamGia);
    }

    @Override
    public int hashCode() {
        return Objects.hash(maCall, maTkThamGia);
    }

}