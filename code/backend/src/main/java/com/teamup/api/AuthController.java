package com.teamup.api;
import com.teamup.security.TokenService;
import com.teamup.config.TeamUpProperties;
import jakarta.servlet.http.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.util.*;
@RestController @RequestMapping("/api/v1/auth") public class AuthController {
    private final JdbcTemplate db;
    private final TokenService tokens;
    private final TeamUpProperties properties;
    public AuthController(JdbcTemplate db,TokenService tokens,TeamUpProperties properties) {
        this.db=db;
        this.tokens=tokens;
        this.properties=properties;
    }
    @PostMapping("/refresh") @Transactional public ResponseEntity<?> refresh(HttpServletRequest req,HttpServletResponse res) {
        String raw=Arrays.stream(Optional.ofNullable(req.getCookies()).orElse(new Cookie[0])).filter(c->c.getName().equals(properties.getRefreshCookieName())).map(Cookie::getValue).findFirst().orElse(null);
        if(raw==null)return ResponseEntity.status(401).body(Map.of("title","Refresh session missing","status",401));
        String hash=tokens.hash(raw);
        Map<String, Object> row=db.query("select id,user_id,family_id,expires_at,absolute_expires_at,consumed_at,revoked_at from refresh_tokens where token_hash=? for update",rs->{if(!rs.next())return null;Map<String,Object> m=new HashMap<>();m.put("id",rs.getObject("id"));m.put("user_id",rs.getObject("user_id"));m.put("family_id",rs.getObject("family_id"));m.put("expires_at",rs.getTimestamp("expires_at"));m.put("absolute_expires_at",rs.getTimestamp("absolute_expires_at"));m.put("consumed_at",rs.getTimestamp("consumed_at"));m.put("revoked_at",rs.getTimestamp("revoked_at"));return m;},hash);
        if(row==null)return expire(res);
        UUID family=(UUID)row.get("family_id");
        if(row.get("consumed_at")!=null) {
            db.update("update refresh_tokens set revoked_at=coalesce(revoked_at,now()) where family_id=?",family);
            return expire(res);
        }
        if(row.get("revoked_at")!=null||((java.sql.Timestamp)row.get("expires_at")).toInstant().isBefore(Instant.now())||((java.sql.Timestamp)row.get("absolute_expires_at")).toInstant().isBefore(Instant.now()))return expire(res);
        UUID user=(UUID)row.get("user_id");
        Boolean active=db.queryForObject("select is_active from users where id=?",Boolean.class,user);
        if(!Boolean.TRUE.equals(active)) {
            db.update("update refresh_tokens set revoked_at=coalesce(revoked_at,now()) where user_id=?",user);
            return expire(res);
        }
        String email=db.queryForObject("select email from users where id=?",String.class,user);
        String next=Base64.getUrlEncoder().withoutPadding().encodeToString(java.security.SecureRandom.getSeed(48));
        UUID nextId=UUID.randomUUID();
        db.update("insert into refresh_tokens(id,user_id,family_id,token_hash,expires_at,absolute_expires_at) values(?,?,?,?,least(now()+(? * interval '1 day'),?),?)",nextId,user,family,tokens.hash(next),properties.getRefreshInactivityDays(),row.get("absolute_expires_at"),row.get("absolute_expires_at"));
        db.update("update refresh_tokens set consumed_at=now(),last_used_at=now(),replaced_by=? where id=? and consumed_at is null",nextId,row.get("id"));
        res.addCookie(tokens.refreshCookie(next, (int)(properties.getAbsoluteSessionDays()*24*60*60)));
        return ResponseEntity.ok(Map.of("accessToken",tokens.accessToken(user,email),"tokenType","Bearer","expiresIn",properties.getAccessTokenMinutes()*60));
    }
    @PostMapping("/logout") public ResponseEntity<?> logout(HttpServletRequest req,HttpServletResponse res) {
        String raw=Arrays.stream(Optional.ofNullable(req.getCookies()).orElse(new Cookie[0])).filter(c->c.getName().equals(properties.getRefreshCookieName())).map(Cookie::getValue).findFirst().orElse(null);
        if(raw!=null)db.update("update refresh_tokens set revoked_at=coalesce(revoked_at,now()) where token_hash=?",tokens.hash(raw));
        res.addCookie(tokens.refreshCookie("", 0));
        return ResponseEntity.noContent().build();
    }
    private ResponseEntity<?> expire(HttpServletResponse res) {
        res.addCookie(tokens.refreshCookie("", 0));
        return ResponseEntity.status(401).body(Map.of("title","Refresh session is invalid or expired","status",401));
    }
}
