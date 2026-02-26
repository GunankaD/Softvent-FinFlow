package com.softvent.finflow.auth.service;

import com.softvent.finflow.auth.dto.*;
import com.softvent.finflow.auth.dto.reset.password.ChangePasswordRequest;
import com.softvent.finflow.auth.entity.Auth;
import com.softvent.finflow.common.BusinessException;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;

import org.mindrot.jbcrypt.BCrypt;

import java.time.Instant;

@ApplicationScoped
public class AuthService {

    @Transactional
    public void signup(SignupRequest req) {

        if (req == null || req.email == null || req.password == null) {
            throw new BusinessException("Invalid signup request", 400); // BAD_REQUEST
        }

        boolean exists = Auth.find("email", req.email)
                .firstResultOptional()
                .isPresent();

        if (exists) {
            throw new BusinessException("Email already exists", 409); // CONFLICT
        }

        Auth user = new Auth();
        user.email = req.email;
        user.pwdHash = BCrypt.hashpw(req.password, BCrypt.gensalt());

        user.persist();
    }

    @Transactional
    public void login(LoginRequest req) {

        if (req == null || req.email == null || req.password == null) {
            throw new BusinessException("Invalid login request", 400); // BAD_REQUEST
        }

        Auth user = Auth.find("email", req.email).firstResult();

        if (user == null || !BCrypt.checkpw(req.password, user.pwdHash)) {
            throw new BusinessException("Invalid credentials", 401); // UNAUTHORIZED
        }

        user.lastLoggedInAt = Instant.now();
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
    public void deleteByEmailId(String email) {

        if (email == null || email.isBlank()) {
            throw new BusinessException("Invalid email", 400);
        }

        long deleted = Auth.delete("email", email);

        if (deleted == 0) {
            throw new BusinessException("User not found", 404);
        }
    }
}
