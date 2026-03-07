package com.softvent.finflow.auth.service;

import com.softvent.finflow.auth.dto.reset.password.ForgotPasswordRequest;
import com.softvent.finflow.auth.dto.reset.password.ResetPasswordRequest;
import com.softvent.finflow.auth.dto.reset.password.ResetPasswordResponse;
import com.softvent.finflow.auth.entity.Auth;
import com.softvent.finflow.auth.entity.PasswordReset;
import com.softvent.finflow.auth.entity.RefreshToken;
import com.softvent.finflow.common.BusinessException;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import org.mindrot.jbcrypt.BCrypt;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@ApplicationScoped
public class ResetPasswordService {

    @Inject
    EmailService emailService;

    @Transactional
    public void forgotPassword(ForgotPasswordRequest req) {

        if (req == null || req.email == null) {
            throw new BusinessException("Invalid request", 400); // BAD_REQUEST
        }

        // cleanup expired tokens
        PasswordReset.delete("expiresAt < ?1", Instant.now());

        Auth user = Auth.find("email", req.email).firstResult();

        if (user == null) {
            return; // security: do not reveal existence
        }

        // remove previous tokens
        PasswordReset.delete("email", req.email);

        PasswordReset reset = new PasswordReset();
        reset.email = req.email;
        reset.token = UUID.randomUUID().toString();
        reset.expiresAt = Instant.now().plus(15, ChronoUnit.MINUTES);

        reset.persist();

        emailService.sendResetPasswordEmail(req.email, reset.token);
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest req) {

        if (req == null || req.token == null || req.newPassword == null) {
            throw new BusinessException("Invalid request", 400);
        }

        PasswordReset.delete("expiresAt < ?1", Instant.now());

        PasswordReset reset =
                PasswordReset.find("token", req.token).firstResult();

        if (reset == null || reset.expiresAt.isBefore(Instant.now())) {
            throw new BusinessException("Invalid or expired token", 401);
        }

        Auth user = Auth.find("email", reset.email).firstResult();

        if (user == null) {
            throw new BusinessException("User not found", 404);
        }

        user.pwdHash = BCrypt.hashpw(req.newPassword, BCrypt.gensalt());
        user.updatedAt = Instant.now();

        /* revoke all active sessions */
        RefreshToken.update("revoked = true where uid = ?1", user.uid);

        reset.delete();
    }

    public ResetPasswordResponse getEmailForToken(String token) {

        if (token == null || token.isBlank()) {
            throw new BusinessException("Invalid token", 400);
        }

        PasswordReset reset =
                PasswordReset.find("token", token).firstResult();

        if (reset == null || reset.expiresAt.isBefore(Instant.now())) {
            throw new BusinessException("Invalid or expired token", 401);
        }

        ResetPasswordResponse res = new ResetPasswordResponse();
        res.email = reset.email;

        return res;
    }
}