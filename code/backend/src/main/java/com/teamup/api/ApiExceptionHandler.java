package com.teamup.api;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.time.Instant;
import java.util.*;
@RestControllerAdvice public class ApiExceptionHandler {
    @ExceptionHandler(ResponseStatusException.class) ResponseEntity<Map<String, Object>> status(ResponseStatusException e) {
        return ResponseEntity.status(e.getStatusCode()).body(Map.of("type","about:blank","title",e.getReason()==null?"Request failed":e.getReason(),"status",e.getStatusCode().value(),"timestamp",Instant.now().toString()));
    }
    @ExceptionHandler(Exception.class) ResponseEntity<Map<String, Object>> other(Exception e) {
        e.printStackTrace();
        return ResponseEntity.status(500).body(Map.of("type","about:blank","title","An internal server error occurred","status",500,"timestamp",Instant.now().toString()));
    }
}
