package com.allies.app.controller;

import com.allies.app.model.Nhom;
import com.allies.app.model.Thanhviennhom;
import com.allies.app.model.Tinnhannhom;
import com.allies.app.service.NhomService;
import com.allies.app.service.ThanhviennhomService;
import com.allies.app.service.TinnhannhomService;
import com.allies.app.repository.NhomRepository;
import com.allies.app.repository.TinnhannhomRepository;
import com.allies.app.repository.TinnhannhomdaxemRepository;
import com.allies.app.repository.ThanhviennhomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/groups")
@CrossOrigin(origins = "*", maxAge = 3600)
public class GroupController {

    @Autowired
    private NhomService nhomService;

    @Autowired
    private ThanhviennhomService thanhviennhomService;

    @Autowired
    private TinnhannhomService tinnhannhomService;

    @Autowired
    private NhomRepository nhomRepository;

    @Autowired
    private TinnhannhomRepository tinnhannhomRepository;

    @Autowired
    private TinnhannhomdaxemRepository tinnhannhomdaxemRepository;

    @Autowired
    private ThanhviennhomRepository thanhviennhomRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    /**
     * CREATE GROUP
     */
    @PostMapping
    @Transactional
    public ResponseEntity<Map<String, Object>> createGroup(@RequestBody Map<String, Object> body) {
        try {
            String tenNhom = (String) body.get("tenNhom");
            Integer creatorId = Integer.valueOf(body.get("creatorId").toString());
            @SuppressWarnings("unchecked")
            List<Integer> memberIds = ((List<Object>) body.getOrDefault("memberIds", new ArrayList<>()))
                    .stream().map(id -> Integer.valueOf(id.toString())).toList();

            Nhom nhom = new Nhom();
            nhom.setTenNhom(tenNhom);
            Nhom savedGroup = nhomService.createGroup(nhom, creatorId);

            thanhviennhomService.addMemberToGroup(savedGroup.getId(), creatorId, "ADMIN");

            for (Integer memberId : memberIds) {
                if (!memberId.equals(creatorId)) {
                    thanhviennhomService.addMemberToGroup(savedGroup.getId(), memberId, "MEMBER");
                }
            }

            Map<String, Object> result = mapGroupToDto(savedGroup);
            result.put("members", buildMemberList(savedGroup.getId()));

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * GET GROUPS for a user
     */
    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<List<Map<String, Object>>> getGroups(@RequestParam("userId") Integer userId) {
        try {
            List<Thanhviennhom> memberships = thanhviennhomService.getGroupsByMember(userId);
            List<Map<String, Object>> groups = new ArrayList<>();

            for (Thanhviennhom membership : memberships) {
                Nhom nhom = membership.getMaNhom();
                Map<String, Object> dto = mapGroupToDto(nhom);
                dto.put("myRole", membership.getVaiTro());
                dto.put("members", buildMemberList(nhom.getId()));
                groups.add(dto);
            }

            return ResponseEntity.ok(groups);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * DELETE GROUP (ADMIN only)
     */
    @DeleteMapping("/{groupId}")
    @Transactional
    public ResponseEntity<Map<String, Object>> deleteGroup(
            @PathVariable Integer groupId,
            @RequestParam("userId") Integer userId) {
        try {
            // Verify the user is ADMIN of this group
            List<Thanhviennhom> members = thanhviennhomService.getMembersByGroup(groupId);
            boolean isAdmin = members.stream()
                    .anyMatch(m -> m.getMaTk().getMaTk().equals(userId) && "ADMIN".equals(m.getVaiTro()));

            if (!isAdmin) {
                Map<String, Object> error = new HashMap<>();
                error.put("error", "Only the group admin can delete this group");
                return ResponseEntity.status(403).body(error);
            }

            // 1. Delete read receipts for all group messages
            Nhom nhom = nhomService.getGroupById(groupId);
            List<Tinnhannhom> messages = tinnhannhomRepository.findByMaNhom(nhom);
            if (messages != null) {
                for (Tinnhannhom msg : messages) {
                    var receipts = tinnhannhomdaxemRepository.findByMaTinNhanNhom(msg);
                    if (receipts != null) {
                        tinnhannhomdaxemRepository.deleteAll(receipts);
                    }
                }
                
                // 2. Delete group messages
                tinnhannhomRepository.deleteAll(messages);
            }

            // 3. Delete group members
            if (members != null) {
                thanhviennhomRepository.deleteAll(members);
            }

            // 4. Delete the group itself
            if (groupId != null) {
                nhomRepository.deleteById(groupId);
            }

            Map<String, Object> result = new HashMap<>();
            result.put("deleted", true);
            result.put("groupId", groupId);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * GET GROUP MESSAGES
     */
    @GetMapping("/{groupId}/messages")
    @Transactional(readOnly = true)
    public ResponseEntity<List<Map<String, Object>>> getGroupMessages(@PathVariable Integer groupId) {
        try {
            List<Tinnhannhom> messages = tinnhannhomService.getGroupMessages(groupId);
            List<Map<String, Object>> dtos = new ArrayList<>();
            for (Tinnhannhom msg : messages) {
                Map<String, Object> dto = new HashMap<>();
                dto.put("id", msg.getId());
                dto.put("noiDung", msg.getNoiDung());
                dto.put("thoiGian", msg.getThoiGian() != null ? msg.getThoiGian().toString() : null);
                dto.put("trangThai", msg.getTrangThai());
                dto.put("groupId", msg.getMaNhom().getId());
                Map<String, Object> sender = new HashMap<>();
                sender.put("id", msg.getMaTkNguoiGui().getMaTk());
                sender.put("username", msg.getMaTkNguoiGui().getTenDn());
                dto.put("sender", sender);
                dtos.add(dto);
            }
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * SEND GROUP MESSAGE
     * Body: { "senderId": 10, "noiDung": "Hello group!" }
     */
    @PostMapping("/{groupId}/messages")
    @Transactional
    public ResponseEntity<Map<String, Object>> sendGroupMessage(
            @PathVariable Integer groupId,
            @RequestBody Map<String, Object> body) {
        try {
            Integer senderId = Integer.valueOf(body.get("senderId").toString());
            String noiDung = (String) body.get("noiDung");

            Tinnhannhom msg = new Tinnhannhom();
            msg.setNoiDung(noiDung);
            Tinnhannhom saved = tinnhannhomService.sendGroupMessage(msg, groupId, senderId);

            Map<String, Object> dto = new HashMap<>();
            dto.put("id", saved.getId());
            dto.put("noiDung", saved.getNoiDung());
            dto.put("thoiGian", saved.getThoiGian() != null ? saved.getThoiGian().toString() : null);
            dto.put("trangThai", saved.getTrangThai());
            dto.put("groupId", saved.getMaNhom().getId());
            Map<String, Object> sender = new HashMap<>();
            sender.put("id", saved.getMaTkNguoiGui().getMaTk());
            sender.put("username", saved.getMaTkNguoiGui().getTenDn());
            dto.put("sender", sender);

            // Broadcast to the group topic
            System.out.println("Broadcasting to: /topic/group/" + groupId);
            messagingTemplate.convertAndSend("/topic/group/" + groupId, dto);

            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // === Helper methods ===

    private List<Map<String, Object>> buildMemberList(Integer groupId) {
        List<Map<String, Object>> memberList = new ArrayList<>();
        for (Thanhviennhom tv : thanhviennhomService.getMembersByGroup(groupId)) {
            Map<String, Object> m = new HashMap<>();
            m.put("userId", tv.getMaTk().getMaTk());
            m.put("username", tv.getMaTk().getTenDn());
            m.put("role", tv.getVaiTro());
            memberList.add(m);
        }
        return memberList;
    }

    private Map<String, Object> mapGroupToDto(Nhom nhom) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", nhom.getId());
        dto.put("tenNhom", nhom.getTenNhom());
        dto.put("ngayTao", nhom.getNgayTao() != null ? nhom.getNgayTao().toString() : null);
        if (nhom.getNguoiTao() != null) {
            Map<String, Object> creator = new HashMap<>();
            creator.put("id", nhom.getNguoiTao().getMaTk());
            creator.put("username", nhom.getNguoiTao().getTenDn());
            dto.put("nguoiTao", creator);
        }
        return dto;
    }
}
