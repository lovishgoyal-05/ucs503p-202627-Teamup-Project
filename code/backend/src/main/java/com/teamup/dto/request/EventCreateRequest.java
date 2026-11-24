package com.teamup.dto.request;
import jakarta.validation.constraints.*;
import java.time.Instant;
public record EventCreateRequest(@NotBlank @Size(max=200) String title,@NotBlank String description,@Size(max=2000) String eventUrl,@Size(max=240) String venue,@NotNull Instant startsAt,Instant endsAt) {
}
