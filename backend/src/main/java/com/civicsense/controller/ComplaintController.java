package com.civicsense.controller;

import com.civicsense.dto.ComplaintRequest;
import com.civicsense.entity.Complaint;
import com.civicsense.service.ComplaintService;

import jakarta.servlet.http.HttpSession;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/complaints")
public class ComplaintController {

    private final ComplaintService complaintService;

    public ComplaintController(
            ComplaintService complaintService) {

        this.complaintService = complaintService;
    }
    @GetMapping
public ResponseEntity<?> getCommunityComplaints() {

    return ResponseEntity.ok(
            complaintService.getCommunityComplaints()
    );
}


    // ======================================================
    // CREATE COMPLAINT
    // ======================================================

    @PostMapping
    public ResponseEntity<?> createComplaint(
            @RequestBody ComplaintRequest request,
            HttpSession session) {

        Long userId = getUserId(session);

        Complaint complaint =
                complaintService.createComplaint(
                        request,
                        userId);

        return ResponseEntity.ok(complaint);
    }


    // ======================================================
    // MY COMPLAINTS
    // ======================================================

    @GetMapping("/my")
    public ResponseEntity<?> getMyComplaints(
            HttpSession session) {

        Long userId = getUserId(session);

        return ResponseEntity.ok(
                complaintService.getMyComplaints(userId)
        );
    }


    // ======================================================
    // SINGLE COMPLAINT
    // ======================================================

    @GetMapping("/{id}")
    public ResponseEntity<?> getComplaint(
            @PathVariable Long id,
            HttpSession session) {

        Long userId = getUserId(session);

        return ResponseEntity.ok(
                complaintService.getComplaint(
                        id,
                        userId)
        );
    }


    // ======================================================
    // STATISTICS
    // ======================================================

    @GetMapping("/stats")
    public ResponseEntity<?> getStats(
            HttpSession session) {

        Long userId = getUserId(session);

        Map<String, Object> response =
                new LinkedHashMap<>();

        response.put(
                "total",
                complaintService.getTotal(userId)
        );

        response.put(
                "pending",
                complaintService.getPending(userId)
        );

        response.put(
                "inProgress",
                complaintService.getInProgress(userId)
        );

        response.put(
                "resolved",
                complaintService.getResolved(userId)
        );

        return ResponseEntity.ok(response);
    }


    // ======================================================
    // SESSION USER
    // ======================================================

    private Long getUserId(HttpSession session) {

        Object userId =
                session.getAttribute("userId");

        if (userId == null) {

            throw new RuntimeException(
                    "Please login first"
            );
        }

        if (userId instanceof Long) {
            return (Long) userId;
        }

        return Long.valueOf(
                userId.toString()
        );
    }
}