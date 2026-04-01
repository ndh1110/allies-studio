package com.allies.app.payload.response;

import lombok.Data;

@Data
public class JwtResponse {
    private String token;
    private String type = "Bearer";
    private Integer id;
    private String username;
    // Bỏ email để khớp với bảng Taikhoan

    public JwtResponse(String accessToken, Integer id, String username, String email) {
        this.token = accessToken;
        this.id = id;
        this.username = username;
        // Bỏ email trong constructor nếu bạn quyết định không truyền nó
    }

    // Constructor đơn giản hơn
    public JwtResponse(String accessToken, Integer id, String username) {
        this.token = accessToken;
        this.id = id;
        this.username = username;
    }
}