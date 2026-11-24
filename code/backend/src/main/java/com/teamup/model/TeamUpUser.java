package com.teamup.model;
import java.util.UUID;
public record TeamUpUser(UUID id,String email,String fullName,String avatarUrl,boolean active) {
}
