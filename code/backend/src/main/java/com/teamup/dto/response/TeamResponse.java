package com.teamup.dto.response;
import java.time.Instant;
import java.util.UUID;
public record TeamResponse(UUID id,String name,String status,Instant createdAt,String myRole) {
}
