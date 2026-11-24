package com.teamup.dto.response;
import java.util.List;
import java.util.UUID;
public record UserResponse(UUID id,String email,String fullName,String avatarUrl,boolean active,List<String> roles) {
}
