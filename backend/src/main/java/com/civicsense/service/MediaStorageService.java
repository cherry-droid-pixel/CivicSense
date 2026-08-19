package com.civicsense.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

@Service
public class MediaStorageService {

    private final Path uploadDir =
            Paths.get("uploads").toAbsolutePath().normalize();

    public MediaStorageService() {

        try {
            Files.createDirectories(uploadDir);
        } catch (IOException e) {
            throw new RuntimeException(
                    "Could not create upload directory", e);
        }
    }

    public String store(MultipartFile file) {

        if (file == null || file.isEmpty()) {
            throw new RuntimeException("Image file is empty");
        }

        String contentType = file.getContentType();

        if (contentType == null ||
                !contentType.startsWith("image/")) {

            throw new RuntimeException(
                    "Only image files are allowed");
        }

        String originalName =
                file.getOriginalFilename();

        String extension = "";

        if (originalName != null &&
                originalName.contains(".")) {

            extension =
                    originalName.substring(
                            originalName.lastIndexOf("."));
        }

        String fileName =
                UUID.randomUUID() + extension;

        Path target =
                uploadDir.resolve(fileName)
                        .normalize();

        if (!target.startsWith(uploadDir)) {
            throw new RuntimeException(
                    "Invalid file path");
        }

        try {

            Files.copy(
                    file.getInputStream(),
                    target,
                    StandardCopyOption.REPLACE_EXISTING
            );

        } catch (IOException e) {

            throw new RuntimeException(
                    "Could not save image", e);
        }

        return "/uploads/" + fileName;
    }
}
