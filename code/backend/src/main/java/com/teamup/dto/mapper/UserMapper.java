package com.teamup.dto.mapper;
import com.teamup.dto.response.UserResponse;
import java.util.Map;
import java.util.UUID;
/** Converts persistence projections to API response DTOs. */
public final class UserMapper {
    private UserMapper() {
    }
    @SuppressWarnings("unchecked")
    public static UserResponse fromRow(Map<String,Object> row) {
        java.util.List<String> roles = (java.util.List<String>) row.getOrDefault("roles", java.util.List.of());
        return new UserResponse((UUID)row.get("id"),(String)row.get("email"),(String)row.get("fullName"),(String)row.get("avatarUrl"),Boolean.TRUE.equals(row.get("active")),roles);
    }
}
