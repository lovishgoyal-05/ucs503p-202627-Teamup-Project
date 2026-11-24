package com.teamup.dto.request;
import jakarta.validation.constraints.NotBlank;
public record EventReviewRequest(@NotBlank String status) {
}
