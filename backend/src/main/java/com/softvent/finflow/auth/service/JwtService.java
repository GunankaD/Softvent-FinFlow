package com.softvent.finflow.auth.service;

import io.smallrye.jwt.build.Jwt;
import jakarta.enterprise.context.ApplicationScoped;

import java.time.Instant;
import java.util.Set;

@ApplicationScoped
public class JwtService {

    private static final long ACCESS_TOKEN_EXPIRATION_SECONDS = 900; // 15 minutes

    public String generateAccessToken(Long uid, String email) {

        Instant now = Instant.now();

        return Jwt.issuer("finflow")
                .upn(email)
                .subject(uid.toString())
                .issuedAt(now)
                .expiresAt(now.plusSeconds(ACCESS_TOKEN_EXPIRATION_SECONDS))
                .groups(Set.of("USER"))
                .sign();
    }

}