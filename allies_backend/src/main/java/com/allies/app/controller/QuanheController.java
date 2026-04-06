package com.allies.app.controller;

import com.allies.app.service.QuanheService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/quanhe")
@RequiredArgsConstructor
// @CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
public class QuanheController {

    private final QuanheService quanheService;

    /** GET ALL FRIENDS FOR USER */
    @GetMapping("/{userId}")
    public ResponseEntity<List<Map<String, Object>>> getFriends(@PathVariable Integer userId) {
        return ResponseEntity.ok(quanheService.getFriendsList(userId));
    }

    /** UNFRIEND A USER */
    @DeleteMapping("/{userId}/{friendId}")
    public ResponseEntity<Void> unfriend(@PathVariable Integer userId, @PathVariable Integer friendId) {
        quanheService.unfriend(userId, friendId);
        return ResponseEntity.ok().build();
    }
}
