package com.civicsense.controller;

import com.civicsense.entity.Complaint;
import com.civicsense.service.AdminService;

import jakarta.servlet.http.HttpSession;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(
            AdminService adminService) {

        this.adminService = adminService;
    }


    // ======================================================
    // ADMIN AUTHORIZATION
    // ======================================================

    private ResponseEntity<?> checkAdmin(
            HttpSession session) {

        Object userId =
                session.getAttribute("userId");

        Object role =
                session.getAttribute("userRole");

        if (userId == null) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(error(
                            401,
                            "Unauthorized",
                            "Please login first"));
        }

        if (role == null ||
                !"ADMIN".equalsIgnoreCase(
                        role.toString())) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(error(
                            403,
                            "Forbidden",
                            "Admin access required"));
        }

        return null;
    }


    private Map<String, Object> error(
            int status,
            String error,
            String message) {

        Map<String, Object> response =
                new LinkedHashMap<>();

        response.put("status", status);
        response.put("error", error);
        response.put("message", message);

        return response;
    }


    // ======================================================
    // ADMIN STATS
    // ======================================================

    @GetMapping("/stats")
    public ResponseEntity<?> getStats(
            HttpSession session) {

        ResponseEntity<?> denied =
                checkAdmin(session);

        if (denied != null) {
            return denied;
        }

        return ResponseEntity.ok(
                adminService.getStats());
    }


    // ======================================================
    // ALL COMPLAINTS
    // ======================================================

    @GetMapping("/complaints")
    public ResponseEntity<?> getAllComplaints(
            HttpSession session,
            @RequestParam(required = false)
            String status) {

        ResponseEntity<?> denied =
                checkAdmin(session);

        if (denied != null) {
            return denied;
        }

        List<Complaint> complaints;

        if (status == null ||
                status.isBlank()) {

            complaints =
                    adminService.getAllComplaints();

        } else {

            complaints =
                    adminService
                            .getComplaintsByStatus(
                                    status);
        }

        return ResponseEntity.ok(complaints);
    }


    // ======================================================
    // SINGLE COMPLAINT
    // ======================================================

    @GetMapping("/complaints/{id}")
    public ResponseEntity<?> getComplaint(
            @PathVariable Long id,
            HttpSession session) {

        ResponseEntity<?> denied =
                checkAdmin(session);

        if (denied != null) {
            return denied;
        }

        return ResponseEntity.ok(
                adminService.getComplaint(id));
    }


    // ======================================================
    // UPDATE STATUS
    // ======================================================

    @PutMapping("/complaints/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> request,
            HttpSession session) {

        ResponseEntity<?> denied =
                checkAdmin(session);

        if (denied != null) {
            return denied;
        }

        String status =
                request.get("status");

        if (status == null ||
                status.isBlank()) {

            return ResponseEntity
                    .badRequest()
                    .body(error(
                            400,
                            "Bad Request",
                            "Status is required"));
        }

        if (!status.equalsIgnoreCase("PENDING") &&
                !status.equalsIgnoreCase("IN_PROGRESS") &&
                !status.equalsIgnoreCase("RESOLVED")) {

            return ResponseEntity
                    .badRequest()
                    .body(error(
                            400,
                            "Bad Request",
                            "Invalid complaint status"));
        }

        Complaint complaint =
                adminService.updateStatus(
                        id,
                        status);

        return ResponseEntity.ok(complaint);
    }
}
