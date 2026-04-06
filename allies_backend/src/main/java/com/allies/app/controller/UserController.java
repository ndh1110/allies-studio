package com.allies.app.controller;

import com.allies.app.dto.UserLiteDto;
import com.allies.app.model.Taikhoan;
import com.allies.app.repository.TaikhoanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
// @CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
public class UserController {

    private final TaikhoanRepository tkRepo;

    @GetMapping("/search")
    public List<UserLiteDto> search(@RequestParam("q") String q, Principal me) {
        if (q == null || (q = q.trim()).length() < 2)
            return List.of(); // gõ ≥2 ký tự mới trả
        // lấy id người đang đăng nhập từ Principal (username = tenDn)
        Taikhoan mine = tkRepo.findByTenDn(me.getName())
                .orElseThrow(() -> new RuntimeException("Current user not found"));
        return tkRepo.findTop20ByTenDnContainingIgnoreCaseAndMaTkNot(q, mine.getMaTk())
                .stream().map(UserLiteDto::from).toList();
    }
}
