package com.softvent.finflow.common;

import java.time.LocalDateTime;
import java.util.List;

public class ApiError {

    public int status;
    public String message;
    public LocalDateTime timestamp;
    public List<String> errors;

    public ApiError(int status, String message, List<String> errors) {
        this.status = status;
        this.message = message;
        this.errors = errors;
        this.timestamp = LocalDateTime.now();
    }
}

