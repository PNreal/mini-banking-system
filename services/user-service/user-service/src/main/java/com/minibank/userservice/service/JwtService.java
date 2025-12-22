package com.minibank.userservice.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;
import java.util.function.Function;

@Service
public class JwtService {

    private static final String SECRET_KEY ="QkVTVF9TRUNSRVRfS0VZX0ZPUl9NSU5JQkFOS19TRVJWSUNFX0FQSV9TRUNSRVQ=";
    private SecretKey getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(SECRET_KEY);
        return Keys.hmacShaKeyFor(keyBytes);
    }
    private final long ACCESS_EXP = 2 * 60 * 60 * 1000; // 2 hours
    private final long REFRESH_EXP = 7 * 24 * 60 * 60 * 1000;
    private final long RESET_EXP = 60 * 60 * 1000;
    
    //TOKEN GENERATION - với userId và role
    public String generateAccessToken(String email, UUID userId, String role) {
        return buildToken(email, userId, role, ACCESS_EXP);
    }
    
    // Backward compatibility - sẽ không có userId và role
    public String generateAccessToken(String email) {
        return buildTokenSimple(email, ACCESS_EXP);
    }

    public String generateRefreshToken(String email) {
        return buildTokenSimple(email, REFRESH_EXP);
    }

    public String generateResetToken(String email) {
        return buildTokenSimple(email, RESET_EXP);
    }

    private String buildToken(String email, UUID userId, String role, long expiration) {
        return Jwts.builder()
                .subject(email)
                .claim("userId", userId != null ? userId.toString() : null)
                .claim("role", role)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSignInKey())
                .compact();
    }
    
    private String buildTokenSimple(String email, long expiration) {
        return Jwts.builder()
                .subject(email)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSignInKey())
                .compact();
    }
    // Extraction
    // Hàm UserService
    public String extractUsername(String token) {
        return extractEmail(token);
    }

    public String extractEmail(String token) {
        return extractClaim(token, Claims::getSubject);
    }
    // Hàm Generic lấy dữ liệu bất kỳ
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }
    // Giải mã toàn bộ
    public Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSignInKey())
                .build()
                .parseSignedClaims(cleanToken(token))
                .getPayload();
    }
    // Validation
    public boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public Instant getExpirationInstant(String token) {
        return extractExpiration(token).toInstant();
    }

    private String cleanToken(String token) {
        if (token != null && token.startsWith("Bearer "))
            return token.substring(7);
        return token;
    }
}