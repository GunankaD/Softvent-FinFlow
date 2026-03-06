package com.softvent.finflow.auth.service;

import com.softvent.finflow.auth.entity.RefreshToken;
import com.softvent.finflow.common.BusinessException;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;

@ApplicationScoped
public class RefreshTokenService {

    private static final long REFRESH_TOKEN_EXPIRY_DAYS = 7;

    private final SecureRandom secureRandom = new SecureRandom();

    @Transactional
    public String createRefreshToken(Long uid) {

        String token = generateToken();
        String hash = hashToken(token);

        RefreshToken entity = new RefreshToken();
        entity.uid = uid;
        entity.tokenHash = hash;
        entity.createdAt = Instant.now();
        entity.expiresAt = Instant.now().plus(REFRESH_TOKEN_EXPIRY_DAYS, ChronoUnit.DAYS);
        entity.revoked = false;

        entity.persist();

        return token;
    }

    public RefreshToken validateRefreshToken(String token) {

        String hash = hashToken(token);

        RefreshToken entity = RefreshToken.find("tokenHash", hash).firstResult();

        if (entity == null) {
            throw new BusinessException("Invalid refresh token", 401);
        }

        if (entity.revoked) {
            throw new BusinessException("Refresh token revoked", 401);
        }

        if (entity.expiresAt.isBefore(Instant.now())) {
            throw new BusinessException("Refresh token expired", 401);
        }

        return entity;
    }

    @Transactional
    public void revokeToken(RefreshToken token) {
        token.revoked = true;
    }

    private String generateToken() {

        byte[] randomBytes = new byte[64];
        secureRandom.nextBytes(randomBytes);

        return Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
    }

    private String hashToken(String token) {

        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(hash);
        } catch (Exception e) {
            throw new RuntimeException("Failed to hash refresh token");
        }
    }
}
