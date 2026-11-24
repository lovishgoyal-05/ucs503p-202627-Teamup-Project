package com.teamup.controller;
import com.teamup.service.TeamUpService;
import com.teamup.config.TeamUpProperties;
import com.teamup.dto.mapper.UserMapper;
import com.teamup.dto.response.UserResponse;
import com.teamup.dto.request.*;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.*;
@RestController @RequestMapping("/api/v1") public class TeamUpController {
    private final TeamUpService service;
    private final TeamUpProperties properties;
    public TeamUpController(TeamUpService service, TeamUpProperties properties) {
        this.service=service;
        this.properties=properties;
    }
    @GetMapping("/health") public Map<String, Object> health() {
        return Map.of("status","ok","service","teamup-api");
    }
    @GetMapping("/auth/me") public UserResponse me(Authentication a) {
        return UserMapper.fromRow(service.me(a));
    }
    @GetMapping("/events") public Map<String, Object> events(@RequestParam(defaultValue="0") int page,@RequestParam(required=false) Integer size,@RequestParam(required=false) String q) {
        int p=Math.max(0,page), s=Math.min(properties.getMaxPageSize(),Math.max(1,size==null?properties.getDefaultPageSize():size));
        return Map.of("items",service.events(p,s,q),"page",p,"size",s,"total",service.countApprovedEvents(q));
    }
    @GetMapping("/events/mine") public List<Map<String, Object>> myEvents(Authentication a) {
        return service.myEvents(a);
    }
    @PostMapping("/events") public Map<String, Object> createEvent(Authentication a,@Valid @RequestBody EventCreateRequest in) {
        return service.createEvent(a,in);
    }
    @PostMapping("/auth/roles/organizer") public Map<String, Object> becomeOrganizer(Authentication a) {
        return service.becomeOrganizer(a);
    }
    @PostMapping("/auth/demo-login") public Map<String, Object> demoLogin(@RequestParam(defaultValue="ORGANIZER") String role) {
        return service.demoLogin(role);
    }
    @PostMapping("/events/{id}/review") public Map<String, Object> reviewEvent(Authentication a,@PathVariable UUID id,@Valid @RequestBody EventReviewRequest in) {
        return service.reviewEvent(a,id,in);
    }
    @GetMapping("/posts") public Map<String, Object> posts(@RequestParam(defaultValue="0") int page,@RequestParam(required=false) Integer size) {
        int p=Math.max(0,page), s=Math.min(properties.getMaxPageSize(),Math.max(1,size==null?properties.getDefaultPageSize():size));
        return Map.of("items",service.posts(p,s),"page",p,"size",s);
    }
    @PostMapping("/posts") public Map<String, Object> createPost(Authentication a,@Valid @RequestBody PostCreateRequest in) {
        return service.createPost(a,in);
    }
    @PostMapping("/posts/{id}/join-requests") public Map<String, Object> requestJoin(Authentication a,@PathVariable UUID id,@RequestBody(required=false) JoinRequestCreateRequest in) {
        return service.requestJoin(a,id,in);
    }
    @PostMapping("/join-requests/{id}/review") public Map<String, Object> reviewJoin(Authentication a,@PathVariable UUID id,@Valid @RequestBody JoinRequestReviewRequest in) {
        return service.reviewJoin(a,id,in);
    }
    @GetMapping("/teams") public List<Map<String, Object>> teams(Authentication a) {
        return service.teams(a);
    }
    @PostMapping("/teams/{id}/transfer-leadership") public Map<String, Object> transfer(Authentication a,@PathVariable UUID id,@Valid @RequestBody LeadershipTransferRequest in) {
        return service.transfer(a,id,in);
    }
    @GetMapping("/notifications") public List<Map<String, Object>> notifications(Authentication a) {
        return service.notifications(a);
    }
    @PostMapping("/notifications/{id}/read") public ResponseEntity<Void> read(Authentication a,@PathVariable UUID id) {
        return service.readNotification(a,id)?ResponseEntity.noContent().build():ResponseEntity.notFound().build();
    }
    @GetMapping("/skills") public List<Map<String, Object>> skills() {
        return service.skills();
    }
    @PostMapping("/skills") public Map<String, Object> addSkill(Authentication a,@Valid @RequestBody SkillUpsertRequest in) {
        return service.addSkill(a,in);
    }
    @GetMapping("/matching/posts") public List<Map<String, Object>> matching(Authentication a) {
        return service.matching(a);
    }
    @GetMapping("/admin/dashboard") public Map<String, Object> dashboard(Authentication a) {
        return service.dashboard(a);
    }
    @PostMapping("/events/{id}/apply") public Map<String, Object> applyToEvent(Authentication a, @PathVariable UUID id, @RequestBody(required=false) Map<String, String> in) {
        return service.applyToEvent(a, id, in);
    }
    @GetMapping("/events/{id}/applications") public List<Map<String, Object>> getEventApplications(Authentication a, @PathVariable UUID id) {
        return service.getEventApplications(a, id);
    }
    @GetMapping("/organizer/applications") public List<Map<String, Object>> getOrganizerApplications(Authentication a) {
        return service.getOrganizerApplications(a);
    }
    @PostMapping("/event-applications/{id}/review") public Map<String, Object> reviewEventApplication(Authentication a, @PathVariable UUID id, @RequestBody Map<String, String> in) {
        return service.reviewEventApplication(a, id, in);
    }
    @GetMapping("/events/my-applications") public List<Map<String, Object>> getMyEventApplications(Authentication a) {
        return service.getMyEventApplications(a);
    }
    @PostMapping("/admin/login") public Map<String, Object> adminLogin(@RequestBody Map<String, String> body) {
        return service.adminLogin(body);
    }
    @GetMapping("/admin/events/pending") public List<Map<String, Object>> getPendingEvents(Authentication a) {
        return service.getPendingEvents(a);
    }
    @GetMapping("/admin/users") public List<Map<String, Object>> getAdminUsers(Authentication a) {
        return service.getAdminUsers(a);
    }
    @PostMapping("/admin/events/sync-web") public Map<String, Object> syncWebEvents(Authentication a) {
        return service.syncWebEvents(a);
    }
}
