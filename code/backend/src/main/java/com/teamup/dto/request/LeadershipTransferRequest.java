package com.teamup.dto.request;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;
public record LeadershipTransferRequest(@NotNull UUID userId) {
}
