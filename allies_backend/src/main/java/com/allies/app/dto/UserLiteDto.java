package com.allies.app.dto;

import com.allies.app.model.Taikhoan;

public record UserLiteDto(Integer id, String username) {
    public static UserLiteDto from(Taikhoan tk) {
        return new UserLiteDto(tk.getMaTk(), tk.getTenDn());
    }
}
