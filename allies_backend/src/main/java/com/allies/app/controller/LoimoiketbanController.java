package com.allies.app.controller;

import com.allies.app.model.Loimoiketban;
import com.allies.app.model.Taikhoan;
import com.allies.app.repository.TaikhoanRepository;
import com.allies.app.service.LoimoiketbanService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/loimoiketban")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
public class LoimoiketbanController {

  private final LoimoiketbanService service;
  private final TaikhoanRepository taikhoanRepository;

  /** GỬI LỜI MỜI: body = { "senderId":1, "receiverId":2, "noiDung":"..."} */
  @PostMapping
  public ResponseEntity<Loimoiketban> send(@RequestBody Map<String, Object> body) {
    Integer senderId   = Integer.valueOf(body.get("senderId").toString());
    Integer receiverId = Integer.valueOf(body.get("receiverId").toString());
    String noiDung     = (String) body.getOrDefault("noiDung", "");
    return ResponseEntity.ok(service.sendFriendRequest(senderId, receiverId, noiDung)); // 
  }

  /** DANH SÁCH LỜI MỜI ĐẾN (PENDING) theo userId */
  @GetMapping("/incoming")
  public ResponseEntity<List<Loimoiketban>> incoming(@RequestParam("userId") Integer userId) {
    return ResponseEntity.ok(service.getPendingRequests(userId)); // 
  }

  /** DANH SÁCH LỜI MỜI ĐÃ GỬI của userId (dùng repo findByMaTkGui) */
  @GetMapping("/outgoing")
  public ResponseEntity<List<Loimoiketban>> outgoing(@RequestParam("userId") Integer userId) {
    Taikhoan sender = taikhoanRepository.findById(userId)
        .orElseThrow(() -> new IllegalArgumentException("Người gửi không tồn tại"));
    // repo đã có findByMaTkGui(...) 
    return ResponseEntity.ok(service.getSentRequests(sender));
  }

  /** CHẤP NHẬN */
  @PostMapping("/{id}/accept")
  public ResponseEntity<Loimoiketban> accept(@PathVariable Integer id) {
    return ResponseEntity.ok(service.acceptFriendRequest(id)); // 
  }

  /** TỪ CHỐI */
  @PostMapping("/{id}/decline")
  public ResponseEntity<Loimoiketban> decline(@PathVariable Integer id) {
    return ResponseEntity.ok(service.rejectFriendRequest(id)); // 
  }

  /** HỦY (bên đã gửi) — thêm nhẹ trong service nếu chưa có */
  @PostMapping("/{id}/cancel")
  public ResponseEntity<Void> cancel(@PathVariable Integer id) {
    service.cancelFriendRequest(id); // thêm method ngắn trong service, bên dưới
    return ResponseEntity.ok().build();
  }
}
