package com.teamup.dto.request;
import jakarta.validation.constraints.Size;
public record JoinRequestCreateRequest(@Size(max=2000) String message) {
}
