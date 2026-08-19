package com.civicsense.controller;

import com.civicsense.service.MediaStorageService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/uploads")
public class UploadController {

    private final MediaStorageService mediaStorageService;

    public UploadController(
            MediaStorageService mediaStorageService) {

        this.mediaStorageService =
                mediaStorageService;
    }

    @PostMapping("/image")
    public ResponseEntity<?> uploadImage(
            @RequestParam("file") MultipartFile file) {

        String imageUrl =
                mediaStorageService.store(file);

        Map<String, Object> response =
                new LinkedHashMap<>();

        response.put("success", true);
        response.put("imageUrl", imageUrl);

        return ResponseEntity.ok(response);
    }
}
