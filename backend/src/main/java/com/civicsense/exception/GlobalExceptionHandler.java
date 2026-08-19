package com.civicsense.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntimeException(
            RuntimeException ex) {

        Map<String, Object> response = new LinkedHashMap<>();

        String message = ex.getMessage();

        if (message == null) {
            message = "An unexpected error occurred";
        }

        if ("Email already registered".equals(message)) {
            response.put("status", 409);
            response.put("error", "Conflict");
            response.put("message", message);

            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(response);
        }

        if ("Name is required".equals(message)
                || "Email is required".equals(message)
                || "Password must contain at least 6 characters".equals(message)) {

            response.put("status", 400);
            response.put("error", "Bad Request");
            response.put("message", message);

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(response);
        }

        if ("Invalid email or password".equals(message)) {
            response.put("status", 401);
            response.put("error", "Unauthorized");
            response.put("message", message);

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(response);
        }

        response.put("status", 500);
        response.put("error", "Internal Server Error");
        response.put("message", message);

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(response);
    }
}
