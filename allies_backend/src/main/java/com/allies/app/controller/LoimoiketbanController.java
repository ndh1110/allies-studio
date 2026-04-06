package com.allies.app.controller;

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
public class LoimoiketbanController {

  private final LoimoiketbanService service;
  private final TaikhoanRepository taikhoanRepository;

  /** GỬI LỜI MỜI */
  @PostMapping
  public ResponseEntity<Map<String, Object>> send(@RequestBody Map<String, Object> body) {
    Integer senderId = Integer.valueOf(body.get("senderId").toString());
    Integer receiverId = Integer.valueOf(body.get("receiverId").toString());
    String noiDung = (String) body.getOrDefault("noiDung", "");

    Map<String, Object> result = service.sendFriendRequest(senderId, receiverId, noiDung);
    return ResponseEntity.ok(result);
  }

  /** DANH SÁCH LỜI MỜI ĐẾN (PENDING) theo userId */
  @GetMapping("/incoming")
  public ResponseEntity<List<Map<String, Object>>> incoming(@RequestParam("userId") Integer userId) {
    return ResponseEntity.ok(service.getPendingRequests(userId));
  }

  /** DANH SÁCH LỜI MỜI ĐÃ GỬI của userId (dùng repo findByMaTkGui) */
  @GetMapping("/outgoing")
  public ResponseEntity<List<Map<String, Object>>> outgoing(@RequestParam("userId") Integer userId) {
    Taikhoan sender = taikhoanRepository.findById(userId)
        .orElseThrow(() -> new IllegalArgumentException("Người gửi không tồn tại"));
    return ResponseEntity.ok(service.getSentRequests(sender));
  }

  /** CHẤP NHẬN */
  @PostMapping("/{id}/accept")
  public ResponseEntity<Map<String, Object>> accept(@PathVariable Integer id) {
    Map<String, Object> result = service.acceptFriendRequest(id);
    return ResponseEntity.ok(result);
  }

  /** TỪ CHỐI */
  @PostMapping("/{id}/decline")
  public ResponseEntity<Map<String, Object>> decline(@PathVariable Integer id) {
    Map<String, Object> result = service.rejectFriendRequest(id);

    return ResponseEntity.ok(result);
  }

  /** HỦY (bên đã gửi) — thêm nhẹ trong service nếu chưa có */
  @PostMapping("/{id}/cancel")
  public ResponseEntity<Void> cancel(@PathVariable Integer id) {
    service.cancelFriendRequest(id);
    return ResponseEntity.ok().build();
  }
}
