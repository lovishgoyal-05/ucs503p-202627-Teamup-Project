package com.teamup.security;
import org.springframework.beans.factory.annotation.Value;
import com.teamup.config.TeamUpProperties;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.sql.ResultSet;
import java.util.UUID;
@Component public class OidcLoginSuccessHandler implements AuthenticationSuccessHandler {
    private final JdbcTemplate db;
    private final TokenService tokens;
    private final String origin;
    private final TeamUpProperties properties;
    public OidcLoginSuccessHandler(JdbcTemplate db,TokenService tokens,@Value("${teamup.frontend-origin}") String origin,TeamUpProperties properties) {
        this.db=db;
        this.tokens=tokens;
        this.origin=origin;
        this.properties=properties;
    }
    @Override public void onAuthenticationSuccess(HttpServletRequest req,HttpServletResponse res,Authentication auth)throws IOException, ServletException {
        OidcUser oidc=(OidcUser)auth.getPrincipal();
        String sub=oidc.getSubject(), email=oidc.getEmail();
        if(email==null||!Boolean.TRUE.equals(oidc.getEmailVerified())) {
            res.sendError(403,"A verified Google email is required");
            return;
        }
        try {
            UUID id=db.query("select u.id from users u join oauth_accounts o on o.user_id=u.id where o.provider='GOOGLE' and o.provider_subject=?",(ResultSet rs)->rs.next()?UUID.fromString(rs.getString(1)):null,sub);
            if(id==null) {
                if(Boolean.TRUE.equals(db.queryForObject("select exists(select 1 from users where lower(email)=lower(?))",Boolean.class,email))) {
                    res.sendError(409,"Email belongs to another account. Automatic account merging is disabled.");
                    return;
                }
                id=UUID.randomUUID();
                db.update("insert into users(id,email,full_name,avatar_url) values(?,?,?,?)",id,email.toLowerCase(),oidc.getFullName()==null?email:oidc.getFullName(),oidc.getPicture());
                db.update("insert into oauth_accounts(id,user_id,provider,provider_subject,email_verified) values(?,?,'GOOGLE',?,true)",UUID.randomUUID(),id,sub);
                db.update("insert into user_roles(user_id,role_id) select ?,id from roles where code=? on conflict do nothing",id,properties.getDefaultRole());
                db.update("insert into student_profiles(user_id) values(?)",id);
            }
            Boolean active=db.queryForObject("select is_active from users where id=?",Boolean.class,id);
            if(!Boolean.TRUE.equals(active)) {
                res.sendError(403,"Account deactivated");
                return;
            }
            String access=tokens.accessToken(id,email);
            String raw=java.util.Base64.getUrlEncoder().withoutPadding().encodeToString(java.security.SecureRandom.getSeed(48));
            UUID family=UUID.randomUUID();
            db.update("insert into refresh_tokens(id,user_id,family_id,token_hash,expires_at,absolute_expires_at) values(?,?,?,?,now()+(? * interval '1 day'),now()+(? * interval '1 day'))",UUID.randomUUID(),id,family,tokens.hash(raw),properties.getRefreshInactivityDays(),properties.getAbsoluteSessionDays());
            Cookie cookie=new Cookie(properties.getRefreshCookieName(),raw);
            cookie.setHttpOnly(true);
            cookie.setSecure(properties.isCookieSecure());
            cookie.setPath("/api/v1/auth");
            cookie.setMaxAge((int)(properties.getAbsoluteSessionDays()*24*60*60));
            cookie.setAttribute("SameSite","Lax");
            res.addCookie(cookie);
            String targetOrigin = origin;
            if ("http://localhost:5173".equals(origin) && req.getServerPort() != 8080) {
                String scheme = req.getScheme();
                String host = req.getServerName();
                int port = req.getServerPort();
                boolean defaultPort = ("http".equalsIgnoreCase(scheme) && port == 80)
                        || ("https".equalsIgnoreCase(scheme) && port == 443);
                targetOrigin = scheme + "://" + host + (defaultPort ? "" : ":" + port);
            }
            res.sendRedirect(targetOrigin+"/auth/callback?token="+URLEncoder.encode(access,StandardCharsets.UTF_8));
        } catch(org.springframework.dao.DataAccessException e) {
            res.sendError(500,"Sign-in could not be completed");
        }
    }
}
