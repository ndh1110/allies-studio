package com.allies.app.service;

import java.util.List;
import java.util.Optional;

import org.springframework.context.annotation.Primary;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;              // 👈 thêm
import org.springframework.transaction.annotation.Transactional; // (tuỳ chọn)

import com.allies.app.model.Taikhoan;
import com.allies.app.repository.TaikhoanRepository;

@Primary                               // 👈 ưu tiên bean này cho UserDetailsService
@Service                                // 👈 biến class thành bean Spring
public class TaikhoanService implements UserDetailsService {

    private final TaikhoanRepository taikhoanRepository;
    private final PasswordEncoder passwordEncoder;
    
    public TaikhoanService(TaikhoanRepository taikhoanRepository, PasswordEncoder passwordEncoder) {
        this.taikhoanRepository = taikhoanRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public Taikhoan createTaikhoan(Taikhoan taikhoan) {
        if (taikhoanRepository.existsByTenDn(taikhoan.getTenDn())) {
            throw new IllegalArgumentException("Tên đăng nhập đã tồn tại");
        }
        // ⚠️ Lưu ý: entity của bạn đang dùng field mật khẩu là `mk` (không phải `matKhau`)
        taikhoan.setMk(passwordEncoder.encode(taikhoan.getMk()));
        return taikhoanRepository.save(taikhoan);
    }
    
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Taikhoan taikhoan = taikhoanRepository.findByTenDn(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        
        return org.springframework.security.core.userdetails.User.builder()
                .username(taikhoan.getTenDn())
                .password(taikhoan.getMk()) // 👈 dùng đúng field mk
                .authorities("ROLE_USER")
                .build();
    }

    public Optional<Taikhoan> getTaikhoanById(Integer id) {
        return taikhoanRepository.findById(id);
    }

    public Optional<Taikhoan> getTaikhoanByTenDn(String tenDn) {
        return taikhoanRepository.findByTenDn(tenDn);
    }

    public List<Taikhoan> getAllTaikhoan() {
        return taikhoanRepository.findAll();
    }

    public Taikhoan updateTaikhoan(Integer id, Taikhoan updatedTaikhoan) {
        Optional<Taikhoan> existing = taikhoanRepository.findById(id);
        if (existing.isPresent()) {
            Taikhoan taikhoan = existing.get();
            taikhoan.setTenDn(updatedTaikhoan.getTenDn());
            taikhoan.setMk(updatedTaikhoan.getMk());
            taikhoan.setAvarta(updatedTaikhoan.getAvarta());
            return taikhoanRepository.save(taikhoan);
        }
        throw new IllegalArgumentException("Tài khoản không tồn tại");
    }

    public void deleteTaikhoan(Integer id) {
        taikhoanRepository.deleteById(id);
    }
}
