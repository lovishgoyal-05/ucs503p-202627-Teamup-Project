package com.teamup.dto.request;
import jakarta.validation.constraints.*;
public record SkillUpsertRequest(@NotBlank @Size(max=80) String name,String proficiency) {
}
