package com.teamup.model;
import java.util.UUID;
/** Domain projection for Event; persistence constraints are defined by Flyway migrations. */
public record Event(UUID id,String title,String description,String status) {
}
