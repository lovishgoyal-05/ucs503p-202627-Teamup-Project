package com.teamup.security;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import com.teamup.config.TeamUpProperties;
import jakarta.servlet.http.Cookie;
import org.springframework.stereotype.Service;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;
@Service public class TokenService {
    private final SecretKey key;
    private final TeamUpProperties properties;
    public TokenService(TeamUpProperties properties) {
        this.properties = properties;
        byte[] bytes=properties.getJwtSecret().getBytes(StandardCharsets.UTF_8);
        if(bytes.length<32) throw new IllegalStateException("JWT_SECRET must be at least 32 bytes");
        key=Keys.hmacShaKeyFor(bytes);
    }
    public String accessToken(UUID userId, String email) {
        Instant now=Instant.now();
        return Jwts.builder().subject(userId.toString()).claim("email",email).issuedAt(Date.from(now)).expiration(Date.from(now.plusSeconds(properties.getAccessTokenMinutes() * 60))).signWith(key).compact();
    }
    public String hash(String value) {
        try {
            java.security.MessageDigest md=java.security.MessageDigest.getInstance("SHA-256");
            return java.util.HexFormat.of().formatHex(md.digest(value.getBytes(java.nio.charset.StandardCharsets.UTF_8)));
        } catch(Exception e) {
            throw new IllegalStateException(e);
        }
    }
    public UUID verify(String token) {
        return UUID.fromString(Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload().getSubject());
    }
    /** Builds the HttpOnly refresh cookie using deployment-configured Secure and SameSite flags. */
    public Cookie refreshCookie(String value, int maxAgeSeconds) {
        Cookie cookie = new Cookie(properties.getRefreshCookieName(), value);
        cookie.setHttpOnly(true);
        cookie.setSecure(properties.isCookieSecure());
        cookie.setPath("/api/v1/auth");
        cookie.setMaxAge(maxAgeSeconds);
        cookie.setAttribute("SameSite", properties.getCookieSameSite());
        return cookie;
    }
}
