package com.allies.app.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import com.allies.app.model.Cuocgoi;
import com.allies.app.model.Taikhoan;
import com.allies.app.service.CuocgoiService;
import com.allies.app.service.TaikhoanService;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/call")
@CrossOrigin(origins = "*", maxAge = 3600)
public class CallController {

    @Autowired
    private CuocgoiService cuocgoiService;

    @Autowired
    private TaikhoanService taikhoanService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/call.initiate")
    public void initiateCall(@Payload Map<String, Object> callData) {
        try {
            String callerId = (String) callData.get("callerId");
            String receiverId = (String) callData.get("receiverId");
            String callType = (String) callData.get("callType");
            
            Taikhoan caller = taikhoanService.getTaikhoanByTenDn(callerId)
                    .orElseThrow(() -> new RuntimeException("Caller not found"));
            taikhoanService.getTaikhoanByTenDn(receiverId)
                    .orElseThrow(() -> new RuntimeException("Receiver not found"));

            Cuocgoi call = new Cuocgoi();
            call.setLoaiGoi(callType);
            call.setThoiGianBatDau(Instant.now());
            call.setNguoiTaoCall(caller);
            call.setTrangThai("ringing");

            Cuocgoi savedCall = cuocgoiService.createCall(call);

            // Send call notification to receiver
            messagingTemplate.convertAndSendToUser(
                receiverId, 
                "/queue/call", 
                Map.of(
                    "type", "incoming_call",
                    "callId", savedCall.getId(),
                    "callerId", callerId,
                    "callType", callType
                )
            );
        } catch (Exception e) {
            messagingTemplate.convertAndSend("/topic/errors", 
                Map.of("error", "Failed to initiate call: " + e.getMessage()));
        }
    }

    @MessageMapping("/call.answer")
    public void answerCall(@Payload Map<String, Object> answerData) {
        try {
            Integer callId = (Integer) answerData.get("callId");
            String answer = (String) answerData.get("answer"); // "accept" or "reject"
            
            Cuocgoi call = cuocgoiService.getCallById(callId)
                    .orElseThrow(() -> new RuntimeException("Call not found"));

            if ("accept".equals(answer)) {
                call.setTrangThai("active");
                call.setThoiGianBatDau(Instant.now());
                
                // Notify caller that call was accepted
                messagingTemplate.convertAndSendToUser(
                    call.getNguoiTaoCall().getTenDn(),
                    "/queue/call",
                    Map.of(
                        "type", "call_accepted",
                        "callId", callId
                    )
                );
            } else {
                call.setTrangThai("rejected");
                call.setThoiGianKetThuc(Instant.now());
                
                // Notify caller that call was rejected
                messagingTemplate.convertAndSendToUser(
                    call.getNguoiTaoCall().getTenDn(),
                    "/queue/call",
                    Map.of(
                        "type", "call_rejected",
                        "callId", callId
                    )
                );
            }
            
            cuocgoiService.updateCall(call);
        } catch (Exception e) {
            messagingTemplate.convertAndSend("/topic/errors", 
                Map.of("error", "Failed to answer call: " + e.getMessage()));
        }
    }

    @MessageMapping("/call.end")
    public void endCall(@Payload Map<String, Object> endData) {
        try {
            Integer callId = (Integer) endData.get("callId");
            
            Cuocgoi call = cuocgoiService.getCallById(callId)
                    .orElseThrow(() -> new RuntimeException("Call not found"));

            call.setTrangThai("ended");
            call.setThoiGianKetThuc(Instant.now());
            
            // Calculate call duration
            if (call.getThoiGianBatDau() != null && call.getThoiGianKetThuc() != null) {
                long duration = call.getThoiGianKetThuc().getEpochSecond() - call.getThoiGianBatDau().getEpochSecond();
                call.setTongThoiLuongGiay((int) duration);
            }
            
            cuocgoiService.updateCall(call);
            
            // Notify all participants that call ended
            messagingTemplate.convertAndSend("/topic/call/" + callId, 
                Map.of(
                    "type", "call_ended",
                    "callId", callId,
                    "duration", call.getTongThoiLuongGiay()
                )
            );
        } catch (Exception e) {
            messagingTemplate.convertAndSend("/topic/errors", 
                Map.of("error", "Failed to end call: " + e.getMessage()));
        }
    }

    @GetMapping("/history/{userId}")
    public ResponseEntity<List<Cuocgoi>> getCallHistory(@PathVariable Integer userId) {
        try {
            List<Cuocgoi> calls = cuocgoiService.getCallHistoryByUser(userId);
            return ResponseEntity.ok(calls);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/create")
    public ResponseEntity<Cuocgoi> createCall(@RequestBody Map<String, Object> callData) {
        try {
            Integer callerId = (Integer) callData.get("callerId");
            String callType = (String) callData.get("callType");
            
            Taikhoan caller = taikhoanService.getTaikhoanById(callerId)
                    .orElseThrow(() -> new RuntimeException("Caller not found"));

            Cuocgoi call = new Cuocgoi();
            call.setLoaiGoi(callType);
            call.setThoiGianBatDau(Instant.now());
            call.setNguoiTaoCall(caller);
            call.setTrangThai("initiated");

            Cuocgoi savedCall = cuocgoiService.createCall(call);
            return ResponseEntity.ok(savedCall);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
