package com.teamup.model;
import java.util.UUID;
/** Domain projection for JoinRequest; persistence constraints are defined by Flyway migrations. */
public record JoinRequest(UUID id,UUID postId,UUID requesterId,String status) {
}
