package com.teamup.dto.request;
import jakarta.validation.constraints.*;
import java.util.List;
import java.util.UUID;
public record PostCreateRequest(@NotBlank @Size(max=200) String title,@NotBlank String description,String postType,List<UUID> skillIds,List<UUID> requiredSkillIds) {
}
