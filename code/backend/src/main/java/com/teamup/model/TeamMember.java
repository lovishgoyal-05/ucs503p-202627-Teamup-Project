package com.teamup.model;
import java.util.UUID;
/** Domain projection for TeamMember; persistence constraints are defined by Flyway migrations. */
public record TeamMember(UUID id,UUID teamId,UUID userId,String memberRole) {
}
