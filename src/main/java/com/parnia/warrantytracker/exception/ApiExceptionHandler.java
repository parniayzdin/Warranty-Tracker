package com.parnia.warrantytracker.exception;

import jakarta.validation.ConstraintViolationException;
import org.springframework.http.*;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.dao.DataIntegrityViolationException;
import java.util.*;

@RestControllerAdvice
public class ApiExceptionHandler {
    public record ApiError(int status, String message, Map<String, String> errors) {}
    private ResponseEntity<ApiError> error(int status, String message, Map<String, String> errors) {
        return ResponseEntity.status(status).body(new ApiError(status, message, errors));
    }
    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ApiError> notFound(NotFoundException ex) {
        return error(404, ex.getMessage(), Map.of());
    }
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> validation(MethodArgumentNotValidException ex) {
        Map<String, String> fields = new LinkedHashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(e -> fields.putIfAbsent(e.getField(), e.getDefaultMessage()));
        return error(400, "Please check the highlighted fields", fields);
    }
    @ExceptionHandler({IllegalArgumentException.class, ConstraintViolationException.class})
    public ResponseEntity<ApiError> invalid(RuntimeException ex) {
        return error(400, ex.getMessage(), Map.of());
    }
    @ExceptionHandler({HttpMessageNotReadableException.class, MethodArgumentTypeMismatchException.class})
    public ResponseEntity<ApiError> malformed(Exception ex) {
        return error(400, "Please provide valid values and dates", Map.of());
    }
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ApiError> tooLarge(Exception ex) {
        return error(413, "Choose a receipt smaller than 5 MB", Map.of());
    }
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiError> conflict(Exception ex) {
        return error(409, "This record conflicts with existing data", Map.of());
    }
}

