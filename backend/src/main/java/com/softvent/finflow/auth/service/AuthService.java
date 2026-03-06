package com.softvent.finflow.auth.service;

import com.softvent.finflow.auth.dto.login.LoginRequest;
import com.softvent.finflow.auth.dto.login.LoginResponse;
import com.softvent.finflow.auth.dto.reset.password.ChangePasswordRequest;
import com.softvent.finflow.auth.entity.Auth;
import com.softvent.finflow.auth.entity.RefreshToken;
import com.softvent.finflow.common.BusinessException;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import org.mindrot.jbcrypt.BCrypt;

import java.time.Instant;

@ApplicationScoped
public class AuthService {
    @Inject
    JwtService jwtService;

    @Inject
    RefreshTokenService refreshTokenService;

    @Transactional
    public LoginResponse login(LoginRequest req) {

        if (req == null || req.email == null || req.password == null) {
            throw new BusinessException("Invalid login request", 400); // BAD_REQUEST
        }

        Auth user = Auth.find("email", req.email).firstResult();

        if (user == null || !BCrypt.checkpw(req.password, user.pwdHash)) {
            throw new BusinessException("Invalid credentials", 401); // UNAUTHORIZED
        }

        user.lastLoggedInAt = Instant.now();

        String accessToken =
                jwtService.generateAccessToken(user.uid, user.email);

        String refreshToken =
                refreshTokenService.createRefreshToken(user.uid);

        return new LoginResponse(accessToken, refreshToken, user.email);
    }

    @Transactional
    public LoginResponse refresh(String refreshToken) {

        if (refreshToken == null || refreshToken.isBlank()) {
            throw new BusinessException("Missing refresh token", 401);
        }

        RefreshToken tokenEntity =
                refreshTokenService.validateRefreshToken(refreshToken);

        Auth user = Auth.findById(tokenEntity.uid);

        if (user == null) {
            throw new BusinessException("User not found", 404);
        }

        refreshTokenService.revokeToken(tokenEntity);

        String newRefreshToken =
                refreshTokenService.createRefreshToken(user.uid);

        String newAccessToken =
                jwtService.generateAccessToken(user.uid, user.email);

        return new LoginResponse(newAccessToken, newRefreshToken, user.email);
    }
    }

    @Transactional
    public void changePassword(ChangePasswordRequest req) {

        if (req == null || req.email == null || req.newPassword == null) {
            throw new BusinessException("Invalid change password request", 400);
        }

        Auth user = Auth.find("email", req.email)
                .firstResult();

        if (user == null) {
            throw new BusinessException("User not found", 404);
        }

        user.pwdHash = BCrypt.hashpw(req.newPassword, BCrypt.gensalt());
    }

    @Transactional
    public void deleteByEmail(String email) {

        if (email == null || email.isBlank()) {
            throw new BusinessException("Invalid email", 400);
        }

        long deleted = Auth.delete("email", email);

        if (deleted == 0) {
            throw new BusinessException("User not found", 404);
        }
    }
}
