package com.teamup.model;
import java.util.UUID;
/** Domain projection for Team; persistence constraints are defined by Flyway migrations. */
public record Team(UUID id,String name,String status) {
}
