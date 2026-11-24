package com.teamup.dto.request;
import jakarta.validation.constraints.NotBlank;
public record JoinRequestReviewRequest(@NotBlank String status) {
}
