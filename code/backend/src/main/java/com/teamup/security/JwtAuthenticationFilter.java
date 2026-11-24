package com.teamup.security;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.*;
@Component public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final TokenService tokens;
    private final JdbcTemplate db;
    public JwtAuthenticationFilter(TokenService tokens,JdbcTemplate db) {
        this.tokens=tokens;
        this.db=db;
    }
    @Override protected void doFilterInternal(HttpServletRequest req,HttpServletResponse res,FilterChain chain)throws ServletException, IOException {
        String h=req.getHeader("Authorization");
        if(h!=null&&h.startsWith("Bearer ")) try {
            UUID id=tokens.verify(h.substring(7));
            Boolean active=db.queryForObject("select is_active from users where id=?",Boolean.class,id);
            if(Boolean.TRUE.equals(active)) {
                List<SimpleGrantedAuthority> roles=db.query("select r.code from user_roles ur join roles r on r.id=ur.role_id where ur.user_id=?",(rs,n)->new SimpleGrantedAuthority("ROLE_"+rs.getString(1)),id);
                SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(id.toString(),null,roles));
            }
        } catch(Exception ignored) {
            SecurityContextHolder.clearContext();
        }
        chain.doFilter(req,res);
    }
}
