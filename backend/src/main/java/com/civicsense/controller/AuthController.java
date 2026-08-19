package com.civicsense.controller;

import com.civicsense.dto.LoginRequest;
import com.civicsense.dto.RegisterRequest;
import com.civicsense.entity.User;
import com.civicsense.service.AuthService;

import jakarta.servlet.http.HttpSession;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestBody RegisterRequest request) {

        User user = authService.register(request);

        Map<String, Object> response =
                new LinkedHashMap<>();

        response.put("message", "Registration successful");
        response.put("id", user.getId());
        response.put("name", user.getName());
        response.put("email", user.getEmail());
        response.put("role", user.getRole());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequest request,
            HttpSession session) {

        User user = authService.login(request);

        // Store logged-in user in server session
        session.setAttribute("userId", user.getId());
        session.setAttribute("userName", user.getName());
        session.setAttribute("userEmail", user.getEmail());
        session.setAttribute("userRole", user.getRole());

        Map<String, Object> response =
                new LinkedHashMap<>();

        response.put("message", "Login successful");
        response.put("id", user.getId());
        response.put("name", user.getName());
        response.put("email", user.getEmail());
        response.put("role", user.getRole());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(
            HttpSession session) {

        session.invalidate();

        Map<String, Object> response =
                new LinkedHashMap<>();

        response.put("message", "Logout successful");

        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(
            HttpSession session) {

        Object userId =
                session.getAttribute("userId");

        if (userId == null) {

            Map<String, Object> response =
                    new LinkedHashMap<>();

            response.put("status", 401);
            response.put("error", "Unauthorized");
            response.put("message", "Please login first");

            return ResponseEntity
                    .status(401)
                    .body(response);
        }

        Map<String, Object> response =
                new LinkedHashMap<>();

        response.put("id", session.getAttribute("userId"));
        response.put("name", session.getAttribute("userName"));
        response.put("email", session.getAttribute("userEmail"));
        response.put("role", session.getAttribute("userRole"));

        return ResponseEntity.ok(response);
    }
}
