package com.teamup.model;
import java.util.UUID;
/** Domain projection for RecruitmentPost; persistence constraints are defined by Flyway migrations. */
public record RecruitmentPost(UUID id,UUID creatorId,String title,String description,String status) {
}
